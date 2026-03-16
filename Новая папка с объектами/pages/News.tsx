
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { Language } from '../types';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Tag, Share2, X, ChevronRight, Image as ImageIcon, Maximize2, ChevronLeft } from 'lucide-react';

interface NewsProps {
  lang: Language;
}

interface NewsItem {
  id: string;
  date: string;
  category: 'academic' | 'event' | 'international' | string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  fullContent?: Record<string, string>;
  images: string[];
  timestamp?: any;
}

const News: React.FC<NewsProps> = ({ lang }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const location = useLocation();

  const t = {
    BG: { 
      title: 'Новини и събития', 
      subtitle: 'Бъдете в крак с академичния живот на Русенския университет в Тараклия.',
      all: 'Всички', 
      readMore: 'Прочети повече', 
      loading: 'Синхронизиране...',
      share: 'Сподели',
      close: 'Затвори',
      published: 'Публикувано в',
      socialTitle: 'Следвайте ни',
      socialSub: 'Последни новини от Facebook',
      cats: { academic: 'Академични', event: 'Събития', international: 'Международни' }
    },
    RU: { 
      title: 'Новости и события', 
      subtitle: 'Будьте в курсе академической жизни Русенского университета в Тараклии.',
      all: 'Все', 
      readMore: 'Читать далее', 
      loading: 'Синхронизация...',
      share: 'Поделиться',
      close: 'Закрыть',
      published: 'Опубликовано в',
      socialTitle: 'Мы в Facebook',
      socialSub: 'Следите за обновлениями в соцсетях',
      cats: { academic: 'Академические', event: 'События', international: 'Международные' }
    },
    RO: { 
      title: 'Știri și Evenimente', 
      subtitle: 'Fiți la curent cu viața academică a Universității din Ruse la Taraclia.',
      all: 'Toate', 
      readMore: 'Citește mai mult', 
      loading: 'Se încarcă...',
      share: 'Partajează',
      close: 'Închide',
      published: 'Publicat la',
      socialTitle: 'Urmăriți-ne',
      socialSub: 'Ultimele noutăți pe Facebook',
      cats: { academic: 'Academice', event: 'Evenimente', international: 'Internaționale' }
    },
    EN: { 
      title: 'News & Events', 
      subtitle: 'Stay up to date with the academic life of Ruse University in Taraclia.',
      all: 'All', 
      readMore: 'Read more', 
      loading: 'Loading...',
      share: 'Share',
      close: 'Close',
      published: 'Published at',
      socialTitle: 'Follow Us',
      socialSub: 'Latest from social media',
      cats: { academic: 'Academic', event: 'Events', international: 'International' }
    }
  }[lang];

  useEffect(() => {
    const q = query(collection(db, "news"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsItem[];
      setNewsData(docs);
      setLoading(false);

      const params = new URLSearchParams(location.search || window.location.hash.split('?')[1]);
      const newsId = params.get('id');
      if (newsId) {
        const found = docs.find(n => n.id === newsId);
        if (found) {
          setSelectedNews(found);
          setModalImageIndex(0);
        }
      }
    });
    return () => unsubscribe();
  }, [location.search]);

  useEffect(() => {
    if (selectedNews) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedNews]);

  const filteredNews = activeCategory === 'all' 
    ? newsData 
    : newsData.filter(item => item.category === activeCategory);

  const shareNews = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#/news?id=${id}`;
    navigator.clipboard.writeText(url);
    alert(lang === 'RU' ? 'Прямая ссылка на новость скопирована!' : 'Директна връзка към новината е копирана!');
  };

  return (
    <div className="page-transition min-h-screen bg-slate-50/50">
      {/* Header Section */}
      <section className="bg-[#001a33] text-white pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#FFCC00]/5 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-8">
            <div className="w-1.5 h-1.5 bg-[#FFCC00] rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">University Pulse</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-bold mb-6 serif italic leading-none tracking-tight">
            {t.title}
          </h1>
          <p className="text-white/40 text-lg md:text-xl font-light max-w-2xl leading-relaxed">
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* Filter Navigation */}
      <nav className="sticky top-20 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex py-5 gap-3 overflow-x-auto no-scrollbar items-center">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-8 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${
              activeCategory === 'all' 
                ? 'bg-[#003366] text-white shadow-lg' 
                : 'text-slate-400 hover:text-[#003366] bg-slate-50 hover:bg-slate-100'
            }`}
          >
            {t.all}
          </button>
          {['academic', 'event', 'international'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${
                activeCategory === cat 
                  ? 'bg-[#003366] text-white shadow-lg' 
                  : 'text-slate-400 hover:text-[#003366] bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {(t.cats as any)[cat] || cat}
            </button>
          ))}
        </div>
      </nav>

      {/* News Content Grid + Sidebar */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main News Area */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40">
                <div className="w-12 h-12 border-4 border-[#FFCC00] border-t-transparent rounded-full animate-spin mb-8"></div>
                <p className="font-black text-[11px] uppercase tracking-[0.5em] text-[#003366] animate-pulse">{t.loading}</p>
              </div>
            ) : filteredNews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {filteredNews.map((item, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        key={item.id} 
                        onClick={() => {
                          setSelectedNews(item);
                          setModalImageIndex(0);
                        }}
                        className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 border border-slate-100 flex flex-col cursor-pointer relative"
                      >
                        <div className="aspect-[16/10] overflow-hidden relative bg-slate-200">
                          <img 
                            src={item.images?.[0] || (item as any).image || `https://picsum.photos/seed/${item.id}/800/600`} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                            alt={item.title[lang]} 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}/800/600`;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          
                          {item.images && item.images.length > 1 && (
                            <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-full flex items-center gap-2 border border-white/10 z-10">
                              <ImageIcon size={12} />
                              +{item.images.length - 1}
                            </div>
                          )}
                        </div>

                        <div className="p-10 flex flex-col flex-grow">
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6 block">
                            <Clock size={12} />
                            {item.date}
                          </div>
                          <h2 className="text-xl md:text-2xl font-bold text-[#003366] mb-8 serif italic leading-tight group-hover:text-[#FFCC00] transition-colors">
                            {item.title[lang] || item.title['RU']}
                          </h2>
                          <p className="text-slate-500 text-sm font-light leading-relaxed line-clamp-3 mb-10">
                            {item.excerpt[lang] || item.excerpt['RU']}
                          </p>
                          
                          <div className="mt-auto flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#003366]">
                            <span className="relative">
                              {t.readMore}
                              <span className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-[#FFCC00] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                            </span>
                            <ChevronRight size={14} className="group-hover:translate-x-2 transition-transform" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
            ) : (
              <div className="text-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-300 text-xs font-black uppercase tracking-[0.5em]">{lang === 'RU' ? 'Ничего не найдено' : 'Няма намерени резултати'}</p>
              </div>
            )}
          </div>

          {/* Social Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm sticky top-32">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[#1877F2] rounded-xl flex items-center justify-center text-white text-xl font-black">f</div>
                <div>
                  <h4 className="text-[14px] font-black text-[#003366] uppercase tracking-widest">{t.socialTitle}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">{t.socialSub}</p>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 aspect-[9/16] relative flex items-center justify-center p-4">
                 <iframe 
                   src={`https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Funi.ruse.taraclia&tabs=timeline&width=340&height=500&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`} 
                   width="100%" 
                   height="500" 
                   style={{border: 'none', overflow: 'hidden'}} 
                   scrolling="no" 
                   frameBorder="0" 
                   allowFullScreen={true} 
                   allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                   title="Facebook Feed"
                 ></iframe>
              </div>
              
              <a 
                href="https://www.facebook.com/uni.ruse.taraclia" 
                target="_blank" 
                rel="noreferrer"
                className="mt-8 w-full bg-[#1877F2] text-white py-5 rounded-2xl text-center font-black uppercase text-[10px] tracking-widest block hover:bg-[#1565c0] transition-colors shadow-lg"
              >
                ОТКРЫТЬ В FACEBOOK
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Reading Modal */}
      {selectedNews && createPortal(
        <AnimatePresence>
          {selectedNews && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 backdrop-blur-2xl bg-[#000d1a]/85"
              onClick={() => setSelectedNews(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-full max-h-[90vh] md:max-w-6xl rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl relative flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                
                {/* Modal Header */}
                <div className="flex justify-between items-center px-8 md:px-12 py-6 bg-white/80 backdrop-blur-md border-b border-slate-50 sticky top-0 z-30">
                   <div className="flex items-center gap-4">
                     <button 
                      onClick={() => shareNews(selectedNews.id)}
                      className="bg-slate-100 text-[#003366] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all flex items-center gap-2"
                     >
                       <Share2 size={14} /> {t.share}
                     </button>
                   </div>
                   <button 
                     onClick={() => { setSelectedNews(null); }} 
                     className="bg-slate-50 p-4 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all border border-slate-100"
                   >
                     <X size={24} />
                   </button>
                </div>

                {/* Modal Content */}
                <div className="overflow-y-auto overflow-x-hidden flex-grow scroll-smooth">
                  {/* Immersive Image for News Modal */}
                  <div className="w-full aspect-video md:aspect-[21/9] bg-slate-900 overflow-hidden relative group/slider">
                    <img 
                      src={selectedNews.images?.[modalImageIndex] || (selectedNews as any).image || `https://picsum.photos/seed/${selectedNews.id}/1200/800`} 
                      className="w-full h-full object-cover cursor-zoom-in" 
                      alt="news cover" 
                      referrerPolicy="no-referrer"
                      onClick={() => setLightboxIndex(modalImageIndex)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${selectedNews.id}/1200/800`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20"></div>
                  </div>

                  <div className="px-8 md:px-24 lg:px-32 py-16">
                    <div className="flex flex-wrap items-center gap-6 mb-12">
                      <span className="bg-[#FFCC00] text-[#003366] text-[10px] font-black px-6 py-2.5 rounded-lg uppercase tracking-[0.3em] shadow-lg flex items-center gap-2">
                        <Tag size={12} />
                        {(t.cats as any)[selectedNews.category] || selectedNews.category}
                      </span>
                      <div className="h-4 w-px bg-slate-200"></div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Clock size={12} />
                        {t.published} {selectedNews.date}
                      </span>
                    </div>

                    <h2 className="text-4xl md:text-7xl font-bold text-[#003366] serif italic mb-12 leading-[1.1] tracking-tight">
                      {selectedNews.title[lang] || selectedNews.title['RU']}
                    </h2>

                    <div className="bg-slate-50/50 border-l-[6px] border-[#FFCC00] p-10 md:p-12 rounded-3xl mb-16 shadow-inner">
                      <p className="text-2xl md:text-3xl text-[#003366]/80 font-medium italic leading-relaxed">
                        {selectedNews.excerpt[lang] || selectedNews.excerpt['RU']}
                      </p>
                    </div>

                    <div className="prose prose-slate prose-xl max-w-none text-slate-600 font-light leading-loose whitespace-pre-line mb-16">
                      {selectedNews.fullContent 
                        ? (selectedNews.fullContent[lang] || selectedNews.fullContent['RU']) 
                        : (selectedNews.excerpt[lang] || selectedNews.excerpt['RU'])}
                    </div>

                    {/* Gallery Section */}
                    {selectedNews.images && selectedNews.images.length > 1 && (
                      <div className="space-y-12 mb-24">
                        <div className="flex items-center gap-6">
                          <div className="h-px flex-grow bg-slate-100"></div>
                          <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Галерея изображений</span>
                          <div className="h-px flex-grow bg-slate-100"></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {selectedNews.images.map((img, i) => (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              key={i} 
                              className={`group/gal rounded-2xl overflow-hidden shadow-sm border aspect-square relative cursor-pointer transition-all duration-500 ${modalImageIndex === i ? 'border-[#FFCC00] ring-4 ring-[#FFCC00]/10 scale-95' : 'border-slate-100 hover:border-slate-300'}`}
                              onClick={() => setModalImageIndex(i)}
                            >
                              <img 
                                src={img || `https://picsum.photos/seed/${selectedNews.id}-${i}/400/400`} 
                                className="w-full h-full object-cover group-hover/gal:scale-110 transition-transform duration-700" 
                                alt={`gallery-${i}`} 
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${selectedNews.id}-${i}/400/400`;
                                }}
                              />
                              <div className={`absolute inset-0 bg-black/20 transition-opacity ${modalImageIndex === i ? 'opacity-0' : 'opacity-0 group-hover/gal:opacity-100'}`}></div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-16 border-t border-slate-100 text-center">
                      <button 
                        onClick={() => setSelectedNews(null)} 
                        className="text-[#003366] text-[11px] font-black uppercase tracking-[0.5em] hover:text-[#FFCC00] transition-colors bg-slate-50 px-12 py-5 rounded-2xl"
                      >
                        {t.close}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Lightbox */}
      {selectedNews && lightboxIndex !== null && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/95 flex items-center justify-center p-4 md:p-12"
            onClick={() => setLightboxIndex(null)}
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <X size={32} />
            </button>

            {selectedNews.images.length > 1 && (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((lightboxIndex - 1 + selectedNews.images.length) % selectedNews.images.length);
                  }}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((lightboxIndex + 1) % selectedNews.images.length);
                  }}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={selectedNews.images[lightboxIndex]}
              className="max-w-full max-h-full object-contain shadow-2xl"
              alt="lightbox"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      {/* Bottom Decoration */}
      <section className="py-24 text-center border-t border-slate-100 bg-white">
        <div className="max-w-md mx-auto px-6">
          <div className="w-16 h-1 bg-[#FFCC00] mx-auto mb-10"></div>
          <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.5em] leading-loose">
            Angel Kanchev University of Ruse <br/> Taraclia Branch Press Office
          </p>
        </div>
      </section>
    </div>
  );
};

export default News;
