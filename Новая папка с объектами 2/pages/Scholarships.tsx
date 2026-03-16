
import React, { useState, useEffect } from 'react';
import { Language, Scholarship } from '../types';
import { Award, CheckCircle, FileText, Info, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const Scholarships: React.FC<{ lang: Language }> = ({ lang }) => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "scholarships"), orderBy("order", "asc"));
    return onSnapshot(q, (snap) => {
      setScholarships(snap.docs.map(d => ({ id: d.id, ...d.data() } as Scholarship)));
      setLoading(false);
    });
  }, []);

  const t = {
    BG: { title: 'Стипендии', subtitle: 'Правила за предоставяне на стипендии на студенти', types: 'Видове стипендии', criteria: 'Критерии', docs: 'Документи', loading: 'Зареждане...' },
    RU: { title: 'Стипендии', subtitle: 'Правила предоставления стипендий студентам', types: 'Виды стипендий', criteria: 'Критерии', docs: 'Документы', loading: 'Загрузка...' },
    RO: { title: 'Burse', subtitle: 'Reguli de acordare a burselor pentru studenți', types: 'Tipuri de burse', criteria: 'Criterii', docs: 'Documente', loading: 'Încărcare...' },
    EN: { title: 'Scholarships', subtitle: 'Rules for providing scholarships to students', types: 'Scholarship Types', criteria: 'Criteria', docs: 'Documents', loading: 'Loading...' }
  }[lang];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#003366]" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-6 mb-16">
          <div className="w-16 h-16 rounded-[2rem] bg-[#FFCC00] text-[#003366] flex items-center justify-center shadow-xl">
            <Award size={32} />
          </div>
          <div>
            <h1 className="text-5xl font-serif italic text-[#003366]">{t.title}</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{t.subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {scholarships.map((type, i) => (
            <div key={type.id} className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 group hover:bg-[#003366] transition-all duration-500">
              <h3 className="text-2xl font-bold text-[#003366] mb-4 group-hover:text-white transition-colors">
                {type.title[lang] || type.title.RU}
              </h3>
              <p className="text-slate-500 group-hover:text-white/70 transition-colors leading-relaxed">
                {type.description[lang] || type.description.RU}
              </p>
            </div>
          ))}
          {scholarships.length === 0 && (
            <div className="col-span-full text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest">Нет доступных стипендий</p>
            </div>
          )}
        </div>

        <div className="bg-[#003366] rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -mr-32 -mt-32 rounded-full"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-serif italic mb-8 flex items-center gap-4">
                <FileText className="text-[#FFCC00]" /> {t.docs}
              </h2>
              <ul className="space-y-4 opacity-80 font-light leading-relaxed">
                <li className="flex gap-3"><CheckCircle size={16} className="text-[#FFCC00] flex-shrink-0 mt-1" /> Заявление-декларация по образец</li>
                <li className="flex gap-3"><CheckCircle size={16} className="text-[#FFCC00] flex-shrink-0 mt-1" /> Документи за доходите на семейството</li>
                <li className="flex gap-3"><CheckCircle size={16} className="text-[#FFCC00] flex-shrink-0 mt-1" /> Уверение за успех от предходните семестри</li>
              </ul>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/10">
              <Info className="text-[#FFCC00] mb-6" size={32} />
              <p className="text-sm leading-relaxed opacity-90">
                {lang === 'BG' 
                  ? 'Стипендиите се изплащат безкасово по банков път. Студентите трябва да представят IBAN в сектор "Стипендии".' 
                  : 'Scholarships are paid by bank transfer. Students must provide an IBAN to the "Scholarships" sector.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scholarships;
