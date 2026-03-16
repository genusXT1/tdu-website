
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Language } from '../types';
import { FileText, Download, Shield, Book, CheckCircle, ExternalLink, Scale, Clock } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface RegulationsProps {
  lang: Language;
}

interface Document {
  id: string;
  title: Record<string, string>;
  url: string;
  category: string;
  timestamp: any;
}

const Regulations: React.FC<RegulationsProps> = ({ lang }) => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "documents"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setDocs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Document[]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const t = {
    BG: {
      title: 'Нормативна база',
      subtitle: 'Официални документи и правилници, уреждащи дейността на университета и неговите поделения',
      featured: 'Основни правилници',
      other: 'Други документи',
      download: 'Преглед PDF',
      readMore: 'Прочети повече',
      lastUpdated: 'Последна актуализация',
      loading: 'Зареждане на документи...',
      noDocs: 'Няма намерени документи'
    },
    RU: {
      title: 'Нормативная база',
      subtitle: 'Официальные документы и регламенты, регулирующие деятельность университета и его подразделений',
      featured: 'Основные регламенты',
      other: 'Другие документы',
      download: 'Открыть PDF',
      readMore: 'Читать далее',
      lastUpdated: 'Последнее обновление',
      loading: 'Загрузка документов...',
      noDocs: 'Документы не найдены'
    }
  }[lang] || { title: 'Regulations', subtitle: 'Legal Framework' };

  const featuredDocs = [
    {
      title: lang === 'BG' 
        ? 'ПРАВИЛНИК за дейността на Русенски университет „Ангел Кънчев“' 
        : 'ПОЛОЖЕНИЕ о деятельности Русенского университета «Ангел Кънчев»',
      year: '2022',
      desc: lang === 'BG'
        ? 'Основен нормативен акт, определящ структурата, управлението и организацията на целия университет.'
        : 'Основной нормативный акт, определяющий структуру, управление и организацию всего университета.',
      url: 'https://www.uni-ruse.bg/files/Pravilnik_RU_2022.pdf',
      color: 'bg-blue-600'
    },
    {
      title: lang === 'BG'
        ? 'СТРАТЕГИЯ за развитие на Русенския университет за периода 2021-2025 г.'
        : 'СТРАТЕГИЯ развития Русенского университета на период 2021-2025 гг.',
      year: '2021',
      desc: lang === 'BG'
        ? 'Дългосрочен документ, очертаващ визията и приоритетите за развитие на висшето училище.'
        : 'Долгосрочный документ, определяющий видение и приоритеты развития высшего учебного заведения.',
      url: 'https://www.uni-ruse.bg/files/Strategia_RU_2021-2025.pdf',
      color: 'bg-amber-500'
    },
    {
      title: lang === 'BG'
        ? 'ЕТИЧЕН КОДЕКС на Русенския университет'
        : 'ЭТИЧЕСКИЙ КОДЕКС Русенского университета',
      year: '2023',
      desc: lang === 'BG'
        ? 'Норми на поведение и професионална етика за преподаватели, служители и студенти.'
        : 'Нормы поведения и профессиональной этики для преподавателей, сотрудников и студентов.',
      url: 'https://www.uni-ruse.bg/files/Etichen_kodeks_RU.pdf',
      color: 'bg-emerald-600'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header Section */}
      <section className="relative pt-44 pb-32 px-6 bg-[#003366] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://www.uni-ruse.bg/PublishingImages/Main_Building.jpg')] bg-cover bg-center"></div>
        </div>
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFCC00]/20 text-[#FFCC00] text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              <Scale size={14} /> {lang === 'BG' ? 'Легитимност и прозрачност' : 'Legitimacy & Transparency'}
            </div>
            <h1 className="text-6xl md:text-8xl font-serif italic text-white mb-8 leading-tight">
              {t.title}
            </h1>
            <p className="text-white/60 text-xl md:text-2xl max-w-3xl mx-auto font-light leading-relaxed">
              {t.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Documents */}
      <section className="py-24 px-6 max-w-7xl mx-auto -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredDocs.map((doc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[3.5rem] p-10 md:p-14 shadow-2xl border border-slate-100 flex flex-col group hover:shadow-[#003366]/5 transition-all duration-700"
            >
              <div className="flex justify-between items-start mb-10">
                <div className={`w-20 h-20 ${doc.color} rounded-[2rem] flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                  <Shield size={32} />
                </div>
                <span className="px-5 py-2 bg-slate-50 text-[#003366] rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">
                  {doc.year} EDITION
                </span>
              </div>
              
              <h3 className="text-3xl md:text-4xl font-bold text-[#003366] serif italic mb-6 leading-tight">
                {doc.title}
              </h3>
              <p className="text-slate-500 text-lg font-light leading-relaxed mb-10">
                {doc.desc}
              </p>
              
              <div className="mt-auto pt-8 border-t border-slate-50">
                <a 
                  href={doc.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-4 bg-[#003366] text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all shadow-lg"
                >
                  <Download size={18} /> {t.download}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Other Documents Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-6 mb-16">
          <h2 className="text-xs font-black uppercase tracking-[0.5em] text-slate-400 whitespace-nowrap">{t.other}</h2>
          <div className="h-px flex-grow bg-slate-100"></div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-[#FFCC00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{(t as any).loading}</p>
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-20 text-slate-300 font-bold uppercase tracking-widest">
            {(t as any).noDocs}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {docs.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500 flex flex-col"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#003366] group-hover:bg-[#003366] group-hover:text-white transition-colors duration-500">
                    <FileText size={28} />
                  </div>
                  <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={12} />
                    {doc.timestamp?.toDate ? doc.timestamp.toDate().toLocaleDateString() : ''}
                  </div>
                </div>

                <h3 className="text-xl md:text-2xl font-serif italic text-[#003366] mb-6 leading-tight group-hover:text-[#FFCC00] transition-colors">
                  {doc.title?.[lang] || doc.title?.RU || 'Document'}
                </h3>
                
                <div className="flex items-center gap-2 mb-8">
                  <span className="bg-slate-50 text-slate-400 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    {doc.category}
                  </span>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-50 flex gap-4">
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-grow flex items-center justify-center gap-3 px-8 py-4 bg-[#003366] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all shadow-lg"
                  >
                    <ExternalLink size={16} /> {(t as any).download}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Info Banner */}
      <section className="pb-32 px-6 max-w-7xl mx-auto">
        <div className="bg-[#FFCC00] rounded-[4rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 shadow-xl">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-serif italic text-[#003366] mb-6">
              {lang === 'BG' ? 'Стабилност и качество' : 'Stability & Quality'}
            </h2>
            <p className="text-[#003366]/80 text-lg font-medium leading-relaxed">
              {lang === 'BG' 
                ? 'Чрез тази стабилна нормативна база Русенският университет гарантира европейско качество на обучение за българската общност и гражданите на Молдова.'
                : 'Through this stable regulatory framework, the University of Ruse guarantees European quality of education for the Bulgarian community and citizens of Moldova.'}
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full border-4 border-[#003366]/20 flex items-center justify-center">
              <Shield size={64} className="text-[#003366]" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Regulations;
