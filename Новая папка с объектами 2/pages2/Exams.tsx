
import React from 'react';
import { Language } from '../types';
import { BookOpen, MapPin, Clock, User } from 'lucide-react';

const ExamSchedule: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = {
    BG: { title: 'Изпитна сесия', subtitle: 'Зимен семестър 2025/2026', discipline: 'Дисциплина', date: 'Дата и час', room: 'Зала', teacher: 'Преподавател' },
    RU: { title: 'Экзаменационная сессия', subtitle: 'Зимний семестр 2025/2026', discipline: 'Дисциплина', date: 'Дата и время', room: 'Аудитория', teacher: 'Преподаватель' },
    RO: { title: 'Sesiunea de examene', subtitle: 'Semestrul de iarnă 2025/2026', discipline: 'Disciplina', date: 'Data și ora', room: 'Sala', teacher: 'Profesor' },
    EN: { title: 'Exam Session', subtitle: 'Winter Semester 2025/2026', discipline: 'Discipline', date: 'Date and Time', room: 'Room', teacher: 'Teacher' }
  }[lang];

  const exams = [
    { discipline: 'Български фолклор', date: '19.01.2026, 8:30 ч.', room: 'И', teacher: 'Доц. д-р Невзорова В.Д.' },
    { discipline: 'Увод в езикознанието', date: '22.01.2026, 8:30 ч.', room: '38', teacher: 'Гл. ас. Терзи В.П.' },
    { discipline: 'Историческа граматика', date: '20.01.2026, 10:00 ч.', room: 'И', teacher: 'Доц. д-р Бойкова Л.В.' },
    { discipline: 'Училищен курс по история на литературата на чуждия език (рум. ез.)', date: '23.01.2026, 9:00 ч.', room: '42', teacher: 'Ас. Гарановская И.И.' },
    { discipline: 'Литература на Българското възраждане', date: '27.01.2026, 14:00 ч.', room: 'И', teacher: 'Доц. д-р Бойкова Л.В.' },
    { discipline: 'Стара българска литература', date: '29.01.2026, 15:00 ч.', room: '7', teacher: 'гл. ас. д-р Стоева А.Г.' },
    { discipline: 'Антична литература', date: '04.02.2026, 8:30 ч.', room: '8', teacher: 'доц. д-р Лечева Г.' },
    { discipline: 'Морфология на съвременния БЕ', date: '06.02.2026, 10:00 ч.', room: '7', teacher: 'Гл. ас. д-р Гринко Г.А.' },
    { discipline: 'Училищен курс по история на литературата на чуждия език (англ. ез.)', date: '12.02.2026, 12:00 ч.', room: '31', teacher: 'Гл. ас. д-р Гринко Г.А.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-serif italic text-[#003366] mb-4">{t.title}</h1>
        <p className="text-slate-500 mb-12 uppercase font-black text-[10px] tracking-[0.4em]">{t.subtitle}</p>

        <div className="grid grid-cols-1 gap-6">
          {exams.map((e, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:shadow-xl transition-all group">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen size={16} className="text-[#FFCC00]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{t.discipline}</span>
                </div>
                <h3 className="text-2xl font-bold text-[#003366] group-hover:text-blue-700 transition-colors">{e.discipline}</h3>
              </div>

              <div className="flex flex-wrap gap-8">
                <div className="w-40">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock size={14} className="text-slate-300" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{t.date}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-600">{e.date}</p>
                </div>
                <div className="w-24">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin size={14} className="text-slate-300" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{t.room}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-600">{e.room}</p>
                </div>
                <div className="w-56">
                  <div className="flex items-center gap-3 mb-2">
                    <User size={14} className="text-slate-300" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{t.teacher}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-600">{e.teacher}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamSchedule;
