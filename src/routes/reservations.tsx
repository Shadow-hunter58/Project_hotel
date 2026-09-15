import { useState, useMemo, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/SiteChrome";
import { PHONE, PHONE_DISPLAY, UPI_ID, UPI_NAME, rooms as localRooms } from "@/lib/site-data";
import {
  createBooking,
  fetchAvailability,
  lookupBooking,
  recordPayment,
  nightsBetween,
  type AvailabilityRow,
  type BookingResult,
  type BookingLookup,
} from "@/lib/booking";

export const Route = createFileRoute("/reservations")({
  head: () => ({
    meta: [
      { title: "Direct Reservations | Hotel Ratna Forever, Nitte" },
      {
        name: "description",
        content:
          "Reserve your room directly at Hotel Ratna Forever, Nitte. Real-time availability, instant front-desk booking confirmation and secure UPI advance payment.",
      },
      { property: "og:title", content: "Reservations — Hotel Ratna Forever, Nitte" },
      {
        property: "og:description",
        content:
          "Live room availability, instant booking reference, and secure direct reservations without intermediaries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReservationsPage,
});

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const prettyDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

function ReservationsPage() {
  const [activeTab, setActiveTab] = useState<"book" | "manage">("book");

  // Booking Flow State
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(() => addDays(today(), 1));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [results, setResults] = useState<AvailabilityRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [selectedRoom, setSelectedRoom] = useState<AvailabilityRow | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<BookingResult | null>(null);

  // Post-booking UPI payment state
  const [payAmount, setPayAmount] = useState(1000);
  const [utrNumber, setUtrNumber] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Manage existing reservation tab state
  const [lookupRef, setLookupRef] = useState("");
  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupBookingData, setLookupBookingData] = useState<BookingLookup | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [manageUtr, setManageUtr] = useState("");
  const [managePayAmount, setManagePayAmount] = useState(1000);
  const [manageSubmittingPay, setManageSubmittingPay] = useState(false);
  const [managePaySuccess, setManagePaySuccess] = useState(false);
  const [managePayError, setManagePayError] = useState<string | null>(null);

  const nights = useMemo(() => Math.max(1, nightsBetween(checkIn, checkOut)), [checkIn, checkOut]);

  // Sync check-in changes so check-out is at least 1 day after
  const handleCheckInChange = (newDate: string) => {
    setCheckIn(newDate);
    if (new Date(newDate) >= new Date(checkOut)) {
      setCheckOut(addDays(newDate, 1));
    }
  };

  // Trigger availability search
  const handleSearch = async () => {
    setLoading(true);
    setSearchError(null);
    setSelectedRoom(null);
    try {
      const rows = await fetchAvailability(checkIn, checkOut);
      setResults(rows);
      setStep(2);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Unable to retrieve real-time availability. Please check dates or call our front desk.");
    } finally {
      setLoading(false);
    }
  };

  // Handle booking submission
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    if (!guestName.trim() || !guestPhone.trim()) {
      setFormError("Please enter your full name and contact number.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const res = await createBooking({
        room_type_id: selectedRoom.room_type_id,
        check_in: checkIn,
        check_out: checkOut,
        guest_name: guestName.trim(),
        guest_phone: guestPhone.trim(),
        guest_email: guestEmail.trim() || undefined,
        num_guests: adults + children,
        notes: notes.trim() || undefined,
      });

      setConfirmation(res);
      setPayAmount(Math.min(res.estimated_total, 1000));
      setStep(4);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Booking could not be confirmed. Please call front desk.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit payment for the newly confirmed booking
  const handleRecordNewPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmation) return;
    if (!utrNumber.trim()) {
      setPaymentError("Please provide the UPI transaction / UTR reference number.");
      return;
    }

    setSubmittingPayment(true);
    setPaymentError(null);
    try {
      await recordPayment(confirmation.reference, guestPhone.trim(), payAmount, utrNumber.trim());
      setPaymentSuccess(true);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Could not record payment details. Front desk will verify upon arrival.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Lookup existing booking
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupRef.trim() || !lookupPhone.trim()) {
      setLookupError("Please enter both your Booking Reference and Phone number.");
      return;
    }
    setLookupLoading(true);
    setLookupError(null);
    setLookupBookingData(null);
    setManagePaySuccess(false);
    try {
      const data = await lookupBooking(lookupRef.trim(), lookupPhone.trim());
      setLookupBookingData(data);
      setManagePayAmount(Math.min(data.estimated_total, 1000));
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : "No reservation found matching those details.");
    } finally {
      setLookupLoading(false);
    }
  };

  // Submit payment for looked up booking
  const handleManagePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupBookingData || !manageUtr.trim()) {
      setManagePayError("Please enter the UTR / transaction ID.");
      return;
    }
    setManageSubmittingPay(true);
    setManagePayError(null);
    try {
      await recordPayment(lookupBookingData.reference, lookupPhone.trim(), managePayAmount, manageUtr.trim());
      setManagePaySuccess(true);
    } catch (err) {
      setManagePayError(err instanceof Error ? err.message : "Failed to record payment.");
    } finally {
      setManageSubmittingPay(false);
    }
  };

  // Helper to match local image
  const getImageForRoom = (roomName: string) => {
    const found = localRooms.find((r) => r.name.toLowerCase() === roomName.toLowerCase());
    return found ? found.image : localRooms[0]!.image;
  };

  return (
    <>
      <PageHeader
        eyebrow="Direct Hotel Reservations"
        title="Reserve Your Stay at Ratna Forever"
        intro="Direct booking guaranteed with immediate front-desk recording. Best rates, zero broker commissions, and hassle-free stay arrangements."
      />

      <section className="relative min-h-[70vh] bg-slate-900/40 py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          
          {/* Main Mode Tabs */}
          <div className="mb-10 flex justify-center">
            <div className="inline-flex rounded-xl bg-slate-950/80 p-1.5 ring-1 ring-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveTab("book")}
                className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
                  activeTab === "book"
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>New Reservation</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("manage")}
                className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
                  activeTab === "manage"
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Look Up & Pay Existing Reservation</span>
              </button>
            </div>
          </div>

          {/* TAB 1: NEW RESERVATION */}
          {activeTab === "book" && (
            <div className="space-y-8">
              {/* Stepper Header */}
              {step < 4 && (
                <div className="glass-card rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    {[
                      { num: 1, label: "Dates & Guests" },
                      { num: 2, label: "Choose Room" },
                      { num: 3, label: "Guest Information" },
                      { num: 4, label: "Confirmation & Payment" },
                    ].map((s, idx) => (
                      <div key={s.num} className="flex items-center">
                        <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-3">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                              step === s.num
                                ? "bg-amber-400 text-slate-950 ring-4 ring-amber-400/20"
                                : step > s.num
                                ? "bg-emerald-500 text-white"
                                : "bg-white/10 text-slate-400"
                            }`}
                          >
                            {step > s.num ? "✓" : s.num}
                          </span>
                          <span
                            className={`hidden text-xs font-medium tracking-wide md:inline ${
                              step === s.num ? "text-amber-400 font-semibold" : "text-slate-400"
                            }`}
                          >
                            {s.label}
                          </span>
                        </div>
                        {idx < 3 && (
                          <div className={`mx-2 h-0.5 w-6 sm:w-12 lg:w-20 ${step > idx + 1 ? "bg-emerald-500/50" : "bg-white/10"}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 1: DATES & SEARCH */}
              {step === 1 && (
                <div className="glass-card rounded-2xl p-6 sm:p-10">
                  <div className="mb-6">
                    <h2 className="font-serif text-2xl font-semibold text-white">Select Your Stay Dates</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Check-in begins at 12:00 PM. Check-out is 11:00 AM. Free breakfast included with every room.
                    </p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                        Check-in Date
                      </label>
                      <input
                        type="date"
                        min={today()}
                        value={checkIn}
                        onChange={(e) => handleCheckInChange(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                        Check-out Date
                      </label>
                      <input
                        type="date"
                        min={addDays(checkIn, 1)}
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                        Adults (12+ yrs)
                      </label>
                      <select
                        value={adults}
                        onChange={(e) => setAdults(Number(e.target.value))}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-amber-400"
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n} className="bg-slate-900 text-white">
                            {n} {n === 1 ? "Adult" : "Adults"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                        Children (under 12)
                      </label>
                      <select
                        value={children}
                        onChange={(e) => setChildren(Number(e.target.value))}
                        className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-amber-400"
                      >
                        {[0, 1, 2, 3].map((n) => (
                          <option key={n} value={n} className="bg-slate-900 text-white">
                            {n} {n === 1 ? "Child" : "Children"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <span className="rounded-lg bg-amber-400/10 px-3 py-1 font-semibold text-amber-300">
                        {nights} {nights === 1 ? "Night" : "Nights"}
                      </span>
                      <span>
                        {prettyDate(checkIn)} → {prettyDate(checkOut)}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleSearch}
                      className="shimmer-btn flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-8 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-slate-950 shadow-xl transition-all sm:w-auto"
                    >
                      {loading ? (
                        <>
                          <svg className="h-4 w-4 animate-spin text-slate-950" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Checking Live Inventory...</span>
                        </>
                      ) : (
                        <>
                          <span>Check Room Availability</span>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>

                  {searchError && (
                    <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
                      {searchError}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: CHOOSE ROOM */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="font-serif text-2xl font-semibold text-white">Available Accommodations</h2>
                      <p className="text-sm text-slate-400">
                        {prettyDate(checkIn)} to {prettyDate(checkOut)} · {nights} {nights === 1 ? "night" : "nights"} · {adults + children} {adults + children === 1 ? "guest" : "guests"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/10"
                    >
                      ← Modify Dates
                    </button>
                  </div>

                  {results && results.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-3">
                      {results.map((room) => {
                        const isSelected = selectedRoom?.room_type_id === room.room_type_id;
                        const isAvailable = room.available_count > 0;
                        const estimatedTotal = room.price_per_night * nights;

                        return (
                          <div
                            key={room.room_type_id}
                            className={`glass-card relative flex flex-col overflow-hidden rounded-2xl transition-all ${
                              isSelected
                                ? "ring-2 ring-amber-400 shadow-2xl scale-[1.01]"
                                : "hover:border-white/20"
                            }`}
                          >
                            <div className="relative h-48 w-full overflow-hidden">
                              <img
                                src={getImageForRoom(room.name)}
                                alt={room.name}
                                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                              />
                              <div className="absolute top-3 right-3">
                                {isAvailable ? (
                                  <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white shadow backdrop-blur-md">
                                    {room.available_count} Available
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-rose-600/90 px-3 py-1 text-xs font-semibold text-white shadow backdrop-blur-md">
                                    Sold Out
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-1 flex-col p-5">
                              <div className="flex-1">
                                <h3 className="font-serif text-xl font-semibold text-white">{room.name}</h3>
                                <p className="mt-1 text-xs text-amber-400/90">Max {room.max_occupancy} guests</p>
                                <p className="mt-3 text-xs leading-relaxed text-slate-300 line-clamp-2">
                                  {room.description || "Air-conditioned comfort with 24-hour hot water, television, and complimentary breakfast."}
                                </p>
                              </div>

                              <div className="mt-6 border-t border-white/10 pt-4">
                                <div className="flex items-baseline justify-between">
                                  <div>
                                    <span className="font-serif text-2xl font-bold text-amber-400">
                                      {formatCurrency(room.price_per_night)}
                                    </span>
                                    <span className="text-xs text-slate-400"> / night</span>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-slate-400">Total ({nights} nts)</p>
                                    <p className="text-sm font-semibold text-white">{formatCurrency(estimatedTotal)}</p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  disabled={!isAvailable}
                                  onClick={() => {
                                    setSelectedRoom(room);
                                    setStep(3);
                                  }}
                                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                                    isSelected
                                      ? "bg-amber-400 text-slate-950 shadow-lg"
                                      : isAvailable
                                      ? "bg-white/10 text-white hover:bg-amber-500 hover:text-slate-950"
                                      : "cursor-not-allowed bg-white/5 text-slate-500"
                                  }`}
                                >
                                  {isSelected ? "Selected ✓" : isAvailable ? "Reserve This Room" : "Unavailable"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="glass-card rounded-2xl p-10 text-center text-slate-400">
                      <p>No room types found for the specified criteria.</p>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="mt-4 rounded-lg bg-amber-400 px-4 py-2 text-xs font-bold uppercase text-slate-950"
                      >
                        Try Different Dates
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: GUEST INFORMATION */}
              {step === 3 && selectedRoom && (
                <div className="glass-card rounded-2xl p-6 sm:p-10">
                  <div className="flex flex-col items-start justify-between gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="font-serif text-2xl font-semibold text-white">Guest & Contact Details</h2>
                      <p className="mt-1 text-sm text-slate-400">
                        Reserving: <strong className="text-amber-400">{selectedRoom.name}</strong> for {nights} {nights === 1 ? "night" : "nights"} ({prettyDate(checkIn)} to {prettyDate(checkOut)})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/10"
                    >
                      ← Change Room
                    </button>
                  </div>

                  <form onSubmit={handleConfirmBooking} className="mt-6 space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                          Primary Guest Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="e.g. Ramesh Hegde"
                          className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                          Mobile Phone / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          placeholder="e.g. 9845012345"
                          className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-amber-400"
                        />
                        <span className="mt-1 block text-xs text-slate-500">
                          Your reservation reference will be mapped to this phone.
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                          Email Address (Optional)
                        </label>
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="e.g. guest@example.com"
                          className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-amber-400"
                        />
                        <span className="mt-1 block text-xs text-slate-500">
                          For copy of stay itinerary and receipts.
                        </span>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                          Special Requests / Estimated Arrival Time
                        </label>
                        <textarea
                          rows={2}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Early check-in request, extra bed, dietary notes, or campus visit info..."
                          className="mt-2 w-full resize-none rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-amber-400"
                        />
                      </div>
                    </div>

                    {formError && (
                      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
                        {formError}
                      </div>
                    )}

                    {/* Booking Summary Box */}
                    <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 sm:p-6">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-amber-300 font-semibold">Stay Summary</p>
                          <p className="mt-1 text-sm text-slate-300">
                            {selectedRoom.name} · {nights} {nights === 1 ? "Night" : "Nights"} · {adults + children} {adults + children === 1 ? "Guest" : "Guests"}
                          </p>
                        </div>
                        <div className="text-right sm:border-l sm:border-amber-400/20 sm:pl-6">
                          <p className="text-xs text-slate-400">Total Estimated Tariff</p>
                          <p className="font-serif text-2xl font-bold text-amber-400">
                            {formatCurrency(selectedRoom.price_per_night * nights)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
                      <p className="text-xs text-slate-400 text-center sm:text-left">
                        ✓ Recorded directly at Hotel Ratna Forever front desk. No WhatsApp messages required.
                      </p>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="shimmer-btn flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-950 shadow-xl transition-all sm:w-auto"
                      >
                        {submitting ? (
                          <>
                            <svg className="h-4 w-4 animate-spin text-slate-950" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Confirming with Front Desk...</span>
                          </>
                        ) : (
                          <>
                            <span>Confirm Reservation</span>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 4: CONFIRMATION & INTEGRATED PAYMENT */}
              {step === 4 && confirmation && (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                  {/* Confirmed Banner */}
                  <div className="glass-card rounded-2xl border-emerald-500/30 p-6 sm:p-10 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/10">
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-widest text-emerald-400">
                      Reservation Successfully Confirmed
                    </span>
                    <h2 className="mt-2 font-serif text-3xl font-semibold text-white sm:text-4xl">
                      We Look Forward to Welcoming You
                    </h2>
                    <p className="mx-auto mt-2 max-w-lg text-sm text-slate-300">
                      Your booking is registered in the front desk management system. Keep your booking reference handy.
                    </p>

                    <div className="mx-auto mt-6 inline-flex flex-col items-center justify-center rounded-xl border border-amber-400/40 bg-slate-950/80 px-8 py-4 shadow-xl">
                      <span className="text-xs uppercase tracking-widest text-slate-400">Booking Reference</span>
                      <span className="mt-1 font-mono text-3xl font-bold tracking-wider text-amber-400">
                        {confirmation.reference}
                      </span>
                    </div>

                    <div className="mt-8 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4 border-t border-white/10 pt-6">
                      <div className="p-3 rounded-lg bg-white/5">
                        <span className="block text-xs text-slate-400 uppercase">Guest</span>
                        <span className="mt-1 block text-sm font-semibold text-white">{confirmation.guest_name}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5">
                        <span className="block text-xs text-slate-400 uppercase">Stay Dates</span>
                        <span className="mt-1 block text-sm font-semibold text-white">
                          {prettyDate(confirmation.check_in)} → {prettyDate(confirmation.check_out)}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5">
                        <span className="block text-xs text-slate-400 uppercase">Room Type</span>
                        <span className="mt-1 block text-sm font-semibold text-white">{confirmation.room_type}</span>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5">
                        <span className="block text-xs text-slate-400 uppercase">Estimated Total</span>
                        <span className="mt-1 block text-sm font-semibold text-amber-400">
                          {formatCurrency(confirmation.estimated_total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Integrated UPI Advance Payment */}
                  <div className="glass-card rounded-2xl p-6 sm:p-10">
                    <div className="border-b border-white/10 pb-6">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-slate-950">
                          ₹
                        </span>
                        <h3 className="font-serif text-xl font-semibold text-white">
                          Pay Advance Deposit via UPI
                        </h3>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">
                        Paying a small advance (recommended ₹500 - ₹1,000) guarantees priority room allocation upon your arrival.
                      </p>
                    </div>

                    {!paymentSuccess ? (
                      <div className="mt-6 grid gap-8 md:grid-cols-2">
                        {/* UPI Details */}
                        <div className="space-y-5">
                          <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Hotel UPI Handle
                            </span>
                            <div className="mt-2 flex items-center justify-between rounded-xl border border-white/15 bg-slate-950/80 p-3">
                              <span className="font-mono text-sm text-amber-400 font-medium">{UPI_ID}</span>
                              <span className="text-xs text-slate-400">{UPI_NAME}</span>
                            </div>
                          </div>

                          <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Choose Advance Amount
                            </span>
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              {[500, 1000, confirmation.estimated_total].map((amt) => (
                                <button
                                  key={amt}
                                  type="button"
                                  onClick={() => setPayAmount(amt)}
                                  className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                                    payAmount === amt
                                      ? "border-amber-400 bg-amber-400/20 text-amber-300"
                                      : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25"
                                  }`}
                                >
                                  {formatCurrency(amt)}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2">
                            <a
                              href={`upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(
                                UPI_NAME,
                              )}&am=${payAmount}&cu=INR&tn=${encodeURIComponent(
                                `Advance ${confirmation.reference}`,
                              )}`}
                              className="shimmer-btn flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg"
                            >
                              <span>Open UPI App to Pay {formatCurrency(payAmount)}</span>
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                            <p className="mt-2 text-center text-xs text-slate-500">
                              (Works on GPay, PhonePe, Paytm or BHIM on mobile devices)
                            </p>
                          </div>
                        </div>

                        {/* Submit UTR */}
                        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-5">
                          <h4 className="text-sm font-semibold text-white">Record Transaction Number (UTR)</h4>
                          <p className="mt-1 text-xs text-slate-400">
                            After completing the UPI transfer, enter the 12-digit UTR or Transaction Ref ID so our accounts team can log it against your reservation.
                          </p>

                          <form onSubmit={handleRecordNewPayment} className="mt-4 space-y-4">
                            <div>
                              <label className="block text-xs font-medium uppercase text-slate-300">
                                UPI 12-Digit Reference / UTR *
                              </label>
                              <input
                                type="text"
                                required
                                value={utrNumber}
                                onChange={(e) => setUtrNumber(e.target.value)}
                                placeholder="e.g. 423819283741"
                                className="mt-1 w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                              />
                            </div>

                            {paymentError && (
                              <p className="text-xs text-rose-400">{paymentError}</p>
                            )}

                            <button
                              type="submit"
                              disabled={submittingPayment}
                              className="w-full rounded-lg bg-white/10 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-amber-500 hover:text-slate-950"
                            >
                              {submittingPayment ? "Recording Payment..." : "Submit Payment UTR"}
                            </button>
                          </form>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
                        <p className="text-sm font-semibold text-emerald-300">
                          ✓ Payment details recorded against booking {confirmation.reference}!
                        </p>
                        <p className="mt-1 text-xs text-slate-300">
                          Our reception will reconcile this upon your check-in. Have a pleasant stay!
                        </p>
                      </div>
                    )}

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
                      <a
                        href={`tel:${PHONE}`}
                        className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-amber-400"
                      >
                        <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Need assistance? Call Front Desk: {PHONE_DISPLAY}
                      </a>
                      <Link
                        to="/"
                        className="rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
                      >
                        Return to Homepage
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LOOK UP & PAY EXISTING RESERVATION */}
          {activeTab === "manage" && (
            <div className="glass-card rounded-2xl p-6 sm:p-10 space-y-8">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-white">Find Existing Reservation</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Enter your booking reference code and the phone number provided during booking to check status or record an advance payment.
                </p>
              </div>

              <form onSubmit={handleLookup} className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Booking Reference *
                  </label>
                  <input
                    type="text"
                    required
                    value={lookupRef}
                    onChange={(e) => setLookupRef(e.target.value.toUpperCase())}
                    placeholder="e.g. RF-4819"
                    className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-2.5 text-sm font-mono text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value)}
                    placeholder="e.g. 9845012345"
                    className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={lookupLoading}
                    className="shimmer-btn flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-md transition-all hover:bg-amber-300"
                  >
                    {lookupLoading ? "Searching..." : "Find Reservation"}
                  </button>
                </div>
              </form>

              {lookupError && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
                  {lookupError}
                </div>
              )}

              {/* Looked Up Booking Card */}
              {lookupBookingData && (
                <div className="rounded-xl border border-white/15 bg-slate-950/80 p-6 space-y-6">
                  <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-slate-400">Reference</span>
                      <h3 className="font-mono text-2xl font-bold text-amber-400">{lookupBookingData.reference}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-amber-400/10 border border-amber-400/30 px-3 py-1 text-xs font-semibold text-amber-300">
                        Status: {lookupBookingData.status}
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300">
                        Payment: {lookupBookingData.payment_status}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                    <div>
                      <span className="block text-xs text-slate-500">Guest Name</span>
                      <span className="font-medium text-white">{lookupBookingData.guest_name}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500">Dates</span>
                      <span className="font-medium text-white">
                        {prettyDate(lookupBookingData.check_in)} → {prettyDate(lookupBookingData.check_out)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500">Room</span>
                      <span className="font-medium text-white">{lookupBookingData.room_type}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500">Estimated Total</span>
                      <span className="font-bold text-amber-400">{formatCurrency(lookupBookingData.estimated_total)}</span>
                    </div>
                  </div>

                  {/* Pay Advance for looked up booking */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
                    <h4 className="text-sm font-semibold text-white">Pay Advance for this Reservation</h4>
                    <p className="text-xs text-slate-400">
                      Send payment via UPI to <strong className="text-amber-400">{UPI_ID}</strong> ({UPI_NAME}) and submit the transaction ID below.
                    </p>

                    {!managePaySuccess ? (
                      <form onSubmit={handleManagePayment} className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs text-slate-400">Amount (INR)</label>
                          <input
                            type="number"
                            value={managePayAmount}
                            onChange={(e) => setManagePayAmount(Number(e.target.value))}
                            className="mt-1 w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400">12-Digit UTR / Ref ID *</label>
                          <input
                            type="text"
                            required
                            value={manageUtr}
                            onChange={(e) => setManageUtr(e.target.value)}
                            placeholder="e.g. 423819283741"
                            className="mt-1 w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="submit"
                            disabled={manageSubmittingPay}
                            className="w-full rounded-lg bg-amber-400 py-2.5 text-xs font-bold uppercase text-slate-950 hover:bg-amber-300"
                          >
                            {manageSubmittingPay ? "Saving..." : "Submit UTR"}
                          </button>
                        </div>
                        {managePayError && <p className="text-xs text-rose-400 sm:col-span-3">{managePayError}</p>}
                      </form>
                    ) : (
                      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 text-center">
                        ✓ Payment details saved successfully! Our reception team will verify upon check-in.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </section>
    </>
  );
}
