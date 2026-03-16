
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Language } from '../types';
import { Navbar } from './layout/Navbar';
import { Footer } from './layout/Footer';
import { FAQ } from './FAQ';

import { useSiteData } from '../store/useSiteData';
import { APP_CONFIG } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  lang: Language;
  setLang: (l: Language) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, lang, setLang }) => {
  const location = useLocation();
  const [showCookieNotice, setShowCookieNotice] = useState(false);
  const { data } = useSiteData();

  useEffect(() => {
    const univName = data.universityName?.[lang] || APP_CONFIG.universityName[lang];
    const branch = data.branchLocation?.[lang] || APP_CONFIG.branchLocation[lang];
    document.title = `${univName} - ${branch}`;

    // Dynamic Favicon
    const logo = data.logoUrl || "https://www.uni-ruse.bg/_layouts/15/images/UniRuse/ru-default-logo.png";
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = logo;
  }, [data, lang]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    const accepted = localStorage.getItem('cookies_accepted');
    if (!accepted) {
      const timer = setTimeout(() => setShowCookieNotice(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookies_accepted', 'true');
    setShowCookieNotice(false);
  };

  const t = {
    BG: { 
      text: "Този сайт използва бисквитки за по-добро изживяване.", 
      btn: "Приемам",
      link: "Научете повече"
    },
    RU: { 
      text: "Этот сайт использует файлы cookie для улучшения работы.", 
      btn: "Принять",
      link: "Подробнее"
    },
    RO: { 
      text: "Acest site folosește cookie-uri.", 
      btn: "Accept",
      link: "Detalii"
    },
    EN: { 
      text: "This site uses cookies to improve your experience.", 
      btn: "Accept",
      link: "Learn more"
    }
  }[lang];

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#FFCC00] selection:text-[#003366]">
      <Navbar lang={lang} setLang={setLang} />
      
      <main className="flex-grow pt-20">
        {children}
      </main>

      <Footer lang={lang} />
      <FAQ lang={lang} />

      {/* Cookie Notice */}
      {showCookieNotice && (
        <div className="fixed bottom-0 left-0 w-full z-[1000] p-4 animate-slideUp">
          <div className="max-w-4xl mx-auto bg-[#001a33] border border-white/10 shadow-2xl rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white/80 text-sm font-medium">
              {t.text} <Link to="/cookies" className="text-[#FFCC00] border-b border-[#FFCC00]/30 ml-2">{t.link}</Link>
            </div>
            <button 
              onClick={acceptCookies}
              className="bg-[#FFCC00] text-[#003366] px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg whitespace-nowrap"
            >
              {t.btn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
