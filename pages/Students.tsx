
import React, { useState, useEffect, useMemo } from 'react';
import { Language, UniversityDocument } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, GraduationCap, Award, Coffee, ArrowRight, FileText, Upload, Trash2, Download, Loader2, Plus, Clock, BookOpen, MapPin, User, Search, ChevronLeft, Info } from 'lucide-react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { db, storage } from '../firebase';
import { useSiteData } from '../store/useSiteData';
import { seedAllSchedules } from '../src/services/scheduleSeeder';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const Students: React.FC<{ lang: Language }> = ({ lang }) => {
  const { isAdmin } = useSiteData();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    } else {
      const path = location.pathname;
      if (path.includes('calendar')) setActiveTab('calendar');
      else if (path.includes('exams')) setActiveTab('exams');
      else if (path.includes('schedules')) setActiveTab('schedules');
      else if (path.includes('docs')) setActiveTab('docs');
      else setActiveTab('overview');
    }
  }, [searchParams, location.pathname]);

  const [docs, setDocs] = useState<UniversityDocument[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState({ BG: '', RU: '', RO: '', EN: '' });
  const [newDocCategory, setNewDocCategory] = useState<'study-plan' | 'regulation' | 'form' | 'other'>('study-plan');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Schedule specific state
  const [searchGroup, setSearchGroup] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string>('1');

  useEffect(() => {
    setLoading(true);
    const unsubs: any[] = [];

    // Documents
    unsubs.push(onSnapshot(query(collection(db, "documents"), orderBy("timestamp", "desc")), (snap) => {
      setDocs(snap.docs.map(d => ({ id: d.id, ...d.data() } as UniversityDocument)));
    }));

    // Academic Calendar
    unsubs.push(onSnapshot(query(collection(db, "academic_calendar"), orderBy("order", "asc")), (snap) => {
      setCalendarEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }));

    // Exams
    unsubs.push(onSnapshot(collection(db, "exam_schedule"), (snap) => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setExams(fetched.sort((a: any, b: any) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
    }));

    // Schedules
    unsubs.push(onSnapshot(collection(db, "schedules"), (snap) => {
      console.log("Schedules snapshot received:", snap.size);
      setSchedules(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }));

    // Safety timeout for loading
    const timer = setTimeout(() => setLoading(false), 3000);

    return () => {
      unsubs.forEach(unsub => unsub());
      clearTimeout(timer);
    };
  }, []);

  const groups = useMemo(() => {
    const set = new Set(schedules.map(s => s.group));
    return Array.from(set).sort();
  }, [schedules]);

  const filteredGroups = groups.filter(g => g.toLowerCase().includes(searchGroup.toLowerCase()));

  const groupSchedule = useMemo(() => {
    if (!selectedGroup) return null;
    const filtered = schedules.filter(s => s.group === selectedGroup);
    const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    
    // Check if there are week-specific schedules
    const hasWeeks = filtered.some(s => s.week && s.week !== 'all');
    
    if (hasWeeks) {
      const grouped: any = {};
      const weekItems = filtered.filter(s => s.week === selectedWeek || s.week === 'all' || !s.week);
      days.forEach(day => {
        const dayItems = weekItems.filter(s => s.day === day).sort((a, b) => a.time.localeCompare(b.time));
        if (dayItems.length > 0) {
          grouped[day] = dayItems;
        }
      });
      return { type: 'weekly', data: grouped, hasWeeks: true };
    } else {
      const grouped: any = {};
      days.forEach(day => {
        const dayItems = filtered.filter(s => s.day === day).sort((a, b) => a.time.localeCompare(b.time));
        if (dayItems.length > 0) {
          grouped[day] = dayItems;
        }
      });
      return { type: 'daily', data: grouped, hasWeeks: false };
    }
  }, [selectedGroup, schedules, selectedWeek]);

  const dayNames = {
    'Понедельник': { BG: 'Понеделник', RU: 'Понедельник' },
    'Вторник': { BG: 'Вторник', RU: 'Вторник' },
    'Среда': { BG: 'Сряда', RU: 'Среда' },
    'Четверг': { BG: 'Четвъртък', RU: 'Четверг' },
    'Пятница': { BG: 'Петък', RU: 'Пятница' },
    'Суббота': { BG: 'Събота', RU: 'Суббота' }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !newDocTitle.RU) {
      alert("Please provide a title and select a file.");
      return;
    }

    setUploading(true);
    try {
      const storageRef = ref(storage, `documents/${Date.now()}_${selectedFile.name}`);
      await uploadBytes(storageRef, selectedFile);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, "documents"), {
        title: newDocTitle,
        url,
        category: newDocCategory,
        timestamp: serverTimestamp(),
        fileName: selectedFile.name,
        storagePath: storageRef.fullPath
      });

      setNewDocTitle({ BG: '', RU: '', RO: '', EN: '' });
      setNewDocCategory('study-plan');
      setSelectedFile(null);
      setShowUpload(false);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string, storagePath?: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await deleteDoc(doc(db, "documents", docId));
      if (storagePath) {
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const t = {
    BG: {
      title: 'Студентски портал',
      docsTitle: 'Документи',
      uploadBtn: 'Качи документ',
      noDocs: 'Няма налични документи',
      tabs: {
        overview: 'Общ преглед',
        calendar: 'График',
        schedules: 'Разписание',
        exams: 'Изпити',
        full: 'Пълен график',
        docs: 'Документи'
      },
      sections: [
        { id: 'calendar', title: 'График на учебния процес', icon: Calendar, desc: 'Дати на семестри, ваканции и сесии.' },
        { id: 'schedules', title: 'Разписание на занятията', icon: Clock, desc: 'График на лекциите и упражненията.' },
        { id: 'exams', title: 'Изпитна сесия', icon: GraduationCap, desc: 'Разписание на изпитите по дисциплини и залите.' },
        { id: 'full', title: 'Пълен график', icon: BookOpen, desc: 'Всички събития и изпити на едно място.' },
        { id: 'docs', title: 'Документи и бланки', icon: FileText, desc: 'Учебни планове, заявления и наредби.' },
        { id: 'scholarships', title: 'Стипендии', path: '/scholarships', icon: Award, desc: 'Информация за видовете стипендии.' },
        { id: 'afk', title: 'Отдих и свободно време', path: '/afk', icon: Coffee, desc: 'Потопете се в атмосферата на филиала.' }
      ]
    },
    RU: {
      title: 'Студенческий портал',
      docsTitle: 'Документы',
      uploadBtn: 'Загрузить документ',
      noDocs: 'Нет доступных документов',
      tabs: {
        overview: 'Обзор',
        calendar: 'График',
        schedules: 'Расписание',
        exams: 'Экзамены',
        full: 'Полный график',
        docs: 'Документы'
      },
      sections: [
        { id: 'calendar', title: 'График учебного процесса', icon: Calendar, desc: 'Даты семестров, каникул и сессий.' },
        { id: 'schedules', title: 'Расписание занятий', icon: Clock, desc: 'График лекций и упражнений.' },
        { id: 'exams', title: 'Экзаменационная сессия', icon: GraduationCap, desc: 'Расписание экзаменов по дисциплинам и аудиториям.' },
        { id: 'full', title: 'Полный график', icon: BookOpen, desc: 'Все события и экзамены в одном месте.' },
        { id: 'docs', title: 'Документы и бланки', icon: FileText, desc: 'Учебные планы, заявления и положения.' },
        { id: 'scholarships', title: 'Стипендии', path: '/scholarships', icon: Award, desc: 'Информация о видах стипендий.' },
        { id: 'afk', title: 'Отдых и досуг', path: '/afk', icon: Coffee, desc: 'Погрузитесь в атмосферу нашего филиала.' }
      ]
    }
  }[lang === 'BG' ? 'BG' : 'RU'] || { title: 'Students', tabs: {}, sections: [] };

  const setTab = (tab: string) => {
    setSearchParams({ tab });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-[#003366] overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 -skew-x-12 transform translate-x-1/4"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[#FFCC00] text-[10px] font-black uppercase tracking-[0.5em] block mb-6">Student Hub</span>
            <h1 className="text-5xl md:text-7xl font-bold text-white serif italic mb-8 leading-tight">{t.title}</h1>
            
            {/* Tab Switcher - Scrollable on mobile */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 mt-12 pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:flex-wrap">
              {Object.entries(t.tabs).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex-shrink-0 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === key 
                      ? 'bg-[#FFCC00] text-[#003366] shadow-xl scale-105' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {label as string}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <main className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {t.sections.map((section: any, idx: number) => (
                  <div key={idx}>
                    {section.path ? (
                      <Link 
                        to={section.path}
                        className="group block bg-white p-10 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 h-full flex flex-col"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 text-[#003366] flex items-center justify-center mb-8 group-hover:bg-[#FFCC00] transition-colors duration-500">
                          <section.icon size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-[#003366] serif italic mb-4 group-hover:text-[#FFCC00] transition-colors">
                          {section.title}
                        </h3>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                          {section.desc}
                        </p>
                        <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#003366]">
                          <span>Explore</span>
                          <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                        </div>
                      </Link>
                    ) : (
                      <button 
                        onClick={() => setTab(section.id)}
                        className="w-full text-left group block bg-white p-10 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 h-full flex flex-col"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 text-[#003366] flex items-center justify-center mb-8 group-hover:bg-[#FFCC00] transition-colors duration-500">
                          <section.icon size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-[#003366] serif italic mb-4 group-hover:text-[#FFCC00] transition-colors">
                          {section.title}
                        </h3>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                          {section.desc}
                        </p>
                        <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#003366]">
                          <span>Open Section</span>
                          <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                        </div>
                      </button>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl">
                  <h2 className="text-3xl font-serif italic text-[#003366] mb-8 flex items-center gap-4">
                    <Calendar className="text-[#FFCC00]" /> {lang === 'RU' ? 'График учебного процесса' : 'График на учебния процес'}
                  </h2>
                  <div className="space-y-6">
                    {calendarEvents.length > 0 ? calendarEvents.map((e, i) => (
                      <div key={e.id || i} className="flex flex-col md:flex-row md:items-center justify-between py-6 border-b border-slate-100 last:border-0 gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-[#FFCC00]"></div>
                          <span className="text-lg font-bold text-[#003366]">{e.event?.[lang] || e.event?.RU}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 font-mono bg-slate-50 px-4 py-2 rounded-xl self-start md:self-center">
                          <Clock size={14} /> {e.date}
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-12">
                        <p className="text-slate-300 italic mb-4">{lang === 'RU' ? 'График пока не опубликован' : 'Графикът все още не е публикуван'}</p>
                        {isAdmin && (
                          <button 
                            onClick={async () => { setLoading(true); await seedAllSchedules(); setLoading(false); }}
                            className="bg-[#FFCC00] text-[#003366] px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest"
                          >
                            Seed Initial Data
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-12 p-8 bg-[#003366] rounded-[2rem] text-white flex items-start gap-6">
                  <Info className="text-[#FFCC00] flex-shrink-0" size={24} />
                  <p className="text-sm font-light leading-relaxed opacity-80">
                    {lang === 'BG' 
                      ? 'По взаимна договореност между преподавателите и студентите, за всяка дисциплина се определят по три дати за изпит.' 
                      : 'По взаимной договоренности между преподавателями и студентами для каждой дисциплины определяются три даты экзамена.'}
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'schedules' && (
              <motion.div
                key="schedules"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {!selectedGroup ? (
                  <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-[3rem] p-12 shadow-xl border border-slate-100">
                      <h2 className="text-3xl font-serif italic text-[#003366] mb-8">{lang === 'RU' ? 'Выберите группу' : 'Изберете група'}</h2>
                      <div className="relative mb-10">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input 
                          type="text" 
                          placeholder={lang === 'RU' ? "Поиск группы..." : "Търсене на група..."}
                          className="w-full pl-16 pr-8 py-6 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#FFCC00] text-lg font-bold text-[#003366]"
                          value={searchGroup}
                          onChange={e => setSearchGroup(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredGroups.length > 0 ? filteredGroups.map(group => (
                          <button
                            key={group}
                            onClick={() => setSelectedGroup(group)}
                            className="p-6 bg-slate-50 rounded-2xl text-center hover:bg-[#003366] hover:text-white transition-all group"
                          >
                            <span className="text-xl font-black uppercase tracking-widest">{group}</span>
                          </button>
                        )) : (
                          <div className="col-span-full py-12 text-center">
                            <p className="text-slate-300 italic mb-4">{lang === 'RU' ? 'Группы не найдены' : 'Няма намерени групи'}</p>
                            {isAdmin && (
                              <button 
                                onClick={async () => { setLoading(true); await seedAllSchedules(); setLoading(false); }}
                                className="bg-[#FFCC00] text-[#003366] px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest"
                              >
                                Seed Initial Data
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <button 
                      onClick={() => setSelectedGroup(null)}
                      className="flex items-center gap-2 text-[#003366] font-black uppercase text-[10px] tracking-widest hover:text-[#FFCC00] transition-colors"
                    >
                      <ChevronLeft size={16} /> {lang === 'RU' ? 'Назад к списку' : 'Назад към списъка'}
                    </button>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 gap-6">
                      <h2 className="text-2xl md:text-3xl font-serif italic text-[#003366]">{lang === 'RU' ? 'Группа' : 'Група'}: {selectedGroup}</h2>
                      
                      {groupSchedule?.hasWeeks && (
                        <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                          {['1', '2', '3', '4'].map(w => (
                            <button
                              key={w}
                              onClick={() => setSelectedWeek(w)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${selectedWeek === w ? 'bg-[#003366] text-white shadow-lg' : 'text-slate-400 hover:text-[#003366]'}`}
                            >
                              {lang === 'RU' ? 'Нед' : 'Сед'} {w}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="hidden md:flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#FFCC00]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#003366]"></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      {Object.entries(groupSchedule?.data || {}).map(([day, items]: [string, any]) => (
                        <div key={day} className="space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="h-px flex-grow bg-slate-200"></div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
                              {(dayNames as any)[day]?.[lang === 'BG' ? 'BG' : 'RU'] || day}
                            </h3>
                            <div className="h-px flex-grow bg-slate-200"></div>
                          </div>

                          <div className="space-y-4">
                            {items.map((item: any, i: number) => (
                              <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                                <div className="flex items-center gap-6">
                                  <div className="w-16 h-16 rounded-2xl bg-slate-50 text-[#003366] flex flex-col items-center justify-center border border-slate-100 group-hover:bg-[#FFCC00] transition-colors">
                                    <Clock size={20} className="mb-1" />
                                    <span className="text-[9px] font-black">{item.time}</span>
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-bold text-[#003366] mb-2">{item.subject[lang] || item.subject.RU}</h4>
                                    <div className="flex flex-wrap gap-4">
                                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <User size={12} className="text-[#FFCC00]" />
                                        {item.teacher[lang] || item.teacher.RU}
                                      </div>
                                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <MapPin size={12} className="text-[#FFCC00]" />
                                        {item.room}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'exams' && (
              <motion.div
                key="exams"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="grid grid-cols-1 gap-6">
                  {exams.length > 0 ? exams.map((e, i) => (
                    <div key={e.id || i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:shadow-xl transition-all group">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-4">
                          <BookOpen size={16} className="text-[#FFCC00]" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{lang === 'RU' ? 'Дисциплина' : 'Дисциплина'}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-[#003366] group-hover:text-blue-700 transition-colors">{e.discipline?.[lang] || e.discipline?.RU}</h3>
                      </div>

                      <div className="flex flex-wrap gap-8">
                        <div className="w-40">
                          <div className="flex items-center gap-3 mb-2">
                            <Clock size={14} className="text-slate-300" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{lang === 'RU' ? 'Дата и время' : 'Дата и час'}</span>
                          </div>
                          <p className="text-sm font-bold text-slate-600">{e.date}</p>
                        </div>
                        <div className="w-24">
                          <div className="flex items-center gap-3 mb-2">
                            <MapPin size={14} className="text-slate-300" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{lang === 'RU' ? 'Аудитория' : 'Зала'}</span>
                          </div>
                          <p className="text-sm font-bold text-slate-600">{e.room}</p>
                        </div>
                        <div className="w-56">
                          <div className="flex items-center gap-3 mb-2">
                            <User size={14} className="text-slate-300" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{lang === 'RU' ? 'Преподаватель' : 'Преподавател'}</span>
                          </div>
                          <p className="text-sm font-bold text-slate-600">{e.teacher?.[lang] || e.teacher?.RU}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100">
                      <p className="text-slate-300 italic mb-4">
                        {loading ? (lang === 'RU' ? 'Загрузка...' : 'Зареждане...') : (lang === 'RU' ? 'Расписание пока не опубликовано' : 'Разписанието още не е публикувано')}
                      </p>
                      {isAdmin && !loading && (
                        <button 
                          onClick={async () => { setLoading(true); await seedAllSchedules(); setLoading(false); }}
                          className="bg-[#FFCC00] text-[#003366] px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest"
                        >
                          Seed Initial Data
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'full' && (
              <motion.div
                key="full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-5xl mx-auto space-y-8 md:space-y-12"
              >
                {/* Academic Calendar Section */}
                <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-slate-100 shadow-xl">
                  <h2 className="text-2xl md:text-3xl font-serif italic text-[#003366] mb-6 md:mb-8 flex items-center gap-4">
                    <Calendar className="text-[#FFCC00]" /> {lang === 'RU' ? 'График учебного процесса' : 'График на учебния процес'}
                  </h2>
                  <div className="space-y-3 md:space-y-4">
                    {calendarEvents.map((e, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors gap-2">
                        <span className="font-bold text-[#003366] text-sm md:text-base">{e.event?.[lang] || e.event?.RU}</span>
                        <span className="text-slate-400 font-mono text-[10px] md:text-sm bg-slate-50 sm:bg-transparent px-3 py-1 sm:p-0 rounded-lg self-start sm:self-auto">{e.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exams Section */}
                <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-slate-100 shadow-xl">
                  <h2 className="text-2xl md:text-3xl font-serif italic text-[#003366] mb-6 md:mb-8 flex items-center gap-4">
                    <GraduationCap className="text-[#FFCC00]" /> {lang === 'RU' ? 'Экзаменационная сессия' : 'Изпитна сесия'}
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {exams.map((e, i) => (
                      <div key={i} className="p-5 md:p-6 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                          <h4 className="text-base md:text-lg font-bold text-[#003366]">{e.discipline?.[lang] || e.discipline?.RU}</h4>
                          <span className="px-3 py-1 bg-[#FFCC00] text-[#003366] text-[9px] md:text-[10px] font-black rounded-full uppercase whitespace-nowrap">{e.date}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 md:gap-6 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span className="flex items-center gap-1"><MapPin size={12} /> {e.room}</span>
                          <span className="flex items-center gap-1"><User size={12} /> {e.teacher?.[lang] || e.teacher?.RU}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'docs' && (
              <motion.div
                key="docs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-white rounded-[4rem] p-12 md:p-20 shadow-xl border border-slate-100">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
                    <div>
                      <h2 className="text-4xl md:text-5xl font-bold text-[#003366] serif italic mb-4">{t.docsTitle}</h2>
                      <div className="h-1 w-20 bg-[#FFCC00]"></div>
                    </div>
                    {isAdmin && (
                      <button 
                        onClick={() => setShowUpload(!showUpload)}
                        className="flex items-center gap-3 bg-[#003366] text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all shadow-lg"
                      >
                        <Plus size={18} /> {t.uploadBtn}
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {isAdmin && showUpload && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-16"
                      >
                        <div className="bg-slate-50 p-8 md:p-12 rounded-[3rem] border border-slate-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                            <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Название (RU)</label>
                              <input 
                                className="w-full p-4 rounded-2xl border-none bg-white shadow-inner outline-none focus:ring-2 focus:ring-[#FFCC00]"
                                placeholder="Учебный план..."
                                value={newDocTitle.RU}
                                onChange={e => setNewDocTitle({...newDocTitle, RU: e.target.value})}
                              />
                            </div>
                            <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Категория</label>
                              <select 
                                className="w-full p-4 rounded-2xl border-none bg-white shadow-inner outline-none focus:ring-2 focus:ring-[#FFCC00] text-slate-600 font-bold"
                                value={newDocCategory}
                                onChange={e => setNewDocCategory(e.target.value as any)}
                              >
                                <option value="study-plan">Учебный план</option>
                                <option value="regulation">Нормативный акт</option>
                                <option value="form">Бланк/Заявление</option>
                                <option value="other">Прочее</option>
                              </select>
                            </div>
                            <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Файл (PDF)</label>
                              <div className="relative">
                                <input 
                                  type="file" 
                                  accept=".pdf"
                                  className="hidden" 
                                  id="file-upload"
                                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                                />
                                <label 
                                  htmlFor="file-upload"
                                  className="flex items-center justify-between w-full p-4 rounded-2xl bg-white shadow-inner cursor-pointer hover:bg-slate-100 transition-colors"
                                >
                                  <span className="text-slate-400 truncate max-w-[200px]">
                                    {selectedFile ? selectedFile.name : 'Выберите файл...'}
                                  </span>
                                  <Upload size={18} className="text-[#003366]" />
                                </label>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button 
                              onClick={handleFileUpload}
                              disabled={uploading}
                              className="flex items-center gap-3 bg-[#FFCC00] text-[#003366] px-12 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                            >
                              {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                              {uploading ? 'Загрузка...' : 'Подтвердить'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 gap-4">
                    {docs.length > 0 ? (
                      docs.map((doc, idx) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between p-6 md:p-8 bg-slate-50 rounded-[2.5rem] hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100 group"
                        >
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-white text-[#003366] flex items-center justify-center shadow-sm group-hover:bg-[#FFCC00] transition-colors">
                              <FileText size={24} />
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="text-lg font-bold text-[#003366]">
                                  {doc.title[lang] || doc.title.RU}
                                </h4>
                                <span className="text-[8px] font-black bg-[#003366]/5 text-[#003366] px-2 py-0.5 rounded uppercase tracking-widest">
                                  {doc.category === 'study-plan' ? 'Учебный план' : 
                                   doc.category === 'regulation' ? 'Норматив' : 
                                   doc.category === 'form' ? 'Бланк' : 'Прочее'}
                                </span>
                              </div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                {new Date(doc.timestamp?.seconds * 1000).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <a 
                              href={doc.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="w-10 h-10 rounded-full bg-white text-[#003366] flex items-center justify-center shadow-sm hover:bg-[#003366] hover:text-white transition-all"
                            >
                              <Download size={18} />
                            </a>
                            {isAdmin && (
                              <button 
                                onClick={() => handleDelete(doc.id, (doc as any).storagePath)}
                                className="w-10 h-10 rounded-full bg-white text-red-500 flex items-center justify-center shadow-sm hover:bg-red-500 hover:text-white transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest">{t.noDocs}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Decorative Footer Section */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-12 h-1 bg-[#FFCC00] mx-auto mb-12"></div>
          <p className="text-slate-400 italic text-lg font-light leading-relaxed">
            {lang === 'BG' 
              ? '"Образованието е най-мощното оръжие, което можете да използвате, за да промените света."'
              : '"Образование — самое мощное оружие, которое вы можете использовать, чтобы изменить мир."'}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Students;
