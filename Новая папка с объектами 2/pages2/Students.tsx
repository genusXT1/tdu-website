
import React, { useState, useEffect } from 'react';
import { Language, UniversityDocument } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, GraduationCap, Award, Coffee, ArrowRight, FileText, Upload, Trash2, Download, Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db, storage } from '../firebase';
import { useSiteData } from '../store/useSiteData';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const Students: React.FC<{ lang: Language }> = ({ lang }) => {
  const { isAdmin } = useSiteData();
  const [docs, setDocs] = useState<UniversityDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState({ BG: '', RU: '', RO: '', EN: '' });
  const [newDocCategory, setNewDocCategory] = useState<'study-plan' | 'regulation' | 'form' | 'other'>('study-plan');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const q = query(collection(db, "documents"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snap) => {
      setDocs(snap.docs.map(d => ({ id: d.id, ...d.data() } as UniversityDocument)));
    });
  }, []);

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
      alert("Document uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload document.");
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
      alert("Document deleted.");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete document.");
    }
  };

  const t = {
    BG: {
      title: 'Студенти',
      docsTitle: 'Документи',
      uploadBtn: 'Качи документ',
      noDocs: 'Няма налични документи',
      sections: [
        { title: 'График на учебния процес', path: '/calendar', icon: Calendar, desc: 'Дати на семестри, ваканции и сесии.' },
        { title: 'Изпитна сесия', path: '/exams', icon: GraduationCap, desc: 'Разписание на изпитите по дисциплини и зали.' },
        { title: 'Стипендии', path: '/scholarships', icon: Award, desc: 'Информация за видовете стипендии и документи.' },
        { title: 'Отдих и свободно време', path: '/afk', icon: Coffee, desc: 'Потопете се в атмосферата на нашия филиал.' }
      ]
    },
    RU: {
      title: 'Студенты',
      docsTitle: 'Документы',
      uploadBtn: 'Загрузить документ',
      noDocs: 'Нет доступных документов',
      sections: [
        { title: 'График учебного процесса', path: '/calendar', icon: Calendar, desc: 'Даты семестров, каникул и сессий.' },
        { title: 'Экзаменационная сессия', path: '/exams', icon: GraduationCap, desc: 'Расписание экзаменов по дисциплинам и аудиториям.' },
        { title: 'Стипендии', path: '/scholarships', icon: Award, desc: 'Информация о видах стипендий и документах.' },
        { title: 'Отдых и досуг', path: '/afk', icon: Coffee, desc: 'Погрузитесь в атмосферу нашего филиала.' }
      ]
    },
    RO: {
      title: 'Studenți',
      docsTitle: 'Documente',
      uploadBtn: 'Încarcă document',
      noDocs: 'Nu există documente disponibile',
      sections: [
        { title: 'Calendar academic', path: '/calendar', icon: Calendar, desc: 'Datele semestrelor, vacanțelor și sesiunilor.' },
        { title: 'Sesiunea de examene', path: '/exams', icon: GraduationCap, desc: 'Programul examenelor pe discipline și săli.' },
        { title: 'Burse', path: '/scholarships', icon: Award, desc: 'Informații despre tipurile de burse și documente.' },
        { title: 'Relaxare și timp liber', path: '/afk', icon: Coffee, desc: 'Cufundați-vă în atmosfera filialei noastre.' }
      ]
    },
    EN: {
      title: 'Students',
      docsTitle: 'Documents',
      uploadBtn: 'Upload Document',
      noDocs: 'No documents available',
      sections: [
        { title: 'Academic Calendar', path: '/calendar', icon: Calendar, desc: 'Dates of semesters, holidays, and sessions.' },
        { title: 'Exam Session', path: '/exams', icon: GraduationCap, desc: 'Exam schedule by disciplines and rooms.' },
        { title: 'Scholarships', path: '/scholarships', icon: Award, desc: 'Information about scholarship types and documents.' },
        { title: 'Relax and Leisure', path: '/afk', icon: Coffee, desc: 'Immerse yourself in the atmosphere of our branch.' }
      ]
    }
  }[lang];

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
            <span className="text-[#FFCC00] text-[10px] font-black uppercase tracking-[0.5em] block mb-6">Student Portal</span>
            <h1 className="text-5xl md:text-7xl font-bold text-white serif italic mb-8 leading-tight">{t.title}</h1>
          </motion.div>
        </div>
      </section>

      {/* Navigation Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
            {t.sections.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
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
              </motion.div>
            ))}
          </div>

          {/* Documents Section */}
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
        </div>
      </section>

      {/* Decorative Footer Section */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-12 h-1 bg-[#FFCC00] mx-auto mb-12"></div>
          <p className="text-slate-400 italic text-lg font-light leading-relaxed">
            "Образованието е най-мощното оръжие, което можете да използвате, за да промените света."
          </p>
        </div>
      </section>
    </div>
  );
};

export default Students;
