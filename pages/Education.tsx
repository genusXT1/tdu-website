
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Language, Program } from '../types';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

interface EducationProps {
  lang: Language;
}

const Education: React.FC<EducationProps> = ({ lang }) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activeLevelTab, setActiveLevelTab] = useState<'college' | 'bachelor' | 'master' | 'doctor'>('bachelor');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  useEffect(() => {
    const q = collection(db, "programs");
    const unsub = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Program[];
      const sorted = fetched.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });
      setPrograms(sorted);
      setIsLoading(false);
    }, (error) => {
      console.error("Education Firestore Error:", error);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const t = {
    BG: {
      title: 'Образователни програми',
      subtitle: 'Изберете вашето бъдеще в европейска академична среда.',
      apply: 'Кандидатствай',
      back: 'Назад към списъка',
      workPlan: 'Учебен план (PDF)',
      tabs: { college: 'Колеж', bachelor: 'Бакалавър', master: 'Магистратура', doctor: 'Докторантура' },
      levels: { college: 'Средно-специално', bachelor: 'Бакалавър', master: 'Магистър', doctor: 'Докторант' },
      labels: { duration: 'Продължителност', lang: 'Език', format: 'Форма', years: 'ГОДИНИ ОБУЧЕНИЕ' },
      faculties: { pedagogy: 'Педагогически факултет', tech: 'Технико-икономически факултет' }
    },
    RU: {
      title: 'Образовательные программы',
      subtitle: 'Выберите свое будущее в европейской академической среде.',
      apply: 'Подать заявку',
      back: 'Назад к списку',
      workPlan: 'Учебный план (PDF)',
      tabs: { college: 'Колледж', bachelor: 'Бакалавриат', master: 'Магистратура', doctor: 'Докторантура' },
      levels: { college: 'Средне-специальное', bachelor: 'Бакалавриат', master: 'Магистратура', doctor: 'Докторантура' },
      labels: { duration: 'Срок обучения', lang: 'Язык', format: 'Формат', years: 'ГОДА ОБУЧЕНИЯ' },
      faculties: { pedagogy: 'Педагогический факультет', tech: 'Технико-экономический факультет' }
    },
    RO: {
      title: 'Programe Educaționale',
      subtitle: 'Alege-ți viitorul într-un mediu academic european.',
      apply: 'Aplică acum',
      back: 'Înapoi la listă',
      workPlan: 'Plan de învățământ (PDF)',
      tabs: { college: 'Colegiu', bachelor: 'Licență', master: 'Master', doctor: 'Doctorat' },
      levels: { college: 'Mediu de specialitate', bachelor: 'Licență', master: 'Master', doctor: 'Doctorat' },
      labels: { duration: 'Durata studiilor', lang: 'Limba', format: 'Format', years: 'ANI DE STUDIU' },
      faculties: { pedagogy: 'Facultatea de Pedagogie', tech: 'Facultatea Tehnico-Economică' }
    }
  }[lang] || {
    title: 'Programs',
    subtitle: 'Choose your future.',
    apply: 'Apply',
    back: 'Back',
    workPlan: 'Work Plan',
    tabs: { college: 'College', bachelor: 'Bachelor', master: 'Master', doctor: 'Doctor' },
    faculties: { pedagogy: 'Pedagogy', tech: 'Tech & Econ' }
  };

  const groupedPrograms = useMemo(() => {
    const filtered = programs.filter(p => {
      if (Array.isArray(p.level)) return p.level.includes(activeLevelTab);
      return p.level === activeLevelTab;
    });

    const groups: Record<string, Program[]> = {};

    filtered.forEach(p => {
      const faculty = p.faculty || 'other';
      if (!groups[faculty]) groups[faculty] = [];
      groups[faculty].push(p);
    });

    return groups;
  }, [programs, activeLevelTab]);

  const ProgramCard: React.FC<{ p: Program }> = ({ p }) => (
    <div
      onClick={() => setSelectedProgram(p)}
      className="bg-white p-8 md:p-10 border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden rounded-[2.5rem] cursor-pointer"
    >
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
          <h2 className="text-2xl md:text-3xl font-bold text-[#003366] serif italic group-hover:text-blue-800 transition-colors mb-4 leading-tight">
            {p.title[lang] || p.title.RU}
          </h2>

          {p.tags && p.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {p.tags.map(tag => (
                <span key={tag} className="text-[8px] font-black bg-slate-50 text-slate-400 px-2 py-1 rounded-full uppercase tracking-tighter">
                  #{tag}
                </span>
              ))}
            </div>
          )}

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
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#003366] group-hover:text-white transition-colors">
          →
        </div>
      </div>
    </div>
  );

  if (selectedProgram) {
    return (
      <div className="page-transition min-h-screen bg-white">
        <header className="bg-[#003366] text-white pt-44 pb-36 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <button
              onClick={() => setSelectedProgram(null)}
              className="text-[#FFCC00] text-[10px] font-black uppercase tracking-widest mb-12 flex items-center gap-2 hover:translate-x-[-4px] transition-transform"
            >
              ← {(t as any).back}
            </button>
            <h1 className="text-4xl md:text-7xl font-bold serif italic leading-tight mb-8">
              {selectedProgram.title[lang] || selectedProgram.title.RU}
            </h1>
            <div className="flex flex-wrap gap-4">
              {Array.isArray(selectedProgram.level)
                ? selectedProgram.level.map(l => (
                  <span key={l} className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {(t.levels as any)[l] || l}
                  </span>
                ))
                : <span className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {(t.levels as any)[selectedProgram.level] || selectedProgram.level}
                </span>
              }
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-2">{(t.labels as any)?.duration}</span>
              <p className="text-2xl font-bold text-[#003366]">{selectedProgram.duration[lang] || selectedProgram.duration.RU} {(t.labels as any)?.years}</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-2">{(t.labels as any)?.lang}</span>
              <p className="text-2xl font-bold text-[#003366]">{selectedProgram.language}</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-2">{(t.labels as any)?.format}</span>
              <p className="text-2xl font-bold text-[#003366]">{selectedProgram.form[lang] || selectedProgram.form.RU}</p>
            </div>
          </div>

          <div className="prose prose-slate prose-xl max-w-none mb-20">
            {selectedProgram.description && selectedProgram.description[lang] && (
              <p className="text-slate-600 font-light leading-loose whitespace-pre-line">
                {selectedProgram.description[lang]}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <Link to="/admission" className="flex-grow bg-[#003366] text-white py-6 rounded-3xl text-center font-black uppercase text-xs tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all shadow-xl">
              {(t as any).apply}
            </Link>
            {selectedProgram.studyPlanUrl && (
              <a
                href={selectedProgram.studyPlanUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-grow bg-slate-100 text-[#003366] py-6 rounded-3xl text-center font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
              >
                {(t as any).workPlan}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

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
            {lang === Language.RU ? 'Загрузка...' : lang === Language.BG ? 'Зареждане...' : lang === Language.RO ? 'Se încarcă...' : 'Loading...'}
          </div>
        ) : (
          <>
            {Object.keys(groupedPrograms).length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">
                  {lang === Language.RU ? 'Программы обучения пока не добавлены' : lang === Language.BG ? 'Все още няма добавени програми' : lang === Language.RO ? 'Nu există programe adăugate încă' : 'No study programs added yet'}
                </p>
                <p className="text-slate-300 text-[10px] uppercase tracking-widest">
                  {lang === Language.RU ? 'Администратор может добавить их в панели управления' : lang === Language.BG ? 'Администраторът може да ги добави в контролния панел' : lang === Language.RO ? 'Administratorul le poate adăuga în panoul de control' : 'The administrator can add them in the control panel'}
                </p>
              </div>
            ) : (
              Object.entries(groupedPrograms).map(([faculty, items]) => (
                <section key={faculty} className="animate-fadeIn">
                  <div className="flex items-center gap-6 mb-12">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-blue-900 bg-blue-50 px-6 py-2 rounded-full">
                      {(t.faculties as any)[faculty] || faculty}
                    </h3>
                    <div className="flex-grow h-px bg-slate-100"></div>
                  </div>
                  <div className="grid grid-cols-1 gap-8">
                    {items.map(p => <ProgramCard key={p.id} p={p} />)}
                  </div>
                </section>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Education;
