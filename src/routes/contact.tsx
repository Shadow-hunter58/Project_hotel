import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/SiteChrome";
import { PHONE, PHONE_DISPLAY, WHATSAPP } from "@/lib/site-data";

const MAPS_LINK = "https://maps.google.com/?q=Ratna+Forever+Nitte+Karkala+Udupi";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact, Location & Directions | Hotel Ratna Forever, Nitte" },
      {
        name: "description",
        content:
          "Find Hotel Ratna Forever on Nitte Main Road, Karkala Taluk, Karnataka 574110. Front desk: +91 73380 88744. 24-hour reception, ample vehicle parking, 5 mins from NMAMIT.",
      },
      { property: "og:title", content: "Contact Hotel Ratna Forever, Nitte" },
      {
        property: "og:description",
        content:
          "Conveniently situated on the Nitte–Karkala main road with free parking — minutes from NMAMIT and Nitte campuses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact & Location"
        title="Find Us in the Heart of Nitte"
        intro="Conveniently situated on the Nitte main highway with dedicated on-site parking. Easily accessible from Mangaluru Airport, Udupi Railway Station, and adjacent to the prestigious Nitte educational institutions."
      />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-12">
            
            {/* Information Column */}
            <div className="space-y-6 lg:col-span-5">
              <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                    Hotel Address
                  </span>
                  <p className="mt-2 text-base font-medium text-white leading-relaxed">
                    Hotel Ratna Forever
                  </p>
                  <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                    Nitte Parapady, Karkala Taluk, Udupi District, Karnataka 574110, India
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    Landmark: Directly on the Nitte Main Road, opposite campus junction
                  </p>
                </div>

                <div className="border-t border-white/10 pt-5">
                  <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                    24-Hour Front Desk & Enquiries
                  </span>
                  <p className="mt-2">
                    <a
                      href={`tel:${PHONE}`}
                      className="font-serif text-2xl font-bold text-white transition-colors hover:text-amber-400"
                    >
                      {PHONE_DISPLAY}
                    </a>
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Staffed around the clock for check-ins, campus transfers, and table reservations.
                  </p>
                </div>

                <div className="border-t border-white/10 pt-5">
                  <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                    Stay Timings
                  </span>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-xs text-slate-400">Check-in</span>
                      <span className="font-semibold text-white">12:00 PM onwards</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400">Check-out</span>
                      <span className="font-semibold text-white">11:00 AM</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-5">
                  <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                    Key Distances
                  </span>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
                    <li className="flex justify-between">
                      <span>NMAM Institute of Technology (NMAMIT)</span>
                      <strong className="text-white">1.5 km (3 mins)</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Nitte Deemed to be University Campus</span>
                      <strong className="text-white">2.0 km (4 mins)</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Karkala Town & Gommateshwara Statue</span>
                      <strong className="text-white">11 km (15 mins)</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Moodbidri (Jain Kashi)</span>
                      <strong className="text-white">18 km (25 mins)</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Udupi Sri Krishna Temple & Railway</span>
                      <strong className="text-white">35 km (45 mins)</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Mangaluru International Airport (IXE)</span>
                      <strong className="text-white">48 km (55 mins)</strong>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-white/10 pt-6 flex flex-wrap gap-3">
                  <a
                    href={`tel:${PHONE}`}
                    className="shimmer-btn flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-950 shadow-md transition-all hover:brightness-110"
                  >
                    Direct Call
                  </a>
                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex-1 rounded-xl border border-white/15 bg-white/5 py-3 text-center text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
                  >
                    Open in Maps ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Interactive Map Column */}
            <div className="lg:col-span-7">
              <div className="glass-card h-full min-h-[420px] overflow-hidden rounded-2xl p-2 sm:p-3">
                <div className="relative h-full w-full min-h-[400px] overflow-hidden rounded-xl">
                  <iframe
                    title="Map of Hotel Ratna Forever in Nitte, Karnataka"
                    src="https://www.google.com/maps?q=Ratna%20Forever%20Nitte%20Karkala&output=embed"
                    loading="lazy"
                    className="h-full w-full min-h-[460px] border-0 rounded-xl filter contrast-[1.05]"
                  />
                  <div className="absolute bottom-4 left-4 rounded-lg bg-slate-950/85 px-4 py-2 text-xs font-medium text-slate-200 backdrop-blur-md ring-1 ring-white/10">
                    📍 Hotel Ratna Forever, Main Road, Nitte
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
