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

const transitDistances = [
  { place: "NMAMIT Engineering College", dist: "1.5 km", time: "3 mins" },
  { place: "Nitte University Campus", dist: "2.0 km", time: "4 mins" },
  { place: "Karkala Town & Gommateshwara", dist: "11 km", time: "15 mins" },
  { place: "Moodbidri (Jain Heritage)", dist: "18 km", time: "25 mins" },
  { place: "Udupi Sri Krishna Temple", dist: "35 km", time: "45 mins" },
  { place: "Mangaluru Airport (IXE)", dist: "48 km", time: "55 mins" },
];

function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      <PageHeader
        eyebrow="Location & Concierge"
        title="Connect with Hotel Ratna Forever"
        intro="Conveniently situated on the Nitte main highway with dedicated on-site parking. Easily accessible from Mangaluru Airport, Udupi Railway Station, and adjacent to the prestigious Nitte educational institutions."
      />

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-12">
            
            {/* Information Column */}
            <div className="space-y-8 lg:col-span-5">
              {/* Core Address & Contact */}
              <div className="editorial-card rounded-2xl p-6 sm:p-8 space-y-6">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400/90">
                    Property Location
                  </span>
                  <h2 className="mt-2 font-serif text-2xl font-medium text-white">
                    Hotel Ratna Forever
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">
                    Nitte Parapady, Karkala Taluk, Udupi District, Karnataka 574110, India
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    Directly on Nitte Main Road · Opposite Campus Junction · Ample On-Site Parking
                  </p>
                </div>

                <div className="border-t border-white/[0.08] pt-6 space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400/90">
                    24-Hour Reception & Enquiries
                  </span>
                  <div>
                    <a
                      href={`tel:${PHONE}`}
                      className="font-serif text-2xl font-medium text-white transition-colors hover:text-amber-300"
                    >
                      {PHONE_DISPLAY}
                    </a>
                  </div>
                  <p className="text-xs text-slate-400">
                    Our reception desk is staffed around the clock for late check-ins and campus visits.
                  </p>
                </div>

                {/* Direct Action Buttons */}
                <div className="border-t border-white/[0.08] pt-6 flex flex-wrap gap-3">
                  <a
                    href={`tel:${PHONE}`}
                    className="champagne-btn flex-1 rounded-xl py-3 text-center text-xs uppercase tracking-wider"
                  >
                    Call Reception
                  </a>
                  <a
                    href={`https://wa.me/${WHATSAPP}?text=Hello%20Hotel%20Ratna%20Forever,%20I%20would%20like%20to%20enquire%20about%20room%20availability.`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Directions ↗
                  </a>
                </div>
              </div>

              {/* Stay Timings & Distances */}
              <div className="editorial-card rounded-2xl p-6 sm:p-8 space-y-6">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400/90">
                    Stay Schedule
                  </span>
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5">
                      <span className="text-xs text-slate-400">Standard Check-in</span>
                      <span className="mt-0.5 block text-sm font-medium text-white">12:00 PM</span>
                    </div>
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5">
                      <span className="text-xs text-slate-400">Standard Check-out</span>
                      <span className="mt-0.5 block text-sm font-medium text-white">11:00 AM</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/[0.08] pt-6 space-y-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400/90">
                    Proximity & Distances
                  </span>
                  <div className="divide-y divide-white/[0.06] text-xs">
                    {transitDistances.map((item) => (
                      <div key={item.place} className="flex items-center justify-between py-2 text-slate-300">
                        <span>{item.place}</span>
                        <div className="text-right">
                          <span className="text-slate-400">{item.dist}</span>
                          <span className="ml-2 font-medium text-amber-300/90">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Map Column */}
            <div className="lg:col-span-7">
              <div className="editorial-card h-full min-h-[500px] overflow-hidden rounded-2xl p-2.5 sm:p-3 flex flex-col">
                <div className="relative h-full w-full min-h-[480px] flex-1 overflow-hidden rounded-xl bg-slate-900">
                  <iframe
                    title="Map of Hotel Ratna Forever in Nitte, Karnataka"
                    src="https://www.google.com/maps?q=Ratna%20Forever%20Nitte%20Karkala&output=embed"
                    loading="lazy"
                    className="h-full w-full min-h-[480px] border-0 rounded-xl filter contrast-[1.03]"
                  />
                  <div className="absolute bottom-4 left-4 rounded-lg bg-slate-950/90 px-3.5 py-2 text-xs font-medium text-slate-200 backdrop-blur-md border border-white/10 shadow-lg">
                    📍 Main Road, Nitte, Karkala Taluk
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
