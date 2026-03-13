import Blank from "./pages/Blank";
import Calendar from "./pages/Calendar";
import Home from "./pages/Dashboard/Home";
import AppLayout from "./layout/AppLayout";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import BarChart from "./pages/Charts/BarChart";
import UserProfiles from "./pages/UserProfiles";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import NotFound from "./pages/OtherPage/NotFound";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import ProjectsPage from "./pages/Projects/ProjectsPage";
import NewProjectPage from "./pages/Projects/NewProjectPage";
import { ScrollToTop } from "./components/common/ScrollToTop";
import ProjectDetailsPage from "./pages/Projects/ProjectDetailsPage";
import NewsPage from "./pages/News/NewsPage";
import NewNewsPage from "./pages/News/NewNewsPage";
import NewsDetailsPage from "./pages/News/NewsDetailsPage";
import AnnouncementsPage from "./pages/Announcements/AnnouncementsPage";
import NewAnnouncementPage from "./pages/Announcements/NewAnnouncementPage";
import AnnouncementDetailsPage from "./pages/Announcements/AnnouncementDetailsPage";
import SlidersPage from "./pages/Sliders/SlidersPage";
import NewSliderPage from "./pages/Sliders/NewSliderPage";
import SliderDetailsPage from "./pages/Sliders/SliderDetailsPage";
import NewsCategoriesPage from "./pages/NewsCategories/NewsCategoriesPage";
import FacultiesPage from "./pages/Faculties/FacultiesPage";
import NewFacultyPage from "./pages/Faculties/NewFacultyPage";
import FacultyDetailsPage from "./pages/Faculties/FacultyDetailsPage";
import CafedrasPage from "./pages/Cafedras/CafedrasPage";
import NewCafedraPage from "./pages/Cafedras/NewCafedraPage";
import CafedraDetailsPage from "./pages/Cafedras/CafedraDetailsPage";
import { BrowserRouter as Router, Routes, Route } from "react-router";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />

            {/* Project */}
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/new" element={<NewProjectPage />} />
            <Route path="/projects/:project_id" element={<ProjectDetailsPage />} />

            {/* News */}
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/new" element={<NewNewsPage />} />
            <Route path="/news/:news_id" element={<NewsDetailsPage />} />

            {/* Announcements */}
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/announcements/new" element={<NewAnnouncementPage />} />
            <Route path="/announcements/:announcement_id" element={<AnnouncementDetailsPage />} />

            {/* Sliders */}
            <Route path="/sliders" element={<SlidersPage />} />
            <Route path="/sliders/new" element={<NewSliderPage />} />
            <Route path="/sliders/:slider_id" element={<SliderDetailsPage />} />

            {/* News Categories */}
            <Route path="/news-categories" element={<NewsCategoriesPage />} />

            {/* Faculties */}
            <Route path="/faculties" element={<FacultiesPage />} />
            <Route path="/faculties/new" element={<NewFacultyPage />} />
            <Route path="/faculties/:faculty_code" element={<FacultyDetailsPage />} />

            {/* Cafedras */}
            <Route path="/cafedras" element={<CafedrasPage />} />
            <Route path="/cafedras/new" element={<NewCafedraPage />} />
            <Route path="/cafedras/:cafedra_code" element={<CafedraDetailsPage />} />

          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
