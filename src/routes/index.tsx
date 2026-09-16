import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import heroExterior from "@/assets/real-exterior.jpg";
import {
  PHONE,
  PHONE_DISPLAY,
  rooms,
  dishes,
  facilities,
  reviews,
  gallery,
} from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hotel Ratna Forever | Luxury Rooms, Dining & Banquets in Nitte" },
      {
        name: "description",
        content:
          "Welcome to Hotel Ratna Forever in Nitte, Karkala Taluk. Premium air-conditioned rooms, celebrated coastal Mangalorean cuisine, grand banquet halls, and 24-hour service. Rated 4.1★ by 2,499+ guests.",
      },
      { property: "og:title", content: "Hotel Ratna Forever, Nitte — Coastal Hospitality at its Finest" },
      {
        property: "og:description",
        content:
          "The premier hotel in Nitte. Minutes from NMAMIT campus, featuring authentic coastal dining, spotless rooms, and instant online reservations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const todayIso = () => new Date().toISOString().slice(0, 10);
const tomorrowIso = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

function HomePage() {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState(todayIso);
  const [checkOut, setCheckOut] = useState(tomorrowIso);
  const [guestCount, setGuestCount] = useState("2");

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/reservations" });
  };

  return (
    <div className="relative overflow-hidden bg-slate-950 text-slate-100">
      {/* ═══ 1. CINEMATIC HERO SECTION ═══ */}
      <section className="relative isolate flex min-h-[95vh] items-center justify-center overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40">
        {/* Background Image with parallax feeling */}
        <div className="absolute inset-0 -z-10">
          <img
            src={heroExterior}
            alt="Hotel Ratna Forever illuminated facade at night in Nitte"
            width={1600}
            height={1080}
            className="h-full w-full object-cover object-center brightness-[0.72] scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12)_0%,transparent_70%)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 text-center sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
              Nitte's Premier Hospitality Landmark
            </span>
          </div>

          <h1 className="mt-6 font-serif text-4xl font-medium tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05]">
            Where Coastal Warmth <br />
            <span className="italic text-amber-400 font-normal">Meets Timeless Rest</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-xl font-light">
            Impeccable air-conditioned rooms, legendary coastal seafood, and grand banquet facilities right on the Nitte main road — moments from the NMAMIT campus.
          </p>

          {/* Floating Booking Quick-Widget */}
          <div className="mx-auto mt-12 max-w-4xl">
            <form
              onSubmit={handleHeroSearch}
              className="glass-card rounded-2xl p-4 sm:p-5 shadow-2xl ring-1 ring-white/15"
            >
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 items-center">
                <div className="text-left px-3 py-2 rounded-xl bg-slate-950/60 border border-white/10">
                  <span className="block text-[0.65rem] font-semibold uppercase tracking-wider text-amber-400">
                    Check-in Date
                  </span>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="mt-1 w-full bg-transparent text-xs font-medium text-white outline-none"
                  />
                </div>

                <div className="text-left px-3 py-2 rounded-xl bg-slate-950/60 border border-white/10">
                  <span className="block text-[0.65rem] font-semibold uppercase tracking-wider text-amber-400">
                    Check-out Date
                  </span>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="mt-1 w-full bg-transparent text-xs font-medium text-white outline-none"
                  />
                </div>

                <div className="text-left px-3 py-2 rounded-xl bg-slate-950/60 border border-white/10">
                  <span className="block text-[0.65rem] font-semibold uppercase tracking-wider text-amber-400">
                    Guests
                  </span>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="mt-1 w-full bg-transparent text-xs font-medium text-white outline-none"
                  >
                    <option value="1" className="bg-slate-900 text-white">1 Guest</option>
                    <option value="2" className="bg-slate-900 text-white">2 Guests</option>
                    <option value="3" className="bg-slate-900 text-white">3 Guests</option>
                    <option value="4" className="bg-slate-900 text-white">4+ Family</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="shimmer-btn h-full min-h-[48px] rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:brightness-110 active:scale-95"
                >
                  Check Availability
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="text-amber-400">✓</span> Best Direct Tariff Guarantee
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-amber-400">✓</span> Free Coastal Breakfast
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-amber-400">✓</span> Instant Confirmation (No WhatsApp needed)
            </span>
          </div>
        </div>
      </section>

      {/* ═══ 2. TRUST & CREDENTIALS BAR ═══ */}
      <section className="relative border-y border-white/10 bg-slate-950/90 py-8 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-4">
            <div className="flex items-center gap-3.5 border-r border-white/10 pr-4 last:border-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-xl text-amber-400 ring-1 ring-amber-400/30">
                ★
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-white">4.1 / 5</span>
                <p className="text-xs text-slate-400">2,499+ Google Reviews</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 border-r border-white/10 pr-4 last:border-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-xl text-amber-400 ring-1 ring-amber-400/30">
                🛎️
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-white">24/7</span>
                <p className="text-xs text-slate-400">Concierge & Front Desk</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 border-r border-white/10 pr-4 last:border-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-xl text-amber-400 ring-1 ring-amber-400/30">
                ⚡
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-white">100%</span>
                <p className="text-xs text-slate-400">Full Generator Backup</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-xl text-amber-400 ring-1 ring-amber-400/30">
                🎓
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-white">3 Mins</span>
                <p className="text-xs text-slate-400">To NMAMIT & Campus</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. ROOMS & SUITES PREVIEW ═══ */}
      <section className="relative bg-slate-950 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-8 md:flex-row md:items-end">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-400">
                Curated Comfort
              </span>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-white sm:text-5xl">
                Rooms & Suites
              </h2>
              <p className="mt-2 text-sm text-slate-300 max-w-xl">
                Each room is air-conditioned, sanitized daily, and appointed with premium teak furnishings, high-speed Wi-Fi, and 24-hour hot water.
              </p>
            </div>
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>View All Room Details</span>
              <span>→</span>
            </Link>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {rooms.map((room) => (
              <div
                key={room.name}
                className="glass-card group relative flex flex-col overflow-hidden rounded-3xl transition-all duration-300 hover:border-amber-400/40 hover:-translate-y-1"
              >
                <div className="relative h-64 w-full overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  <div className="absolute top-4 right-4">
                    <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-amber-300 ring-1 ring-white/15 backdrop-blur-md">
                      {room.beds}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="font-serif text-2xl font-bold text-amber-400">
                      {room.price}
                    </span>
                    <span className="text-xs text-slate-300"> / night</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-serif text-2xl font-semibold text-white">{room.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300 line-clamp-3">
                    {room.blurb}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {room.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-white/5 px-2.5 py-1 text-[0.7rem] text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
                    <Link
                      to="/reservations"
                      className="shimmer-btn flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-950 shadow-md"
                    >
                      Reserve Now
                    </Link>
                    <Link
                      to="/rooms"
                      className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-semibold text-white hover:bg-white/10"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. CELEBRATED COASTAL DINING (CONSOLIDATED) ═══ */}
      <section className="relative overflow-hidden bg-slate-950/90 py-24 sm:py-32 border-t border-white/10">
        <div className="pointer-events-none absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                The Coastal Kitchen
              </span>
              <h2 className="font-serif text-3xl font-semibold text-white sm:text-5xl leading-tight">
                Authentic Tulu Nadu Seafood & Curated Tastes
              </h2>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                People drive from across Karkala and Udupi for the kitchen at Hotel Ratna Forever. We serve the freshest catch from Malpe, slow-roasted in native Byadgi chillies and genuine artisanal ghee.
              </p>

              <div className="space-y-4 pt-2">
                {dishes.map((dish) => (
                  <div key={dish.name} className="glass-card rounded-xl p-4 transition-all hover:border-amber-400/30">
                    <div className="flex items-baseline justify-between">
                      <h4 className="font-serif text-base font-semibold text-amber-300">{dish.name}</h4>
                      <span className="text-xs text-amber-400/80">Signature</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{dish.note}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-4 text-xs text-slate-400">
                <span className="rounded-lg bg-white/5 px-3 py-2">
                  🍳 Breakfast: 7:30 – 10:30 AM
                </span>
                <span className="rounded-lg bg-white/5 px-3 py-2">
                  🍲 Kitchen open till 11:00 PM
                </span>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-2xl shadow-xl">
                    <img
                      src={gallery[4].src}
                      alt="Suite dining area"
                      className="h-64 w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="glass-card rounded-2xl p-6 text-center">
                    <span className="font-serif text-3xl font-bold text-amber-400">Fresh</span>
                    <p className="mt-1 text-xs text-slate-300">Catch brought in daily from Malpe coastal harbor</p>
                  </div>
                </div>

                <div className="space-y-4 sm:mt-8">
                  <div className="glass-card rounded-2xl p-6 text-center">
                    <span className="font-serif text-3xl font-bold text-amber-400">Teak Lounge</span>
                    <p className="mt-1 text-xs text-slate-300">Family dining halls and private banquet suites</p>
                  </div>
                  <div className="overflow-hidden rounded-2xl shadow-xl">
                    <img
                      src={gallery[3].src}
                      alt="Lobby lounge & dining"
                      className="h-64 w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5. FACILITIES & HOTEL PRIVILEGES (CONSOLIDATED) ═══ */}
      <section className="relative bg-slate-950 py-24 sm:py-32 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Hotel Privileges
            </span>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-white sm:text-5xl">
              Everything for a Seamless Stay
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300">
              From family weddings and student convocations to peaceful corporate retreats.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {facilities.map((fac) => (
              <div
                key={fac.title}
                className="glass-card flex flex-col justify-between rounded-2xl p-6 transition-all hover:border-amber-400/40 hover:-translate-y-1"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
                    ✓
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-semibold text-white">{fac.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">{fac.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. ARCHITECTURE & SPACES GALLERY (CONSOLIDATED) ═══ */}
      <section className="relative bg-slate-950/90 py-24 sm:py-32 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-8 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                Visual Showcase
              </span>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-white sm:text-5xl">
                Living Spaces & Banquets
              </h2>
            </div>
            <Link
              to="/reservations"
              className="shimmer-btn rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950"
            >
              Book Stay
            </Link>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.slice(0, 6).map((item) => (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-white/10"
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-5">
                  <h4 className="font-serif text-lg font-semibold text-white">{item.title}</h4>
                  <p className="mt-1 text-xs text-slate-300">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. VERIFIED REVIEWS & SOCIAL PROOF ═══ */}
      <section className="relative bg-slate-950 py-24 sm:py-32 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Guest Testimonials
            </span>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-white sm:text-5xl">
              Endorsed by Thousands of Visitors
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {reviews.map((rev, i) => (
              <div
                key={i}
                className="glass-card relative flex flex-col justify-between rounded-3xl p-8"
              >
                <div>
                  <div className="flex gap-1 text-amber-400 text-sm">
                    {"★".repeat(5)}
                  </div>
                  <p className="mt-4 font-serif text-base italic leading-relaxed text-slate-100">
                    "{rev.quote}"
                  </p>
                </div>
                <div className="mt-6 border-t border-white/10 pt-4 flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold text-white">{rev.name}</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-amber-300">{rev.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 8. FINAL INVITATION CTA ═══ */}
      <section className="relative border-t border-white/10 bg-gradient-to-b from-slate-950 to-slate-900 py-20 text-center">
        <div className="mx-auto max-w-4xl px-5">
          <span className="inline-block rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
            Instant Online Reservations
          </span>
          <h2 className="mt-5 font-serif text-3xl font-medium text-white sm:text-5xl">
            Experience the Warmth of Hotel Ratna Forever
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-300">
            Plan your visit to Nitte with guaranteed live availability, transparent direct tariffs, and dedicated front-desk care.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/reservations"
              className="shimmer-btn rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-950 shadow-2xl transition-all hover:brightness-110"
            >
              Reserve Your Stay Online
            </Link>
            <a
              href={`tel:${PHONE}`}
              className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/10"
            >
              Direct Call: {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
