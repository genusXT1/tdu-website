
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Calendar, Users, MapPin, User, ChevronRight, Search } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

interface ScheduleEntry {
  id: string;
  group: string;
  day: string;
  time: string;
  subject: Record<string, string>;
  room: string;
  teacher: Record<string, string>;
}

const Schedules: React.FC<{ lang: Language }> = ({ lang }) => {
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "schedules"));
    return onSnapshot(q, (snap) => {
      setSchedules(snap.docs.map(d => ({ id: d.id, ...d.data() } as ScheduleEntry)));
      setLoading(false);
    });
  }, []);

  const groups = Array.from(new Set(schedules.map(s => s.group))).sort();
  const filteredGroups = groups.filter(g => g.toLowerCase().includes(searchQuery.toLowerCase()));

  const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const t = {
    BG: {
      title: 'Разписание на занятията',
      subtitle: 'График на лекциите и упражненията по групи',
      searchPlaceholder: 'Търсене на група...',
      noResults: 'Няма намерени групи',
      back: 'Назад към списъка',
      dayNames: {
        'Понедельник': 'Понеделник',
        'Вторник': 'Вторник',
        'Среда': 'Сряда',
        'Четверг': 'Четвъртък',
        'Пятница': 'Петък',
        'Суббота': 'Събота'
      }
    },
    RU: {
      title: 'Расписание занятий',
      subtitle: 'График лекций и упражнений по группам',
      searchPlaceholder: 'Поиск группы...',
      noResults: 'Группы не найдены',
      back: 'Назад к списку',
      dayNames: {
        'Понедельник': 'Понедельник',
        'Вторник': 'Вторник',
        'Среда': 'Среда',
        'Четверг': 'Четверг',
        'Пятница': 'Пятница',
        'Суббота': 'Суббота'
      }
    }
  }[lang] || { title: 'Schedule', subtitle: 'Class schedule' };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <span className="text-[#FFCC00] text-[10px] font-black uppercase tracking-[0.5em] block mb-4">Academic Process</span>
          <h1 className="text-5xl md:text-7xl font-bold text-[#003366] serif italic mb-6">{t.title}</h1>
          <p className="text-slate-400 text-xl font-light">{t.subtitle}</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-[#FFCC00] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-12">
            {!selectedGroup ? (
              <div className="space-y-8">
                <div className="relative max-w-md">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    type="text" 
                    placeholder={t.searchPlaceholder}
                    className="w-full pl-16 pr-8 py-5 bg-white rounded-3xl shadow-sm border border-slate-100 outline-none focus:ring-2 focus:ring-[#FFCC00] transition-all font-bold text-[#003366]"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredGroups.length > 0 ? (
                    filteredGroups.map((group, idx) => (
                      <motion.button
                        key={group}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedGroup(group)}
                        className="bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-slate-100 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-[#003366] flex items-center justify-center group-hover:bg-[#FFCC00] transition-colors">
                            <Users size={24} />
                          </div>
                          <span className="text-xl font-bold text-[#003366]">{group}</span>
                        </div>
                        <ChevronRight className="text-slate-200 group-hover:text-[#003366] transition-all group-hover:translate-x-1" />
                      </motion.button>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                      <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest">{t.noResults}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                <button 
                  onClick={() => setSelectedGroup(null)}
                  className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#003366] transition-colors"
                >
                  <Search size={14} className="rotate-180" /> {t.back}
                </button>

                <div className="flex items-center gap-6 mb-12">
                  <div className="w-20 h-20 rounded-[2rem] bg-[#003366] text-[#FFCC00] flex items-center justify-center shadow-xl">
                    <Users size={40} />
                  </div>
                  <h2 className="text-4xl md:text-6xl font-bold text-[#003366] serif italic">{selectedGroup}</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {days.map(day => {
                    const daySchedules = schedules.filter(s => s.group === selectedGroup && s.day === day);
                    if (daySchedules.length === 0) return null;

                    return (
                      <motion.div 
                        key={day}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-px flex-grow bg-slate-200"></div>
                          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
                            {(t.dayNames as any)[day] || day}
                          </h3>
                          <div className="h-px flex-grow bg-slate-200"></div>
                        </div>

                        <div className="space-y-4">
                          {daySchedules.sort((a, b) => a.time.localeCompare(b.time)).map((s, idx) => (
                            <div key={s.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                              <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 text-[#003366] flex flex-col items-center justify-center border border-slate-100">
                                  <Clock size={20} className="mb-1" />
                                  <span className="text-[9px] font-black">{s.time}</span>
                                </div>
                                <div>
                                  <h4 className="text-lg font-bold text-[#003366] mb-2">{s.subject[lang] || s.subject.RU}</h4>
                                  <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                      <User size={12} className="text-[#FFCC00]" />
                                      {s.teacher[lang] || s.teacher.RU}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                      <MapPin size={12} className="text-[#FFCC00]" />
                                      {s.room}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedules;
