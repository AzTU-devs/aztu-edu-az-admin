import Blank from "./pages/Blank";
import Calendar from "./pages/Calendar";
import Home from "./pages/Dashboard/Home";
import AppLayout from "./layout/AppLayout";
import SignIn from "./pages/AuthPages/SignIn";
import Forbidden from "./pages/Forbidden";
import RequirePermission from "./components/auth/RequirePermission";
import { useSelector } from "react-redux";
import { RootState } from "./redux/store";
import { Navigate, Outlet } from "react-router";
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
import AboutPageEditor from "./pages/About/AboutPageEditor";
import HomePageEditor from "./pages/Home/HomePageEditor";
import OfficesList from "./pages/Offices/OfficesList";
import NewOffice from "./pages/Offices/NewOffice";
import OfficeEditor from "./pages/Offices/OfficeEditor";
import ResearchPageEditor from "./pages/Research/ResearchPageEditor";
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
import ResearchInstitutesPage from "./pages/ResearchInstitute/ResearchInstitutesPage";
import NewResearchInstitutePage from "./pages/ResearchInstitute/NewResearchInstitutePage";
import ResearchInstituteDetailsPage from "./pages/ResearchInstitute/ResearchInstituteDetailsPage";
import ResearchProjectsPage from "./pages/ResearchProject/ResearchProjectsPage";
import NewResearchProjectPage from "./pages/ResearchProject/NewResearchProjectPage";
import ResearchProjectDetailsPage from "./pages/ResearchProject/ResearchProjectDetailsPage";
import ResearchLaboratoriesPage from "./pages/ResearchLaboratory/ResearchLaboratoriesPage";
import NewResearchLaboratoryPage from "./pages/ResearchLaboratory/NewResearchLaboratoryPage";
import ResearchLaboratoryDetailsPage from "./pages/ResearchLaboratory/ResearchLaboratoryDetailsPage";
import FacultiesPage from "./pages/Faculties/FacultiesPage";
import NewFacultyPage from "./pages/Faculties/NewFacultyPage";
import FacultyDetailsPage from "./pages/Faculties/FacultyDetailsPage";
import FacultyViewPage from "./pages/Faculties/FacultyViewPage";
import CafedrasPage from "./pages/Cafedras/CafedrasPage";
import NewCafedraPage from "./pages/Cafedras/NewCafedraPage";
import CafedraDetailsPage from "./pages/Cafedras/CafedraDetailsPage";
import CafedraViewPage from "./pages/Cafedras/CafedraViewPage";
import DepartmentsPage from "./pages/Departments/DepartmentsPage";
import NewDepartmentPage from "./pages/Departments/NewDepartmentPage";
import DepartmentDetailsPage from "./pages/Departments/DepartmentDetailsPage";
import HeroPage from "./pages/Hero/HeroPage";
import HeroCertificatesPage from "./pages/HeroCertificates/HeroCertificatesPage";
import NewHeroCertificatePage from "./pages/HeroCertificates/NewHeroCertificatePage";
import HeroCertificateDetailsPage from "./pages/HeroCertificates/HeroCertificateDetailsPage";
import MenuHeaderPage from "./pages/Menu/MenuHeaderPage";
import MenuFooterPage from "./pages/Menu/MenuFooterPage";
import MenuQuickPage from "./pages/Menu/MenuQuickPage";
import MenuSharedPage from "./pages/Menu/MenuSharedPage";
import CollaborationsPage from "./pages/Collaborations/CollaborationsPage";
import NewCollaborationPage from "./pages/Collaborations/NewCollaborationPage";
import CollaborationDetailsPage from "./pages/Collaborations/CollaborationDetailsPage";
import EmployeesPage from "./pages/Employees/EmployeesPage";
import NewEmployeePage from "./pages/Employees/NewEmployeePage";
import EmployeeDetailsPage from "./pages/Employees/EmployeeDetailsPage";
import RolesPage from "./pages/Settings/RolesPage";
import RoleEditorPage from "./pages/Settings/RoleEditorPage";
import AdminUsersPage from "./pages/Settings/AdminUsersPage";
import AdminUserEditorPage from "./pages/Settings/AdminUserEditorPage";
import ActivityLogPage from "./pages/Settings/ActivityLogPage";
import ChatSessionsPage from "./pages/Chat/ChatSessionsPage";
import ChatSessionDetailPage from "./pages/Chat/ChatSessionDetailPage";
import ChatStatsPage from "./pages/Chat/ChatStatsPage";
import { BrowserRouter as Router, Routes, Route } from "react-router";

