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

const hotelPrivileges = [
  {
    title: "Split Air-Conditioning",
    desc: "Whisper-quiet climate control in every room.",
  },
  {
    title: "24-Hour Hot Water",
    desc: "Pressurized solar & electric backup water supply.",
  },
  {
    title: "Complimentary Breakfast",
    desc: "Fresh South Indian & continental buffet each morning.",
  },
  {
    title: "High-Speed Wi-Fi",
    desc: "Unrestricted optical fiber connectivity throughout.",
  },
  {
    title: "100% Power Backup",
    desc: "Heavy-duty generator ensures uninterrupted power.",
  },
  {
    title: "Secure On-Site Parking",
    desc: "Spacious parking bays directly on Nitte Main Road.",
  },
  {
    title: "In-Room Refreshments",
    desc: "Electric kettle with tea, coffee, and daily water bottles.",
  },
  {
    title: "24/7 Front Desk Service",
    desc: "Attentive hospitality team ready whenever you need.",
  },
];

function RoomsPage() {
  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      <PageHeader
        eyebrow="Accommodations"
        title="Sanctuaries of Quiet Coastal Rest"
        intro="Impeccably clean, air-conditioned rooms tailored for visiting families, campus guests, corporate executives, and holidaymakers exploring coastal Karnataka."
      />

      {/* Understated Info Strip */}
      <section className="border-b border-white/[0.06] bg-[#0d111a]/60 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300 font-medium">Direct Booking Guarantee</span>
            <span className="text-slate-500">· Best Available Rates & Zero Intermediary Fees</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Check-in: <strong className="text-slate-200 font-medium">12:00 PM</strong></span>
            <span>Check-out: <strong className="text-slate-200 font-medium">11:00 AM</strong></span>
          </div>
        </div>
      </section>

      {/* Main Room Showcase */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl space-y-16 px-5 sm:px-8">
          {rooms.map((room, i) => (
            <article
              key={room.name}
              className="editorial-card group overflow-hidden rounded-2xl p-6 sm:p-8 lg:p-10"
            >
              <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
                {/* Visual */}
                <div className={`lg:col-span-7 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className="relative overflow-hidden rounded-xl bg-slate-900 aspect-[16/10] shadow-xl">
                    <img
                      src={room.image}
                      alt={`${room.name} interior at Hotel Ratna Forever, Nitte`}
                      loading={i === 0 ? "eager" : "lazy"}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-4 left-4">
                      <span className="rounded-full bg-slate-950/80 px-3.5 py-1 text-xs font-medium text-amber-200 backdrop-blur-md border border-white/10">
                        {room.beds}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className={`lg:col-span-5 space-y-5 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400/90">
                      Suite Category 0{i + 1}
                    </span>
                    <h2 className="mt-1 font-serif text-2xl font-medium text-white sm:text-3xl">
                      {room.name}
                    </h2>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-300">
                    {room.blurb}
                  </p>

                  <div className="space-y-2.5 pt-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Key Highlights
                    </span>
                    <ul className="flex flex-wrap gap-2">
                      {room.tags.map((tag) => (
                        <li
                          key={tag}
                          className="pill-tag"
                        >
                          <span className="text-amber-400 text-xs">✓</span>
                          <span>{tag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-white/[0.08] pt-5">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-400">Nightly Tariff</span>
                        <div className="mt-0.5 flex items-baseline gap-1.5">
                          <span className="font-serif text-2xl font-semibold text-amber-400 sm:text-3xl">
                            {room.price}
                          </span>
                          <span className="text-xs text-slate-400">/ night</span>
                        </div>
                      </div>
                      <span className="text-xs text-emerald-400 font-medium">Free Breakfast Included</span>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                      <Link
                        to="/reservations"
                        className="champagne-btn flex-1 rounded-xl py-3.5 text-center text-xs uppercase tracking-wider"
                      >
                        Reserve {room.name}
                      </Link>
                      <a
                        href="tel:+917338088744"
                        className="rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
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

      {/* Refined Privileges Matrix */}
      <section className="border-t border-white/[0.06] bg-[#0d111a]/40 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/90">
              Standard Privileges
            </span>
            <h3 className="mt-2 font-serif text-2xl font-medium text-white sm:text-3xl">
              Thoughtfully Appointed for Rest & Work
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Every stay includes full access to front-desk assistance, breakfast dining, and secure highway parking.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {hotelPrivileges.map((item) => (
              <div
                key={item.title}
                className="editorial-card rounded-xl p-5 space-y-1.5"
              >
                <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-2xl border border-white/[0.08] bg-gradient-to-r from-amber-500/10 via-amber-500/[0.03] to-transparent p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-serif text-xl font-medium text-white sm:text-2xl">
                Ready to secure your stay?
              </h4>
              <p className="text-sm text-slate-300">
                Direct reservations receive instant room assignment and digital voucher delivery.
              </p>
            </div>
            <Link
              to="/reservations"
              className="champagne-btn shrink-0 rounded-xl px-7 py-3.5 text-xs uppercase tracking-wider"
            >
              Book Direct Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
