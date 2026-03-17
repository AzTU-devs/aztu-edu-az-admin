import React from "react";
import GridShape from "../../components/common/GridShape";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
              <div className="block mb-6">
                <img
                  width={200}
                  height={80}
                  src="/images/aztu-logo-dark.png"
                  alt="AZTU Logo"
                  className="block dark:hidden"
                />
                <img
                  width={200}
                  height={80}
                  src="/images/aztu-logo-dark.png"
                  alt="AZTU Logo"
                  className="hidden dark:block"
                />
              </div>
              <h2 className="text-white text-title-sm font-semibold text-center mb-2">
                İdarəetmə Paneli
              </h2>
              <p className="text-center text-gray-400 dark:text-white/60 text-sm">
                Azərbaycan Texniki Universiteti rəsmi saytının idarəetmə sistemi
              </p>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
