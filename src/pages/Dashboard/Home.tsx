import PageMeta from "../../components/common/PageMeta";
import NewsMetric from "../../components/metrics/NewsMetric";
import GaleryMetric from "../../components/metrics/GaleryMetric";
import SliderMetric from "../../components/metrics/SliderMetric";
import ProjectMetric from "../../components/metrics/ProjectMetric";
import HeaderMenuMetric from "../../components/metrics/HeaderMenuMetric";
import FooterMenuMetric from "../../components/metrics/FooterMenuMetric";
import ConferenceMetric from "../../components/metrics/ConferenceMetric";
import AnnouncementMetric from "../../components/metrics/AnnouncementMetric";
import CollaboratorMetric from "../../components/metrics/CollaboratorMetric";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import { Link } from "react-router";

const quickActions = [
  {
    label: "Yeni xəbər",
    to: "/news/new",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
    ),
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
  },
  {
    label: "Yeni elan",
    to: "/announcements/new",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
    ),
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
  },
  {
    label: "Yeni layihə",
    to: "/projects/new",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    ),
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
  },
  {
    label: "Yeni fakültə",
    to: "/faculties/new",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
    ),
    color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
  },
  {
    label: "Yeni kafedra",
    to: "/cafedras/new",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
    ),
    color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
  },
  {
    label: "Yeni slayder",
    to: "/sliders/new",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    ),
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
  },
];

export default function Home() {
  return (
    <>
      <PageMeta
        title="AzTU Admin | İdarəetmə Paneli"
        description="AzTU (aztu.edu.az) saytının idarəetmə paneli"
      />
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 p-6 md:p-8">
          {/* Decorative blobs */}
          <div className="absolute -right-8 -top-8 h-56 w-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute right-20 bottom-0 h-36 w-36 rounded-full bg-brand-300/15 blur-2xl pointer-events-none" />
          <div className="absolute left-1/2 -bottom-10 h-44 w-44 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  Sistem aktiv
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white md:text-3xl leading-tight">
                İdarəetmə Panelinə<br className="hidden sm:block" /> Xoş Gəldiniz
              </h1>
              <p className="mt-2.5 text-white/70 text-sm max-w-lg leading-relaxed">
                AzTU (aztu.edu.az) saytının bütün məzmununu buradan idarə edin — xəbərlər, elanlar, fakültələr, kafedralar və daha çox.
              </p>
            </div>
            <div className="flex-shrink-0 grid grid-cols-2 gap-2 md:grid-cols-1">
              <Link to="/news/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-brand-600 px-4 py-2.5 text-sm font-semibold hover:bg-white/90 transition-colors shadow-sm">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                Yeni xəbər
              </Link>
              <Link to="/announcements/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 border border-white/20 text-white px-4 py-2.5 text-sm font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                Yeni elan
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sürətli əməliyyatlar</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map(({ label, to, icon, color }) => (
              <Link
                key={to}
                to={to}
                className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${color} transition-transform group-hover:scale-110 duration-200`}>
                  {icon}
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Section heading */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ümumi Statistika</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Saytın bütün məzmun göstəriciləri</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          <NewsMetric />
          <AnnouncementMetric />
          <HeaderMenuMetric />
          <FooterMenuMetric />
          <ProjectMetric />
          <ConferenceMetric />
          <GaleryMetric />
          <SliderMetric />
          <CollaboratorMetric />
        </div>

        {/* Chart */}
        <MonthlySalesChart />
      </div>
    </>
  );
}
