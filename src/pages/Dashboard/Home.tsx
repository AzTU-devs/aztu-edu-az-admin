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

export default function Home() {
  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div>
        <h2 className="text-[20px] font-bold text-gray-900 dark:text-gray-100">
          AzTU (aztu.edu.az) idarəetmə paneli
        </h2>
        <div className="flex flex-wrap justify-start items-start gap-6 mt-8">
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
        <div className="mt-[20px]">
          <MonthlySalesChart />
        </div>
      </div>
    </>
  );
}
