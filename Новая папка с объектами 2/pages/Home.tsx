
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Language, Partner } from '../types';
import { db } from '../firebase';
import { useSiteData } from '../store/useSiteData';
import { APP_CONFIG } from '../constants';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Share2, X, Clock, Tag, Maximize2, ChevronLeft, ChevronRight, Send, MessageSquare } from 'lucide-react';

interface HomeProps { lang: Language; }

interface NewsItem {
  id: string;
  date: string;
  time?: string;
  images: string[];
  title: Record<string, string>;
  excerpt: Record<string, string>;
  fullContent?: Record<string, string>;
  category: string;
  slug?: string;
  timestamp?: any;
}

const Home: React.FC<HomeProps> = ({ lang }) => {
  const { data } = useSiteData();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [readNews, setReadNews] = useState<string[]>([]);

  const [heroLoaded, setHeroLoaded] = useState(false);
  const [showShareModal, setShowShareModal] = useState<NewsItem | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('read_news');
    if (saved) setReadNews(JSON.parse(saved));

    const qNews = collection(db, "news");
    const unsubNews = onSnapshot(qNews, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as NewsItem[];
      const sorted = docs.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });
      setNewsItems(sorted.slice(0, 3));
      setIsNewsLoading(false);
    });

    const unsubPartners = onSnapshot(collection(db, "partners"), (snapshot) => {
      setPartners(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Partner[]);
    });

    return () => { unsubNews(); unsubPartners(); };
  }, []);

  useEffect(() => {
    if (selectedNews) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedNews]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!heroLoaded) setHeroLoaded(true);
    }, 3000); // Show content after 3s even if image is slow
    return () => clearTimeout(timer);
  }, [heroLoaded]);

  const openNews = (item: NewsItem) => {
    setSelectedNews(item);
    setModalImageIndex(0);
    if (!readNews.includes(item.id)) {
      const updated = [...readNews, item.id];
      setReadNews(updated);
      localStorage.setItem('read_news', JSON.stringify(updated));
    }
  };

  const shareNews = (item: NewsItem) => {
    setShowShareModal(item);
  };

  const copyToClipboard = (text: string) => {
    const handleCopy = () => {
      showToast(lang === 'RU' ? 'Ссылка скопирована!' : 'Връзката е копирана!');
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(handleCopy).catch(() => {
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        handleCopy();
      });
    } else {
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      handleCopy();
    }
  };

  const showToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#003366] text-[#FFCC00] px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl z-[5000] animate-bounce';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const universityName = data.universityName?.[lang] || APP_CONFIG.universityName[lang];
  const branchLocation = data.branchLocation?.[lang] || APP_CONFIG.branchLocation[lang];

  const t = {
    BG: {
      hero: universityName,
      heroSub: `Европейско бъдеще в ${branchLocation}. Държавна диплома на Република България, призната в целия ЕС.`,
      cta: "Кандидатствай 2025",
      programs: "Академични направления",
      allPrograms: "Пълен списък със специалности",
      newsTitle: "Последни новини",
      newsSub: "Актуални събития от академичния и студентския живот",
      newLabel: "НОВО",
      readMore: "Прочети повече",
      trustTitle: "Доверие и Бъдеще",
      trustSub: "Информация за родители",
      trustText: "Филиалът в Тараклия осигурява европейски стандарти за безопасност и образование.",
      quote: "Образованието е най-мощното оръжие, което можете да използвате, за да промените света.",
      share: "СПОДЕЛИ",
      close: "Затвори",
      published: "Публикувано в",
      targetTitle: "За кого е обучението?",
      targets: [
        { title: "Абитуриенти", desc: "Стартирайте кариерата си с европейска диплома." },
        { title: "Родители", desc: "Гарантирана безопасност и качество на образованието." },
        { title: "Международни студенти", desc: "Програми за обмен и глобални възможности." },
        { title: "Професионалисти", desc: "Повишаване на квалификацията и нови хоризонти." }
      ]
    },
    RU: {
      hero: universityName,
      heroSub: `Европейское будущее в ${branchLocation}. Государственный диплом Республики Болгария, признанный во всем ЕС.`,
      cta: "Поступление 2025",
      programs: "Академические направления",
      allPrograms: "Полный список специальностей",
      newsTitle: "Последние новости",
      newsSub: "Актуальные события из академической и студенческой жизни",
      newLabel: "НОВОЕ",
      readMore: "Читать полностью",
      trustTitle: "Доверие и Будущее",
      trustSub: "Для родителей и абитуриентов",
      trustText: "Тараклийский филиал — это островок стабильности и европейского качества.",
      quote: "Образование — это самое мощное оружие, которое вы можете использовать, чтобы изменить мир.",
      share: "СПОДЕЛИТЬ",
      close: "Закрыть",
      published: "Опубликовано в",
      targetTitle: "Для кого это обучение?",
      targets: [
        { title: "Абитуриенты", desc: "Начните карьеру с дипломом европейского образца." },
        { title: "Родители", desc: "Гарантия безопасности и качества образования." },
        { title: "Иностранные студенты", desc: "Программы обмена и глобальные возможности." },
        { title: "Профессионалы", desc: "Повышение квалификации и новые горизонты." }
      ]
    }
  }[lang] || { newsTitle: "News", readMore: "More", share: "Share", close: "Close", published: "Date" };

  const specialties = [
    { RU: 'Бизнес и менеджмент', BG: 'Бизнес и мениджмънт', level: 'Bachelor', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600' },
    { RU: 'Компьютерные технологии', BG: 'Компютърни технологии', level: 'Bachelor', img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600' },
    { RU: 'Педагогика и Психология', BG: 'Педагогика и Психология', level: 'Bachelor / Master', img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600' },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-slate-900 overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: heroLoaded ? 0.6 : 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img 
            src="https://tuk.md/wp-content/uploads/2025/05/2025-05-24-18.58.04.jpg" 
            className="w-full h-full object-cover" 
            alt="Hero" 
            referrerPolicy="no-referrer"
            onLoad={() => setHeroLoaded(true)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://picsum.photos/id/122/1920/1080';
              setHeroLoaded(true);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-transparent to-slate-900"></div>
        </motion.div>
        
        {!heroLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#FFCC00] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[#FFCC00] text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Loading Experience</p>
            </div>
          </div>
        )}

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ 
              y: [0, -10, 0],
              opacity: 1 
            }}
            transition={{ 
              y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              },
              opacity: {
                delay: 0.5,
                duration: 0.8
              }
            }}
            className="text-4xl md:text-7xl lg:text-[6rem] font-bold text-white serif italic leading-tight mb-8 tracking-tight"
          >
            {t.hero}
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-lg md:text-2xl text-white/70 font-light mb-12 max-w-2xl mx-auto"
          >
            {t.heroSub}
          </motion.p>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link to="/admission" className="bg-[#FFCC00] text-[#003366] px-12 py-5 font-black uppercase text-xs tracking-[0.2em] hover:bg-white transition-all shadow-xl">
              {t.cta}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-[#003366] serif italic mb-4">{t.newsTitle}</h2>
            <p className="text-[#003366]/60 font-medium italic text-lg mb-8">{t.newsSub}</p>
            <div className="h-1 w-20 bg-[#FFCC00] mx-auto"></div>
          </motion.div>

          <motion.div 
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            {isNewsLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-96 bg-white animate-pulse rounded-[2rem]"></div>)
            ) : (
              newsItems.map((item) => (
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
                  }}
                  key={item.id} 
                  onClick={() => openNews(item)}
                  className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col relative cursor-pointer"
                >
                  {!readNews.includes(item.id) && (
                    <div className="absolute top-6 left-6 bg-red-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-lg z-20">
                      {t.newLabel}
                    </div>
                  )}
                  <div className="aspect-video overflow-hidden relative bg-slate-200">
                    <img 
                      src={item.images?.[0] || (item as any).image || `https://picsum.photos/seed/${item.id}/800/600`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                      alt="news" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}/800/600`;
                      }}
                    />
                    {item.images && item.images.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
                        <Maximize2 size={10} />
                        +{item.images.length - 1}
                      </div>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); shareNews(item); }}
                      className="absolute top-6 right-6 bg-white/90 backdrop-blur-md text-[#003366] p-3 rounded-full shadow-lg z-20 hover:bg-[#FFCC00] transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                  <div className="p-10 flex flex-col flex-grow">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        <Clock size={12} />
                        {item.date}
                      </div>
                      <span className="bg-[#003366]/5 text-[#003366] text-[9px] font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1">
                        <Tag size={10} />
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#003366] serif italic leading-tight mb-8 group-hover:text-[#FFCC00] transition-colors">
                      {item.title[lang] || item.title['RU']}
                    </h3>
                    <div className="mt-auto inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#003366]">
                      <ArrowRight size={14} /> {t.readMore}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 -skew-x-12 transform translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8"
          >
            <div className="max-w-2xl">
              <span className="text-[#FFCC00] text-[10px] font-black uppercase tracking-[0.5em] block mb-6">Academic Excellence</span>
              <h2 className="text-4xl md:text-7xl font-bold text-[#003366] serif italic leading-none">{t.programs}</h2>
            </div>
            <Link to="/education" className="text-[11px] font-black uppercase tracking-widest text-[#003366] border-b-2 border-[#FFCC00] pb-2 hover:text-[#FFCC00] transition-colors">
              {t.allPrograms}
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {specialties.map((spec, idx) => (
              <Link to="/education" key={idx} className="group relative bg-white rounded-[3rem] overflow-hidden shadow-xl border border-slate-100 hover:-translate-y-4 transition-all duration-700">
                <div className="h-[450px] relative overflow-hidden">
                   <img src={spec.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" referrerPolicy="no-referrer" />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#003366] via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity"></div>
                   
                   <div className="absolute top-8 left-8">
                      <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">0{idx + 1}</span>
                   </div>

                   <div className="absolute bottom-12 left-10 right-10">
                      <span className="inline-block bg-[#FFCC00] text-[#003366] px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest mb-4 shadow-lg">
                        {spec.level}
                      </span>
                      <h3 className="text-3xl font-bold text-white serif italic leading-tight group-hover:text-[#FFCC00] transition-colors">
                        {spec[lang] || spec['RU']}
                      </h3>
                   </div>
                </div>
                <div className="p-8 bg-white flex justify-between items-center">
                   <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Enrollment 2025</span>
                   <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#003366] group-hover:text-white transition-colors">
                      →
                   </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Future */}
      <section className="py-32 bg-[#001a33] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/[0.02] -skew-x-12"></div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[#FFCC00] text-[10px] font-black uppercase tracking-[0.5em] block mb-6">{t.trustSub}</span>
            <h2 className="text-5xl md:text-7xl font-bold serif italic mb-10 leading-tight">{t.trustTitle}</h2>
            <p className="text-white/60 text-xl font-light leading-relaxed mb-12">{t.trustText}</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <img src="https://picsum.photos/id/180/800/1000" className="relative z-10 rounded-[4rem] grayscale shadow-2xl hover:grayscale-0 transition-all duration-1000" alt="Trust" referrerPolicy="no-referrer" />
          </motion.div>
        </div>
      </section>

      {/* Partners Section - Redesigned */}
      {partners.length > 0 && (
        <section className="py-32 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <span className="text-[#FFCC00] text-[10px] font-black uppercase tracking-[0.5em] block mb-4">
                {lang === 'BG' ? 'Нашите партньори' : 'Our Partners'}
              </span>
              <h2 className="text-4xl md:text-6xl font-serif italic text-[#003366]">
                {lang === 'BG' ? 'Доверие и сътрудничество' : 'Trust & Collaboration'}
              </h2>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-10 items-center">
              {partners.map((partner, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  key={partner.id}
                  onClick={() => partner.link && window.open(partner.link, '_blank')}
                  className={`h-32 w-56 flex items-center justify-center transition-all duration-700 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm ${partner.link ? 'cursor-pointer hover:shadow-2xl hover:-translate-y-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100' : 'grayscale-0 opacity-100 cursor-default'}`}
                >
                  <img 
                    src={partner.logo} 
                    alt={partner.name} 
                    className="max-w-full max-h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quote */}
      <section className="py-48 bg-slate-50 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <motion.blockquote 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-[#003366] serif italic leading-[1.3] mb-12"
          >
            {t.quote.split('').map((char, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 5 },
                  visible: { opacity: 1, y: 0, transition: { delay: i * 0.03 } }
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.blockquote>
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: 48 }}
            viewport={{ once: true }}
            transition={{ delay: t.quote.length * 0.03, duration: 0.5 }}
            className="h-1 bg-[#FFCC00] mx-auto"
          ></motion.div>
        </div>
      </section>

      {/* News Modal - Redesigned */}
      {createPortal(
        <AnimatePresence>
          {selectedNews && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[5000] flex items-center justify-center p-4 md:p-6 backdrop-blur-2xl bg-[#000d1a]/90 overflow-hidden"
              onClick={() => setSelectedNews(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-full max-h-[90vh] md:max-w-5xl rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl relative flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                
                {/* Header Sticky */}
                <div className="flex justify-between items-center px-8 py-5 bg-white/95 backdrop-blur-md border-b border-slate-50 sticky top-0 z-30">
                   <motion.button 
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => shareNews(selectedNews)} 
                     className="bg-slate-50 text-[#003366] px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#FFCC00] transition-all flex items-center gap-2 border border-slate-200"
                   >
                     <Share2 size={14} /> {t.share}
                   </motion.button>
                   <button onClick={() => setSelectedNews(null)} className="bg-slate-50 p-3 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all border border-slate-200">
                     <X size={20} />
                   </button>
                </div>

                <div className="overflow-y-auto scroll-smooth flex-grow">
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

                    <div className="px-8 md:px-24 py-12 md:py-16">
                      <div className="flex items-center gap-4 mb-10">
                         <span className="bg-[#003366] text-[#FFCC00] text-[10px] font-black px-5 py-2 rounded-lg uppercase tracking-widest shadow-md flex items-center gap-2">
                           <Tag size={12} /> {selectedNews.category}
                         </span>
                         <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                           <Clock size={12} /> {selectedNews.date}
                         </span>
                      </div>

                      <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#003366] serif italic mb-12 leading-[1.15] tracking-tight">
                        {selectedNews.title[lang] || selectedNews.title['RU']}
                      </h2>
                      
                      {/* Clean Excerpt Block */}
                      <div className="border-l-[6px] border-[#FFCC00] bg-slate-50/70 p-10 rounded-r-[2.5rem] mb-16 shadow-inner">
                         <p className="text-2xl md:text-3xl text-[#003366]/90 italic font-medium leading-relaxed">
                            {selectedNews.excerpt[lang] || selectedNews.excerpt['RU']}
                         </p>
                      </div>

                      <div className="prose prose-slate prose-xl max-w-none text-slate-600 font-light leading-loose whitespace-pre-line mb-16">
                        {(() => {
                          const content = selectedNews.fullContent 
                            ? (selectedNews.fullContent[lang] || selectedNews.fullContent['RU']) 
                            : (selectedNews.excerpt[lang] || selectedNews.excerpt['RU']);
                          
                          // Simple linkifier
                          const parts = content.split(/(https?:\/\/[^\s]+)/g);
                          return parts.map((part, i) => {
                            if (part.match(/^https?:\/\//)) {
                              return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-[#003366] underline decoration-[#FFCC00] decoration-2 underline-offset-4 hover:text-[#FFCC00] transition-colors">{part}</a>;
                            }
                            return part;
                          });
                        })()}
                      </div>

                      {/* Image Gallery */}
                      {selectedNews.images && selectedNews.images.length > 1 && (
                        <div className="space-y-8 mb-20">
                          <div className="flex items-center gap-4">
                            <div className="h-px flex-grow bg-slate-100"></div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Фотогалерея</span>
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
                      
                      <div className="text-center py-10 opacity-30 border-t border-slate-100">
                         <button onClick={() => setSelectedNews(null)} className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500 hover:text-[#003366] transition-colors">{t.close}</button>
                      </div>
                    </div>
                </div>
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
                    { name: 'Telegram', icon: <Send size={20} />, color: 'bg-[#229ED9]', url: (u: string) => `https://t.me/share/url?url=${u}` },
                    { name: 'WhatsApp', icon: <MessageSquare size={20} />, color: 'bg-[#25D366]', url: (u: string) => `https://api.whatsapp.com/send?text=${u}` },
                    { name: 'Facebook', icon: <Share2 size={20} />, color: 'bg-[#1877F2]', url: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${u}` },
                    { name: 'Viber', icon: <Tag size={20} />, color: 'bg-[#7360F2]', url: (u: string) => `viber://forward?text=${u}` },
                  ].map(social => {
                    const identifier = showShareModal.slug || showShareModal.id;
                    const shareUrl = encodeURIComponent(`${window.location.origin}${window.location.pathname}#/news?id=${identifier}`);
                    return (
                      <a 
                        key={social.name}
                        href={social.url(shareUrl)}
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

      {/* Lightbox */}
      {selectedNews && lightboxIndex !== null && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[7000] bg-black/95 flex items-center justify-center p-4 md:p-12"
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
    </div>
  );
};

export default Home;
