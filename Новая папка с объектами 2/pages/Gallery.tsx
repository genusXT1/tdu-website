
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { Maximize2, X, Camera, Filter } from 'lucide-react';
import { db } from '../firebase';
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snap) => {
      setImages(snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryImage)));
      setLoading(false);
    });
  }, []);

  const categories = ['all', ...Array.from(new Set(images.map(img => img.category)))];

  const filteredImages = filter === 'all' 
    ? images 
    : images.filter(img => img.category === filter);

  const t = {
    BG: { title: 'Фотогалерия', subtitle: 'Моменти от живота в нашия университет', all: 'Всички' },
    RU: { title: 'Фотогалерея', subtitle: 'Моменты из жизни нашего университета', all: 'Все' },
    RO: { title: 'Galerie Foto', subtitle: 'Momente din viața universității noastre', all: 'Toate' },
    EN: { title: 'Photo Gallery', subtitle: 'Moments from life at our university', all: 'All' }
  }[lang];

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
              <Camera size={14} /> {lang === 'BG' ? 'Визуален архив' : 'Visual Archive'}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold serif italic mb-8">{t.title}</h1>
            <p className="text-white/60 text-lg max-w-2xl font-light leading-relaxed">
              {t.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-12 px-6 border-b border-slate-100 sticky top-20 bg-white/80 backdrop-blur-xl z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400 mr-4">
            <Filter size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Филтър:</span>
          </div>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === cat 
                  ? 'bg-[#003366] text-white shadow-lg scale-105' 
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' ? t.all : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="aspect-square bg-slate-50 rounded-[3rem] animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode='popLayout'>
              {filteredImages.map((img, idx) => (
                <motion.div
                  layout
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="group relative aspect-square overflow-hidden rounded-[3rem] shadow-sm hover:shadow-2xl transition-all cursor-zoom-in border border-slate-100"
                  onClick={() => setSelectedImage(img.url)}
                >
                  <img 
                    src={img.url} 
                    alt="" 
                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-2"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001a33]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-10">
                    <span className="text-[#FFCC00] text-[8px] font-black uppercase tracking-widest mb-2">
                      {img.category}
                    </span>
                    <h3 className="text-white font-bold text-lg leading-tight">
                      {img.title[lang] || img.title.RU}
                    </h3>
                  </div>
                  <div className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                    <Maximize2 size={20} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-[#001a33]/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-20"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-10 right-10 text-white/40 hover:text-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={40} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
