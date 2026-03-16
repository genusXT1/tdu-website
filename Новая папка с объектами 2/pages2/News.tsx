
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { Language } from '../types';
import { useSiteData } from '../store/useSiteData';
import { APP_CONFIG } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Tag, Share2, X, ChevronRight, Image as ImageIcon, Maximize2, ChevronLeft, Calendar, ArrowRight, Send } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';

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
  const { data } = useSiteData();
  const [activeCategory, setActiveCategory] = useState('all');
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const location = useLocation();

  const universityName = data.universityName?.[lang] || APP_CONFIG.universityName[lang];
  const branchLocation = data.branchLocation?.[lang] || APP_CONFIG.branchLocation[lang];

  const t = {
    BG: { 
      title: 'Новини и събития', 
      subtitle: `Бъдете в крак с академичния живот на ${universityName} в ${branchLocation}.`,
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
      subtitle: `Будьте в курсе академической жизни ${universityName} в ${branchLocation}.`,
      all: 'Все', 
      readMore: 'Читать далее', 
      loading: 'Синхронизация...',
      share: 'Поделиться',
      close: 'Закрыть',
      published: 'Опубликовано в',
      socialTitle: 'Мы в Facebook',
      socialSub: 'Следите за обновлениями в соцсетях',
      cats: { academic: 'Академические', event: 'События', international: 'Международные' }
    }
  }[lang] || { title: 'News', subtitle: 'Latest updates' };

  const getNewsImage = (n: any, width = 800, height = 600) => {
    if (Array.isArray(n.images) && n.images.length > 0) return n.images[0];
    if (typeof n.images === 'string' && n.images.length > 0) return n.images;
    if (n.image) return n.image;
    return `https://picsum.photos/seed/${n.id}/${width}/${height}`;
  };

  useEffect(() => {
    const q = query(collection(db, "news"), orderBy("timestamp", "desc"), limit(50));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as NewsItem[];
      setNewsData(docs);
      setLoading(false);

      // Handle deep linking
      const params = new URLSearchParams(location.search || window.location.hash.split('?')[1]);
      const newsId = params.get('id');
      if (newsId) {
        const found = docs.find((n: any) => n.id === newsId);
        if (found) {
          setSelectedNews(found);
          setModalImageIndex(0);
        }
      }
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsub();
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
    <div className="min-h-screen bg-[#fcfdfe]">
      {/* Editorial Hero Section */}
      <section className="pt-44 pb-32 px-6 bg-[#001a33] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#FFCC00] blur-[180px] rounded-full -mr-96 -mt-96"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500 blur-[150px] rounded-full -ml-64 -mb-64"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-px bg-[#FFCC00]"></div>
              <span className="text-[#FFCC00] text-[10px] font-black uppercase tracking-[0.6em]">{lang === 'RU' ? 'ПРЕСС-ЦЕНТР' : 'ПРЕСЦЕНТЪР'}</span>
            </div>
            <h1 className="text-7xl md:text-[10rem] font-bold serif italic leading-[0.85] mb-12 tracking-tighter">
              {t.title}
            </h1>
            <p className="text-xl md:text-3xl text-white/50 font-light max-w-3xl leading-relaxed">
              {t.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Navigation - Sticky */}
      <nav className="sticky top-20 z-40 bg-white/80 backdrop-blur-3xl border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex py-6 gap-3 overflow-x-auto no-scrollbar items-center justify-center">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-10 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all whitespace-nowrap border-2 ${
              activeCategory === 'all' 
                ? 'bg-[#003366] text-white border-[#003366] shadow-xl scale-105' 
                : 'text-slate-400 hover:text-[#003366] bg-white border-transparent hover:border-slate-200'
            }`}
          >
            {t.all}
          </button>
          {['academic', 'event', 'international'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-10 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all whitespace-nowrap border-2 ${
                activeCategory === cat 
                  ? 'bg-[#003366] text-white border-[#003366] shadow-xl scale-105' 
                  : 'text-slate-400 hover:text-[#003366] bg-white border-transparent hover:border-slate-200'
              }`}
            >
              {(t.cats as any)[cat] || cat}
            </button>
          ))}
        </div>
      </nav>

      {/* News Content */}
      <main className="max-w-7xl mx-auto px-6 py-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-60">
            <div className="relative">
              <div className="w-24 h-24 border-2 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 w-24 h-24 border-t-2 border-[#FFCC00] rounded-full animate-spin"></div>
            </div>
            <p className="mt-12 font-black text-[11px] uppercase tracking-[0.8em] text-[#003366] animate-pulse">{t.loading}</p>
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="space-y-32">
            {/* Featured Section */}
            {activeCategory === 'all' && filteredNews.length > 0 && (
              <motion.section 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="group cursor-pointer relative"
                onClick={() => {
                  setSelectedNews(filteredNews[0]);
                  setModalImageIndex(0);
                }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  <div className="lg:col-span-7">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[4rem] shadow-2xl bg-slate-100">
                      <img 
                        src={getNewsImage(filteredNews[0], 1200, 800)} 
                        className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" 
                        alt="featured" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes('picsum')) {
                            target.src = `https://picsum.photos/seed/${filteredNews[0].id}/1200/800`;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#001a33]/40 to-transparent"></div>
                      <div className="absolute top-10 left-10">
                        <span className="bg-[#FFCC00] text-[#003366] text-[10px] font-black px-6 py-2.5 rounded-xl uppercase tracking-widest shadow-xl">
                          {lang === 'RU' ? 'ГЛАВНОЕ' : 'ОСНОВНО'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-5 space-y-8">
                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      <Calendar size={14} />
                      {filteredNews[0].date}
                      <span className="mx-2">•</span>
                      <Tag size={14} />
                      {(t.cats as any)[filteredNews[0].category] || filteredNews[0].category}
                    </div>
                    <h2 className="text-5xl md:text-7xl font-bold text-[#003366] serif italic leading-[1.1] group-hover:text-[#FFCC00] transition-colors duration-500">
                      {filteredNews[0].title[lang] || filteredNews[0].title['RU']}
                    </h2>
                    <p className="text-slate-500 text-xl font-light leading-relaxed line-clamp-4">
                      {filteredNews[0].excerpt[lang] || filteredNews[0].excerpt['RU']}
                    </p>
                    <div className="pt-4">
                      <div className="inline-flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.5em] text-[#003366] group-hover:gap-10 transition-all duration-500">
                        {t.readMore}
                        <div className="w-12 h-px bg-[#FFCC00]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
              {/* Main Feed */}
              <div className="lg:col-span-8 space-y-24">
                {filteredNews.slice(activeCategory === 'all' ? 1 : 0).map((item, idx) => (
                  <motion.article 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    key={item.id} 
                    onClick={() => {
                      setSelectedNews(item);
                      setModalImageIndex(0);
                    }}
                    className="group cursor-pointer border-b border-slate-100 pb-24 last:border-0"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                      <div className="md:col-span-4">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-xl bg-slate-50">
                          <img 
                            src={getNewsImage(item, 800, 1000)} 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" 
                            alt={item.title[lang]} 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (!target.src.includes('picsum')) {
                                target.src = `https://picsum.photos/seed/${item.id}/800/1000`;
                              }
                            }}
                          />
                          {item.images && item.images.length > 1 && (
                            <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md text-white text-[8px] font-black px-3 py-1.5 rounded-lg border border-white/30">
                              +{item.images.length - 1}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-8 flex flex-col justify-center">
                        <div className="flex items-center gap-4 mb-6">
                          <span className="text-[9px] font-black text-[#FFCC00] uppercase tracking-widest">
                            {(t.cats as any)[item.category] || item.category}
                          </span>
                          <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                          <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                            {item.date}
                          </div>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold text-[#003366] mb-6 serif italic leading-tight group-hover:text-[#FFCC00] transition-colors duration-500">
                          {item.title[lang] || item.title['RU']}
                        </h2>
                        
                        <p className="text-slate-500 text-lg font-light leading-relaxed line-clamp-2 mb-8">
                          {item.excerpt[lang] || item.excerpt['RU']}
                        </p>
                        
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-[#003366] group-hover:translate-x-4 transition-transform duration-500">
                          {t.readMore}
                          <ArrowRight size={16} className="text-[#FFCC00]" />
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-4">
                <div className="sticky top-44 space-y-16">
                  {/* Facebook Widget */}
                  <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-[#1877F2]"></div>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 bg-[#1877F2] rounded-xl flex items-center justify-center text-white text-xl font-black">f</div>
                      <div>
                        <h4 className="text-[11px] font-black text-[#003366] uppercase tracking-widest">{t.socialTitle}</h4>
                        <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">{t.socialSub}</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 aspect-[3/4] relative shadow-inner">
                       <iframe 
                         src={`https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Funi.ruse.taraclia&tabs=timeline&width=340&height=500&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`} 
                         width="100%" 
                         height="100%" 
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
                      className="mt-8 w-full bg-[#1877F2] text-white py-5 rounded-xl text-center font-black uppercase text-[9px] tracking-[0.2em] block hover:bg-[#1565c0] transition-all shadow-lg"
                    >
                      {lang === 'RU' ? 'ПЕРЕЙТИ В FACEBOOK' : 'КЪМ FACEBOOK'}
                    </a>
                  </div>

                  {/* Newsletter / Telegram */}
                  <div className="bg-[#003366] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFCC00]/10 -mr-16 -mt-16 rounded-full"></div>
                    <h4 className="text-2xl font-bold serif italic mb-6 text-[#FFCC00]">
                      {lang === 'RU' ? 'Будьте в курсе' : 'Бъдете информирани'}
                    </h4>
                    <p className="text-white/60 text-sm font-light leading-relaxed mb-10">
                      {lang === 'RU' 
                        ? 'Подпишитесь на наш Telegram-канал для получения мгновенных уведомлений о жизни филиала.' 
                        : 'Абонирайте се за нашия Telegram канал за незабавни известия за живота на филиала.'}
                    </p>
                    <a 
                      href="https://t.me/uni_ruse_taraclia" 
                      target="_blank" 
                      rel="noreferrer"
                      className="w-full bg-[#FFCC00] text-[#003366] py-5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all flex items-center justify-center gap-3 shadow-xl"
                    >
                      <Send size={16} /> Telegram Channel
                    </a>
                  </div>

                  {/* Archive / Tags */}
                  <div className="px-6">
                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-8">Архив новостей</h4>
                    <div className="space-y-4">
                      {['2025', '2024', '2023'].map(year => (
                        <button key={year} className="w-full flex justify-between items-center py-4 border-b border-slate-100 group">
                          <span className="text-sm font-bold text-[#003366] group-hover:text-[#FFCC00] transition-colors">{year}</span>
                          <ChevronRight size={16} className="text-slate-200 group-hover:text-[#FFCC00] transition-all group-hover:translate-x-2" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        ) : (
          <div className="text-center py-60 bg-white rounded-[5rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-8">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
              <ImageIcon size={40} />
            </div>
            <p className="text-slate-300 text-xs font-black uppercase tracking-[0.5em]">{lang === 'RU' ? 'Ничего не найдено' : 'Няма намерени резултати'}</p>
          </div>
        )}
      </main>

      {/* Reading Modal */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10 backdrop-blur-3xl bg-[#000d1a]/90"
            onClick={() => setSelectedNews(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              className="bg-white w-full max-h-[90vh] md:max-w-7xl rounded-[4rem] overflow-hidden shadow-2xl relative flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-12 py-8 bg-white/80 backdrop-blur-md border-b border-slate-50 sticky top-0 z-30">
                 <div className="flex items-center gap-6">
                   <button 
                    onClick={() => shareNews(selectedNews.id)}
                    className="bg-slate-50 text-[#003366] px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FFCC00] transition-all flex items-center gap-3"
                   >
                     <Share2 size={16} /> {t.share}
                   </button>
                 </div>
                 <button 
                   onClick={() => setSelectedNews(null)} 
                   className="bg-slate-50 p-5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all border border-slate-100"
                 >
                   <X size={28} />
                 </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto flex-grow scroll-smooth">
                  <div className="w-full aspect-video md:aspect-[21/9] bg-slate-900 overflow-hidden relative">
                    <img 
                      src={selectedNews.images?.[modalImageIndex] || getNewsImage(selectedNews, 1200, 800)} 
                      className="w-full h-full object-cover" 
                      alt="news cover" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('picsum')) {
                          target.src = `https://picsum.photos/seed/${selectedNews.id}/1200/800`;
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                  </div>

                <div className="px-8 md:px-24 lg:px-40 py-20">
                  <div className="flex flex-wrap items-center gap-8 mb-12">
                    <span className="bg-[#FFCC00] text-[#003366] text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest shadow-lg flex items-center gap-3">
                      <Tag size={14} />
                      {(t.cats as any)[selectedNews.category] || selectedNews.category}
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-3">
                      <Clock size={14} />
                      {t.published} {selectedNews.date}
                    </span>
                  </div>

                  <h2 className="text-4xl md:text-8xl font-bold text-[#003366] serif italic mb-16 leading-[1.1] tracking-tight">
                    {selectedNews.title[lang] || selectedNews.title['RU']}
                  </h2>

                  <div className="bg-slate-50 border-l-[8px] border-[#FFCC00] p-12 md:p-16 rounded-[3rem] mb-20">
                    <p className="text-2xl md:text-4xl text-[#003366]/80 font-medium italic leading-relaxed">
                      {selectedNews.excerpt[lang] || selectedNews.excerpt['RU']}
                    </p>
                  </div>

                  <div className="prose prose-slate prose-2xl max-w-none text-slate-600 font-light leading-loose whitespace-pre-line mb-24">
                    {selectedNews.fullContent 
                      ? (selectedNews.fullContent[lang] || selectedNews.fullContent['RU']) 
                      : (selectedNews.excerpt[lang] || selectedNews.excerpt['RU'])}
                  </div>

                  {/* Gallery */}
                  {selectedNews.images && selectedNews.images.length > 1 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-24">
                      {selectedNews.images.map((img, i) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          key={i} 
                          className={`rounded-[2.5rem] overflow-hidden aspect-square relative cursor-pointer transition-all duration-500 ${modalImageIndex === i ? 'ring-8 ring-[#FFCC00]/20' : 'hover:scale-95'}`}
                          onClick={() => setModalImageIndex(i)}
                        >
                          <img 
                            src={img} 
                            className="w-full h-full object-cover" 
                            alt={`gallery-${i}`} 
                            referrerPolicy="no-referrer"
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
