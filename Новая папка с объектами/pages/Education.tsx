
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Language, Program } from '../types';
import { db } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

interface EducationProps {
  lang: Language;
}

const Education: React.FC<EducationProps> = ({ lang }) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activeLevelTab, setActiveLevelTab] = useState<'college' | 'bachelor' | 'master' | 'doctor'>('bachelor');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "programs"));
    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as Program));
      const sorted = fetched.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setPrograms(sorted);
      setIsLoading(false);
    }, (err) => {
      console.error("Education Error:", err);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const t = {
    BG: { 
      title: 'Образователни програми', 
      subtitle: 'Изберете вашето бъдеще в европейска академична среда.', 
      apply: 'Кандидатствай', 
      tabs: { college: 'Колеж', bachelor: 'Бакалавър', master: 'Магистратура', doctor: 'Докторантура' },
      levels: { college: 'Средно-специално', bachelor: 'Бакалавър', master: 'Магистър', doctor: 'Докторант' },
      labels: { duration: 'Продължителност', lang: 'Език', format: 'Форма', years: 'ГОДИНИ ОБУЧЕНИЕ' },
      faculties: { pedagogy: 'Педагогически факултет', tech: 'Технико-икономически факултет' }
    },
    RU: { 
      title: 'Образовательные программы', 
      subtitle: 'Выберите свое будущее в европейской академической среде.', 
      apply: 'Подать заявку', 
      tabs: { college: 'Колледж', bachelor: 'Бакалавриат', master: 'Магистратура', doctor: 'Докторантура' },
      levels: { college: 'Средне-специальное', bachelor: 'Бакалавриат', master: 'Магистратура', doctor: 'Докторантура' },
      labels: { duration: 'Срок обучения', lang: 'Язык', format: 'Формат', years: 'ГОДА ОБУЧЕНИЯ' },
      faculties: { pedagogy: 'Педагогический факультет', tech: 'Технико-экономический факультет' }
    },
    RO: { 
      title: 'Programe Educaționale', 
      subtitle: 'Alege-ți viitorul într-un mediu academic european.', 
      apply: 'Aplică acum', 
      tabs: { college: 'Colegiu', bachelor: 'Licență', master: 'Master', doctor: 'Doctorat' },
      levels: { college: 'Mediu de specialitate', bachelor: 'Licență', master: 'Master', doctor: 'Doctorat' },
      labels: { duration: 'Durata studiilor', lang: 'Limba', format: 'Format', years: 'ANI DE STUDIU' },
      faculties: { pedagogy: 'Facultatea de Pedagogie', tech: 'Facultatea Tehnico-Economică' }
    }
  }[lang] || {
    title: 'Programs',
    subtitle: 'Choose your future.',
    apply: 'Apply',
    tabs: { college: 'College', bachelor: 'Bachelor', master: 'Master', doctor: 'Doctor' },
    faculties: { pedagogy: 'Pedagogy', tech: 'Tech & Econ' }
  };

  const groupedPrograms = useMemo(() => {
    // Теперь фильтруем по вхождению в массив уровней или совпадению строки
    const filtered = programs.filter(p => {
      if (Array.isArray(p.level)) return p.level.includes(activeLevelTab);
      return p.level === activeLevelTab;
    });

    const pedagogy = filtered.filter(p => 
      p.title.RU?.toLowerCase().includes('педагогика') || 
      p.title.RU?.toLowerCase().includes('язык') || 
      p.title.BG?.toLowerCase().includes('педагогика') ||
      p.title.RU?.toLowerCase().includes('музык')
    );
    const other = filtered.filter(p => !pedagogy.includes(p));
    return { pedagogy, other };
  }, [programs, activeLevelTab]);

  const ProgramCard: React.FC<{ p: Program }> = ({ p }) => (
    <div className="bg-white p-8 md:p-10 border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden rounded-[2.5rem]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFCC00]/5 -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 relative z-10">
        <div className="flex-grow">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[9px] font-black text-[#FFCC00] uppercase tracking-widest bg-[#003366] px-3 py-1.5 rounded-md">
              {Array.isArray(p.level) 
                ? p.level.map(l => (t.levels as any)[l] || l).join(' / ')
                : (t.levels as any)[p.level] || p.level
              }
            </span>
            <div className="h-px w-8 bg-slate-100"></div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#003366] serif italic group-hover:text-blue-800 transition-colors mb-6 leading-tight">
            {p.title[lang] || p.title.RU}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12">
            <div>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1">{(t.labels as any)?.duration}</span>
              <span className="text-sm font-black text-[#003366] uppercase">
                {p.duration[lang] || p.duration.RU} 
                <span className="ml-1 text-[10px] opacity-40">{(t.labels as any)?.years}</span>
              </span>
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1">{(t.labels as any)?.lang}</span>
              <span className="text-xs font-bold text-slate-600 uppercase">{p.language}</span>
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1">{(t.labels as any)?.format}</span>
              <span className="text-xs font-bold text-slate-600 uppercase">{p.form[lang] || p.form.RU}</span>
            </div>
          </div>
        </div>
        <Link to="/admission" className="w-full lg:w-auto bg-[#003366] text-white px-10 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#FFCC00] hover:text-[#003366] transition-all shadow-lg rounded-2xl">
          {(t as any).apply}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="page-transition min-h-screen bg-[#fcfdfe]">
      <header className="bg-[#003366] text-white pt-44 pb-36 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 100 L100 0 L100 100 Z" fill="white" />
           </svg>
        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl md:text-8xl font-bold serif italic leading-tight mb-8">{(t as any).title}</h1>
          <p className="text-xl md:text-2xl text-white/50 max-w-2xl font-light leading-relaxed mx-auto">{(t as any).subtitle}</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 -mt-12 relative z-30 mb-20">
        <div className="bg-white rounded-3xl shadow-2xl p-2 flex gap-2 border border-slate-100 overflow-x-auto no-scrollbar">
          {(['college', 'bachelor', 'master', 'doctor'] as const).map(lvl => (
            <button key={lvl} onClick={() => setActiveLevelTab(lvl)} className={`flex-1 py-5 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeLevelTab === lvl ? 'bg-[#FFCC00] text-[#003366] shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>
              {(t.tabs as any)[lvl]}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-40 space-y-24">
        {isLoading ? (
          <div className="text-center py-20 animate-pulse text-slate-300 font-black uppercase tracking-widest">
            {lang === Language.RU ? 'Загрузка...' : lang === Language.BG ? 'Зареждане...' : 'Se încarcă...'}
          </div>
        ) : (
          <>
            {groupedPrograms.pedagogy.length > 0 && (
              <section className="animate-fadeIn">
                <div className="flex items-center gap-6 mb-12">
                   <h3 className="text-xs font-black uppercase tracking-[0.4em] text-blue-900 bg-blue-50 px-6 py-2 rounded-full">{(t.faculties as any).pedagogy}</h3>
                   <div className="flex-grow h-px bg-slate-100"></div>
                </div>
                <div className="grid grid-cols-1 gap-8">
                  {groupedPrograms.pedagogy.map(p => <ProgramCard key={p.id} p={p} />)}
                </div>
              </section>
            )}

            {groupedPrograms.other.length > 0 && (
              <section className="animate-fadeIn">
                <div className="flex items-center gap-6 mb-12">
                   <h3 className="text-xs font-black uppercase tracking-[0.4em] text-amber-900 bg-amber-50 px-6 py-2 rounded-full">{(t.faculties as any).tech}</h3>
                   <div className="flex-grow h-px bg-slate-100"></div>
                </div>
                <div className="grid grid-cols-1 gap-8">
                  {groupedPrograms.other.map(p => <ProgramCard key={p.id} p={p} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Education;
