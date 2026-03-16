
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Language, NavLink as NavLinkType } from './types';
import Layout from './components/Layout';
import PageTransition from './components/PageTransition';
import IdleTimer from './components/IdleTimer';
import { useSiteData } from './store/useSiteData';
import React, { useState, useMemo, Fragment, Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

const Home = lazy(() => import('./pages/Home'));
const Education = lazy(() => import('./pages/Education'));
const Contacts = lazy(() => import('./pages/Contacts'));
const Admission = lazy(() => import('./pages/Admission'));
const News = lazy(() => import('./pages/News'));
const Leadership = lazy(() => import('./pages/Leadership'));
const Library = lazy(() => import('./pages/Library'));
const About = lazy(() => import('./pages/About'));
const Structure = lazy(() => import('./pages/Structure'));
const Departments = lazy(() => import('./pages/Departments'));
const Museum = lazy(() => import('./pages/Museum'));
const StudentCouncil = lazy(() => import('./pages/StudentCouncil'));
const Regulations = lazy(() => import('./pages/Regulations'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Exams = lazy(() => import('./pages/Exams'));
const Scholarships = lazy(() => import('./pages/Scholarships'));
const International = lazy(() => import('./pages/International'));
const Students = lazy(() => import('./pages/Students'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Schedules = lazy(() => import('./pages/Schedules'));
const GenericPage = lazy(() => import('./pages/GenericPage'));

const AdminPanel = lazy(() => import('./pages/AdminPanel').then(module => ({ default: module.AdminPanel })));
const AFK = lazy(() => import('./pages/AFK').then(module => ({ default: module.AFK })));
const NotFound = lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })));

const GlobalLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#000d1a]">
    <Loader2 className="animate-spin text-[#FFCC00]" size={48} />
  </div>
);

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(Language.BG);
  const { data } = useSiteData();

  const systemSlugs = ['privacy', 'cookies', 'legal', 'about', 'management', 'regulations', 'departments', 'gallery', 'accessibility'];

  const allSlugs = useMemo(() => {
    const slugs: string[] = [];
    const extract = (links: NavLinkType[]) => {
      if (!links || !Array.isArray(links)) return;
      links.forEach(l => {
        if (l.path && l.path !== '/' && l.path !== '/admin') {
          slugs.push(l.path.replace(/^\//, ''));
        }
        if (l.children) extract(l.children);
      });
    };
    extract(data.navLinks);
    return Array.from(new Set([...slugs, ...systemSlugs]));
  }, [data.navLinks]);

  return (
    <HashRouter>
      <IdleTimer />
      <Routes>
        <Route path="/admin" element={
          <Suspense fallback={<GlobalLoader />}>
            <AdminPanel />
          </Suspense>
        } />

        <Route path="*" element={
          <Layout lang={lang} setLang={setLang}>
            <PageTransition trigger={lang}>
              <Suspense fallback={<GlobalLoader />}>
                <Routes>
                  <Route path="/" element={<Home lang={lang} />} />
                  <Route path="/news" element={<News lang={lang} />} />
                  <Route path="/contacts" element={<Contacts lang={lang} />} />
                  <Route path="/education" element={<Education lang={lang} />} />
                  <Route path="/education-programs" element={<Education lang={lang} />} />
                  <Route path="/admission" element={<Admission lang={lang} />} />
                  <Route path="/management" element={<Leadership lang={lang} />} />
                  <Route path="/administration" element={<Leadership lang={lang} />} />
                  <Route path="/leadership" element={<Leadership lang={lang} />} />
                  <Route path="/library" element={<Library lang={lang} />} />
                  <Route path="/structur" element={<Structure lang={lang} />} />
                  <Route path="/departments" element={<Departments lang={lang} />} />
                  <Route path="/museum" element={<Museum lang={lang} />} />
                  <Route path="/student-council" element={<StudentCouncil lang={lang} />} />
                  <Route path="/about" element={<About lang={lang} />} />
                  <Route path="/regulations" element={<Regulations lang={lang} />} />
                  <Route path="/calendar" element={<Calendar lang={lang} />} />
                  <Route path="/exams" element={<Exams lang={lang} />} />
                  <Route path="/scholarships" element={<Scholarships lang={lang} />} />
                  <Route path="/schedules" element={<Schedules lang={lang} />} />
                  <Route path="/international" element={<International lang={lang} />} />
                  <Route path="/students" element={<Students lang={lang} />} />
                  <Route path="/gallery" element={<Gallery lang={lang} />} />
                  <Route path="/afk" element={<AFK lang={lang} />} />

                  {allSlugs.map(slug => {
                    const dynamicPage = data.pages?.find(p => p.slug === slug);
                    if (!dynamicPage) {
                      const staticPages = ['news', 'contacts', 'education', 'admission', 'education-programs', 'management', 'leadership', 'library', 'about', 'regulations', 'calendar', 'exams', 'scholarships', 'international', 'students', 'afk', 'museum', 'gallery', 'student-council', 'departments', 'structure', 'administration'];
                      if (staticPages.includes(slug)) return null;
                    }

                    return (
                      <Fragment key={slug}>
                        <Route
                          path={`/${slug}`}
                          element={<GenericPage lang={lang} />}
                        />
                      </Fragment>
                    );
                  })}

                  <Route path="*" element={<NotFound lang={lang} />} />
                </Routes>
              </Suspense>
            </PageTransition>
          </Layout>
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;
