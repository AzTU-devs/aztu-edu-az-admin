import React from "react";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

/**
 * Split sign-in shell: brand panel on the left, form on the right.
 *
 * Below `lg` the brand panel is dropped entirely rather than stacked — a navy
 * band above a form reads as a header, not as branding. The logo moves into the
 * form column instead so mobile stays a single, quiet column.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-900 lg:grid lg:grid-cols-2">
      {/*
        The panel is dark in both themes, so it always carries the light logo —
        no dark: pairing needed here. Dark mode shifts it off pure brand navy so
        it reads as a deliberate surface next to the gray-900 form column.
      */}
      <aside className="relative hidden overflow-hidden bg-brand-950 p-12 dark:bg-gray-950 lg:flex lg:flex-col lg:justify-between">
        {/* Two soft blooms instead of a pattern: depth without noise. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-40 size-[32rem] rounded-full bg-brand-500/25 blur-3xl dark:bg-brand-600/20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-44 -right-28 size-[28rem] rounded-full bg-brand-700/30 blur-3xl dark:bg-brand-800/25"
        />

        <div className="relative">
          {/*
            Portrait artwork (~2873x3932). Preflight forces height:auto, so it is
            sized by HEIGHT and the width follows — sizing by width lets the
            height run away and overflow the panel.
          */}
          <img
            src="/images/aztu-logo-light.png"
            alt="Azərbaycan Texniki Universiteti"
            className="h-20 w-auto object-contain"
          />
        </div>

        <div className="relative max-w-sm">
          <h2 className="text-title-sm font-semibold leading-tight text-white">
            İdarəetmə Paneli
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            Azərbaycan Texniki Universiteti rəsmi saytının idarəetmə sistemi
          </p>
        </div>

        <p className="relative text-xs text-white/40">
          Azərbaycan Texniki Universiteti
        </p>
      </aside>

      <main className="relative flex min-h-screen flex-col justify-center px-6 py-14 sm:px-10 lg:px-16">
        {/* Stands in for the brand panel once it drops out below lg. */}
        <div className="mb-10 flex justify-center lg:hidden">
          <img
            src="/images/aztu-logo-dark.png"
            alt="Azərbaycan Texniki Universiteti"
            className="h-16 w-auto object-contain dark:hidden"
          />
          <img
            src="/images/aztu-logo-light.png"
            alt="Azərbaycan Texniki Universiteti"
            className="hidden h-16 w-auto object-contain dark:block"
          />
        </div>

        {children}
      </main>

      <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
        <ThemeTogglerTwo />
      </div>
    </div>
  );
}
