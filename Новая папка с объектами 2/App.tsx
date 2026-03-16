
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Language, NavLink as NavLinkType } from './types';
import Layout from './components/Layout';
import Home from './pages/Home';
import Education from './pages/Education';
import Contacts from './pages/Contacts';
import Admission from './pages/Admission';
import News from './pages/News';
import Leadership from './pages/Leadership';
import Library from './pages/Library';
import About from './pages/About';
import Structure from './pages/Structure';
import Departments from './pages/Departments';
import Museum from './pages/Museum';
import StudentCouncil from './pages/StudentCouncil';
import Regulations from './pages/Regulations';
import Calendar from './pages/Calendar';
import Exams from './pages/Exams';
import Scholarships from './pages/Scholarships';
import International from './pages/International';
import Students from './pages/Students';
import Gallery from './pages/Gallery';
import Schedules from './pages/Schedules';
import GenericPage from './pages/GenericPage';
import { AdminPanel } from './pages/AdminPanel';
import { AFK } from './pages/AFK';
import { NotFound } from './pages/NotFound';
import { useSiteData } from './store/useSiteData';
import PageTransition from './components/PageTransition';
import React, { useState, useMemo, Fragment } from 'react';

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
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        
        <Route path="*" element={
          <Layout lang={lang} setLang={setLang}>
            <PageTransition trigger={lang}>
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
                <Route path="/calendar" element={<Students lang={lang} />} />
                <Route path="/exams" element={<Students lang={lang} />} />
                <Route path="/scholarships" element={<Scholarships lang={lang} />} />
                <Route path="/schedules" element={<Students lang={lang} />} />
                <Route path="/international" element={<International lang={lang} />} />
                <Route path="/students" element={<Students lang={lang} />} />
                <Route path="/gallery" element={<Gallery lang={lang} />} />
                <Route path="/afk" element={<AFK lang={lang} />} />

                {allSlugs.map(slug => {
                  const staticPages = ['news', 'contacts', 'education', 'admission', 'education-programs', 'management', 'leadership', 'library', 'about', 'regulations', 'calendar', 'exams', 'scholarships', 'international', 'students', 'afk'];
                  if (staticPages.includes(slug)) return null;

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
            </PageTransition>
          </Layout>
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;
