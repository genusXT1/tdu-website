
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { Maximize2, X, Camera, Filter, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { db } from '../firebase';
import { useSiteData } from '../store/useSiteData';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

interface GalleryImage {
  id: string;
  url: string;
  title: Record<string, string>;
  category: string;
  timestamp: any;
}

const Gallery: React.FC<{ lang: Language }> = ({ lang }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { isAdmin } = useSiteData();

  const t = {
    BG: { title: 'Фотогалерия', subtitle: 'Моменти от живота в нашия университет', all: 'Всички', unknownDate: 'Предишни' },
    RU: { title: 'Фотогалерея', subtitle: 'Моменты из жизни нашего университета', all: 'Все', unknownDate: 'Ранее' },
    RO: { title: 'Galerie Foto', subtitle: 'Momente din viața universității noastre', all: 'Toate', unknownDate: 'Mai demult' },
    EN: { title: 'Photo Gallery', subtitle: 'Moments from life at our university', all: 'All', unknownDate: 'Earlier' }
  }[lang];

  // No longer using category filter, we will group by month
  const groupedImages = images.reduce((acc, img) => {
    let dateStr = t.unknownDate;
    if (img.timestamp) {
      const date = img.timestamp.toDate ? img.timestamp.toDate() : new Date(img.timestamp);
      dateStr = date.toLocaleDateString(
        lang === 'BG' ? 'bg-BG' : lang === 'RO' ? 'ro-RO' : lang === 'EN' ? 'en-US' : 'ru-RU',
        { month: 'long', year: 'numeric' }
      );
      // Capitalize first letter
      dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    }
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(img);
    return acc;
  }, {} as Record<string, GalleryImage[]>);

  // Maintain chronological order of groups (latest first)
  const sortedMonths = Object.keys(groupedImages).sort((a, b) => {
    if (a === t.unknownDate) return 1;
    if (b === t.unknownDate) return -1;
    // Basic string comparison works if they were parsed back to dates, 
    // but firestore orderBy already returns them descending. 
    // The groups will naturally be discovered in descending order.
    return 0;
  });

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snap) => {
      setImages(snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryImage)));
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="pt-32 pb-20 px-6 bg-[#001a33] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#FFCC00]/5 -skew-x-12 transform translate-x-1/4"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 text-[#FFCC00] text-[10px] font-black uppercase tracking-[0.5em] mb-6">
              <Camera size={14} /> {lang === 'BG' ? 'Визуален архив' : lang === 'RU' ? 'Визуальный архив' : lang === 'RO' ? 'Arhivă vizuală' : 'Visual Archive'}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold serif italic mb-8">{t.title}</h1>
            <p className="text-white/60 text-lg max-w-2xl font-light leading-relaxed">
              {t.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square bg-slate-50 rounded-[3rem] animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-32">
            {sortedMonths.map((month) => (
              <div key={month} className="relative">
                {/* Month Sticky Header */}
                <div className="sticky top-24 z-30 inline-block mb-12">
                  <div className="bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm px-8 py-4 rounded-2xl flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-[#FFCC00]"></div>
                    <h2 className="text-2xl font-bold text-[#003366] capitalize tracking-wide">{month}</h2>
                  </div>
                </div>

                {/* Masonry-style Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
                  <AnimatePresence>
                    {groupedImages[month].map((img, idx) => {
                      // Alternate span sizes to create a masonry-like feel
                      const isLarge = idx % 5 === 0;
                      const isTall = idx % 7 === 0 && !isLarge;

                      return (
                        <motion.div
                          layout
                          key={img.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: (idx % 10) * 0.05 }}
                          className={`group relative overflow-hidden rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-700 cursor-zoom-in border border-slate-100/50 ${isLarge ? 'md:col-span-2 md:row-span-2' : isTall ? 'md:row-span-2' : ''
                            }`}
                          onClick={() => {
                            const globalIndex = images.findIndex(i => i.id === img.id);
                            setSelectedIndex(globalIndex !== -1 ? globalIndex : null);
                          }}
                        >
                          <img
                            src={(img as any).image || img.url}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#001122]/90 via-[#001122]/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                            <span className="text-[#FFCC00] text-[9px] font-black uppercase tracking-[0.3em] mb-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                              {img.category}
                            </span>
                            <h3 className="text-white font-bold text-xl md:text-2xl leading-tight translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                              {img.title[lang] || img.title.RU}
                            </h3>
                          </div>
                          <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
                            <Maximize2 size={16} />
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            ))}

            {images.length === 0 && (
              <div className="text-center py-40">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <Camera size={40} />
                </div>
                <h3 className="text-2xl font-bold text-[#003366] mb-2">{lang === 'RU' ? 'Галерея пуста' : 'Галерията е празна'}</h3>
                <p className="text-slate-400">{lang === 'RU' ? 'Здесь скоро появятся новые фотографии' : 'Тук скоро ще се появят нови снимки'}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Admin Quick Edit */}
      {isAdmin && (
        <div className="fixed bottom-10 right-10 z-[100]">
          <Link to="/admin?tab=gallery" className="flex items-center gap-3 bg-[#FFCC00] text-[#003366] px-6 py-4 rounded-full font-black text-[12px] uppercase shadow-2xl hover:scale-105 transition-all">
            <Edit2 size={18} />
            {lang === 'RU' ? 'Редактировать галерею' : 'Редактирай галерията'}
          </Link>
        </div>
      )}

      {/* Premium Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && images[selectedIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[7000] bg-[#00050f]/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12 overflow-hidden"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[7010] p-4 bg-white/5 hover:bg-white/10 rounded-full"
              onClick={() => setSelectedIndex(null)}
            >
              <X size={24} strokeWidth={2} />
            </button>

            <motion.div
              className="relative w-full h-full flex items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-[7010] px-6 py-3 bg-black/40 backdrop-blur-xl rounded-full border border-white/10">
                {images.slice(Math.max(0, selectedIndex - 5), Math.min(images.length, selectedIndex + 6)).map((img, i) => {
                  const actualIndex = Math.max(0, selectedIndex - 5) + i;
                  return (
                    <button
                      key={img.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIndex(actualIndex);
                      }}
                      className={`rounded-full transition-all duration-300 ${selectedIndex === actualIndex ? 'w-2.5 h-2.5 bg-white' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'}`}
                    />
                  );
                })}
              </div>

              <motion.img
                key={selectedIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                src={(images[selectedIndex] as any).image || images[selectedIndex].url}
                className="max-w-[95vw] max-h-[85vh] object-contain shadow-2xl rounded-sm"
                referrerPolicy="no-referrer"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
                    }}
                    className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-all p-4 hover:bg-white/5 rounded-full"
                  >
                    <ChevronLeft size={40} strokeWidth={1} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIndex((selectedIndex + 1) % images.length);
                    }}
                    className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-all p-4 hover:bg-white/5 rounded-full"
                  >
                    <ChevronRight size={40} strokeWidth={1} />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
