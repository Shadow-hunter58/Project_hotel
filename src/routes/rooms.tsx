import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/SiteChrome";
import { rooms } from "@/lib/site-data";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "Accommodations & Suites | Hotel Ratna Forever, Nitte" },
      {
        name: "description",
        content:
          "Explore Deluxe, Executive, and Family Suite rooms at Hotel Ratna Forever, Nitte. Spotless air-conditioned comfort, premium bedding, 24-hr hot water, free high-speed Wi-Fi and coastal breakfast.",
      },
      { property: "og:title", content: "Accommodations & Suites — Hotel Ratna Forever, Nitte" },
      {
        property: "og:description",
        content:
          "Air-conditioned Deluxe, Executive and Family Suite rooms from ₹1,899 a night with breakfast, Wi-Fi and free parking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoomsPage,
});

const roomFeatures = [
  { icon: "❄️", label: "Split Air-Conditioning" },
  { icon: "🚿", label: "24-Hour Hot Water" },
  { icon: "📶", label: "High-Speed Wi-Fi" },
  { icon: "☕", label: "Complimentary Breakfast" },
  { icon: "🅿️", label: "Free Highway Parking" },
  { icon: "⚡", label: "100% Generator Backup" },
  { icon: "🫖", label: "Tea / Coffee Tray" },
  { icon: "🛎️", label: "Room Service until 11 PM" },
];

function RoomsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Accommodations"
        title="Sanctuaries of Quiet Coastal Rest"
        intro="Impeccably clean, air-conditioned rooms tailored for visiting families, campus guests, corporate executives, and holidaymakers exploring coastal Karnataka."
      />

      {/* Trust & Guarantee Banner */}
      <section className="border-b border-white/10 bg-slate-950/80 py-6 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-6 text-xs text-slate-300 sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">★ ★ ★ ★ ☆</span>
            <span className="font-semibold text-white">4.1 Rating</span>
            <span className="text-slate-400">(2,499+ Verified Reviews)</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <span>Check-in: <strong className="text-slate-200">12:00 PM</strong></span>
            <span>Check-out: <strong className="text-slate-200">11:00 AM</strong></span>
            <span>Early arrival on request</span>
          </div>
        </div>
      </section>

      {/* Main Room Showcase */}
      <section className="relative py-20 lg:py-28">
        <div className="mx-auto max-w-7xl space-y-24 px-5 sm:px-8">
          {rooms.map((room, i) => (
            <article
              key={room.name}
              className="glass-card relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-10 transition-all hover:border-amber-400/30"
            >
              <div className="grid items-center gap-10 lg:grid-cols-12">
                {/* Visual */}
                <div className={`lg:col-span-7 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className="group relative overflow-hidden rounded-2xl shadow-2xl">
                    <img
                      src={room.image}
                      alt={`${room.name} interior at Hotel Ratna Forever, Nitte`}
                      loading={i === 0 ? "eager" : "lazy"}
                      className="h-80 w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-96 lg:h-[26rem]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <span className="rounded-full bg-slate-950/80 px-3.5 py-1 text-xs font-medium text-amber-300 backdrop-blur-md ring-1 ring-white/10">
                        {room.beds}
                      </span>
                      <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white shadow">
                        Live Instant Booking
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className={`lg:col-span-5 space-y-6 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div>
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-400">
                      Tier {i + 1} Accommodations
                    </span>
                    <h2 className="mt-2 font-serif text-3xl font-semibold text-white sm:text-4xl">
                      {room.name}
                    </h2>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                    {room.blurb}
                  </p>

                  <div className="space-y-3">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Included Comforts
                    </span>
                    <ul className="flex flex-wrap gap-2">
                      {room.tags.map((tag) => (
                        <li
                          key={tag}
                          className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200"
                        >
                          <span className="text-amber-400">✓</span>
                          <span>{tag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-400">Direct Online Rate</span>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="font-serif text-3xl font-bold text-amber-400 sm:text-4xl">
                            {room.price}
                          </span>
                          <span className="text-xs text-slate-400">/ night + taxes</span>
                        </div>
                      </div>
                      <span className="text-xs text-emerald-400">Breakfast Included</span>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <Link
                        to="/reservations"
                        className="shimmer-btn flex-1 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 py-3.5 text-center text-xs font-bold uppercase tracking-[0.16em] text-slate-950 shadow-xl transition-all hover:brightness-110"
                      >
                        Reserve {room.name}
                      </Link>
                      <a
                        href="tel:+917338088744"
                        className="rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                      >
                        Enquire
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Standard Amenities Matrix */}
      <section className="border-t border-white/10 bg-slate-950/70 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Standard Across Every Stay
            </span>
            <h3 className="mt-2 font-serif text-3xl font-semibold text-white">
              Every Room Includes Full Hotel Privileges
            </h3>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
            {roomFeatures.map((feat) => (
              <div
                key={feat.label}
                className="glass-card flex items-center gap-3.5 rounded-xl p-4 transition-all hover:border-amber-400/30"
              >
                <span className="text-2xl">{feat.icon}</span>
                <span className="text-xs font-medium text-slate-200 sm:text-sm">{feat.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-8 text-center sm:p-10">
            <h4 className="font-serif text-2xl font-semibold text-white">Ready for a Restful Stay in Nitte?</h4>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-300">
              Book directly through our instant reservations system to lock in live availability and best direct rates.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                to="/reservations"
                className="shimmer-btn rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-8 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-slate-950 shadow-xl"
              >
                Reserve Your Room Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
