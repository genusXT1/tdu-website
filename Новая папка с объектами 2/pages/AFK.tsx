
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react';
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
    badge: { RU: 'Погружение в атмосферу', BG: 'Потапяне в атмосферата', RO: 'Imersiune în atmosferă', EN: 'Atmospheric Immersion' },
    title1: { RU: 'Твой путь', BG: 'Твоят път', RO: 'Calea ta', EN: 'Your path' },
    title2: { RU: 'Начинается здесь.', BG: 'Започва оттук.', RO: 'Începe aici.', EN: 'Starts here.' },
    description: { 
      RU: 'Мы создаем будущее вместе. Исследуй возможности, открывай новые горизонты и становись частью нашей большой семьи.',
      BG: 'Ние създаваме бъдещето заедно. Изследвайте възможностите, откривайте нови хоризонти и станете част от нашето голямо семейство.',
      RO: 'Creăm viitorul împreună. Explorează posibilitățile, descoperă noi orizonturi și devino parte din marea noastră familie.',
      EN: 'We create the future together. Explore opportunities, discover new horizons, and become part of our big family.'
    },
    button: { RU: 'Вернуться на главную', BG: 'Към началната страница', RO: 'Înapoi la pagina principală', EN: 'Back to home' }
  };

  const c = content || defaultContent;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#000d1a]">
      <Loader2 className="animate-spin text-[#FFCC00]" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#000d1a] text-white font-sans selection:bg-[#FFCC00] selection:text-[#003366] overflow-hidden flex items-center justify-center relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-[#FFCC00]/20 to-transparent rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full blur-[120px]"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "circOut" }}
        >
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full mb-12"
          >
            <Sparkles size={14} className="text-[#FFCC00]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">
              {c.badge[lang] || c.badge.RU}
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "circOut" }}
            className="text-7xl md:text-9xl font-black serif italic tracking-tighter mb-10 leading-[0.85]"
          >
            <span className="block text-white">{c.title1[lang] || c.title1.RU}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FFCC00] via-white to-white/20">
              {c.title2[lang] || c.title2.RU}
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-xl md:text-2xl text-white/40 font-light leading-relaxed max-w-2xl mx-auto mb-16"
          >
            {c.description[lang] || c.description.RU}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              to="/" 
              className="group relative inline-flex items-center gap-4 bg-[#FFCC00] text-[#003366] px-12 py-6 rounded-full font-black uppercase tracking-widest overflow-hidden shadow-2xl shadow-[#FFCC00]/20 transition-all"
            >
              <span className="relative z-10">{c.button[lang] || c.button.RU}</span>
              <ArrowRight size={20} className="relative z-10 group-hover:translate-x-2 transition-transform" />
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-12 left-12 hidden lg:block">
        <div className="flex flex-col gap-2">
          <div className="w-12 h-px bg-white/20"></div>
          <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20">Est. 2004</span>
        </div>
      </div>

      <div className="absolute top-12 right-12 hidden lg:block">
        <div className="flex items-center gap-6">
          <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20">Taraclia Branch</span>
          <div className="w-12 h-px bg-white/20"></div>
        </div>
      </div>
    </div>
  );
};
