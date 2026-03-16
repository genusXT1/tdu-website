
import React from 'react';
import { Language } from '../types';
import { motion } from 'motion/react';
import { CheckCircle2, FileText, UserCheck, Calendar, ArrowRight, Info, GraduationCap, ClipboardList } from 'lucide-react';

interface AdmissionProps {
  lang: Language;
}

const Admission: React.FC<AdmissionProps> = ({ lang }) => {
  const t = {
    BG: {
      title: 'Прием 2024–2025',
      subtitle: 'Правила за приемане на студенти, докторанти и специализанти',
      categoriesTitle: 'Кой може да кандидатства?',
      processTitle: 'Процес на кандидатстване',
      docsTitle: 'Необходими документи',
      applyNow: 'Към платформата за кандидатстване',
      categories: [
        'Чуждестранни граждани от българска народност',
        'Лица, пребиваващи постоянно в чужбина',
        'Граждани на Република Северна Македония',
        'Кандидати за ОКС "Бакалавър" и "Магистър"'
      ],
      steps: [
        { title: 'Регистрация', desc: 'Еднократна регистрация в електронната платформа на МОН.' },
        { title: 'Потвърждение', desc: 'Потвърждаване на профила чрез имейл адрес.' },
        { title: 'Документи', desc: 'Прикачване на сканирани оригинални документи и преводи.' },
        { title: 'Класиране', desc: 'Проверка на резултатите според графика на кампанията.' }
      ]
    },
    RU: {
      title: 'Прием 2024–2025',
      subtitle: 'Правила приема студентов, докторантов и специализантов',
      categoriesTitle: 'Кто может подать заявку?',
      processTitle: 'Процесс подачи заявки',
      docsTitle: 'Необходимые документы',
      applyNow: 'Перейти к платформе подачи заявок',
      categories: [
        'Иностранные граждане болгарского происхождения',
        'Лица, постоянно проживающие за рубежом',
        'Граждане Республики Северная Македония',
        'Кандидаты на степени "Бакалавр" и "Магистр"'
      ],
      steps: [
        { title: 'Регистрация', desc: 'Единоразовая регистрация на электронной платформе МОН.' },
        { title: 'Подтверждение', desc: 'Подтверждение профиля через электронную почту.' },
        { title: 'Документы', desc: 'Загрузка сканированных оригиналов документов и переводов.' },
        { title: 'Рейтинг', desc: 'Проверка результатов согласно графику кампании.' }
      ]
    },
    RO: {
      title: 'Admitere 2024–2025',
      subtitle: 'Reguli de admitere pentru studenți, doctoranzi și specialiști',
      categoriesTitle: 'Cine poate aplica?',
      processTitle: 'Procesul de aplicare',
      docsTitle: 'Documente necesare',
      applyNow: 'Către platforma de aplicare',
      categories: [
        'Cetățeni străini de origine bulgară',
        'Persoane cu reședința permanentă în străinătate',
        'Cetățenii Republicii Macedonia de Nord',
        'Candidați pentru gradele "Licență" și "Master"'
      ],
      steps: [
        { title: 'Înregistrare', desc: 'Înregistrare unică pe platforma electronică a Ministerului Educației.' },
        { title: 'Confirmare', desc: 'Confirmarea profilului prin adresa de e-mail.' },
        { title: 'Documente', desc: 'Încărcarea documentelor originale scanate și a traducerilor.' },
        { title: 'Clasament', desc: 'Verificarea rezultatelor conform calendarului campaniei.' }
      ]
    }
  }[lang] || { title: 'Admission', subtitle: 'Rules and Procedures' };

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
                {t.categories.map((cat, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex items-start gap-4 group transition-all hover:shadow-xl"
                  >
                    <CheckCircle2 className="text-[#FFCC00] mt-1 flex-shrink-0" size={20} />
                    <span className="text-slate-600 font-medium leading-relaxed">{cat}</span>
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
                {t.steps.map((step, i) => (
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
                      <h3 className="text-xl font-bold text-[#003366] mb-2">{step.title}</h3>
                      <p className="text-slate-500 leading-relaxed font-light">{step.desc}</p>
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
              <button className="w-full mt-12 py-5 bg-[#FFCC00] text-[#003366] rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-lg flex items-center justify-center gap-3">
                {t.applyNow} <ArrowRight size={14} />
              </button>
            </div>

            <div className="bg-[#FFCC00] p-10 rounded-[3rem] shadow-xl text-[#003366]">
              <Calendar className="mb-6" size={32} />
              <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Важни дати</h3>
              <p className="text-sm font-medium leading-relaxed opacity-80">
                {lang === 'BG' 
                  ? 'Следете официалния график на МОН за датите на изпитите и класиранията.' 
                  : 'Follow the official MES schedule for exam dates and rankings.'}
              </p>
              <div className="mt-8 pt-8 border-t border-[#003366]/10 flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                <Info size={16} /> {lang === 'BG' ? 'Очаквайте скоро' : 'Coming soon'}
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Admission;
