
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { Calendar, Clock, Info } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const AcademicCalendar: React.FC<{ lang: Language }> = ({ lang }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "academic_calendar"), orderBy("order", "asc"));
    return onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  const t = {
    BG: { title: 'График на учебния процес', subtitle: 'Учебна година 2025 - 2026', semester: 'Семестър', winter: 'Зимен', summer: 'Летен' },
    RU: { title: 'График учебного процесса', subtitle: 'Учебный год 2025 - 2026', semester: 'Семестр', winter: 'Зимний', summer: 'Летний' },
    RO: { title: 'Calendar academic', subtitle: 'Anul universitar 2025 - 2026', semester: 'Semestru', winter: 'Iarnă', summer: 'Vară' },
    EN: { title: 'Academic Calendar', subtitle: 'Academic Year 2025 - 2026', semester: 'Semester', winter: 'Winter', summer: 'Summer' }
  }[lang];

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#003366] text-[#FFCC00] flex items-center justify-center shadow-lg">
            <Calendar size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-serif italic text-[#003366]">{t.title}</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{t.subtitle}</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100 shadow-sm">
          <div className="space-y-6">
            {events.length > 0 ? events.map((e, i) => (
              <div key={e.id || i} className="flex flex-col md:flex-row md:items-center justify-between py-6 border-b border-slate-200 last:border-0 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#FFCC00]"></div>
                  <span className="text-lg font-bold text-[#003366]">{e.event?.[lang] || e.event?.RU}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-mono bg-white px-4 py-2 rounded-xl shadow-sm self-start md:self-center">
                  <Clock size={14} /> {e.date}
                </div>
              </div>
            )) : (
              <p className="text-center py-10 text-slate-300 italic">
                {loading ? 'Загрузка...' : 'Нет данных'}
              </p>
            )}
          </div>
        </div>

        <div className="mt-12 p-8 bg-[#003366] rounded-[2rem] text-white flex items-start gap-6">
          <Info className="text-[#FFCC00] flex-shrink-0" size={24} />
          <p className="text-sm font-light leading-relaxed opacity-80">
            {lang === 'BG'
              ? 'По взаимна договореност между преподавателите и студентите, за всяка дисциплина се определят по три дати за изпит.'
              : lang === 'RU'
                ? 'По взаимной договоренности между преподавателями и студентами, по каждой дисциплине определяются три даты экзамена.'
                : lang === 'RO'
                  ? 'De comun acord între profesori și studenți, pentru fiecare disciplină se stabilesc trei date de examen.'
                  : 'By mutual agreement between teachers and students, three exam dates are determined for each discipline.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AcademicCalendar;
