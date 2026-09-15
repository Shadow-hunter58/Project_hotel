import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import ratnaLogo from "@/assets/ratna-logo.png";
import { nav, PHONE, PHONE_DISPLAY } from "@/lib/site-data";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-slate-950/85 backdrop-blur-xl shadow-2xl py-3"
          : "border-b border-white/5 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent backdrop-blur-sm py-4"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" className="group flex items-center gap-3.5 leading-tight text-white transition-opacity hover:opacity-95">
          <div className="relative overflow-hidden rounded-md bg-white/95 p-1.5 shadow-md ring-1 ring-amber-400/30 transition-transform group-hover:scale-[1.02]">
            <img
              src={ratnaLogo}
              alt="Hotel Ratna Forever logo"
              width={765}
              height={424}
              className="h-9 w-auto sm:h-10"
            />
          </div>
          <div>
            <span className="block font-serif text-base font-semibold tracking-wide text-white sm:text-lg">
              Ratna Forever
            </span>
            <span className="eyebrow block text-[0.62rem] text-amber-400/90">
              Nitte · Karkala Taluk
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-amber-400 font-semibold" }}
              activeOptions={{ exact: item.to === "/" }}
              className="relative text-sm font-medium tracking-wide text-slate-200 transition-colors hover:text-amber-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <a
            href={`tel:${PHONE}`}
            className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-slate-200 backdrop-blur-md transition-all hover:border-amber-400/40 hover:bg-white/10 sm:flex"
          >
            <svg className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{PHONE_DISPLAY}</span>
          </a>

          <Link
            to="/reservations"
            className="shimmer-btn inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/40 hover:brightness-110 active:scale-95"
          >
            <span>Reservations</span>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10 lg:hidden"
          >
            <div className="flex flex-col gap-1.5">
              <span className={`block h-0.5 w-5 bg-white transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-5 bg-white transition-opacity ${open ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-white transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-200 border-t border-white/10 bg-slate-950/95 px-6 pb-6 pt-4 backdrop-blur-2xl lg:hidden">
          <nav className="flex flex-col divide-y divide-white/10">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "text-amber-400 font-bold pl-2" }}
                activeOptions={{ exact: item.to === "/" }}
                className="py-3.5 text-base font-medium text-slate-200 transition-all hover:text-amber-400"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-5 space-y-3 pt-2">
            <Link
              to="/reservations"
              onClick={() => setOpen(false)}
              className="shimmer-btn flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 py-3.5 text-center text-xs font-bold uppercase tracking-[0.16em] text-slate-950 shadow-lg"
            >
              <span>Book a Stay</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <a
              href={`tel:${PHONE}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 text-center text-xs font-semibold text-white transition-colors hover:bg-white/10"
            >
              <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Direct Call: {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-slate-950 text-slate-300">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand Col */}
          <div className="lg:col-span-5 space-y-6">
            <Link to="/" className="inline-block">
              <div className="inline-flex items-center gap-3 rounded-xl bg-white/95 p-2 shadow-xl ring-1 ring-amber-400/30">
                <img
                  src={ratnaLogo}
                  alt="Hotel Ratna Forever logo"
                  width={765}
                  height={424}
                  className="h-12 w-auto"
                />
              </div>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-slate-400">
              The premier hospitality landmark of Nitte, Karnataka. Experience genuine coastal hospitality, immaculate accommodations, and the celebrated flavours of coastal Tulu Nadu.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 font-medium text-amber-300">
                ★ 4.1 Rating
              </span>
              <span className="text-slate-500">·</span>
              <span>2,499+ Verified Guest Reviews</span>
              <span className="text-slate-500">·</span>
              <span>24/7 Front Desk</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-serif text-base font-semibold tracking-wide text-white">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              {nav.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-slate-400 transition-colors hover:text-amber-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Location & Contact */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-serif text-base font-semibold tracking-wide text-white">
              Location & Enquiries
            </h3>
            <div className="space-y-3 text-sm text-slate-400">
              <p className="leading-relaxed">
                Nitte Parapady, Karkala Taluk, Udupi District, Karnataka 574110, India
              </p>
              <p className="text-xs text-slate-500">
                (Right on Nitte Main Road, 5 mins from NMAMIT campus)
              </p>
              <div className="pt-2">
                <a
                  href={`tel:${PHONE}`}
                  className="inline-flex items-center gap-2 text-white transition-colors hover:text-amber-400 font-medium"
                >
                  <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {PHONE_DISPLAY}
                </a>
              </div>
              <p className="text-xs text-slate-400">
                Check-in: <strong className="text-slate-200">12:00 PM</strong> · Check-out: <strong className="text-slate-200">11:00 AM</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Hotel Ratna Forever, Nitte. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/reservations" className="hover:text-amber-400 transition-colors">
              Online Reservations
            </Link>
            <Link to="/contact" className="hover:text-amber-400 transition-colors">
              Directions & Map
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-slate-950 pb-16 pt-36 text-white md:pb-24 md:pt-44">
      {/* Background glow & luxury ambiance */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.18),rgba(255,255,255,0))]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-medium uppercase tracking-[0.16em] text-amber-300">
          {eyebrow}
        </span>
        <h1 className="mt-5 font-serif text-4xl leading-[1.1] text-white sm:text-5xl md:text-6xl font-medium tracking-tight max-w-3xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {intro}
          </p>
        )}
      </div>
    </section>
  );
}
