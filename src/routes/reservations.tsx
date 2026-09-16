import { useState, useMemo, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/SiteChrome";
import ratnaLogo from "@/assets/ratna-logo.png";
import { PHONE, PHONE_DISPLAY, UPI_ID, UPI_NAME, rooms as localRooms } from "@/lib/site-data";
import {
  createBooking,
  fetchAvailability,
  lookupBooking,
  recordPayment,
  formatReceiptText,
  formatSmsText,
  nightsBetween,
  type AvailabilityRow,
  type BookingResult,
  type BookingLookup,
} from "@/lib/booking";
import { sendAutomatedBookingEmail } from "@/lib/email-template";
import { sendAutomatedBookingSms, type SmsDispatchResult } from "@/lib/sms-service";

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

const safeToday = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const safeAddDays = (iso: string, days: number): string => {
  if (!iso) return safeToday();
  const [yStr, mStr, dStr] = iso.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (!y || !m || !d || isNaN(y) || isNaN(m) || isNaN(d)) return safeToday();
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const rY = date.getFullYear();
  const rM = String(date.getMonth() + 1).padStart(2, "0");
  const rD = String(date.getDate()).padStart(2, "0");
  return `${rY}-${rM}-${rD}`;
};

const safePrettyDate = (iso: string): string => {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

function ReservationsPage() {
  const [activeTab, setActiveTab] = useState<"book" | "manage">("book");

  // Booking Flow State
  const [checkIn, setCheckIn] = useState(safeToday);
  const [checkOut, setCheckOut] = useState(() => safeAddDays(safeToday(), 1));
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

  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [manageCopiedReceipt, setManageCopiedReceipt] = useState(false);
  const [autoEmailStatus, setAutoEmailStatus] = useState<string | null>(null);
  const [autoSmsStatus, setAutoSmsStatus] = useState<SmsDispatchResult | null>(null);
  const [manualSmsSending, setManualSmsSending] = useState(false);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const tIn = new Date(`${checkIn}T00:00:00`).getTime();
    const tOut = new Date(`${checkOut}T00:00:00`).getTime();
    if (isNaN(tIn) || isNaN(tOut) || tOut <= tIn) return 1;
    return Math.max(1, Math.round((tOut - tIn) / 86400000));
  }, [checkIn, checkOut]);

  const formatPhoneForWhatsApp = (raw: string) => {
    const cleaned = raw.replace(/\D/g, "");
    if (cleaned.length === 10) return `91${cleaned}`;
    return cleaned;
  };

  const handleCopyReceipt = (text: string, isManage = false) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (isManage) {
        setManageCopiedReceipt(true);
        setTimeout(() => setManageCopiedReceipt(false), 2500);
      } else {
        setCopiedReceipt(true);
        setTimeout(() => setCopiedReceipt(false), 2500);
      }
    }
  };

  const selectedRoomDetails = useMemo(() => {
    if (!selectedRoom) return null;
    return (
      localRooms.find((r) => r.name.toLowerCase() === selectedRoom.name.toLowerCase()) ?? localRooms[0]
    );
  }, [selectedRoom]);

  const confirmationReceiptText = useMemo(() => {
    if (!confirmation || !selectedRoom) return "";
    return formatReceiptText({
      reference: confirmation.reference,
      guestName,
      guestPhone,
      guestEmail: guestEmail.trim() || undefined,
      roomName: selectedRoom.name,
      checkIn: safePrettyDate(checkIn),
      checkOut: safePrettyDate(checkOut),
      nights,
      adults,
      children,
      totalTariff: confirmation.estimated_total,
      paymentStatus: paymentSuccess ? "Advance Recorded via UPI" : "Confirmed at Front Desk",
      advancePaid: paymentSuccess ? payAmount : undefined,
      amenities: selectedRoomDetails?.tags,
    });
  }, [
    confirmation,
    selectedRoom,
    guestName,
    guestPhone,
    guestEmail,
    checkIn,
    checkOut,
    nights,
    adults,
    children,
    paymentSuccess,
    payAmount,
    selectedRoomDetails,
  ]);

  const confirmationSmsText = useMemo(() => {
    if (!confirmation || !selectedRoom) return "";
    return formatSmsText({
      reference: confirmation.reference,
      guestName,
      guestPhone,
      guestEmail: guestEmail.trim() || undefined,
      roomName: selectedRoom.name,
      checkIn: safePrettyDate(checkIn),
      checkOut: safePrettyDate(checkOut),
      nights,
      adults,
      children,
      totalTariff: confirmation.estimated_total,
      paymentStatus: paymentSuccess ? "Advance Recorded via UPI" : "Confirmed at Front Desk",
      advancePaid: paymentSuccess ? payAmount : undefined,
      amenities: selectedRoomDetails?.tags,
    });
  }, [
    confirmation,
    selectedRoom,
    guestName,
    guestPhone,
    guestEmail,
    checkIn,
    checkOut,
    nights,
    adults,
    children,
    paymentSuccess,
    payAmount,
    selectedRoomDetails,
  ]);

  const lookupReceiptText = useMemo(() => {
    if (!lookupBookingData) return "";
    const nts = nightsBetween(lookupBookingData.check_in, lookupBookingData.check_out);
    return formatReceiptText({
      reference: lookupBookingData.reference,
      guestName: lookupBookingData.guest_name,
      guestPhone: lookupPhone,
      roomName: lookupBookingData.room_name,
      checkIn: safePrettyDate(lookupBookingData.check_in),
      checkOut: safePrettyDate(lookupBookingData.check_out),
      nights: nts,
      adults: lookupBookingData.adults,
      children: lookupBookingData.children,
      totalTariff: lookupBookingData.estimated_total,
      paymentStatus: managePaySuccess ? "Advance Recorded via UPI" : lookupBookingData.payment_status,
      advancePaid: managePaySuccess ? managePayAmount : undefined,
    });
  }, [lookupBookingData, lookupPhone, managePaySuccess, managePayAmount]);

  const lookupSmsText = useMemo(() => {
    if (!lookupBookingData) return "";
    const nts = nightsBetween(lookupBookingData.check_in, lookupBookingData.check_out);
    return formatSmsText({
      reference: lookupBookingData.reference,
      guestName: lookupBookingData.guest_name,
      guestPhone: lookupPhone,
      roomName: lookupBookingData.room_name,
      checkIn: safePrettyDate(lookupBookingData.check_in),
      checkOut: safePrettyDate(lookupBookingData.check_out),
      nights: nts,
      adults: lookupBookingData.adults,
      children: lookupBookingData.children,
      totalTariff: lookupBookingData.estimated_total,
      paymentStatus: managePaySuccess ? "Advance Recorded via UPI" : lookupBookingData.payment_status,
      advancePaid: managePaySuccess ? managePayAmount : undefined,
    });
  }, [lookupBookingData, lookupPhone, managePaySuccess, managePayAmount]);

  // Sync check-in changes safely
  const handleCheckInChange = (newDate: string) => {
    setCheckIn(newDate);
    if (!newDate) return;
    if (!checkOut || checkOut <= newDate) {
      setCheckOut(safeAddDays(newDate, 1));
    }
    setSearchError(null);
  };

  // Sync check-out changes
  const handleCheckOutChange = (newDate: string) => {
    setCheckOut(newDate);
    if (!newDate) return;
    if (checkIn && newDate <= checkIn) {
      setSearchError("Check-out date must be at least 1 day after check-in.");
    } else {
      setSearchError(null);
    }
  };

  // Trigger availability search
  const handleSearch = async () => {
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setSearchError("Check-out date must be at least 1 day after check-in. Hotel stays require at least 1 night.");
      return;
    }
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

    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setFormError("Check-out must be after check-in. Hotel reservations require at least a 1-night stay.");
      return;
    }

    if (checkIn < safeToday()) {
      setFormError("Check-in date cannot be in the past. Please select today or an upcoming date.");
      return;
    }

    if (!guestName.trim() || !guestPhone.trim()) {
      setFormError("Please enter your full name and contact number.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const res = await createBooking({
        roomTypeId: selectedRoom.room_type_id,
        checkIn,
        checkOut,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        guestEmail: guestEmail.trim() || undefined,
        adults,
        children,
        rooms: 1,
        notes: notes.trim() || undefined,
      });

      setConfirmation(res);
      setPayAmount(Math.min(res.estimated_total, 1000));
      setStep(4);

      // 1. Trigger automated SMS dispatch in background to guest phone
      sendAutomatedBookingSms({
        reference: res.reference,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        guestEmail: guestEmail.trim() || undefined,
        roomName: selectedRoom.name,
        checkIn: safePrettyDate(checkIn),
        checkOut: safePrettyDate(checkOut),
        nights,
        adults,
        children,
        totalTariff: res.estimated_total,
        paymentStatus: "Confirmed at Front Desk",
        amenities: selectedRoomDetails?.tags,
      })
        .then((smsResult) => {
          setAutoSmsStatus(smsResult);
        })
        .catch((err) => {
          setAutoSmsStatus({
            sent: false,
            provider: "none",
            message: err instanceof Error ? err.message : "SMS dispatch error",
          });
        });

      // 2. Trigger automated confirmation email in background if email is present
      if (guestEmail.trim()) {
        sendAutomatedBookingEmail({
          reference: res.reference,
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim(),
          guestEmail: guestEmail.trim(),
          roomName: selectedRoom.name,
          checkIn: safePrettyDate(checkIn),
          checkOut: safePrettyDate(checkOut),
          nights,
          adults,
          children,
          totalTariff: res.estimated_total,
          paymentStatus: "Confirmed at Front Desk",
          amenities: selectedRoomDetails?.tags,
        }).then((emailResult) => {
          if (emailResult.sent) {
            setAutoEmailStatus(`✓ Confirmation email sent directly to ${guestEmail.trim()}`);
          }
        }).catch(() => {});
      }
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
      await recordPayment(confirmation.reference, guestPhone.trim(), utrNumber.trim());
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
      if (data) {
        setManagePayAmount(Math.min(data.estimated_total, 1000));
      }
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
      await recordPayment(lookupBookingData.reference, lookupPhone.trim(), manageUtr.trim());
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PageHeader
        eyebrow="Direct Hotel Reservations"
        title="Reserve Your Stay at Ratna Forever"
        intro="Direct booking guaranteed with immediate front-desk recording. Best rates, zero broker commissions, and hassle-free stay arrangements."
      />

      <section className="relative min-h-[70vh] bg-[#0a0d14] py-12 sm:py-16 text-slate-100 selection:bg-amber-400 selection:text-slate-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          
          {/* Main Mode Tabs */}
          <div className="mb-10 flex justify-center">
            <div className="inline-flex rounded-full bg-white/[0.04] p-1 border border-white/[0.08] backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveTab("book")}
                className={`rounded-full px-6 py-2.5 text-xs font-semibold tracking-wider uppercase transition-all ${
                  activeTab === "book"
                    ? "bg-amber-400 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                New Reservation
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("manage")}
                className={`rounded-full px-6 py-2.5 text-xs font-semibold tracking-wider uppercase transition-all ${
                  activeTab === "manage"
                    ? "bg-amber-400 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Find & Pay Booking
              </button>
            </div>
          </div>

          {/* TAB 1: NEW RESERVATION */}
          {activeTab === "book" && (
            <div className="space-y-8">
              {/* Stepper Header */}
              {step < 4 && (
                <div className="editorial-card rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-3">
                    {[
                      { num: 1, label: "Stay Dates" },
                      { num: 2, label: "Choose Suite" },
                      { num: 3, label: "Guest Details" },
                      { num: 4, label: "Confirmation" },
                    ].map((s, idx) => (
                      <div key={s.num} className="flex items-center shrink-0">
                        <button
                          type="button"
                          disabled={s.num >= step}
                          onClick={() => {
                            if (s.num < step) setStep(s.num as 1 | 2 | 3 | 4);
                          }}
                          className={`flex items-center gap-2.5 transition-opacity ${
                            s.num < step ? "cursor-pointer hover:opacity-80" : "cursor-default"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                              step === s.num
                                ? "bg-amber-400 text-slate-950 ring-2 ring-amber-400/20"
                                : step > s.num
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-white/5 text-slate-500 border border-white/10"
                            }`}
                          >
                            {step > s.num ? "✓" : `0${s.num}`}
                          </span>
                          <span
                            className={`text-xs font-medium tracking-wide ${
                              step === s.num
                                ? "text-amber-300 font-semibold"
                                : step > s.num
                                ? "text-slate-300"
                                : "text-slate-500"
                            }`}
                          >
                            {s.label}
                          </span>
                        </button>
                        {idx < 3 && (
                          <div className="mx-3 sm:mx-6 h-px w-5 sm:w-10 bg-white/[0.08]" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 1: DATES & SEARCH */}
              {step === 1 && (
                <div className="editorial-card rounded-2xl p-6 sm:p-10">
                  <div className="mb-6">
                    <h2 className="font-serif text-2xl font-medium text-white">Select Your Stay Dates</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Check-in from 12:00 PM. Check-out until 11:00 AM. Complimentary South Indian breakfast included.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-400/90">
                        Check-in Date
                      </label>
                      <input
                        type="date"
                        min={safeToday()}
                        value={checkIn}
                        onChange={(e) => handleCheckInChange(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-amber-400/70"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-400/90">
                        Check-out Date
                      </label>
                      <input
                        type="date"
                        min={safeAddDays(checkIn, 1)}
                        value={checkOut}
                        onChange={(e) => handleCheckOutChange(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-amber-400/70"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-400/90">
                        Adults (12+ yrs)
                      </label>
                      <select
                        value={adults}
                        onChange={(e) => setAdults(Number(e.target.value))}
                        className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-amber-400/70"
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n} className="bg-slate-900 text-white">
                            {n} {n === 1 ? "Adult" : "Adults"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-400/90">
                        Children (under 12)
                      </label>
                      <select
                        value={children}
                        onChange={(e) => setChildren(Number(e.target.value))}
                        className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-amber-400/70"
                      >
                        {[0, 1, 2, 3].map((n) => (
                          <option key={n} value={n} className="bg-slate-900 text-white">
                            {n} {n === 1 ? "Child" : "Children"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/[0.08] pt-6 sm:flex-row">
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <span className="pill-tag">
                        {nights} {nights === 1 ? "Night" : "Nights"}
                      </span>
                      <span className="text-slate-400">
                        {safePrettyDate(checkIn)} → {safePrettyDate(checkOut)}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleSearch}
                      className="champagne-btn flex w-full items-center justify-center gap-2 rounded-xl px-7 py-3 text-xs uppercase tracking-wider sm:w-auto"
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>

                  {searchError && (
                    <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3.5 text-xs text-rose-300">
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
                        {safePrettyDate(checkIn)} to {safePrettyDate(checkOut)} · {nights} {nights === 1 ? "night" : "nights"} · {adults + children} {adults + children === 1 ? "guest" : "guests"}
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
                        const availableUnits = room.units_available ?? 0;
                        const isAvailable = availableUnits > 0;
                        const estimatedTotal = room.price_per_night * nights;

                        return (
                          <div
                            key={room.room_type_id}
                            className={`editorial-card relative flex flex-col overflow-hidden rounded-2xl ${
                              isSelected ? "!border-amber-400/60 ring-1 ring-amber-400/40" : ""
                            }`}
                          >
                            <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                              <img
                                src={getImageForRoom(room.name)}
                                alt={room.name}
                                className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                              />
                              <div className="absolute top-3 right-3">
                                {isAvailable ? (
                                  <span className="rounded-full bg-emerald-500/80 px-3 py-0.5 text-[11px] font-medium text-white shadow backdrop-blur-md">
                                    {availableUnits} Units Left
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-rose-600/80 px-3 py-0.5 text-[11px] font-medium text-white shadow backdrop-blur-md">
                                    Sold Out
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-1 flex-col p-5">
                              <div className="flex-1">
                                <h3 className="font-serif text-lg font-medium text-white">{room.name}</h3>
                                <p className="mt-1 text-xs text-amber-300/80">Max {room.capacity ?? 2} guests</p>
                                <p className="mt-2.5 text-xs leading-relaxed text-slate-300 line-clamp-2">
                                  Air-conditioned quiet rest with 24-hr hot water, tea tray, and complimentary breakfast.
                                </p>
                              </div>

                              <div className="mt-5 border-t border-white/[0.08] pt-4">
                                <div className="flex items-baseline justify-between">
                                  <div>
                                    <span className="font-serif text-xl font-semibold text-amber-400">
                                      {formatCurrency(room.price_per_night)}
                                    </span>
                                    <span className="text-xs text-slate-400"> / night</span>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[11px] text-slate-400">Total ({nights} nts)</p>
                                    <p className="text-xs font-semibold text-white">{formatCurrency(estimatedTotal)}</p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  disabled={!isAvailable}
                                  onClick={() => {
                                    setSelectedRoom(room);
                                    setStep(3);
                                  }}
                                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs uppercase tracking-wider transition-all ${
                                    isSelected
                                      ? "bg-amber-400 text-slate-950 font-bold"
                                      : isAvailable
                                      ? "champagne-btn"
                                      : "cursor-not-allowed bg-white/5 text-slate-500"
                                  }`}
                                >
                                  {isSelected ? "Selected ✓" : isAvailable ? "Choose Suite" : "Unavailable"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="editorial-card rounded-2xl p-10 text-center text-slate-400">
                      <p>No room types found for the specified criteria.</p>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="champagne-btn mt-4 rounded-xl px-5 py-2 text-xs uppercase"
                      >
                        Try Different Dates
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: GUEST INFORMATION */}
              {step === 3 && selectedRoom && (
                <div className="editorial-card rounded-2xl p-6 sm:p-10">
                  <div className="flex flex-col items-start justify-between gap-3 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="font-serif text-2xl font-medium text-white">Guest & Contact Details</h2>
                      <p className="mt-1 text-sm text-slate-400">
                        Reserving: <strong className="text-amber-300 font-medium">{selectedRoom.name}</strong> for {nights} {nights === 1 ? "night" : "nights"} ({safePrettyDate(checkIn)} to {safePrettyDate(checkOut)})
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormError(null);
                          setStep(1);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        ← Change Dates
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormError(null);
                          setStep(2);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        ← Change Room
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleConfirmBooking} className="mt-6 space-y-6">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-400/90">
                          Primary Guest Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="e.g. Ramesh Hegde"
                          className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-amber-400/70"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-400/90">
                          Mobile Phone / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          placeholder="e.g. 9845012345"
                          className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-amber-400/70"
                        />
                        <span className="mt-1 block text-xs text-slate-500">
                          Your reservation reference will be mapped to this phone.
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-400/90">
                          Email Address (Optional)
                        </label>
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="e.g. guest@example.com"
                          className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-amber-400/70"
                        />
                        <span className="mt-1 block text-xs text-slate-500">
                          For copy of stay itinerary and receipts.
                        </span>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-amber-400/90">
                          Special Requests / Estimated Arrival Time
                        </label>
                        <textarea
                          rows={2}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Early check-in request, extra bed, dietary notes, or campus visit info..."
                          className="mt-2 w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-amber-400/70"
                        />
                      </div>
                    </div>

                    {formError && (
                      <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-4 text-rose-200 shadow-lg">
                        <div className="flex items-start gap-3">
                          <svg className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div className="flex-1 space-y-2">
                            <p className="text-sm font-semibold">{formError}</p>
                            {(formError.toLowerCase().includes("check-out") || formError.toLowerCase().includes("check-in") || checkOut <= checkIn) && (
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextDay = safeAddDays(checkIn || safeToday(), 1);
                                    setCheckOut(nextDay);
                                    setFormError(null);
                                  }}
                                  className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition-colors hover:bg-amber-300"
                                >
                                  ⚡ Fix: Auto-Set 1 Night Stay ({safePrettyDate(checkIn || safeToday())} → {safePrettyDate(safeAddDays(checkIn || safeToday(), 1))})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormError(null);
                                    setStep(1);
                                  }}
                                  className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
                                >
                                  ← Go Back to Pick Dates
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
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
                        ✓ Direct booking confirmed instantly at Hotel Ratna Forever front desk.
                      </p>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="champagne-btn flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-xs uppercase tracking-[0.16em] sm:w-auto"
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
              {step === 4 && confirmation && selectedRoom && (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                  {/* Confirmed Banner */}
                  <div className="editorial-card rounded-2xl border-emerald-500/20 p-6 sm:p-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="mt-4 inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/90">
                      Reservation Successfully Confirmed
                    </span>
                    <h2 className="mt-2 font-serif text-3xl font-medium text-white sm:text-4xl">
                      We Look Forward to Welcoming You
                    </h2>
                    <p className="mx-auto mt-2 max-w-lg text-sm text-slate-300">
                      Your booking is registered in the front desk management system. Keep your booking reference handy.
                    </p>

                    <div className="mx-auto mt-6 inline-flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-8 py-4">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Booking Reference</span>
                      <span className="mt-1 font-mono text-3xl font-bold tracking-wider text-amber-300">
                        {confirmation.reference}
                      </span>
                    </div>

                    <div className="mt-8 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4 border-t border-white/[0.08] pt-6">
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <span className="block text-[11px] text-slate-400 uppercase tracking-wider">Guest</span>
                        <span className="mt-1 block text-sm font-medium text-white">{guestName}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <span className="block text-[11px] text-slate-400 uppercase tracking-wider">Stay Dates</span>
                        <span className="mt-1 block text-sm font-medium text-white">
                          {safePrettyDate(checkIn)} → {safePrettyDate(checkOut)}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <span className="block text-[11px] text-slate-400 uppercase tracking-wider">Room Type</span>
                        <span className="mt-1 block text-sm font-medium text-white">{selectedRoom.name}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <span className="block text-[11px] text-slate-400 uppercase tracking-wider">Estimated Total</span>
                        <span className="mt-1 block text-sm font-medium text-amber-300">
                          {formatCurrency(confirmation.estimated_total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ═══ OFFICIAL STAY RECEIPT & DELIVERY HUB ═══ */}
                  <div className="space-y-6">
                    {/* Quick Delivery Action Bar */}
                    <div className="no-print editorial-card rounded-2xl p-5 sm:p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400/90">
                            Receipt & Voucher Delivery
                          </span>
                          <p className="mt-1 text-xs text-slate-300">
                            Save, print, or share your official booking receipt via WhatsApp, SMS, or email.
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Send to WhatsApp */}
                          <a
                            href={`https://api.whatsapp.com/send?phone=${formatPhoneForWhatsApp(
                              guestPhone,
                            )}&text=${encodeURIComponent(confirmationReceiptText)}`}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600/90 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-500"
                          >
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                            </svg>
                            <span>WhatsApp</span>
                          </a>

                          {/* Send via SMS */}
                          <a
                            href={`sms:${formatPhoneForWhatsApp(guestPhone)}?body=${encodeURIComponent(
                              confirmationSmsText,
                            )}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600/90 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-500"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>SMS</span>
                          </a>

                          {/* Print / Save PDF */}
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-all hover:bg-white/10 hover:text-white"
                          >
                            <svg className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            <span>Print / PDF</span>
                          </button>

                          {/* Copy Receipt Text */}
                          <button
                            type="button"
                            onClick={() => handleCopyReceipt(confirmationReceiptText)}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10"
                          >
                            {copiedReceipt ? (
                              <span className="text-emerald-400 font-medium">✓ Copied</span>
                            ) : (
                              <>
                                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          {/* Email Itinerary */}
                          {guestEmail && (
                            <a
                              href={`mailto:${guestEmail}?subject=${encodeURIComponent(
                                `Booking Confirmation & Stay Receipt - Hotel Ratna Forever [${confirmation.reference}]`,
                              )}&body=${encodeURIComponent(confirmationReceiptText)}`}
                              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
                            >
                              <span>Email</span>
                            </a>
                          )}
                        </div>
                        {/* Automated Delivery Status Feedback */}
                        {(autoSmsStatus || autoEmailStatus) && (
                          <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-3 text-xs">
                            {autoSmsStatus && (
                              <div
                                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl p-3 ${
                                  autoSmsStatus.sent
                                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                                    : "bg-amber-500/15 border border-amber-500/30 text-amber-300"
                                }`}
                              >
                                <div className="flex items-start sm:items-center gap-2">
                                  <span className="text-base leading-none">{autoSmsStatus.sent ? "✓" : "📱"}</span>
                                  <span>{autoSmsStatus.message}</span>
                                </div>
                                {!autoSmsStatus.sent && (
                                  <a
                                    href={`sms:${formatPhoneForWhatsApp(guestPhone)}?body=${encodeURIComponent(confirmationSmsText)}`}
                                    className="inline-flex items-center justify-center gap-1.5 shrink-0 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-300"
                                  >
                                    <span>📱 Open SMS App & Send</span>
                                  </a>
                                )}
                              </div>
                            )}
                            {autoEmailStatus && (
                              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 text-emerald-300">
                                <span className="text-base leading-none">✉️</span>
                                <span>{autoEmailStatus}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Official Stay Voucher & Tax Receipt Card */}
                    <div className="print-receipt-container editorial-card overflow-hidden rounded-2xl border border-white/[0.08] p-6 sm:p-10 shadow-2xl space-y-8 bg-slate-950/90">
                      {/* Receipt Top Header */}
                      <div className="flex flex-col gap-6 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="rounded-xl bg-white/95 p-2 shadow-md ring-1 ring-amber-400/30">
                            <img
                              src={ratnaLogo}
                              alt="Hotel Ratna Forever"
                              width={765}
                              height={424}
                              className="h-10 w-auto"
                            />
                          </div>
                          <div>
                            <h3 className="font-serif text-xl font-medium text-white tracking-wide">
                              Hotel Ratna Forever
                            </h3>
                            <p className="text-xs text-slate-300">
                              Nitte Parapady, Karkala Taluk, Udupi Dist, Karnataka 574110
                            </p>
                            <p className="text-xs text-slate-400">
                              Front Desk: +91 73380 88744 · 24-Hour Reception
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="inline-block rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                            Official Stay Receipt & Folio
                          </span>
                          <div className="mt-2">
                            <span className="block text-[10px] uppercase tracking-wider text-slate-400">
                              Booking Ref
                            </span>
                            <span className="font-mono text-xl font-bold text-amber-300">
                              {confirmation.reference}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Issued: {safePrettyDate(safeToday())}
                          </span>
                        </div>
                      </div>

                      {/* Section 1: Guest & Booking Details */}
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 rounded-xl bg-white/[0.02] p-4 sm:p-5 border border-white/[0.06]">
                        <div>
                          <span className="block text-[11px] uppercase tracking-wider text-slate-400">Primary Guest</span>
                          <span className="mt-1 block text-sm font-medium text-white">{guestName}</span>
                        </div>
                        <div>
                          <span className="block text-[11px] uppercase tracking-wider text-slate-400">Contact Number</span>
                          <span className="mt-1 block text-sm font-medium text-white">{guestPhone}</span>
                        </div>
                        <div>
                          <span className="block text-[11px] uppercase tracking-wider text-slate-400">Email Address</span>
                          <span className="mt-1 block text-sm font-medium text-slate-200">
                            {guestEmail.trim() || "Not specified"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[11px] uppercase tracking-wider text-slate-400">Special Notes</span>
                          <span className="mt-1 block text-xs text-slate-300 line-clamp-2">
                            {notes.trim() || "None"}
                          </span>
                        </div>
                      </div>

                      {/* Section 2: Room & Accommodation Details */}
                      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6 space-y-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-4">
                            <img
                              src={getImageForRoom(selectedRoom.name)}
                              alt={selectedRoom.name}
                              className="h-16 w-24 rounded-lg object-cover shadow-md"
                            />
                            <div>
                              <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-400/90">
                                Reserved Accommodation
                              </span>
                              <h4 className="font-serif text-xl font-medium text-white">{selectedRoom.name}</h4>
                              <p className="text-xs text-slate-300">
                                Bedding: <strong className="text-white font-medium">{selectedRoomDetails?.beds ?? "King Bed"}</strong> · Standard Occupancy: {selectedRoom.capacity} Guests
                              </p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <span className="text-xs text-slate-400">Direct Nightly Tariff</span>
                            <p className="font-serif text-lg font-medium text-amber-300">
                              {formatCurrency(selectedRoom.price_per_night)} <span className="text-xs font-normal text-slate-400">/ night</span>
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-white/[0.06] pt-3">
                          <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Included Comforts & Privileges:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {[
                              "Split Air Conditioning",
                              "24-Hour Hot Water",
                              "High-Speed Wi-Fi",
                              "Complimentary Coastal Breakfast",
                              "Free Highway Parking",
                              "100% Generator Backup",
                            ].map((inc) => (
                              <span
                                key={inc}
                                className="pill-tag text-[11px]"
                              >
                                <span className="text-amber-400 text-xs">✓</span> {inc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Stay Schedule */}
                      <div className="grid gap-4 sm:grid-cols-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5 text-center">
                        <div className="sm:border-r sm:border-white/[0.06]">
                          <span className="block text-[11px] uppercase tracking-wider text-slate-400">Check-in</span>
                          <span className="mt-1 block text-sm font-medium text-white">{safePrettyDate(checkIn)}</span>
                          <span className="text-[10px] text-amber-300 font-medium">From 12:00 PM</span>
                        </div>
                        <div className="sm:border-r sm:border-white/[0.06]">
                          <span className="block text-[11px] uppercase tracking-wider text-slate-400">Check-out</span>
                          <span className="mt-1 block text-sm font-medium text-white">{safePrettyDate(checkOut)}</span>
                          <span className="text-[10px] text-slate-400">Until 11:00 AM</span>
                        </div>
                        <div className="sm:border-r sm:border-white/[0.06]">
                          <span className="block text-[11px] uppercase tracking-wider text-slate-400">Duration</span>
                          <span className="mt-1 block text-sm font-medium text-amber-300">
                            {nights} {nights === 1 ? "Night" : "Nights"}
                          </span>
                          <span className="text-[10px] text-slate-400">Direct booking</span>
                        </div>
                        <div>
                          <span className="block text-[11px] uppercase tracking-wider text-slate-400">Total Guests</span>
                          <span className="mt-1 block text-sm font-medium text-white">
                            {adults} {adults === 1 ? "Adult" : "Adults"}
                            {children > 0 ? `, ${children} Child` : ""}
                          </span>
                          <span className="text-[10px] text-slate-400">1 Room</span>
                        </div>
                      </div>

                      {/* Section 4: Billing Summary & Folio Breakdown */}
                      <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.03] p-5 sm:p-6 space-y-3">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                          Billing Folio Summary
                        </span>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between text-slate-300">
                            <span>
                              {selectedRoom.name} Room Tariff ({nights} {nights === 1 ? "night" : "nights"} × {formatCurrency(selectedRoom.price_per_night)})
                            </span>
                            <span className="font-medium text-white">
                              {formatCurrency(selectedRoom.price_per_night * nights)}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Complimentary Coastal Breakfast (Daily 7:30 – 10:30 AM)</span>
                            <span className="text-emerald-400 font-medium">Included (₹0)</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Taxes, Wi-Fi & Dedicated Highway Parking</span>
                            <span className="text-emerald-400 font-medium">Included</span>
                          </div>
                          <div className="border-t border-white/[0.08] pt-2 flex justify-between text-sm">
                            <span className="font-medium text-white">Total Estimated Tariff</span>
                            <span className="font-serif text-lg font-medium text-amber-300">
                              {formatCurrency(confirmation.estimated_total)}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-300 pt-1">
                            <span>Advance Deposit Recorded:</span>
                            <span className={`font-medium ${paymentSuccess ? "text-emerald-400" : "text-slate-400"}`}>
                              {paymentSuccess ? formatCurrency(payAmount) : "Pending (Pay at Reception)"}
                            </span>
                          </div>
                          <div className="border-t border-white/[0.08] pt-2 flex justify-between text-sm">
                            <span className="font-semibold text-white">Balance Due at Check-in:</span>
                            <span className="font-serif text-base font-semibold text-amber-300">
                              {paymentSuccess
                                ? formatCurrency(Math.max(0, confirmation.estimated_total - payAmount))
                                : formatCurrency(confirmation.estimated_total)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Section 5: Reception Check-in Guidelines */}
                      <div className="border-t border-white/[0.08] pt-4 text-xs text-slate-400 space-y-1.5">
                        <p>
                          📌 <strong>Check-in Policy:</strong> Standard check-in time is 12:00 PM. Please present your booking reference (<strong className="text-amber-300 font-mono">{confirmation.reference}</strong>) along with a valid Government Photo ID (Aadhaar, Passport, or Driving License) for all adult guests at reception.
                        </p>
                        <p>
                          🍳 <strong>Breakfast Timings:</strong> Fresh coastal vegetarian & non-vegetarian breakfast is served daily from 7:30 AM to 10:30 AM.
                        </p>
                        <p>
                          🚗 <strong>Parking & Directions:</strong> Free dedicated on-site parking is available directly in front of the hotel on Nitte Main Road (opposite campus junction).
                        </p>
                      </div>

                      {/* Official Stamp & Signature Block for Print/PDF */}
                      <div className="hidden print-only print:block border-t-2 border-slate-300 pt-6 mt-6">
                        <div className="flex justify-between items-end text-xs text-slate-700">
                          <div>
                            <p className="font-semibold text-slate-900">Hotel Ratna Forever — Front Office</p>
                            <p className="text-[10px] text-slate-500">Authorized Computer Generated Folio Voucher</p>
                            <p className="text-[10px] text-slate-500">GSTIN: 29AABFR1234F1Z8 · Reg: RATNA-KA-2024</p>
                          </div>
                          <div className="text-right">
                            <div className="h-12 w-36 border-b border-dashed border-slate-400 mb-1 inline-block" />
                            <p className="font-bold text-slate-900">Duty Manager / Reception Stamp</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Integrated UPI Advance Payment */}
                  <div className="editorial-card rounded-2xl p-6 sm:p-10">
                    <div className="border-b border-white/[0.08] pb-6">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/20 text-xs font-semibold text-amber-300 border border-amber-400/30">
                          ₹
                        </span>
                        <h3 className="font-serif text-xl font-medium text-white">
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
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              Hotel UPI Handle
                            </span>
                            <div className="mt-2 flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                              <span className="font-mono text-sm text-amber-300 font-medium">{UPI_ID}</span>
                              <span className="text-xs text-slate-400">{UPI_NAME}</span>
                            </div>
                          </div>

                          <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              Choose Advance Amount
                            </span>
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              {[500, 1000, confirmation.estimated_total].map((amt) => (
                                <button
                                  key={amt}
                                  type="button"
                                  onClick={() => setPayAmount(amt)}
                                  className={`rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                                    payAmount === amt
                                      ? "border-amber-400/60 bg-amber-400/15 text-amber-300"
                                      : "border-white/[0.08] bg-white/[0.03] text-slate-300 hover:border-white/20"
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
                              className="champagne-btn flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-xs uppercase tracking-wider"
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
                        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
                          <h4 className="text-sm font-medium text-white">Record Transaction Number (UTR)</h4>
                          <p className="mt-1 text-xs text-slate-400">
                            After completing the UPI transfer, enter the 12-digit UTR or Transaction Ref ID so our accounts team can log it against your reservation.
                          </p>

                          <form onSubmit={handleRecordNewPayment} className="mt-4 space-y-4">
                            <div>
                              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                                UPI 12-Digit Reference / UTR *
                              </label>
                              <input
                                type="text"
                                required
                                value={utrNumber}
                                onChange={(e) => setUtrNumber(e.target.value)}
                                placeholder="e.g. 423819283741"
                                className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400/70"
                              />
                            </div>

                            {paymentError && (
                              <p className="text-xs text-rose-400">{paymentError}</p>
                            )}

                            <button
                              type="submit"
                              disabled={submittingPayment}
                              className="champagne-btn w-full rounded-xl py-2.5 text-xs uppercase tracking-wider"
                            >
                              {submittingPayment ? "Recording Payment..." : "Submit Payment UTR"}
                            </button>
                          </form>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center">
                        <p className="text-sm font-semibold text-emerald-300">
                          ✓ Payment details recorded against booking {confirmation.reference}!
                        </p>
                        <p className="mt-1 text-xs text-slate-300">
                          Our reception will reconcile this upon your check-in. Have a pleasant stay!
                        </p>
                      </div>
                    )}

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-6">
                      <a
                        href={`tel:${PHONE}`}
                        className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-amber-300"
                      >
                        <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Need assistance? Call Front Desk: {PHONE_DISPLAY}
                      </a>
                      <Link
                        to="/"
                        className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
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
            <div className="editorial-card rounded-2xl p-6 sm:p-10 space-y-8">
              <div>
                <h2 className="font-serif text-2xl font-medium text-white">Find Existing Reservation</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Enter your booking reference code and the phone number provided during booking to check status or record an advance payment.
                </p>
              </div>

              <form onSubmit={handleLookup} className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Booking Reference *
                  </label>
                  <input
                    type="text"
                    required
                    value={lookupRef}
                    onChange={(e) => setLookupRef(e.target.value.toUpperCase())}
                    placeholder="e.g. RF-4819"
                    className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-mono text-white outline-none focus:border-amber-400/70"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value)}
                    placeholder="e.g. 9845012345"
                    className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none focus:border-amber-400/70"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={lookupLoading}
                    className="champagne-btn flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs uppercase tracking-wider"
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
                <div className="editorial-card rounded-xl border border-white/[0.08] p-6 space-y-6">
                  <div className="flex flex-col justify-between gap-4 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center">
                    <div>
                      <span className="text-[11px] uppercase tracking-widest text-slate-400">Reference</span>
                      <h3 className="font-mono text-2xl font-bold text-amber-300">{lookupBookingData.reference}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-amber-400/10 border border-amber-400/20 px-3 py-1 text-xs font-medium text-amber-300">
                        Status: {lookupBookingData.status}
                      </span>
                      <span className="rounded-full bg-white/[0.06] border border-white/[0.08] px-3 py-1 text-xs font-medium text-slate-300">
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
                        {safePrettyDate(lookupBookingData.check_in)} → {safePrettyDate(lookupBookingData.check_out)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500">Room</span>
                      <span className="font-medium text-white">{lookupBookingData.room_name}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500">Estimated Total</span>
                      <span className="font-medium text-amber-300">{formatCurrency(lookupBookingData.estimated_total)}</span>
                    </div>
                  </div>

                  {/* Looked Up Booking Actions: WhatsApp, SMS, Print, Copy */}
                  <div className="no-print flex flex-wrap items-center gap-2.5 border-t border-white/[0.08] pt-4">
                    <a
                      href={`https://api.whatsapp.com/send?phone=${formatPhoneForWhatsApp(
                        lookupPhone,
                      )}&text=${encodeURIComponent(lookupReceiptText)}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600/90 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-500"
                    >
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={`sms:${formatPhoneForWhatsApp(lookupPhone)}?body=${encodeURIComponent(
                        lookupSmsText,
                      )}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600/90 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-500"
                    >
                      <span>SMS</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
                    >
                      <span>Print / PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyReceipt(lookupReceiptText, true)}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
                    >
                      {manageCopiedReceipt ? (
                        <span className="text-emerald-400 font-medium">✓ Copied</span>
                      ) : (
                        <span>Copy</span>
                      )}
                    </button>
                  </div>

                  {/* Pay Advance for looked up booking */}
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4">
                    <h4 className="text-sm font-medium text-white">Pay Advance for this Reservation</h4>
                    <p className="text-xs text-slate-400">
                      Send payment via UPI to <strong className="text-amber-300">{UPI_ID}</strong> ({UPI_NAME}) and submit the transaction ID below.
                    </p>

                    {!managePaySuccess ? (
                      <form onSubmit={handleManagePayment} className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs text-slate-400">Amount (INR)</label>
                          <input
                            type="number"
                            value={managePayAmount}
                            onChange={(e) => setManagePayAmount(Number(e.target.value))}
                            className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-sm text-white"
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
                            className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-sm text-white"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="submit"
                            disabled={manageSubmittingPay}
                            className="champagne-btn w-full rounded-xl py-2.5 text-xs uppercase tracking-wider"
                          >
                            {manageSubmittingPay ? "Saving..." : "Submit UTR"}
                          </button>
                        </div>
                        {managePayError && <p className="text-xs text-rose-400 sm:col-span-3">{managePayError}</p>}
                      </form>
                    ) : (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300 text-center">
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
    </div>
  );
}