function ProtectedRoute() {
  const token = useSelector((state: RootState) => state.auth.token);
  return token ? <Outlet /> : <Navigate to="/signin" replace />;
}

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout — protected */}
          <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/*
              One pathless guard covers every screen. It resolves the requirement
              for the current pathname from src/config/routePermissions — the same
              map the sidebar filters on — so a route can never be reachable but
              hidden, or listed but forbidden. Paths absent from that map (/, /403,
              /profile) carry no requirement and pass straight through.
            */}
            <Route element={<RequirePermission />}>
            <Route index path="/" element={<Home />} />
            <Route path="/403" element={<Forbidden />} />

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

            {/* About (Haqqımızda) */}
            <Route path="/about/:page_key" element={<AboutPageEditor />} />

            {/* Home page metrics (Ana səhifə) */}
            <Route path="/home" element={<HomePageEditor />} />

            {/* Offices and Centres (İdarəetmə) — /new before the :id edit route */}
            <Route path="/offices" element={<OfficesList />} />
            <Route path="/offices/new" element={<NewOffice />} />
            <Route path="/offices/:office_id" element={<OfficeEditor />} />

            {/*
              Research (Tədqiqat) — the section's editorial pages. Distinct from
              /research-institutes, /research-projects and /research-laboratories
              below, which manage entities; nothing here collides with them
              because those paths are siblings of /research, not children.
            */}
            <Route path="/research/:page_key" element={<ResearchPageEditor />} />

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

            {/* Research Institutes */}
            <Route path="/research-institutes" element={<ResearchInstitutesPage />} />
            <Route path="/research-institutes/new" element={<NewResearchInstitutePage />} />
            <Route path="/research-institutes/:institute_code" element={<ResearchInstituteDetailsPage />} />

            {/* Research Projects */}
            <Route path="/research-projects" element={<ResearchProjectsPage />} />
            <Route path="/research-projects/new" element={<NewResearchProjectPage />} />
            <Route path="/research-projects/:project_code" element={<ResearchProjectDetailsPage />} />

            {/* Research Laboratories */}
            <Route path="/research-laboratories" element={<ResearchLaboratoriesPage />} />
            <Route path="/research-laboratories/new" element={<NewResearchLaboratoryPage />} />
            <Route path="/research-laboratories/:laboratory_id" element={<ResearchLaboratoryDetailsPage />} />

            {/* Faculties */}
            <Route path="/faculties" element={<FacultiesPage />} />
            <Route path="/faculties/new" element={<NewFacultyPage />} />
            <Route path="/faculties/:faculty_code/view" element={<FacultyViewPage />} />
            <Route path="/faculties/:faculty_code" element={<FacultyDetailsPage />} />

            {/* Cafedras */}
            <Route path="/cafedras" element={<CafedrasPage />} />
            <Route path="/cafedras/new" element={<NewCafedraPage />} />
            <Route path="/cafedras/:cafedra_code/view" element={<CafedraViewPage />} />
            <Route path="/cafedras/:cafedra_code" element={<CafedraDetailsPage />} />

            {/* Departments */}
            <Route path="/admin/departments" element={<DepartmentsPage />} />
            <Route path="/admin/departments/create" element={<NewDepartmentPage />} />
            <Route path="/admin/departments/:department_code/edit" element={<DepartmentDetailsPage />} />

            {/* Collaborations */}
            <Route path="/collaborations" element={<CollaborationsPage />} />
            <Route path="/collaborations/new" element={<NewCollaborationPage />} />
            <Route path="/collaborations/:collaboration_id" element={<CollaborationDetailsPage />} />

            {/* Employees */}
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/new" element={<NewEmployeePage />} />
            <Route path="/employees/:employee_id" element={<EmployeeDetailsPage />} />

            {/* Hero */}
            <Route path="/hero" element={<HeroPage />} />

            {/* Hero certificates */}
            <Route path="/hero-certificates" element={<HeroCertificatesPage />} />
            <Route path="/hero-certificates/new" element={<NewHeroCertificatePage />} />
            <Route path="/hero-certificates/:certificate_id" element={<HeroCertificateDetailsPage />} />

            {/* Menu */}
            <Route path="/menu-header" element={<MenuHeaderPage />} />
            <Route path="/menu-footer" element={<MenuFooterPage />} />
            <Route path="/menu-quick" element={<MenuQuickPage />} />
            <Route path="/menu-shared" element={<MenuSharedPage />} />

            {/*
              Settings. The outer pathless guard already resolves these from
              routePermissions; the explicit `perm` here states the requirement
              at the route itself so the two can be read side by side. Editors
              open on the domain's read key and gate their own save buttons on
              the write key — viewing a role without being able to change it is
              a legitimate state.
            */}
            <Route element={<RequirePermission perm="roles.read" />}>
              <Route path="/settings/roles" element={<RolesPage />} />
              <Route path="/settings/roles/:role_id" element={<RoleEditorPage />} />
            </Route>
            <Route element={<RequirePermission perm="roles.create" />}>
              <Route path="/settings/roles/new" element={<RoleEditorPage />} />
            </Route>

            <Route element={<RequirePermission perm="admin_users.read" />}>
              <Route path="/settings/admin-users" element={<AdminUsersPage />} />
              <Route path="/settings/admin-users/:user_id" element={<AdminUserEditorPage />} />
            </Route>
            <Route element={<RequirePermission perm="admin_users.create" />}>
              <Route path="/settings/admin-users/new" element={<AdminUserEditorPage />} />
            </Route>

            <Route element={<RequirePermission perm="activity.read" />}>
              <Route path="/settings/activity" element={<ActivityLogPage />} />
            </Route>

            {/*
              Chat monitoring. Transcripts and the session list expose visitor IP
              addresses, so read access is its own key rather than inherited from
              the chatbot knowledge domain.
            */}
            <Route element={<RequirePermission perm="chat.read" />}>
              <Route path="/chat/sessions" element={<ChatSessionsPage />} />
              <Route path="/chat/sessions/:session_id" element={<ChatSessionDetailPage />} />
              <Route path="/chat/stats" element={<ChatStatsPage />} />
            </Route>

            </Route>
          </Route>
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
