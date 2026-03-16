
import React from 'react';
import { Language } from '../types';
import { Calendar, Clock, Info } from 'lucide-react';

const AcademicCalendar: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = {
    BG: { title: 'График на учебния процес', subtitle: 'Учебна година 2025 - 2026', semester: 'Семестър', winter: 'Зимен', summer: 'Летен' },
    RU: { title: 'График учебного процесса', subtitle: 'Учебный год 2025 - 2026', semester: 'Семестр', winter: 'Зимний', summer: 'Летний' },
    RO: { title: 'Calendar academic', subtitle: 'Anul universitar 2025 - 2026', semester: 'Semestru', winter: 'Iarnă', summer: 'Vară' },
    EN: { title: 'Academic Calendar', subtitle: 'Academic Year 2025 - 2026', semester: 'Semester', winter: 'Winter', summer: 'Summer' }
  }[lang];

  const events = [
    { date: '01.09.2025', event: 'Откриване на учебната година' },
    { date: '01.09 - 05.10.2025', event: 'Интензивен курс по български език (за студенти I курс)' },
    { date: '15.09 - 26.12.2025', event: 'ЗИМЕН СЕМЕСТЪР' },
    { date: '29.12.2025 - 18.01.2026', event: 'Зимна (коледна) ваканция' },
    { date: '19.01 - 14.02.2026', event: 'Зимна изпитна сесия' },
    { date: '16.02 - 21.02.2026', event: 'Зимна поправителна сесия' },
    { date: '23.02 - 05.06.2026', event: 'ЛЕТЕН СЕМЕСТЪР' },
    { date: '08.06 - 04.07.2026', event: 'Лятна изпитна сесия' },
    { date: '06.07 - 11.07.2026', event: 'Лятна поправителна сесия' },
    { date: '13.07 - 07.08.2026', event: 'Учебно-производствена практика' },
    { date: '10.08 - 01.09.2026', event: 'Лятна ваканция' }
  ];

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
            {events.map((e, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center justify-between py-6 border-b border-slate-200 last:border-0 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#FFCC00]"></div>
                  <span className="text-lg font-bold text-[#003366]">{e.event}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-mono bg-white px-4 py-2 rounded-xl shadow-sm self-start md:self-center">
                  <Clock size={14} /> {e.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 p-8 bg-[#003366] rounded-[2rem] text-white flex items-start gap-6">
          <Info className="text-[#FFCC00] flex-shrink-0" size={24} />
          <p className="text-sm font-light leading-relaxed opacity-80">
            {lang === 'BG' 
              ? 'По взаимна договореност между преподавателите и студентите, за всяка дисциплина се определят по три дати за изпит.' 
              : 'By mutual agreement between teachers and students, three exam dates are determined for each discipline.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AcademicCalendar;
