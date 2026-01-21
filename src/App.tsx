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
import NewsPage from "./pages/newsPages/NewsPage";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import ProjectsPage from "./pages/Projects/ProjectsPage";
import NewProjectPage from "./pages/Projects/NewProjectPage";
import { ScrollToTop } from "./components/common/ScrollToTop";
import NewsDetailsPage from "./pages/newsPages/NewsDetailsPage";
import ProjectDetailsPage from "./pages/Projects/ProjectDetailsPage";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import NewsCategoryPage from "./pages/newsCategoryPages/NewsCategoryPage";
import AnnouncementsPage from "./pages/AnnouncementPages/AnnouncementsPage";

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

            {/* Announcement */}
            <Route path="/announcements" element={<AnnouncementsPage />} />

            {/* News */}
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:news_id" element={<NewsDetailsPage />} />

            {/* News category */}
            <Route path="/news-categories" element={<NewsCategoryPage />} />

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
