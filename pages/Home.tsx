
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
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [readNews, setReadNews] = useState<string[]>([]);

  const [heroLoaded, setHeroLoaded] = useState(false);
  const [showShareModal, setShowShareModal] = useState<NewsItem | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('read_news');
    if (saved) setReadNews(JSON.parse(saved));

    const qNews = query(collection(db, "news"), orderBy("timestamp", "desc"), limit(4));
    const unsubNews = onSnapshot(qNews, (snapshot) => {
      // Prevent the UI from clearing out the skeleton loader if the local cache is empty but we're still fetching
      if (snapshot.empty && snapshot.metadata.fromCache) {
        return;
      }
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as NewsItem[];
      setNewsItems(docs.slice(0, 3));
      setIsNewsLoading(false);
    });

    const unsubPartners = onSnapshot(collection(db, "partners"), (snapshot) => {
      setPartners(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Partner[]);
    });

    return () => { unsubNews(); unsubPartners(); };
  }, []);

  useEffect(() => {
    if (selectedNews || selectedPartner) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedNews, selectedPartner]);

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

  const shareNews = async (item: NewsItem) => {
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
      allNews: "Всички новини",
      newLabel: "НОВО",
      readMore: "Прочети повече",
      trustTitle: "Доверие и Бъдеще",
      trustSub: "Информация за родители",
      trustText: "Филиалът в Тараклия осигурява европейски стандарти за безопасност и образование.",
      quote: "Образованието е най-мощното оръжие, което можете да използвате, за да промените света.",
      share: "СПОДЕЛИ",
      close: "Затвори",
      visitWebsite: "Към сайта",
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
      allNews: "Все новости",
      newLabel: "НОВОЕ",
      readMore: "Читать полностью",
      trustTitle: "Доверие и Будущее",
      trustSub: "Для родителей и абитуриентов",
      trustText: "Тараклийский филиал — это островок стабильности и европейского качества.",
      quote: "Образование — самое мощное оружие, которое вы можете использовать, чтобы изменить мир.",
      share: "ПОДЕЛИТЬСЯ",
      close: "Закрыть",
      visitWebsite: "Перейти на источник",
      published: "Опубликовано в",
      targetTitle: "Для кого это обучение?",
      targets: [
        { title: "Абитуриенты", desc: "Начните карьеру с дипломом европейского образца." },
        { title: "Родители", desc: "Гарантия безопасности и качества образования." },
        { title: "Иностранные студенты", desc: "Программы обмена и глобальные возможности." },
        { title: "Профессионалы", desc: "Повышение квалификации и новые горизонты." }
      ]
    },
    RO: {
      hero: universityName,
      heroSub: `Viitor european în ${branchLocation}. Diplomă de stat a Republicii Bulgaria, recunoscută în toată UE.`,
      cta: "Admitere 2025",
      programs: "Domenii Academice",
      allPrograms: "Lista completă a specialităților",
      newsTitle: "Ultimele Știri",
      newsSub: "Evenimente actuale din viața academică și studențească",
      allNews: "Toate știrile",
      newLabel: "NOU",
      readMore: "Citește mai mult",
      trustTitle: "Încredere și Viitor",
      trustSub: "Pentru părinți și candidați",
      trustText: "Filiala din Taraclia este o insulă de stabilitate și calitate europeană.",
      quote: "Educația este cea mai puternică armă pe care o poți folosi pentru a schimba lumea.",
      share: "DISTRIBUIE",
      close: "Închide",
      visitWebsite: "Către sursă",
      published: "Publicat în",
      targetTitle: "Pentru cine este această formare?",
      targets: [
        { title: "Absolvenți", desc: "Începe-ți cariera cu o diplomă europeană." },
        { title: "Părinți", desc: "Garanția siguranței și calității educației." },
        { title: "Studenți Internaționali", desc: "Programe de schimb și oportunități globale." },
        { title: "Profesioniști", desc: "Dezvoltare profesională și noi orizonturi." }
      ]
    },
    EN: {
      hero: universityName,
      heroSub: `European future in ${branchLocation}. State diploma from the Republic of Bulgaria, recognized across the EU.`,
      cta: "Admission 2025",
      programs: "Academic Fields",
      allPrograms: "Full list of specialties",
      newsTitle: "Latest News",
      newsSub: "Current events from academic and student life",
      allNews: "All News",
      newLabel: "NEW",
      readMore: "Read more",
      trustTitle: "Trust & Future",
      trustSub: "For Parents & Applicants",
      trustText: "The Taraclia branch is an island of stability and European quality.",
      quote: "Education is the most powerful weapon which you can use to change the world.",
      share: "SHARE",
      close: "Close",
      visitWebsite: "Visit source",
      published: "Published on",
      targetTitle: "Who is this education for?",
      targets: [
        { title: "Applicants", desc: "Start your career with a European diploma." },
        { title: "Parents", desc: "Guarantee of safety and quality of education." },
        { title: "International Students", desc: "Exchange programs and global opportunities." },
        { title: "Professional", desc: "Professional development and new horizons." }
      ]
    }
  }[lang] || { newsTitle: "News", allNews: "All News", readMore: "More", share: "Share", close: "Close", published: "Date" };

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
      <section className="py-32 uni-block-bg border-y border-slate-100">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {isNewsLoading ? (
              [1, 2, 3].map(i => <div key={i} className="h-96 bg-white animate-pulse rounded-[2rem]"></div>)
            ) : (
              newsItems.map((item) => (
                <motion.div
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-50px" }}
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
                      loading="lazy"
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
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 flex justify-center"
          >
            <Link to="/news" className="bg-[#003366] text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-[#FFCC00] hover:text-[#003366] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              {t.allNews}
            </Link>
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
                  onClick={() => setSelectedPartner(partner)}
                  className="w-36 h-24 sm:h-32 sm:w-56 flex items-center justify-center transition-all duration-700 p-4 sm:p-8 bg-white rounded-3xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm cursor-pointer hover:shadow-2xl hover:-translate-y-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100"
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
                        src={selectedNews.images?.[modalImageIndex] || (selectedNews as any).image || '/img/no-image.png'}
                        className="w-full h-full object-cover cursor-zoom-in"
                        alt="news cover"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onClick={() => setLightboxIndex(modalImageIndex)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/img/no-image.png';
                        }}
                      />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20 pointer-events-none"></div>

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

                  <div className="px-6 md:px-24 py-10 md:py-16">
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
                    <div className="bg-slate-50 border-l-[6px] border-[#FFCC00] p-6 md:p-10 rounded-r-[2rem] md:rounded-r-[2.5rem] mb-16 shadow-inner">
                      <p
                        className="text-xl md:text-3xl text-[#003366]/90 italic font-medium leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: selectedNews.excerpt[lang] || selectedNews.excerpt['RU'] || "" }}
                      />
                    </div>

                    <div
                      className="prose prose-slate prose-lg md:prose-xl max-w-none text-slate-600 font-light leading-loose whitespace-pre-line mb-16"
                      dangerouslySetInnerHTML={{
                        __html: selectedNews.fullContent
                          ? (selectedNews.fullContent[lang] || selectedNews.fullContent['RU'] || "")
                          : (selectedNews.excerpt[lang] || selectedNews.excerpt['RU'] || "")
                      }}
                    />

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

      {/* Partner/Sponsor Modal */}
      {createPortal(
        <AnimatePresence>
          {selectedPartner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[6000] flex items-center justify-center p-4 md:p-6 backdrop-blur-3xl bg-[#001a33]/60 overflow-hidden"
              onClick={() => setSelectedPartner(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-white/95 md:bg-white/80 backdrop-blur-xl w-full max-w-2xl rounded-3xl md:rounded-[3rem] p-8 md:p-14 shadow-2xl relative border border-slate-100 md:border-white/50 text-center flex flex-col items-center max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 bg-slate-50 md:bg-white/50 hover:bg-slate-100 md:hover:bg-white p-3 md:p-4 rounded-full text-slate-400 hover:text-[#003366] transition-all shadow-sm"
                >
                  <X size={20} className="md:w-6 md:h-6" />
                </button>

                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 bg-white rounded-2xl md:rounded-[2.5rem] shadow-xl flex items-center justify-center p-4 md:p-6 mb-6 md:mb-8 mt-2 md:mt-4 border border-slate-100 shrink-0">
                  <img
                    src={selectedPartner.logo}
                    alt={selectedPartner.name}
                    className="max-w-full max-h-full object-contain drop-shadow-sm"
                  />
                </div>

                <h3 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#003366] serif italic mb-4 md:mb-6 leading-tight">
                  {selectedPartner.name}
                </h3>

                {selectedPartner.description?.[lang] ? (
                  <p className="text-slate-500 text-sm sm:text-base md:text-xl font-light leading-relaxed mb-8 md:mb-10 max-w-xl">
                    {selectedPartner.description[lang]}
                  </p>
                ) : (
                  <div className="h-px w-16 md:w-24 bg-slate-200 mb-8 md:mb-10 mx-auto"></div>
                )}

                {selectedPartner.link && (
                  <a
                    href={selectedPartner.link}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#003366] hover:bg-[#FFCC00] text-white hover:text-[#003366] px-8 md:px-10 py-4 md:py-5 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-3 md:gap-4 group w-full sm:w-auto justify-center"
                  >
                    {t.visitWebsite} <Maximize2 size={14} className="md:w-4 md:h-4 group-hover:rotate-12 transition-transform" />
                  </a>
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
              className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-[#000d1a]/40 backdrop-blur-md"
              onClick={() => setShowShareModal(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 40, opacity: 0, rotateX: -10 }}
                animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border border-white/20"
                onClick={e => e.stopPropagation()}
              >
                {/* Декоративная линия с анимацией */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#003366] via-[#FFCC00] to-[#003366]"
                />

                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-[#003366] serif italic leading-none">
                      {lang === 'RU' ? 'Поделиться' : 'Сподели'}
                    </h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-2 font-bold">
                      {lang === 'RU' ? 'Выберите платформу' : 'Изберете платформа'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowShareModal(null)}
                    className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-8">
                  {[
                    { name: 'Telegram', icon: <Send size={22} />, color: 'bg-[#229ED9]', url: (u: string, t: string) => `https://t.me/share/url?url=${u}&text=${t}` },
                    { name: 'WhatsApp', icon: <MessageSquare size={22} />, color: 'bg-[#25D366]', url: (u: string, t: string) => `https://api.whatsapp.com/send?text=${t}%0A${u}` },
                    { name: 'Facebook', icon: <Share2 size={22} />, color: 'bg-[#1877F2]', url: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${u}` },
                    { name: 'Viber', icon: <Tag size={22} />, color: 'bg-[#7360F2]', url: (u: string, t: string) => `viber://forward?text=${t}%0A${u}` },
                  ].map((social, index) => {
                    const identifier = showShareModal.slug || showShareModal.id;
                    const shareUrl = encodeURIComponent(`${window.location.origin}${window.location.pathname}#/news?id=${identifier}`);
                    const stripHtml = (html: any) => (typeof html === 'string' ? html.replace(/<[^>]*>?/gm, '') : '');
                    const shareTitle = encodeURIComponent(stripHtml(showShareModal.title?.[lang] || showShareModal.title?.RU || document.title));

                    return (
                      <motion.a
                        key={social.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                        href={social.url(shareUrl, shareTitle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div className={`${social.color} text-white w-full aspect-square rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 group-active:scale-95`}>
                          {social.icon}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-tighter text-slate-500">{social.name}</span>
                      </motion.a>
                    );
                  })}
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                    {lang === 'RU' ? 'Ссылка на новость' : 'Линк към новината'}
                  </label>
                  <div className="relative group">
                    <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100 group-focus-within:border-[#003366]/30 transition-all">
                      <input
                        readOnly
                        className="bg-transparent flex-grow px-4 text-[11px] font-bold text-[#003366] outline-none overflow-hidden text-ellipsis whitespace-nowrap"
                        value={`${window.location.origin}${window.location.pathname}#/news?id=${showShareModal.slug || showShareModal.id}`}
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => copyToClipboard(`${window.location.origin}${window.location.pathname}#/news?id=${showShareModal.slug || showShareModal.id}`)}
                        className="bg-[#003366] text-[#FFCC00] px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-[#002244] transition-all"
                      >
                        {lang === 'RU' ? 'КОПИРОВАТЬ' : 'КОПИРАЙ'}
                      </motion.button>
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
      {createPortal(
        <AnimatePresence>
          {selectedNews && lightboxIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[7000] bg-[#00050f]/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12"
              onClick={() => setLightboxIndex(null)}
            >
              <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[7010] p-4">
                <X size={32} strokeWidth={1.5} />
              </button>

              <motion.div
                className="relative w-full h-full flex items-center justify-center"
                onClick={e => e.stopPropagation()}
              >

                <motion.img
                  key={lightboxIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                  src={selectedNews.images[lightboxIndex]}
                  className="max-w-[95vw] max-h-[90vh] object-contain shadow-2xl rounded-sm"
                  alt="lightbox"
                  referrerPolicy="no-referrer"
                />

                {selectedNews.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIndex((lightboxIndex - 1 + selectedNews.images.length) % selectedNews.images.length);
                      }}
                      className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-all p-4"
                    >
                      <ChevronLeft size={48} strokeWidth={1} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIndex((lightboxIndex + 1) % selectedNews.images.length);
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
                            setLightboxIndex(i);
                          }}
                          className={`rounded-full transition-all duration-300 ${lightboxIndex === i ? 'w-2.5 h-2.5 bg-white' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'}`}
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
    </div>
  );
};

export default Home;
