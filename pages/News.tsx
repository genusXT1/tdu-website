
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { Language } from '../types';
import { useSiteData } from '../store/useSiteData';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Tag, Share2, X, ChevronRight, Image as ImageIcon, Maximize2, ChevronLeft, Calendar, ArrowRight, Send, MessageSquare, Edit2 } from 'lucide-react';
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
  slug?: string;
}

const News: React.FC<NewsProps> = ({ lang }) => {
  const { data, isAdmin } = useSiteData();
  const [activeCategory, setActiveCategory] = useState('all');
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showShareModal, setShowShareModal] = useState<NewsItem | null>(null);
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
    },
    RO: {
      title: 'Știri și Evenimente',
      subtitle: `Fii la curent cu viața academică a ${universityName} în ${branchLocation}.`,
      all: 'Toate',
      readMore: 'Citește mai mult',
      loading: 'Sincronizare...',
      share: 'Distribuie',
      close: 'Închide',
      published: 'Publicat în',
      socialTitle: 'Urmăriți-ne pe Facebook',
      socialSub: 'Ultimele noutăți',
      cats: { academic: 'Academice', event: 'Evenimente', international: 'Internaționale' }
    },
    EN: {
      title: 'News and Events',
      subtitle: `Stay updated with the academic life of ${universityName} in ${branchLocation}.`,
      all: 'All',
      readMore: 'Read more',
      loading: 'Syncing...',
      share: 'Share',
      close: 'Close',
      published: 'Published in',
      socialTitle: 'Follow us',
      socialSub: 'Latest news from Facebook',
      cats: { academic: 'Academic', event: 'Events', international: 'International' }
    }
  }[lang] || { title: 'News', subtitle: 'Latest updates' };

  const getNewsImage = (n: any) => {
    if (Array.isArray(n.images) && n.images.length > 0) return n.images[0];
    if (typeof n.images === 'string' && n.images.length > 0) return n.images;
    if (n.image) return n.image;
    return '/img/no-image.png';
  };

  const getLocalized = (field: any, fallbackField?: any): string => {
    const val = field || fallbackField;
    if (!val) return "";
    if (typeof val === 'string') return val;
    return val[lang] || val['RU'] || val['BG'] || "";
  };

  useEffect(() => {
    const q = collection(db, "news");
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as NewsItem[];
      const sorted = docs.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });
      setNewsData(sorted);
      setLoading(false);

      // Handle deep linking
      const params = new URLSearchParams(location.search || window.location.hash.split('?')[1]);
      const newsId = params.get('id');
      if (newsId) {
        const found = sorted.find((n: any) => n.id === newsId || n.slug === newsId);
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

  const shareNews = async (item: NewsItem) => {
    setShowShareModal(item);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(lang === 'RU' ? 'Ссылка скопирована!' : 'Връзката е копирана!');
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe]">
      {/* Editorial Hero Section */}
      <section className="pt-44 pb-32 px-6 bg-white border-b border-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FFCC00] blur-[150px] rounded-full -mr-64 -mt-64 opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#003366] blur-[150px] rounded-full -ml-32 -mb-32 opacity-10"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-px bg-[#FFCC00]"></div>
              <span className="text-[#003366] text-[10px] font-black uppercase tracking-[0.6em]">{lang === 'RU' ? 'ПРЕСС-ЦЕНТР' : 'ПРЕСЦЕНТЪР'}</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-[8rem] font-bold text-[#003366] serif italic leading-[0.9] mb-12 tracking-tight">
              {t.title}
            </h1>
            <p className="text-xl md:text-3xl text-slate-500 font-light max-w-3xl leading-relaxed">
              {t.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Navigation - Modern Sleek Tabs */}
      <nav className="sticky top-20 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex py-4 gap-8 overflow-x-auto no-scrollbar items-center justify-start sm:justify-center relative">
          <button
            onClick={() => setActiveCategory('all')}
            className={`relative px-2 py-4 text-[11px] font-black uppercase tracking-widest transition-colors whitespace-nowrap ${activeCategory === 'all' ? 'text-[#003366]' : 'text-slate-400 hover:text-[#003366]'}`}
          >
            {t.all}
            {activeCategory === 'all' && (
              <motion.div layoutId="news-tab" className="absolute bottom-0 left-0 w-full h-[3px] bg-[#FFCC00] rounded-t-full" />
            )}
          </button>
          {['academic', 'event', 'international'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative px-2 py-4 text-[11px] font-black uppercase tracking-widest transition-colors whitespace-nowrap ${activeCategory === cat ? 'text-[#003366]' : 'text-slate-400 hover:text-[#003366]'}`}
            >
              {(t.cats as any)[cat] || cat}
              {activeCategory === cat && (
                <motion.div layoutId="news-tab" className="absolute bottom-0 left-0 w-full h-[3px] bg-[#FFCC00] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* News Content */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="relative">
              <div className="w-20 h-20 border-2 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 w-20 h-20 border-t-2 border-[#FFCC00] rounded-full animate-spin"></div>
            </div>
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="space-y-20">
            {/* Featured Section */}
            {activeCategory === 'all' && filteredNews.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="group cursor-pointer relative"
                onClick={() => {
                  setSelectedNews(filteredNews[0]);
                  setModalImageIndex(0);
                }}
              >
                <div className="relative aspect-video lg:aspect-[21/9] overflow-hidden rounded-[2.5rem] md:rounded-[4rem] shadow-2xl bg-[#003366]">
                  {getNewsImage(filteredNews[0]) === '/img/no-image.png' ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#003366] to-[#001a33] opacity-80" />
                  ) : (
                    <img
                      src={getNewsImage(filteredNews[0])}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      alt="featured"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001122]/90 via-[#001122]/40 to-transparent"></div>

                  <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 flex flex-col justify-end">
                    <div className="flex flex-wrap items-center gap-4 text-[10px] md:text-xs font-black text-white/90 uppercase tracking-widest mb-6">
                      <span className="bg-[#FFCC00] text-[#003366] px-4 py-1.5 rounded-full shadow-lg">
                        {lang === 'RU' ? 'ГЛАВНОЕ' : 'ОСНОВНО'}
                      </span>
                      <span className="flex items-center gap-2"><Calendar size={14} /> {filteredNews[0].date}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center gap-2"><Tag size={14} /> {(t.cats as any)[filteredNews[0].category] || filteredNews[0].category}</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white serif italic leading-tight md:leading-[1.1] mb-6 max-w-5xl group-hover:text-[#FFCC00] transition-colors duration-500 line-clamp-3">
                      {getLocalized(filteredNews[0].title)}
                    </h2>
                    <p
                      className="text-slate-300 text-lg md:text-2xl font-light leading-relaxed line-clamp-2 max-w-4xl hidden sm:block"
                      dangerouslySetInnerHTML={{ __html: getLocalized(filteredNews[0].excerpt, (filteredNews[0] as any).body) }}
                    />
                  </div>
                </div>
              </motion.section>
            )}

            {/* Smart Grid Feed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredNews.slice(activeCategory === 'all' ? 1 : 0).map((item, idx) => (
                <motion.article
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: (idx % 4) * 0.1 }}
                  key={item.id}
                  onClick={() => {
                    setSelectedNews(item);
                    setModalImageIndex(0);
                  }}
                  className="group cursor-pointer bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-100 flex flex-col h-full"
                >
                  <div className="aspect-[4/3] overflow-hidden relative bg-[#003366]">
                    {getNewsImage(item) === '/img/no-image.png' ? (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#003366] to-[#001a33] opacity-80" />
                    ) : (
                      <img
                        src={getNewsImage(item)}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={getLocalized(item.title)}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    )}

                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                      <div className="bg-white/90 backdrop-blur-sm text-[#003366] text-[9px] font-black px-3 py-1.5 rounded-full uppercase shadow-sm">
                        {(t.cats as any)[item.category] || item.category}
                      </div>

                      {item.images && item.images.length > 1 && (
                        <div className="bg-black/50 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1.5 rounded-full flex items-center gap-1">
                          <ImageIcon size={10} /> +{item.images.length - 1}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-grow">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <Clock size={12} /> {item.date}
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-[#003366] serif italic leading-tight mb-4 group-hover:text-[#FFCC00] transition-colors line-clamp-3">
                      {getLocalized(item.title)}
                    </h3>

                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 group-hover:text-[#003366] transition-colors">{t.readMore}</span>
                      <div className="w-8 h-8 rounded-full bg-slate-50 text-[#003366] flex flex-shrink-0 items-center justify-center group-hover:bg-[#FFCC00] transition-colors">
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Horizontal Widgets Banner */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 border-t border-slate-100 pt-20">
              {/* Facebook Banner */}
              <a href="https://www.facebook.com/RUTaraclia" target="_blank" rel="noreferrer" className="group relative overflow-hidden bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1877F2]"></div>
                <div className="w-16 h-16 bg-[#1877F2]/10 rounded-2xl flex items-center justify-center text-[#1877F2] flex-shrink-0 group-hover:bg-[#1877F2] group-hover:text-white transition-colors">
                  <div className="text-3xl font-black">f</div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#003366] serif italic mb-1">{t.socialTitle}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.socialSub}</p>
                </div>
                <ArrowRight size={20} className="ml-auto text-slate-300 group-hover:text-[#1877F2] transition-colors" />
              </a>

              {/* Telegram Banner */}
              <a href="https://t.me/uniruse" target="_blank" rel="noreferrer" className="group relative overflow-hidden bg-[#003366] p-8 rounded-[2.5rem] shadow-sm flex items-center gap-6 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFCC00]/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
                <div className="w-16 h-16 bg-[#FFCC00]/20 rounded-2xl flex items-center justify-center text-[#FFCC00] flex-shrink-0 group-hover:bg-[#FFCC00] group-hover:text-[#003366] transition-colors">
                  <Send size={24} />
                </div>
                <div className="relative z-10">
                  <h4 className="text-lg font-bold text-white serif italic mb-1">{lang === 'RU' ? 'Наш Telegram' : 'Нашият Telegram'}</h4>
                  <p className="text-[10px] text-[#FFCC00] font-bold uppercase tracking-widest">{lang === 'RU' ? 'Свежие обновления' : 'Нови актуализации'}</p>
                </div>
                <ArrowRight size={20} className="ml-auto text-white/30 group-hover:text-[#FFCC00] transition-colors relative z-10" />
              </a>
            </div>

          </div>
        ) : (
          <div className="text-center py-40">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-8 border border-slate-100 shadow-sm">
              <ImageIcon size={32} />
            </div>
            <p className="text-[#003366] text-[11px] font-black uppercase tracking-[0.5em]">{lang === 'RU' ? 'Ничего не найдено' : 'Няма намерени резултати'}</p>
          </div>
        )}
      </main>

      {/* Admin Quick Edit */}
      {isAdmin && (
        <div className="fixed bottom-10 right-10 z-[100]">
          <Link to="/admin?tab=news" className="flex items-center gap-2 bg-[#FFCC00] text-[#003366] px-6 py-4 rounded-full font-black text-[12px] uppercase shadow-2xl hover:scale-105 transition-all">
            <Edit2 size={18} />
            {lang === 'RU' ? 'Редактировать новости' : 'Редактирай новини'}
          </Link>
        </div>
      )}

      {/* Reading Modal */}
      {createPortal(
        <AnimatePresence>
          {selectedNews && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[5000] flex items-center justify-center p-4 md:p-10 backdrop-blur-3xl bg-[#000d1a]/90"
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
                      onClick={() => shareNews(selectedNews)}
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
                  <div className="w-full aspect-video md:aspect-[21/9] bg-slate-900 overflow-hidden relative group/slider">
                    <motion.div
                      key={modalImageIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="w-full h-full"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(_, info) => {
                        if (selectedNews.images && selectedNews.images.length > 1) {
                          if (info.offset.x < -50) setModalImageIndex((modalImageIndex + 1) % selectedNews.images.length);
                          if (info.offset.x > 50) setModalImageIndex((modalImageIndex - 1 + selectedNews.images.length) % selectedNews.images.length);
                        }
                      }}
                    >
                      <img
                        src={selectedNews.images?.[modalImageIndex] || getNewsImage(selectedNews)}
                        className="w-full h-full object-cover cursor-zoom-in"
                        alt="news cover"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onClick={() => setShowLightbox(true)}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes('picsum')) {
                            target.src = `https://picsum.photos/seed/${selectedNews.id}/1200/800`;
                          }
                        }}
                      />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none"></div>

                    {selectedNews.images && selectedNews.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setModalImageIndex((modalImageIndex - 1 + selectedNews.images.length) % selectedNews.images.length)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/40 transition-all md:opacity-0 md:group-hover/slider:opacity-100"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={() => setModalImageIndex((modalImageIndex + 1) % selectedNews.images.length)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/40 transition-all md:opacity-0 md:group-hover/slider:opacity-100"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="px-6 md:px-24 lg:px-40 py-12 md:py-20">
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
                      {getLocalized(selectedNews.title)}
                    </h2>

                    <div className="bg-slate-50 border-l-[8px] border-[#FFCC00] p-8 md:p-16 rounded-[2.5rem] md:rounded-[3rem] mb-16 md:mb-20">
                      <p className="text-xl md:text-4xl text-[#003366]/80 font-medium italic leading-relaxed">
                        {getLocalized(selectedNews.excerpt, (selectedNews as any).body)}
                      </p>
                    </div>
                    <div
                      className="prose prose-slate prose-lg md:prose-2xl max-w-none text-slate-600 font-light leading-loose whitespace-pre-line mb-24"
                      dangerouslySetInnerHTML={{ __html: selectedNews.fullContent ? getLocalized(selectedNews.fullContent) : getLocalized(selectedNews.excerpt, (selectedNews as any).body) }}
                    />

                    {/* Gallery */}
                    {selectedNews.images && selectedNews.images.length > 1 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-24">
                        {selectedNews.images.map((img, i) => (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            key={i}
                            className={`rounded-[2.5rem] overflow-hidden aspect-square relative cursor-zoom-in transition-all duration-500 ${modalImageIndex === i ? 'ring-8 ring-[#FFCC00]/20' : 'hover:scale-95'}`}
                            onClick={() => {
                              setModalImageIndex(i);
                              setShowLightbox(true);
                            }}
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
        </AnimatePresence>,
        document.body
      )}

      {/* Lightbox Modal */}
      {createPortal(
        <AnimatePresence>
          {showLightbox && selectedNews && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[7000] flex items-center justify-center p-4 bg-[#00050f]/95 backdrop-blur-3xl"
              onClick={() => setShowLightbox(false)}
            >
              <button
                className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[7010] p-4"
                onClick={() => setShowLightbox(false)}
              >
                <X size={32} strokeWidth={1.5} />
              </button>

              <motion.div
                className="relative w-full h-full flex items-center justify-center"
                onClick={e => e.stopPropagation()}
              >
                <motion.img
                  key={modalImageIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                  src={selectedNews.images?.[modalImageIndex] || getNewsImage(selectedNews)}
                  className="max-w-[95vw] max-h-[90vh] object-contain shadow-2xl rounded-sm"
                  referrerPolicy="no-referrer"
                />

                {selectedNews.images && selectedNews.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalImageIndex((modalImageIndex - 1 + selectedNews.images!.length) % selectedNews.images!.length);
                      }}
                      className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-all p-4"
                    >
                      <ChevronLeft size={48} strokeWidth={1} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalImageIndex((modalImageIndex + 1) % selectedNews.images!.length);
                      }}
                      className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-all p-4"
                    >
                      <ChevronRight size={48} strokeWidth={1} />
                    </button>

                    {/* Dots indicator */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3">
                      {selectedNews.images.map((_, i) => (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalImageIndex(i);
                          }}
                          className={`rounded-full transition-all duration-300 ${modalImageIndex === i ? 'w-2.5 h-2.5 bg-white' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Share Modal */}
      {createPortal(
        <AnimatePresence>
          {showShareModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-[#000d1a]/80 backdrop-blur-xl"
              onClick={() => setShowShareModal(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#003366] via-[#FFCC00] to-[#003366]"></div>

                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-bold text-[#003366] serif italic">{lang === 'RU' ? 'Поделиться' : 'Сподели'}</h3>
                  <button onClick={() => setShowShareModal(null)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  {[
                    { name: 'Telegram', icon: <Send size={20} />, color: 'bg-[#229ED9]', url: (u: string, t: string) => `https://t.me/share/url?url=${u}&text=${t}` },
                    { name: 'WhatsApp', icon: <MessageSquare size={20} />, color: 'bg-[#25D366]', url: (u: string, t: string) => `https://api.whatsapp.com/send?text=${t}%0A${u}` },
                    { name: 'Facebook', icon: <Share2 size={20} />, color: 'bg-[#1877F2]', url: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${u}` },
                    { name: 'Viber', icon: <Tag size={20} />, color: 'bg-[#7360F2]', url: (u: string, t: string) => `viber://forward?text=${t}%0A${u}` },
                  ].map(social => {
                    const identifier = showShareModal.slug || showShareModal.id;
                    const shareUrl = encodeURIComponent(`${window.location.origin}${window.location.pathname}#/news?id=${identifier}`);
                    const stripHtml = (html: any) => (typeof html === 'string' ? html.replace(/<[^>]*>?/gm, '') : '');
                    const shareTitle = encodeURIComponent(stripHtml(getLocalized(showShareModal.title)));

                    return (
                      <a
                        key={social.name}
                        href={social.url(shareUrl, shareTitle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${social.color} text-white p-5 rounded-2xl flex flex-col items-center justify-center gap-3 hover:scale-[1.05] transition-all shadow-lg active:scale-95`}
                      >
                        {social.icon}
                        <span className="text-[10px] font-black uppercase tracking-widest">{social.name}</span>
                      </a>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Прямая ссылка</label>
                  <div className="flex gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                    <input
                      readOnly
                      className="bg-transparent flex-grow px-4 text-xs font-medium text-[#003366] outline-none"
                      value={`${window.location.origin}${window.location.pathname}#/news?id=${showShareModal.slug || showShareModal.id}`}
                    />
                    <button
                      onClick={() => copyToClipboard(`${window.location.origin}${window.location.pathname}#/news?id=${showShareModal.slug || showShareModal.id}`)}
                      className="bg-[#003366] text-[#FFCC00] px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all"
                    >
                      {lang === 'RU' ? 'КОПИРОВАТЬ' : 'КОПИРАЙ'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Bottom Decoration */}
      <section className="py-24 text-center border-t border-slate-100 bg-white">
        <div className="max-w-md mx-auto px-6">
          <div className="w-16 h-1 bg-[#FFCC00] mx-auto mb-10"></div>
          <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.5em] leading-loose">
            Angel Kanchev University of Ruse <br /> Taraclia Branch Press Office
          </p>
        </div>
      </section>
    </div>
  );
};

export default News;
