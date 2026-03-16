
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { BookOpen, MapPin, Clock, User } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const ExamSchedule: React.FC<{ lang: Language }> = ({ lang }) => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = collection(db, "exam_schedule");
    const unsub = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      const sorted = fetched.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setExams(sorted);
      setLoading(false);
    }, (error) => {
      console.error("Exams Firestore Error:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const t = {
    BG: { title: 'Изпитна сесия', subtitle: 'Зимен семестър 2025/2026', discipline: 'Дисциплина', date: 'Дата и час', room: 'Зала', teacher: 'Преподавател' },
    RU: { title: 'Экзаменационная сессия', subtitle: 'Зимний семестр 2025/2026', discipline: 'Дисциплина', date: 'Дата и время', room: 'Аудитория', teacher: 'Преподаватель' },
    RO: { title: 'Sesiunea de examene', subtitle: 'Semestrul de iarnă 2025/2026', discipline: 'Disciplina', date: 'Data și ora', room: 'Sala', teacher: 'Profesor' },
    EN: { title: 'Exam Session', subtitle: 'Winter Semester 2025/2026', discipline: 'Discipline', date: 'Date and Time', room: 'Room', teacher: 'Teacher' }
  }[lang];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-serif italic text-[#003366] mb-4">{t.title}</h1>
        <p className="text-slate-500 mb-12 uppercase font-black text-[10px] tracking-[0.4em]">{t.subtitle}</p>

        <div className="grid grid-cols-1 gap-6">
          {exams.length > 0 ? exams.map((e, i) => (
            <div key={e.id || i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:shadow-xl transition-all group">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen size={16} className="text-[#FFCC00]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{t.discipline}</span>
                </div>
                <h3 className="text-2xl font-bold text-[#003366] group-hover:text-blue-700 transition-colors">{e.discipline?.[lang] || e.discipline?.RU}</h3>
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
                  <p className="text-sm font-bold text-slate-600">{e.teacher?.[lang] || e.teacher?.RU}</p>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-center py-20 text-slate-300 italic bg-white rounded-[2.5rem] border border-slate-100">
              {loading ? 'Загрузка...' : 'Расписание пока не опубликовано'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamSchedule;
