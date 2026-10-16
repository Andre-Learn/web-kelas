import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import { LoadingState } from './components/States.jsx';

// Secondary pages and the whole dashboard are split out of the initial bundle.
const StructurePage = lazy(() => import('./pages/StructurePage.jsx'));
const MembersPage = lazy(() => import('./pages/MembersPage.jsx'));
const GalleryPage = lazy(() => import('./pages/GalleryPage.jsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

const AdminLayout = lazy(() => import('./layouts/AdminLayout.jsx'));
const LoginPage = lazy(() => import('./pages/admin/LoginPage.jsx'));
const OverviewPage = lazy(() => import('./pages/admin/OverviewPage.jsx'));
const HeroSettingsPage = lazy(() => import('./pages/admin/HeroSettingsPage.jsx'));
const AboutManagerPage = lazy(() => import('./pages/admin/AboutManagerPage.jsx'));
const StructureManagerPage = lazy(() => import('./pages/admin/StructureManagerPage.jsx'));
const MembersManagerPage = lazy(() => import('./pages/admin/MembersManagerPage.jsx'));
const GalleryManagerPage = lazy(() => import('./pages/admin/GalleryManagerPage.jsx'));
const AppearancePage = lazy(() => import('./pages/admin/AppearancePage.jsx'));
const AccountPage = lazy(() => import('./pages/admin/AccountPage.jsx'));

const fallback = (
  <div className="route-loading">
    <LoadingState />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={fallback}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="structure" element={<StructurePage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="admin/login" element={<LoginPage />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="hero" element={<HeroSettingsPage />} />
          <Route path="about" element={<AboutManagerPage />} />
          <Route path="structure" element={<StructureManagerPage />} />
          <Route path="members" element={<MembersManagerPage />} />
          <Route path="gallery" element={<GalleryManagerPage />} />
          <Route path="appearance" element={<AppearancePage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
