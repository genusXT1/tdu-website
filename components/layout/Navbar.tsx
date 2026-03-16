
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Language } from '../../types';
import { APP_CONFIG } from '../../constants';
import { useSiteData } from '../../store/useSiteData';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Globe, ChevronRight } from 'lucide-react';

interface NavbarProps {
  lang: Language;
  setLang: (l: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ lang, setLang }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const { data } = useSiteData();

  const toggleSection = (id: string) => {
    setOpenSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const languages = [
    { code: Language.BG, flag: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/bg.svg' },
    { code: Language.RU, flag: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/ru.svg' },
    { code: Language.RO, flag: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/md.svg' }
  ];

  const navLinks = data.navLinks || [];

  // Prevent scroll when menu is open
  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-[100] bg-[#003366] border-b border-white/10 shadow-xl h-20">
        <div className="max-w-[1600px] mx-auto px-6 flex justify-between items-center h-full">
          <Link to="/" className="flex items-center gap-4">
            <img src={data.logoUrl || "https://www.uni-ruse.bg/_layouts/15/images/UniRuse/ru-default-logo.png"} alt="Logo" className="h-10 brightness-200" />
            <div className="hidden lg:flex flex-col border-l border-white/20 pl-4 text-white">
              <span className="text-[11px] font-black uppercase tracking-wider leading-tight">
                {data.universityName?.[lang] || APP_CONFIG.universityName[lang]}
              </span>
              <span className="text-[9px] text-[#FFCC00] uppercase tracking-[0.2em] font-bold">
                {data.branchLocation?.[lang] || APP_CONFIG.branchLocation[lang]}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 md:gap-8">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 px-4 md:px-6 py-2.5 rounded-full border border-white/10 transition-all shadow-inner"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80 hidden sm:inline">МЕНЮ</span>
              <div className="space-y-1.5">
                <div className="w-6 h-0.5 bg-white group-hover:w-8 transition-all"></div>
                <div className="w-4 h-0.5 bg-[#FFCC00] ml-auto"></div>
              </div>
            </button>
          </div>
        </div>

        {/* FULLSCREEN BURGER MENU */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 bg-[#000d1a] z-[1000] flex flex-col"
            >
              <div className="p-8 flex justify-between items-center border-b border-white/5">
                <Link to="/" onClick={() => setIsMenuOpen(false)}>
                  <img src={data.logoUrl || "https://www.uni-ruse.bg/_layouts/15/images/UniRuse/ru-default-logo.png"} className="h-8 brightness-200" alt="Logo" />
                </Link>
                <button onClick={() => setIsMenuOpen(false)} className="text-white hover:text-[#FFCC00] p-2 border border-white/10 rounded-full">
                  <X size={32} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto px-6 py-12">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8 md:gap-y-16">
                  {navLinks.map((link, idx) => {
                    const isExpanded = openSections.includes(link.id);
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + idx * 0.05 }}
                        key={link.id}
                        className="space-y-4 md:space-y-6"
                      >
                        <div className="flex justify-between items-center border-b border-white/10 pb-3">
                          {link.path ? (
                            <Link
                              to={link.path}
                              onClick={() => setIsMenuOpen(false)}
                              className="text-2xl md:text-3xl font-bold text-[#FFCC00] serif italic hover:pl-2 transition-all"
                            >
                              {link.label[lang] || link.label.RU || 'Untitled'}
                            </Link>
                          ) : (
                            <h3
                              className="text-2xl md:text-3xl font-bold text-[#FFCC00] serif italic cursor-pointer md:cursor-default flex-grow"
                              onClick={() => toggleSection(link.id)}
                            >
                              {link.label[lang] || link.label.RU || 'Category'}
                            </h3>
                          )}

                          {link.children && (
                            <button
                              onClick={() => toggleSection(link.id)}
                              className="md:hidden text-[#FFCC00] p-2"
                            >
                              <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
                                <ChevronRight size={20} />
                              </motion.div>
                            </button>
                          )}
                        </div>

                        <AnimatePresence>
                          {(isExpanded || window.innerWidth >= 768) && link.children && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="flex flex-col gap-4 pl-4 overflow-hidden"
                            >
                              {link.children.map(c => (
                                <Link
                                  key={c.id}
                                  to={c.path || '#'}
                                  onClick={() => setIsMenuOpen(false)}
                                  className="text-[16px] md:text-[17px] text-white/60 hover:text-white transition-all font-medium flex items-center gap-3 group"
                                >
                                  <ChevronRight size={14} className="text-[#FFCC00] opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />
                                  {c.label[lang] || c.label.RU}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="p-10 border-t border-white/5 flex flex-col items-center gap-6 bg-[#000d1a]">
                <div className="flex flex-col items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFCC00]/60 mb-2">
                    {lang === Language.RU ? 'Выберите язык' : 'Изберете език'}
                  </span>
                  <div className="flex gap-10">
                    {languages.map(l => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setIsMenuOpen(false); }}
                        className={`w-14 h-10 rounded-lg overflow-hidden transition-all hover:scale-125 border-2 ${lang === l.code ? 'border-[#FFCC00] scale-110' : 'border-transparent grayscale opacity-40 hover:grayscale-0 hover:opacity-100'}`}
                        title={l.code}
                      >
                        <img src={l.flag} alt={l.code} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/10">Angel Kanchev University of Ruse • Taraclia Branch</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};
