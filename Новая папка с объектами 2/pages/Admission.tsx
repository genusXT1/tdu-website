
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { motion } from 'motion/react';
import { CheckCircle2, FileText, UserCheck, Calendar, ArrowRight, Info, GraduationCap, ClipboardList, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const Admission: React.FC<{ lang: Language }> = ({ lang }) => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onSnapshot(doc(db, "site_content", "admission"), (snap) => {
      if (snap.exists()) setContent(snap.data());
      setLoading(false);
    });
  }, []);

  const defaultContent = {
    title: { BG: 'Прием 2024–2025', RU: 'Прием 2024–2025', RO: 'Admitere 2024–2025', EN: 'Admission 2024–2025' },
    subtitle: { 
      BG: 'Правила за приемане на студенти, докторанти и специализанти',
      RU: 'Правила приема студентов, докторантов и специализантов',
      RO: 'Reguli de admitere pentru studenți, doctoranzi și specialiști',
      EN: 'Rules and Procedures for Admissions'
    },
    categories: [
      { RU: 'Иностранные граждане болгарского происхождения', BG: 'Чуждестранни граждани от българска народност', RO: 'Cetățeni străini de origine bulgară', EN: 'Foreign citizens of Bulgarian origin' },
      { RU: 'Лица, постоянно проживающие за рубежом', BG: 'Лица, пребиваващи постоянно в чужбина', RO: 'Persoane cu reședința permanentă în străинătate', EN: 'Persons permanently residing abroad' },
      { RU: 'Граждане Республики Северная Македония', BG: 'Граждани на Република Северна Македония', RO: 'Cetățenii Republicii Macedonia de Nord', EN: 'Citizens of North Macedonia' },
      { RU: 'Кандидаты на степени "Бакалавр" и "Магистр"', BG: 'Кандидати за ОКС "Бакалавър" и "Магистър"', RO: 'Candidați pentru gradele "Licență" și "Master"', EN: 'Bachelor and Master candidates' }
    ],
    steps: [
      { title: { RU: 'Регистрация', BG: 'Регистрация', RO: 'Înregistrare', EN: 'Registration' }, desc: { RU: 'Единоразовая регистрация на электронной платформе МОН.', BG: 'Еднократна регистрация в електронната платформа на МОН.', RO: 'Înregistrare unică pe platforma electronică a Ministerului Educației.', EN: 'One-time registration on the MES platform.' } },
      { title: { RU: 'Подтверждение', BG: 'Потвърждение', RO: 'Confirmare', EN: 'Confirmation' }, desc: { RU: 'Подтверждение профиля через электронную почту.', BG: 'Потвърждаване на профила через имейл адрес.', RO: 'Confirmarea profilului prin adresa de e-mail.', EN: 'Email confirmation of your profile.' } },
      { title: { RU: 'Документы', BG: 'Документы', RO: 'Documente', EN: 'Documents' }, desc: { RU: 'Загрузка сканированных оригиналов документов и переводов.', BG: 'Прикачване на сканирани оригинални документи и преводи.', RO: 'Încărcarea documentelor originale scanate și a traducerilor.', EN: 'Upload scanned documents and translations.' } },
      { title: { RU: 'Рейтинг', BG: 'Класиране', RO: 'Clasament', EN: 'Ranking' }, desc: { RU: 'Проверка результатов согласно графику кампании.', BG: 'Проверка на резултатите според графика на кампанията.', RO: 'Verificarea rezultatelor conform calendarului campaniei.', EN: 'Check results according to the schedule.' } }
    ]
  };

  const c = content || defaultContent;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#003366]" size={48} />
    </div>
  );

  const t = {
    BG: {
      title: c.title.BG,
      subtitle: c.subtitle.BG,
      categoriesTitle: 'Кой може да кандидатства?',
      processTitle: 'Процес на кандидатстване',
      docsTitle: 'Необходими документи',
      applyNow: 'Към платформата за кандидатстване',
    },
    RU: {
      title: c.title.RU,
      subtitle: c.subtitle.RU,
      categoriesTitle: 'Кто может подать заявку?',
      processTitle: 'Процесс подачи заявки',
      docsTitle: 'Необходимые документы',
      applyNow: 'Перейти к платформе подачи заявок',
    },
    RO: {
      title: c.title.RO,
      subtitle: c.subtitle.RO,
      categoriesTitle: 'Cine poate aplica?',
      processTitle: 'Procesul de aplicare',
      docsTitle: 'Documente necesare',
      applyNow: 'Către platforma de aplicare',
    },
    EN: {
      title: c.title.EN,
      subtitle: c.subtitle.EN,
      categoriesTitle: 'Who can apply?',
      processTitle: 'Application Process',
      docsTitle: 'Required Documents',
      applyNow: 'Go to Application Platform',
    }
  }[lang];

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 bg-[#003366] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://www.uni-ruse.bg/PublishingImages/Main_Building.jpg')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#003366] to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFCC00] text-[#003366] text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              <GraduationCap size={14} /> {lang === 'BG' ? 'Отворени възможности' : 'Open Opportunities'}
            </div>
            <h1 className="text-5xl md:text-8xl font-serif italic text-white mb-8 leading-tight max-w-4xl">
              {t.title}
            </h1>
            <p className="text-white/60 text-xl md:text-2xl max-w-2xl font-light leading-relaxed">
              {t.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left: Categories & Steps */}
          <div className="lg:col-span-8 space-y-20">
            
            {/* Categories */}
            <div>
              <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 rounded-2xl bg-[#003366]/5 flex items-center justify-center text-[#003366]">
                  <UserCheck size={24} />
                </div>
                <h2 className="text-3xl font-serif italic text-[#003366]">{t.categoriesTitle}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {c.categories.map((cat: any, i: number) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex items-start gap-4 group transition-all hover:shadow-xl"
                  >
                    <CheckCircle2 className="text-[#FFCC00] mt-1 flex-shrink-0" size={20} />
                    <span className="text-slate-600 font-medium leading-relaxed">{cat[lang] || cat.RU}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Process Steps */}
            <div>
              <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 rounded-2xl bg-[#003366]/5 flex items-center justify-center text-[#003366]">
                  <ClipboardList size={24} />
                </div>
                <h2 className="text-3xl font-serif italic text-[#003366]">{t.processTitle}</h2>
              </div>
              <div className="space-y-8 relative">
                <div className="absolute left-[27px] top-4 bottom-4 w-px bg-slate-100"></div>
                {c.steps.map((step: any, i: number) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="flex gap-8 relative"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#003366] text-[#FFCC00] flex items-center justify-center font-black text-xl shadow-lg z-10">
                      {i + 1}
                    </div>
                    <div className="pt-2">
                      <h3 className="text-xl font-bold text-[#003366] mb-2">{step.title[lang] || step.title.RU}</h3>
                      <p className="text-slate-500 leading-relaxed font-light">{step.desc[lang] || step.desc.RU}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>

          {/* Right: Sidebar Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#003366] p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-16 -mt-16 rounded-full"></div>
              <FileText className="text-[#FFCC00] mb-8" size={40} />
              <h3 className="text-2xl font-serif italic mb-6">{t.docsTitle}</h3>
              <ul className="space-y-4 text-white/70 text-sm font-light leading-relaxed">
                <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#FFCC00] mt-2 flex-shrink-0"></div> {lang === 'BG' ? 'Диплома за средно образование (оригинал и превод)' : 'High school diploma (original and translation)'}</li>
                <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#FFCC00] mt-2 flex-shrink-0"></div> {lang === 'BG' ? 'Удостоверение за раждане' : 'Birth certificate'}</li>
                <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#FFCC00] mt-2 flex-shrink-0"></div> {lang === 'BG' ? 'Документ за българска народност' : 'Document of Bulgarian origin'}</li>
                <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#FFCC00] mt-2 flex-shrink-0"></div> {lang === 'BG' ? 'Медицинско свидетелство' : 'Medical certificate'}</li>
              </ul>
              <a 
                href="https://apply.mon.bg/" 
                target="_blank" 
                rel="noreferrer"
                className="w-full mt-12 py-5 bg-[#FFCC00] text-[#003366] rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-lg flex items-center justify-center gap-3"
              >
                {t.applyNow} <ArrowRight size={14} />
              </a>
            </div>

            <div className="bg-[#FFCC00] p-10 rounded-[3rem] shadow-xl text-[#003366]">
              <Calendar className="mb-6" size={32} />
              <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Важни дати</h3>
              <div className="space-y-4 mb-8">
                {[
                  { date: '01.06 - 30.06', event: lang === 'BG' ? 'Подаване на документи' : 'Подача документов' },
                  { date: '05.07 - 10.07', event: lang === 'BG' ? 'Приемни изпити' : 'Вступительные экзамены' },
                  { date: '15.07', event: lang === 'BG' ? 'Първо класиране' : 'Первый этап зачисления' },
                  { date: '20.07', event: lang === 'BG' ? 'Записване' : 'Зачисление' }
                ].map((d, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-[#003366]/10 pb-2">
                    <span className="text-[10px] font-black">{d.date}</span>
                    <span className="text-xs font-medium">{d.event}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-medium leading-relaxed opacity-80">
                {lang === 'BG' 
                  ? 'Следете официалния график на МОН за евентуални промени.' 
                  : 'Следите за официальным графиком МОН на предмет возможных изменений.'}
              </p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Admission;
