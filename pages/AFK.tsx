import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Home, BookOpen, Building2, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Language } from '../types';

export const AFK: React.FC<{ lang: Language }> = ({ lang }) => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onSnapshot(doc(db, "site_content", "afk"), (snap) => {
      if (snap.exists()) {
        setContent(snap.data());
      }
      setLoading(false);
    });
  }, []);

  const defaultContent = {
    badge: { RU: 'Академическая среда', BG: 'Академична среда', RO: 'Mediu academic', EN: 'Academic Environment' },
    title1: { RU: 'Твоё будущее', BG: 'Твоето бъдеще', RO: 'Viitorul tău', EN: 'Your Future' },
    title2: { RU: 'Начинается здесь.', BG: 'Започва оттук.', RO: 'Începe aici.', EN: 'Starts here.' },
    description: {
      RU: 'Открой мир возможностей в Тараклийском филиале Русенского университета. Инновации, традиции и успех в каждом шаге.',
      BG: 'Открийте свят от възможности в Тараклийския филиал на Русенския университет. Иновации, традиции и успех във всяка стъпка.',
      RO: 'Descoperă o lume a posibilităților la filiala din Taraclia a Universității din Ruse. Inovație, tradiție și succes la fiecare pas.',
      EN: 'Discover a world of opportunities at the Taraclia branch of Ruse University. Innovation, tradition, and success in every step.'
    }
  };

  const links = [
    { path: '/', icon: Home, title: { RU: 'Главная', BG: 'Начало', RO: 'Acasă', EN: 'Home' }, color: 'from-blue-500/20' },
    { path: '/museum', icon: Building2, title: { RU: 'Музей', BG: 'Музей', RO: 'Muzeu', EN: 'Museum' }, color: 'from-[#FFCC00]/20' },
    { path: '/library', icon: BookOpen, title: { RU: 'Библиотека', BG: 'Библиотека', RO: 'Bibliotecă', EN: 'Library' }, color: 'from-emerald-500/20' },
    { path: '/gallery', icon: ImageIcon, title: { RU: 'Галерея', BG: 'Галерия', RO: 'Galerie', EN: 'Gallery' }, color: 'from-purple-500/20' },
  ];

  const c = content || defaultContent;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#000d1a]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
        <Loader2 className="text-[#FFCC00]" size={48} />
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#000d1a] text-white selection:bg-[#FFCC00] selection:text-[#003366] overflow-hidden flex items-center justify-center relative">

      {/* 🌌 Улучшенный динамический фон */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FFCC00]/10 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full"
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full mb-12 backdrop-blur-xl shadow-xl"
        >
          <Sparkles size={14} className="text-[#FFCC00]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFCC00]">
            {c.badge[lang] || c.badge.RU}
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-10"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] mb-6">
            <span className="block opacity-90">{c.title1[lang] || c.title1.RU}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-[#FFCC00] to-[#e6b800] italic serif">
              {c.title2[lang] || c.title2.RU}
            </span>
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
            {c.description[lang] || c.description.RU}
          </p>
        </motion.div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {links.map((link, index) => {
            const Icon = link.icon;
            return (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Link
                  to={link.path}
                  className="group relative flex items-center p-6 bg-white/[0.03] border border-white/10 rounded-[2rem] overflow-hidden transition-all hover:bg-white/[0.07] hover:border-[#FFCC00]/50 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(255,204,0,0.1)]"
                >
                  {/* Glow Effect on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${link.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative z-10 flex items-center gap-5 w-full">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-[#FFCC00] group-hover:scale-110 group-hover:bg-[#FFCC00] group-hover:text-[#003366] transition-all duration-300 shadow-inner">
                      <Icon size={24} />
                    </div>
                    <div className="text-left">
                      <span className="block text-xl font-bold tracking-tight text-white group-hover:text-[#FFCC00] transition-colors">
                        {link.title[lang] || link.title.RU}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold group-hover:text-white/60">
                        {lang === 'RU' ? 'Перейти' : 'Към страницата'}
                      </span>
                    </div>
                    <ChevronRight size={20} className="ml-auto text-white/20 group-hover:text-[#FFCC00] group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Decorative Branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-4 pointer-events-none"
      >
        <span className="h-[1px] w-20 bg-gradient-to-r from-transparent to-white/20" />
        <p className="text-[9px] font-black uppercase tracking-[0.8em] text-white">Taraclia • 2004</p>
        <span className="h-[1px] w-20 bg-gradient-to-l from-transparent to-white/20" />
      </motion.div>
    </div>
  );
};