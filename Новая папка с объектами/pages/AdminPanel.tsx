
import React, { useState, useEffect, useRef } from 'react';
import { auth, db, storage, signInWithEmailAndPassword, onAuthStateChanged, signOut } from '../firebase';
import { useSiteData } from '../store/useSiteData';
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, onSnapshot, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Language, Program, AdmissionApplication, DynamicPage, NavLink, Partner, BlockType, ContentBlock } from '../types';
import { 
  LayoutDashboard, 
  Newspaper, 
  GraduationCap, 
  Inbox, 
  Handshake, 
  FileText, 
  Link as LinkIcon, 
  Settings, 
  LogOut, 
  Plus, 
  Edit2, 
  Trash2, 
  Image as ImageIcon, 
  X, 
  Send, 
  RefreshCw, 
  ChevronUp, 
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Tag,
  History,
  User
} from 'lucide-react';

const TAB_INFO: Record<string, { label: string, icon: any }> = {
  dash: { label: 'Обзор', icon: LayoutDashboard },
  news: { label: 'Новости', icon: Newspaper },
  programs: { label: 'Программы', icon: GraduationCap },
  apps: { label: 'Заявки', icon: Inbox },
  partners: { label: 'Спонсоры', icon: Handshake },
  gallery: { label: 'Галерея', icon: ImageIcon },
  pages: { label: 'Страницы', icon: FileText },
  nav: { label: 'Навигация', icon: LinkIcon },
  logs: { label: 'Логи', icon: History },
  system: { label: 'Система', icon: Settings },
};

export const AdminPanel: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('dash');
  const { data, updatePage, deletePage, updateNav, bootstrapDatabase, saveConfig } = useSiteData();
  
  const [news, setNews] = useState<any[]>([]);
  const [apps, setApps] = useState<AdmissionApplication[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Telegram Integration State
  const [showTgModal, setShowTgModal] = useState(false);
  const [tgSettings, setTgSettings] = useState({ botToken: '', autoSync: true, syncInterval: 3 });
  const syncTimerRef = useRef<number | null>(null);

  // Forms and States
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false); // New state for delete confirmation
  const [newsForm, setNewsForm] = useState({ titleRU: '', contentRU: '', category: 'academic', images: [] as string[] });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'news' | 'partners' | 'pages' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const storageRef = ref(storage, `uploads/${target}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      if (target === 'news') {
        setNewsForm(prev => ({ ...prev, images: [...prev.images, url] }));
      } else if (target === 'partners') {
        setPartnerForm(prev => ({ ...prev, logo: url }));
      } else if (target === 'gallery') {
        await addDoc(collection(db, "gallery"), {
          url,
          title: file.name,
          timestamp: serverTimestamp()
        });
        logAction("Gallery Upload", `Загружено фото в галерею: ${file.name}`);
      }
      showToast("Файл загружен успешно");
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Ошибка при загрузке", "error");
    } finally {
      setUploading(false);
    }
  };
  
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const initialProgramForm: Partial<Program> = {
    level: ['bachelor'],
    title: { BG: '', RU: '', RO: '', EN: '' } as Record<Language, string>,
    duration: { BG: '', RU: '', RO: '', EN: '' } as Record<Language, string>,
    language: 'Български / Руски',
    form: { BG: 'Редовна', RU: 'Очная', RO: 'Full-time', EN: 'Full-time' } as Record<Language, string>
  };
  const [programForm, setProgramForm] = useState<Partial<Program>>(initialProgramForm);

  const [editingPage, setEditingPage] = useState<DynamicPage | null>(null);
  const [navItems, setNavItems] = useState<NavLink[]>([]);
  const [partnerForm, setPartnerForm] = useState({ name: '', logo: '', link: '' });
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, u => {
      setUser(u);
      if (u) {
        onSnapshot(collection(db, "news"), (s) => {
          setNews(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
        }, (err) => setErrorMsg("Error News: " + err.message));
        
        onSnapshot(collection(db, "applications"), (s) => {
          setApps(s.docs.map(d => ({ id: d.id, ...d.data() } as AdmissionApplication)).sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
        }, (err) => setErrorMsg("Error Apps: " + err.message));
        
        onSnapshot(collection(db, "programs"), (s) => {
          setPrograms(s.docs.map(d => ({ id: d.id, ...d.data() } as Program)).sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
        }, (err) => setErrorMsg("Error Programs: " + err.message));
        
        onSnapshot(collection(db, "partners"), (s) => {
          setPartners(s.docs.map(d => ({ id: d.id, ...d.data() } as Partner)));
        }, (err) => setErrorMsg("Error Partners: " + err.message));

        onSnapshot(collection(db, "gallery"), (s) => {
          setGallery(s.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (err) => setErrorMsg("Error Gallery: " + err.message));

        onSnapshot(query(collection(db, "logs"), orderBy("timestamp", "desc")), (s) => {
          setLogs(s.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (err) => setErrorMsg("Error Logs: " + err.message));
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (data.tgSettings) {
      setTgSettings({
        botToken: data.tgSettings.botToken || '',
        autoSync: data.tgSettings.autoSync ?? true,
        syncInterval: data.tgSettings.syncInterval || 3
      });
    }
  }, [data.tgSettings]);

  // Background Auto-Sync
  useEffect(() => {
    if (tgSettings.autoSync && tgSettings.botToken && user) {
      if (syncTimerRef.current) window.clearInterval(syncTimerRef.current);
      syncTelegram(true);
      syncTimerRef.current = window.setInterval(() => {
        syncTelegram(true);
      }, tgSettings.syncInterval * 60 * 1000);
    } else {
      if (syncTimerRef.current) window.clearInterval(syncTimerRef.current);
    }
    return () => {
      if (syncTimerRef.current) window.clearInterval(syncTimerRef.current);
    };
  }, [tgSettings.autoSync, tgSettings.syncInterval, tgSettings.botToken, user]);

  useEffect(() => { 
    if (activeTab === 'nav' && data.navLinks) setNavItems(JSON.parse(JSON.stringify(data.navLinks)));
  }, [activeTab, data.navLinks]);

  const logAction = async (action: string, details: string, data?: any) => {
    try {
      await addDoc(collection(db, "logs"), {
        action,
        details,
        data: data ? JSON.stringify(data) : null,
        user: user?.email || 'System',
        timestamp: serverTimestamp()
      });
    } catch (e) { console.error("Log error:", e); }
  };

  const syncTelegram = async (silent = false) => {
    const token = data.tgSettings?.botToken || tgSettings.botToken;
    if (!token || syncLoading) return;
    if (!silent) setSyncLoading(true);

    try {
      const resp = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
      const resData = await resp.json();
      if (!resData.ok) return;

      const updates = resData.result;
      let count = 0;
      for (const update of updates) {
        const msg = update.message || update.channel_post;
        if (!msg || (!msg.text && !msg.caption)) continue;

        const q = query(collection(db, "news"), where("tgMessageId", "==", msg.message_id));
        const existing = await getDocs(q);
        if (!existing.empty) continue;

        const fullText = msg.text || msg.caption || '';
        const lines = fullText.split('\n').filter(l => l.trim() !== '');
        const titleText = lines.length > 0 ? lines[0] : "Новость из Telegram";
        const bodyText = lines.length > 1 ? lines.slice(1).join('\n') : fullText;
        const excerptText = fullText.length > 150 ? fullText.substring(0, 147) + '...' : fullText;

        let imageUrls: string[] = [];
        if (msg.photo) {
          const fileId = msg.photo[msg.photo.length - 1].file_id;
          const fResp = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
          const fData = await fResp.json();
          if (fData.ok) imageUrls.push(`https://api.telegram.org/file/bot${token}/${fData.result.file_path}`);
        }

        const authorName = msg.from?.username || msg.from?.first_name || msg.chat?.title || "Telegram Bot";

        await addDoc(collection(db, "news"), {
          tgMessageId: msg.message_id,
          date: new Date(msg.date * 1000).toLocaleDateString(),
          category: 'academic',
          images: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1523050853064-dbad350c74ee'],
          title: { RU: titleText, BG: titleText, EN: titleText, RO: titleText },
          excerpt: { RU: excerptText, BG: excerptText, EN: excerptText, RO: excerptText },
          fullContent: { RU: bodyText, BG: bodyText, EN: bodyText, RO: bodyText },
          timestamp: serverTimestamp(),
          author: `Telegram: ${authorName}`
        });
        count++;
      }
      if (count > 0) {
        logAction("TG Sync", `Синхронизировано ${count} новостей из Telegram`);
      }
      if (!silent && count > 0) alert(`Успешно! Добавлено ${count} новых сообщений.`);
    } catch (e) { 
      if (!silent) alert("Ошибка синхронизации TG.");
    } finally { if (!silent) setSyncLoading(false); }
  };

  const handleSaveNews = async () => {
    if (!newsForm.titleRU) return alert("Введите заголовок!");
    if (newsForm.images.length === 0) return alert("Добавьте хотя бы одно изображение!");
    
    setLoading(true);
    
    const payload = {
      title: { RU: newsForm.titleRU, BG: newsForm.titleRU, EN: newsForm.titleRU, RO: newsForm.titleRU },
      excerpt: { 
        RU: newsForm.contentRU.substring(0, 150), 
        BG: newsForm.contentRU.substring(0, 150), 
        EN: newsForm.contentRU.substring(0, 150), 
        RO: newsForm.contentRU.substring(0, 150) 
      },
      fullContent: { 
        RU: newsForm.contentRU, 
        BG: newsForm.contentRU, 
        EN: newsForm.contentRU, 
        RO: newsForm.contentRU 
      },
      category: newsForm.category, 
      images: newsForm.images, 
      date: new Date().toLocaleDateString(), 
      timestamp: serverTimestamp(),
      author: user?.email || 'Admin'
    };

    try {
      if (editingNewsId) {
        await updateDoc(doc(db, "news", editingNewsId), payload);
        logAction("News Update", `Обновлена новость: ${newsForm.titleRU}`);
        showToast("Новость обновлена");
      } else {
        await addDoc(collection(db, "news"), payload);
        logAction("News Create", `Создана новость: ${newsForm.titleRU}`);
        showToast("Новость создана");
      }
      setEditingNewsId(null);
      setNewsForm({ titleRU: '', contentRU: '', category: 'academic', images: [] });
      setShowNewsModal(false);
    } catch (e: any) {
      console.error("Ошибка сохранения новости:", e);
      showToast("Ошибка сохранения", 'error');
    } finally { 
      setLoading(false); 
    }
  };

  const handleDeleteNews = async (id: string) => {
    console.log("Attempting to delete news with ID:", id);
    if (!id) {
      console.error("Delete failed: No ID provided");
      return;
    }

    setLoading(true);
    try {
      const newsItem = news.find(n => n.id === id);
      await deleteDoc(doc(db, "news", id));
      logAction("News Delete", `Удалена новость: ${newsItem?.title?.RU || id}`, { type: 'news', ...newsItem });
      console.log("Delete successful for ID:", id);
      showToast("Новость успешно удалена");

      setEditingNewsId(null);
      setShowNewsModal(false);
      setIsDeleting(false);
    } catch (e: any) {
      console.error("Delete error for ID:", id, e);
      showToast("Ошибка удаления: " + (e.message || "Неизвестная ошибка"), 'error');
    } finally {
      setLoading(false);
    }
  };

  // PARTNERS LOGIC
  const handleSavePartner = async () => {
    if (!partnerForm.name || !partnerForm.logo) return showToast("Заполните поля", 'error');
    setLoading(true);
    try {
      await addDoc(collection(db, "partners"), partnerForm);
      logAction("Partner Create", `Добавлен партнер: ${partnerForm.name}`);
      setPartnerForm({ name: '', logo: '', link: '' });
      showToast("Партнер добавлен");
    } catch (e: any) {
      showToast("Ошибка", 'error');
    } finally {
      setLoading(false);
    }
  };

  // PAGES LOGIC
  const addBlock = (type: BlockType) => {
    if (!editingPage) return;
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      data: {
        title: { RU: 'Заголовок блока', BG: '', EN: '', RO: '' },
        content: { RU: '', BG: '', EN: '', RO: '' },
        image: '',
        link: ''
      }
    };
    setEditingPage({ ...editingPage, blocks: [...(editingPage.blocks || []), newBlock] });
  };

  const updateBlock = (bId: string, field: string, val: any, isRaw = false) => {
    if (!editingPage) return;
    const translatable = ['title', 'content', 'subtitle', 'buttonText'];
    const updatedBlocks = editingPage.blocks.map(b => {
      if (b.id === bId) {
        const newData = { ...b.data };
        if (translatable.includes(field) && !isRaw) {
          newData[field] = { ...(newData[field] || {}), RU: val };
        } else {
          newData[field] = val;
        }
        return { ...b, data: newData };
      }
      return b;
    });
    setEditingPage({ ...editingPage, blocks: updatedBlocks });
  };

  const handleSavePage = async () => {
    if (!editingPage?.slug) return showToast("URL обязателен", 'error');
    setLoading(true);
    try {
      if (editingPage.id.length > 15) { // Existing page usually has long ID
        await updatePage(editingPage);
        logAction("Page Update", `Обновлена страница: ${editingPage.title?.RU}`);
      } else {
        await updatePage(editingPage); // updatePage handles both in useSiteData
        logAction("Page Create", `Создана страница: ${editingPage.title?.RU}`);
      }
      setEditingPage(null);
      showToast("Страница сохранена");
    } catch (e: any) {
      showToast("Ошибка сохранения", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProgram = async () => {
    if (!programForm.title?.RU) return showToast("Введите название", 'error');
    setLoading(true);
    const finalTitle = { ...programForm.title };
    Object.keys(Language).forEach(l => { if (!finalTitle[l as Language]) finalTitle[l as Language] = finalTitle.RU; });
    const finalDuration = { ...programForm.duration };
    Object.keys(Language).forEach(l => { if (!finalDuration[l as Language]) finalDuration[l as Language] = finalDuration.RU; });
    const payload = { ...programForm, title: finalTitle, duration: finalDuration, timestamp: serverTimestamp() };
    try {
      if (editingProgramId) {
        await updateDoc(doc(db, "programs", editingProgramId), payload);
        logAction("Program Update", `Обновлена программа: ${programForm.title?.RU}`);
      } else {
        await addDoc(collection(db, "programs"), payload);
        logAction("Program Create", `Создана программа: ${programForm.title?.RU}`);
      }
      setEditingProgramId(null);
      setProgramForm(initialProgramForm);
      showToast("Программа сохранена");
    } catch (e: any) { showToast("Ошибка", 'error'); } finally { setLoading(false); }
  };

  const handleDeletePartner = async (id: string) => {
    const p = partners.find(x => x.id === id);
    if (!p) return;
    if (!window.confirm(`Удалить партнера ${p.name}?`)) return;
    try {
      await deleteDoc(doc(db, "partners", id));
      logAction("Partner Delete", `Удален партнер: ${p.name}`, { type: 'partner', ...p });
      showToast("Партнер удален");
    } catch (e) { showToast("Ошибка", "error"); }
  };

  const handleDeleteProgram = async (id: string) => {
    const p = programs.find(x => x.id === id);
    if (!p) return;
    if (!window.confirm(`Удалить программу ${p.title?.RU}?`)) return;
    try {
      await deleteDoc(doc(db, "programs", id));
      logAction("Program Delete", `Удалена программа: ${p.title?.RU}`, { type: 'program', ...p });
      showToast("Программа удалена");
    } catch (e) { showToast("Ошибка", "error"); }
  };

  const handleDeleteGallery = async (id: string) => {
    const item = gallery.find(x => x.id === id);
    if (!item) return;
    try {
      await deleteDoc(doc(db, "gallery", id));
      logAction("Gallery Delete", `Удалено фото из галереи`, { type: 'gallery', ...item });
      showToast("Фото удалено");
    } catch (e) { showToast("Ошибка", "error"); }
  };

  const handleRestore = async (log: any) => {
    if (!log.data) return;
    const data = JSON.parse(log.data);
    setLoading(true);
    try {
      if (data.type === 'news') {
        const { id, type, ...rest } = data;
        await addDoc(collection(db, "news"), {
          ...rest,
          timestamp: serverTimestamp(),
          date: new Date().toLocaleDateString()
        });
        showToast("Новость восстановлена");
        logAction("Restore", `Восстановлена новость: ${rest.title?.RU || 'Untitled'}`);
      } else if (data.type === 'partner') {
        const { id, type, ...rest } = data;
        await addDoc(collection(db, "partners"), rest);
        showToast("Партнер восстановлен");
        logAction("Restore", `Восстановлен партнер: ${rest.name}`);
      } else if (data.type === 'program') {
        const { id, type, ...rest } = data;
        await addDoc(collection(db, "programs"), rest);
        showToast("Программа восстановлена");
        logAction("Restore", `Восстановлена программа: ${rest.title?.RU}`);
      } else if (data.type === 'gallery') {
        const { id, type, ...rest } = data;
        await addDoc(collection(db, "gallery"), rest);
        showToast("Фото восстановлено");
        logAction("Restore", `Восстановлено фото в галерее`);
      }
    } catch (e) {
      console.error("Restore error:", e);
      showToast("Ошибка восстановления", "error");
    } finally {
      setLoading(false);
    }
  };

  const editProgram = (p: Program) => {
    setEditingProgramId(p.id);
    setProgramForm({
      level: Array.isArray(p.level) ? p.level : [p.level as any],
      title: p.title || { RU: '', BG: '', RO: '', EN: '' },
      duration: p.duration || { RU: '', BG: '', RO: '', EN: '' },
      language: p.language || 'Български / Руски',
      form: p.form || { RU: 'Очная', BG: 'Редовна', RO: 'Full-time', EN: 'Full-time' }
    });
  };

  const toggleLevel = (lvl: string) => {
    const currentLevels = Array.isArray(programForm.level) ? programForm.level : [];
    if (currentLevels.includes(lvl as any)) {
      setProgramForm({...programForm, level: currentLevels.filter(l => l !== lvl) as any});
    } else {
      setProgramForm({...programForm, level: [...currentLevels, lvl] as any});
    }
  };

  // NAVIGATION
  const addTopLevelNav = () => {
    const newItem: NavLink = { id: Date.now().toString(), label: { BG: 'Нов раздел', RU: 'Новый раздел', RO: 'Secțiune nouă', EN: 'New Section' } as any, path: '', children: [] };
    setNavItems([...navItems, newItem]);
  };
  const addSubNav = (parentId: string) => {
    setNavItems(navItems.map(item => item.id === parentId ? { ...item, children: [...(item.children || []), { id: Date.now().toString(), label: { RU: 'Подпункт' } as any, path: '' }] } : item));
  };
  const deleteNav = (id: string) => setNavItems(navItems.filter(item => item.id !== id));
  const moveTopNav = (idx: number, direction: number) => {
    const updated = [...navItems];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    [updated[idx], updated[targetIdx]] = [updated[targetIdx], updated[idx]];
    setNavItems(updated);
  };
  const moveSubNav = (pIdx: number, cIdx: number, dir: number) => {
    const updated = [...navItems];
    const children = [...(updated[pIdx].children || [])];
    const targetIdx = cIdx + dir;
    if (targetIdx < 0 || targetIdx >= children.length) return;
    [children[cIdx], children[targetIdx]] = [children[targetIdx], children[cIdx]];
    updated[pIdx].children = children;
    setNavItems(updated);
  };
  const handleSaveNav = async () => {
    setLoading(true);
    try { 
      await updateNav(navItems); 
      logAction("Nav Update", "Обновлена навигация сайта");
      showToast("Навигация сохранена"); 
    } finally { setLoading(false); }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#001a33] flex items-center justify-center p-6">
        <form onSubmit={(e) => { e.preventDefault(); signInWithEmailAndPassword(auth, (e.target as any).email.value, (e.target as any).pass.value); }} className="bg-white p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md space-y-6">
          <h2 className="text-3xl font-bold text-[#003366] text-center serif italic">Admin Access</h2>
          <input name="email" type="email" placeholder="Email" className="w-full p-4 bg-slate-50 rounded-2xl border outline-none" />
          <input name="pass" type="password" placeholder="Password" className="w-full p-4 bg-slate-50 rounded-2xl border outline-none" />
          <button className="w-full bg-[#003366] text-white py-5 rounded-2xl font-black uppercase tracking-widest">Войти</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row font-sans relative">
      {/* Sidebar */}
      <aside className="lg:w-64 w-full bg-[#001a33] text-white p-2 lg:p-6 flex flex-row lg:flex-col sticky top-0 h-auto lg:h-screen z-[100] shadow-2xl lg:overflow-y-auto no-scrollbar gap-1 lg:gap-4 items-center lg:items-stretch flex-shrink-0">
        <div className="flex items-center gap-2 mb-0 lg:mb-10 shrink-0 px-2">
          <div className="w-6 h-6 lg:w-8 lg:h-8 bg-[#FFCC00] rounded-lg flex items-center justify-center text-[#003366]">
            <Settings size={14} />
          </div>
          <span className="font-black uppercase tracking-tighter text-[8px] lg:text-[10px] hidden xs:block">ADMIN</span>
        </div>
        <nav className="flex flex-row lg:flex-col gap-1 shrink-0 lg:shrink w-full overflow-x-auto lg:overflow-x-visible no-scrollbar py-1">
          {Object.keys(TAB_INFO).map(tabId => {
            const Icon = TAB_INFO[tabId].icon;
            const isActive = activeTab === tabId;
            return (
              <button 
                key={tabId} 
                onClick={() => { setActiveTab(tabId); setEditingPage(null); setShowNewsModal(false); setIsDeleting(false); }} 
                className={`flex items-center gap-2 lg:gap-4 px-3 lg:px-5 py-2 lg:py-4 rounded-lg lg:rounded-xl font-black text-[8px] lg:text-[10px] uppercase tracking-widest transition-all whitespace-nowrap lg:w-full ${isActive ? 'bg-[#FFCC00] text-[#003366] shadow-lg' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
              >
                <Icon size={14} /> 
                <span className="hidden sm:inline">{TAB_INFO[tabId].label}</span>
              </button>
            );
          })}
        </nav>
        <button onClick={() => signOut(auth)} className="ml-auto lg:ml-0 lg:mt-auto py-2 text-red-400 font-black text-[8px] uppercase tracking-widest flex items-center gap-1 px-2">
          <LogOut size={12} /> <span className="hidden xs:inline">ВЫХОД</span>
        </button>
      </aside>

      <main className="flex-grow p-4 lg:p-12 overflow-y-auto">
        {errorMsg && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 animate-fadeIn">⚠️ {errorMsg}</div>}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
           <div className="flex flex-col max-w-full overflow-hidden">
             <h1 className="text-4xl lg:text-6xl font-black text-[#003366] serif italic leading-tight truncate">{TAB_INFO[activeTab].label}</h1>
             {tgSettings.autoSync && tgSettings.botToken && (
               <span className="text-[10px] font-black uppercase text-green-500 tracking-widest mt-2 flex items-center gap-2">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                 Авто-синхронизация активна ({tgSettings.syncInterval} мин)
               </span>
             )}
           </div>
        </header>

        {activeTab === 'dash' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
            {[
              { l: 'НОВОСТИ', v: news.length, c: 'text-blue-600', bg: 'bg-blue-50', icon: Newspaper },
              { l: 'ЗАЯВКИ', v: apps.length, c: 'text-amber-600', bg: 'bg-amber-50', icon: Inbox },
              { l: 'ПРОГРАММЫ', v: programs.length, c: 'text-indigo-600', bg: 'bg-indigo-50', icon: GraduationCap },
              { l: 'ПАРТНЕРЫ', v: partners.length, c: 'text-emerald-600', bg: 'bg-emerald-50', icon: Handshake }
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.l} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-xl transition-all">
                  <div className={`absolute top-0 right-0 w-24 h-24 ${s.bg} rounded-bl-[4rem] flex items-center justify-center translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform`}>
                    <Icon size={32} className={`${s.c} opacity-20`} />
                  </div>
                  <span className="text-[10px] font-black text-slate-300 block mb-4 tracking-[0.2em] uppercase">{s.l}</span>
                  <div className={`text-5xl font-black ${s.c} serif italic`}>{s.v}</div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'partners' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white p-8 rounded-3xl border grid grid-cols-1 md:grid-cols-2 gap-6 shadow-xl border-slate-100">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Название партнера</label>
                <input placeholder="Напр: Erasmus+" className="w-full p-4 bg-slate-50 rounded-xl outline-none" value={partnerForm.name} onChange={e=>setPartnerForm({...partnerForm, name:e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Логотип партнера</label>
                <div className="flex gap-2">
                  <input placeholder="https://..." className="flex-grow p-4 bg-slate-50 rounded-xl outline-none" value={partnerForm.logo} onChange={e=>setPartnerForm({...partnerForm, logo:e.target.value})} />
                  <label className="cursor-pointer bg-blue-50 text-blue-600 p-4 rounded-xl hover:bg-blue-100 transition-colors">
                    <ImageIcon size={20} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'partners')} />
                  </label>
                </div>
              </div>
              <button onClick={handleSavePartner} disabled={loading} className="bg-[#003366] text-white py-5 rounded-2xl col-span-1 md:col-span-2 font-black uppercase text-[10px] tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all">
                {loading ? '...' : 'ДОБАВИТЬ ПАРТНЕРА'}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {partners.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 text-center relative group shadow-sm">
                  <button onClick={() => handleDeletePartner(p.id)} className="absolute top-4 right-4 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  <img src={p.logo} className="h-10 mx-auto mb-4 grayscale group-hover:grayscale-0 transition-all object-contain" />
                  <p className="text-[10px] font-black uppercase text-[#003366]">{p.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pages' && (
          <div className="space-y-8 animate-fadeIn">
            {!editingPage ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button onClick={() => setEditingPage({ id: Date.now().toString(), slug: '', title: { RU: 'Новая страница' } as any, blocks: [], isPublished: true })} className="bg-white border-2 border-dashed border-slate-200 p-10 rounded-3xl text-slate-300 font-black hover:border-[#FFCC00] hover:text-[#FFCC00] transition-all">
                  + НОВАЯ СТРАНИЦА
                </button>
                {(data.pages || []).map(p => (
                  <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
                    <div>
                      <h4 className="font-bold text-xl mb-4 serif italic text-[#003366]">{p.title?.RU}</h4>
                      <p className="text-[10px] font-mono text-slate-400">/{p.slug}</p>
                    </div>
                    <div className="flex gap-2 mt-8">
                      <button onClick={() => setEditingPage({...p})} className="flex-grow bg-[#003366] text-white px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest">ИЗМЕНИТЬ</button>
                      <button onClick={() => deletePage(p.id)} className="bg-red-50 text-red-400 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all">🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 lg:p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 space-y-10">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Название страницы (RU)</label>
                      <input placeholder="Напр: Документы" className="w-full p-6 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#FFCC00]" value={editingPage.title?.RU} onChange={e=> {
                        const title = e.target.value;
                        const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                        setEditingPage({...editingPage, title: { ...(editingPage.title || {}), RU: title } as any, slug: editingPage.slug || slug });
                      }} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Slug (URL путь)</label>
                      <input placeholder="documents" className="w-full p-6 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#FFCC00]" value={editingPage.slug} onChange={e=>setEditingPage({...editingPage, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} />
                    </div>
                 </div>
                 
                 <div className="flex flex-wrap gap-3 pt-8 border-t border-slate-100">
                    {(['hero','text','image-text','cta','programs','gallery','stats','person-grid','service-grid','contact-card'] as BlockType[]).map(t=>(<button key={t} onClick={()=>addBlock(t)} className="bg-[#003366] text-white px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-[#FFCC00] transition-colors">+ {t}</button>))}
                 </div>

                 <div className="space-y-8">
                    {editingPage.blocks.map((b, bIdx)=>(
                      <div key={b.id} className="p-10 bg-slate-50 rounded-[2.5rem] relative border border-slate-100 shadow-inner group">
                         <div className="absolute top-6 right-6 flex gap-2">
                            <button onClick={() => {
                              const newBlocks = [...editingPage.blocks];
                              [newBlocks[bIdx], newBlocks[bIdx-1]] = [newBlocks[bIdx-1], newBlocks[bIdx]];
                              setEditingPage({...editingPage, blocks: newBlocks});
                            }} disabled={bIdx === 0} className="text-slate-300 hover:text-[#003366] disabled:opacity-0">↑</button>
                            <button onClick={() => setEditingPage({...editingPage, blocks: editingPage.blocks.filter(block => block.id !== b.id)})} className="text-red-300 hover:text-red-500">✕ Удалить</button>
                         </div>
                         <span className="text-[10px] font-black uppercase text-slate-300 mb-6 block tracking-widest">Блок: {b.type}</span>
                         
                         <div className="space-y-4">
                           {b.type !== 'programs' && (
                              <div className="grid grid-cols-1 gap-4">
                                <input placeholder="Заголовок (RU)" className="w-full bg-white p-4 rounded-xl font-bold border-none outline-none shadow-sm" value={b.data.title?.RU || ''} onChange={e=>updateBlock(b.id, 'title', e.target.value)} />
                                <textarea placeholder="Текст/Контент (HTML поддерживается)" className="w-full bg-white p-4 rounded-xl min-h-[120px] border-none outline-none shadow-sm" value={b.data.content?.RU || ''} onChange={e=>updateBlock(b.id, 'content', e.target.value)} />
                              </div>
                           )}
                           {['hero','image-text'].includes(b.type) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input placeholder="URL изображения" className="w-full bg-white p-4 rounded-xl border-none outline-none shadow-sm" value={b.data.image || ''} onChange={e=>updateBlock(b.id, 'image', e.target.value)} />
                                {b.data.image && <img src={b.data.image} className="h-20 w-auto rounded-xl object-cover" />}
                              </div>
                           )}
                           {b.type === 'cta' && (
                              <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Текст кнопки" className="bg-white p-4 rounded-xl" value={b.data.buttonText?.RU || ''} onChange={e=>updateBlock(b.id, 'buttonText', e.target.value)} />
                                <input placeholder="Ссылка (URL)" className="bg-white p-4 rounded-xl" value={b.data.link || ''} onChange={e=>updateBlock(b.id, 'link', e.target.value)} />
                              </div>
                           )}
                           {b.type === 'gallery' && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-4 gap-2">
                                  {b.data.images?.map((img: string, idx: number) => (
                                    <div key={idx} className="relative group/img">
                                      <img src={img} className="h-20 w-full object-cover rounded-lg" />
                                      <button onClick={() => {
                                        const newImgs = b.data.images.filter((_: any, i: number) => i !== idx);
                                        updateBlock(b.id, 'images', newImgs, true);
                                      }} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover/img:opacity-100">✕</button>
                                    </div>
                                  ))}
                                </div>
                                <input 
                                  placeholder="Добавить URL изображения (Enter)" 
                                  className="w-full bg-white p-4 rounded-xl" 
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      const val = e.currentTarget.value;
                                      if (val) {
                                        updateBlock(b.id, 'images', [...(b.data.images || []), val], true);
                                        e.currentTarget.value = '';
                                      }
                                    }
                                  }}
                                />
                              </div>
                           )}
                           {b.type === 'stats' && (
                              <div className="space-y-4">
                                {(b.data.stats || []).map((s: any, idx: number) => (
                                  <div key={idx} className="grid grid-cols-3 gap-2 bg-white p-4 rounded-xl shadow-sm">
                                    <input placeholder="Значение (напр: 27K)" className="p-2 border rounded" value={s.value} onChange={e => {
                                      const newStats = [...b.data.stats];
                                      newStats[idx].value = e.target.value;
                                      updateBlock(b.id, 'stats', newStats, true);
                                    }} />
                                    <input placeholder="Подпись (RU)" className="p-2 border rounded" value={s.label?.RU} onChange={e => {
                                      const newStats = [...b.data.stats];
                                      newStats[idx].label = { ...newStats[idx].label, RU: e.target.value };
                                      updateBlock(b.id, 'stats', newStats, true);
                                    }} />
                                    <button onClick={() => updateBlock(b.id, 'stats', b.data.stats.filter((_: any, i: number) => i !== idx), true)} className="text-red-500">Удалить</button>
                                  </div>
                                ))}
                                <button onClick={() => updateBlock(b.id, 'stats', [...(b.data.stats || []), { value: '0', label: { RU: '' } }], true)} className="text-xs font-bold text-blue-500">+ Добавить показатель</button>
                              </div>
                           )}
                           {b.type === 'person-grid' && (
                              <div className="space-y-4">
                                {(b.data.people || []).map((p: any, idx: number) => (
                                  <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <input placeholder="Имя Фамилия" className="p-2 border rounded" value={p.name} onChange={e => {
                                        const newPeople = [...b.data.people];
                                        newPeople[idx].name = e.target.value;
                                        updateBlock(b.id, 'people', newPeople, true);
                                      }} />
                                      <input placeholder="Должность (RU)" className="p-2 border rounded" value={p.role?.RU} onChange={e => {
                                        const newPeople = [...b.data.people];
                                        newPeople[idx].role = { ...newPeople[idx].role, RU: e.target.value };
                                        updateBlock(b.id, 'people', newPeople, true);
                                      }} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <input placeholder="Email" className="p-2 border rounded" value={p.email} onChange={e => {
                                        const newPeople = [...b.data.people];
                                        newPeople[idx].email = e.target.value;
                                        updateBlock(b.id, 'people', newPeople, true);
                                      }} />
                                      <input placeholder="URL фото" className="p-2 border rounded" value={p.image} onChange={e => {
                                        const newPeople = [...b.data.people];
                                        newPeople[idx].image = e.target.value;
                                        updateBlock(b.id, 'people', newPeople, true);
                                      }} />
                                    </div>
                                    <button onClick={() => updateBlock(b.id, 'people', b.data.people.filter((_: any, i: number) => i !== idx), true)} className="text-red-500 text-xs">Удалить сотрудника</button>
                                  </div>
                                ))}
                                <button onClick={() => updateBlock(b.id, 'people', [...(b.data.people || []), { name: '', role: { RU: '' }, email: '', image: '' }], true)} className="text-xs font-bold text-blue-500">+ Добавить сотрудника</button>
                              </div>
                           )}
                           {b.type === 'service-grid' && (
                              <div className="space-y-4">
                                {(b.data.services || []).map((s: any, idx: number) => (
                                  <div key={idx} className="bg-white p-4 rounded-xl shadow-sm space-y-2">
                                    <input placeholder="Заголовок услуги (RU)" className="w-full p-2 border rounded font-bold" value={s.title?.RU} onChange={e => {
                                      const newServices = [...b.data.services];
                                      newServices[idx].title = { ...newServices[idx].title, RU: e.target.value };
                                      updateBlock(b.id, 'services', newServices, true);
                                    }} />
                                    <textarea placeholder="Описание услуги (RU)" className="w-full p-2 border rounded text-sm" value={s.desc?.RU} onChange={e => {
                                      const newServices = [...b.data.services];
                                      newServices[idx].desc = { ...newServices[idx].desc, RU: e.target.value };
                                      updateBlock(b.id, 'services', newServices, true);
                                    }} />
                                    <button onClick={() => updateBlock(b.id, 'services', b.data.services.filter((_: any, i: number) => i !== idx), true)} className="text-red-500 text-xs">Удалить услугу</button>
                                  </div>
                                ))}
                                <button onClick={() => updateBlock(b.id, 'services', [...(b.data.services || []), { title: { RU: '' }, desc: { RU: '' } }], true)} className="text-xs font-bold text-blue-500">+ Добавить услугу</button>
                              </div>
                           )}
                           {b.type === 'contact-card' && (
                              <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Email" className="bg-white p-4 rounded-xl" value={b.data.email || ''} onChange={e=>updateBlock(b.id, 'email', e.target.value, true)} />
                                <input placeholder="Часы работы" className="bg-white p-4 rounded-xl" value={b.data.hours || ''} onChange={e=>updateBlock(b.id, 'hours', e.target.value, true)} />
                              </div>
                           )}
                         </div>
                      </div>
                    ))}
                 </div>

                 <div className="flex gap-4 pt-10 border-t border-slate-100">
                   <button onClick={handleSavePage} disabled={loading} className="flex-grow bg-[#FFCC00] text-[#003366] py-6 rounded-3xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:scale-[1.02] transition-all">
                     {loading ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ СТРАНИЦУ'}
                   </button>
                   <button onClick={() => setEditingPage(null)} className="px-12 bg-slate-100 py-6 rounded-3xl font-black uppercase text-[11px] text-slate-400 hover:bg-slate-200">ОТМЕНА</button>
                 </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'news' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <button 
                onClick={() => {
                  setEditingNewsId(null);
                  setNewsForm({ titleRU: '', contentRU: '', category: 'academic', images: [] });
                  setShowNewsModal(true);
                }} 
                className="bg-[#FFCC00] text-[#003366] px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <Plus size={16} /> СОЗДАТЬ НОВОСТЬ
              </button>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl text-[9px] font-bold text-amber-700">
                  <AlertCircle size={12} />
                  <span>Внимание: ссылки на фото из Telegram временные и могут устареть.</span>
                </div>
                <button onClick={() => setShowTgModal(true)} className="flex-grow sm:flex-grow-0 bg-white border border-slate-200 text-[#003366] px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm flex items-center justify-center gap-2">
                  <Settings size={14} /> TG
                </button>
                <button onClick={() => syncTelegram()} disabled={syncLoading} className="flex-grow sm:flex-grow-0 bg-[#003366] text-white px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  <RefreshCw size={14} className={syncLoading ? 'animate-spin' : ''} />
                  {syncLoading ? '...' : 'SYNC'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {news.map(n => (
                <div key={n.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col relative">
                  <div className="aspect-video relative overflow-hidden">
                    <img src={n.images?.[0] || n.image || 'https://images.unsplash.com/photo-1523050853064-dbad350c74ee'} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    
                    {/* Direct Delete Button on Card */}
                    <button 
                      type="button"
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        if (window.confirm("Удалить эту новость?")) {
                          handleDeleteNews(n.id); 
                        }
                      }} 
                      className="absolute top-3 right-3 bg-red-500 text-white p-2.5 rounded-xl shadow-lg z-30 hover:bg-red-600 active:scale-90 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[7px] font-black text-[#003366] uppercase tracking-widest border border-slate-100">
                      {n.category}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 text-[8px] font-bold text-slate-300 uppercase tracking-widest mb-2">
                      <Clock size={10} /> {n.date}
                    </div>
                    <h4 className="font-bold text-xs text-[#003366] serif italic line-clamp-2 mb-4 flex-grow leading-relaxed">{n.title?.RU}</h4>
                    <button 
                      onClick={() => { 
                        setEditingNewsId(n.id); 
                        setNewsForm({titleRU:n.title.RU, contentRU:n.fullContent?.RU, category:n.category, images: n.images || [n.image]}); 
                        setShowNewsModal(true);
                      }} 
                      className="w-full bg-slate-50 text-[#003366] py-3 rounded-xl font-black text-[8px] uppercase tracking-widest hover:bg-[#FFCC00] transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 size={10} /> ИЗМЕНИТЬ
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* News Form Modal */}
            {showNewsModal && (
              <div className="fixed inset-0 z-[1100] flex items-center justify-center p-0 sm:p-6 backdrop-blur-xl bg-[#000d1a]/80 animate-fadeIn">
                <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col relative">
                  <div className="p-8 border-b border-slate-50 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-2xl font-bold text-[#003366] serif italic">
                      {editingNewsId ? 'Редактировать новость' : 'Создать новость'}
                    </h3>
                    <button onClick={() => setShowNewsModal(false)} className="bg-slate-50 p-3 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="p-8 overflow-y-auto space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Заголовок (RU)</label>
                      <input 
                        placeholder="Введите заголовок..." 
                        className="w-full p-6 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#FFCC00] font-bold text-lg" 
                        value={newsForm.titleRU} 
                        onChange={e => setNewsForm({...newsForm, titleRU: e.target.value})} 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Изображения</label>
                        <div className="flex gap-2">
                          <input 
                            placeholder="https://..." 
                            className="flex-grow p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#FFCC00] text-sm" 
                            value={newImageUrl} 
                            onChange={e => setNewImageUrl(e.target.value)} 
                          />
                          <label className={`cursor-pointer px-4 flex items-center justify-center rounded-xl transition-all ${uploading ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                            {uploading ? <RefreshCw size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'news')} disabled={uploading} />
                          </label>
                          <button 
                            onClick={() => { if (newImageUrl) { setNewsForm({...newsForm, images: [...newsForm.images, newImageUrl]}); setNewImageUrl(''); } }} 
                            className="bg-[#003366] text-white px-6 rounded-xl hover:bg-[#FFCC00] hover:text-[#003366] transition-all"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {newsForm.images.map((img, i) => (
                            <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                              <img src={img} className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setNewsForm({...newsForm, images: newsForm.images.filter((_, idx) => idx !== i)});
                                }} 
                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all z-30"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                          {newsForm.images.length === 0 && (
                            <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-200 gap-2">
                              <ImageIcon size={24} />
                              <span className="text-[8px] font-black uppercase">Нет фото</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Категория</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                           { id: 'academic', label: 'Академические' },
                            { id: 'event', label: 'События' },
                            { id: 'international', label: 'Международные' },
                            { id: 'admission', label: 'Прием' },
                            { id: 'culture', label: 'Культура' },
                            { id: 'sports', label: 'Спорт' },
                            { id: 'announcement', label: 'Объявление' },
                            { id: 'student-life', label: 'Студ. жизнь' } 
                          ].map(cat => (
                            <button 
                              key={cat.id} 
                              type="button"
                              onClick={() => setNewsForm({...newsForm, category: cat.id})}
                              className={`p-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border ${newsForm.category === cat.id ? 'bg-[#003366] text-white border-[#003366] shadow-lg' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'}`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Текст новости (RU)</label>
                      <textarea 
                        placeholder="Напишите содержание новости..." 
                        className="w-full p-6 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#FFCC00] min-h-[300px] leading-relaxed text-slate-600" 
                        value={newsForm.contentRU} 
                        onChange={e => setNewsForm({...newsForm, contentRU: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex flex-wrap gap-4">
                    {!isDeleting ? (
                      <>
                        <button 
                          onClick={handleSaveNews} 
                          disabled={loading} 
                          className="flex-grow bg-[#003366] text-white py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:bg-[#FFCC00] hover:text-[#003366] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                          {loading ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                          {loading ? 'СОХРАНЕНИЕ...' : (editingNewsId ? 'ОБНОВИТЬ НОВОСТЬ' : 'ОПУБЛИКОВАТЬ НОВОСТЬ')}
                        </button>

                        {editingNewsId && (
                          <button 
                            type="button"
                            onClick={() => setIsDeleting(true)}
                            className="px-10 bg-red-50 text-red-500 border border-red-100 py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                            <Trash2 size={18} /> УДАЛИТЬ
                          </button>
                        )}

                        <button 
                          onClick={() => setShowNewsModal(false)} 
                          className="px-10 bg-white border border-slate-200 text-slate-400 py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-50 transition-all"
                        >
                          ОТМЕНА
                        </button>
                      </>
                    ) : (
                      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6 p-4 bg-red-50 rounded-[2rem] border border-red-100 animate-fadeIn">
                        <div className="flex items-center gap-4 text-red-600">
                          <AlertCircle size={24} />
                          <span className="font-bold text-sm uppercase tracking-tight">Вы уверены, что хотите удалить эту новость?</span>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                          <button 
                            onClick={() => handleDeleteNews(editingNewsId!)}
                            disabled={loading}
                            className="flex-grow sm:flex-grow-0 bg-red-600 text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-red-700 transition-all"
                          >
                            ДА, УДАЛИТЬ
                          </button>
                          <button 
                            onClick={() => setIsDeleting(false)}
                            className="flex-grow sm:flex-grow-0 bg-white text-slate-400 px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all"
                          >
                            ОТМЕНА
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'programs' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Название специальности (RU)</label>
                  <input placeholder="Бизнес и менеджмент" className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#FFCC00]" value={programForm.title?.RU || ''} onChange={e => setProgramForm({...programForm, title: {...(programForm.title as any), RU: e.target.value}})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Срок обучения (RU) - только цифра</label>
                  <input placeholder="4" className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#FFCC00]" value={programForm.duration?.RU || ''} onChange={e => setProgramForm({...programForm, duration: {...(programForm.duration as any), RU: e.target.value}})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">Уровни образования</label>
                <div className="flex flex-wrap gap-2">
                  {['college', 'bachelor', 'master', 'doctor'].map(lvl => (
                    <button key={lvl} onClick={() => toggleLevel(lvl)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase ${Array.isArray(programForm.level) && programForm.level.includes(lvl as any) ? 'bg-[#003366] text-white' : 'bg-slate-50 text-slate-400'}`}>
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-end gap-4">
                <button onClick={handleSaveProgram} disabled={loading} className="flex-grow bg-[#003366] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all">
                  {loading ? '...' : editingProgramId ? 'ОБНОВИТЬ СПЕЦИАЛЬНОСТЬ' : 'СОХРАНИТЬ СПЕЦИАЛЬНОСТЬ'}
                </button>
                {editingProgramId && <button onClick={() => { setEditingProgramId(null); setProgramForm(initialProgramForm); }} className="px-6 py-4 bg-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">Отмена</button>}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                    <tr><th className="p-6">СПЕЦИАЛЬНОСТЬ</th><th className="p-6">УРОВНИ</th><th className="p-6">СРОК</th><th className="p-6 text-right">ДЕЙСТВИЯ</th></tr>
                  </thead>
                  <tbody>
                    {programs.map((p) => (
                      <tr key={p.id} className="border-b text-sm group hover:bg-slate-50/50 transition-colors">
                        <td className="p-6"><div className="font-bold text-[#003366]">{p.title?.RU}</div></td>
                        <td className="p-6">
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(p.level) ? p.level : [p.level]).map(l => (
                              <span key={l} className="text-[8px] font-black bg-[#003366]/5 text-[#003366] px-2 py-0.5 rounded uppercase">{l}</span>
                            ))}
                          </div>
                        </td>
                        <td className="p-6 text-slate-500 font-medium">{p.duration?.RU}</td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-3">
                            <button onClick={() => editProgram(p)} className="text-blue-500 font-black text-[10px] uppercase">Edit</button>
                            <button onClick={() => handleDeleteProgram(p.id)} className="text-red-300 font-black text-[10px] uppercase">Del</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'apps' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 gap-4">
              {apps.map(a => (
                <div key={a.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#003366] font-black text-lg">
                      {a.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#003366]">{a.name}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Send size={10} /> {a.email}</span>
                        <span className="flex items-center gap-1">📞 {a.phone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                    <span className="bg-[#003366]/5 text-[#003366] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-[#003366]/10">
                      {a.program}
                    </span>
                    <select 
                      className={`p-2 rounded-xl text-[10px] font-black border-none outline-none cursor-pointer transition-colors ${
                        a.status === 'new' ? 'bg-amber-100 text-amber-800' : 
                        a.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 
                        'bg-red-100 text-red-800'
                      }`} 
                      value={a.status} 
                      onChange={e => {
                        updateDoc(doc(db, "applications", a.id), {status: e.target.value});
                        showToast("Статус обновлен");
                      }}
                    >
                      <option value="new">НОВАЯ ЗАЯВКА</option>
                      <option value="accepted">ПРИНЯТА</option>
                      <option value="rejected">ОТКЛОНЕНА</option>
                    </select>
                  </div>
                </div>
              ))}
              {apps.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                   <p className="text-slate-300 text-xs font-black uppercase tracking-widest">Нет активных заявок</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'nav' && (
          <div className="space-y-8 animate-fadeIn">
            <button onClick={addTopLevelNav} className="bg-[#003366] text-white px-8 py-4 rounded-full font-black text-[10px] uppercase">+ ДОБАВИТЬ РАЗДЕЛ</button>
            <div className="space-y-6">
              {navItems.map((item, idx) => (
                <div key={item.id} className="bg-white p-8 rounded-3xl border shadow-sm">
                  <div className="flex gap-4 items-end">
                    <div className="flex flex-col gap-1 mr-2">
                      <button onClick={() => moveTopNav(idx, -1)} disabled={idx === 0} className="p-2 bg-slate-50 rounded text-xs">▲</button>
                      <button onClick={() => moveTopNav(idx, 1)} disabled={idx === navItems.length - 1} className="p-2 bg-slate-50 rounded text-xs">▼</button>
                    </div>
                    <div className="flex-grow">
                      <input className="w-full text-2xl font-bold text-[#003366] serif italic bg-slate-50 p-4 rounded-xl" value={item.label?.RU || ''} onChange={e => { const updated = [...navItems]; updated[idx].label = {...(updated[idx].label || {}), RU: e.target.value} as any; setNavItems(updated); }} />
                    </div>
                    <input className="w-48 p-4 bg-slate-50 rounded-xl text-xs font-mono" placeholder="/url" value={item.path} onChange={e => { const updated = [...navItems]; updated[idx].path = e.target.value; setNavItems(updated); }} />
                    <button onClick={() => addSubNav(item.id)} className="bg-blue-50 text-blue-600 px-6 py-4 rounded-xl font-black text-[10px] uppercase">+ ПОДПУНКТ</button>
                    <button onClick={() => deleteNav(item.id)} className="bg-red-50 text-red-300 p-4 rounded-xl">🗑</button>
                  </div>
                  {item.children?.map((child, cIdx) => (
                    <div key={child.id} className="ml-10 mt-4 flex gap-4 bg-slate-50 p-4 rounded-xl items-center">
                      <div className="flex flex-col gap-1">
                        <button onClick={() => moveSubNav(idx, cIdx, -1)} disabled={cIdx === 0} className="p-1 bg-white rounded text-[10px]">▲</button>
                        <button onClick={() => moveSubNav(idx, cIdx, 1)} disabled={cIdx === (item.children?.length || 0) - 1} className="p-1 bg-white rounded text-[10px]">▼</button>
                      </div>
                      <input className="bg-transparent border-none font-bold text-[#003366] flex-grow outline-none" value={child.label?.RU || ''} onChange={e => { const updated = [...navItems]; updated[idx].children![cIdx].label = {...(updated[idx].children![cIdx].label || {}), RU: e.target.value} as any; setNavItems(updated); }} />
                      <input className="bg-transparent border-none text-xs text-slate-400 w-32 outline-none text-right" value={child.path} onChange={e => { const updated = [...navItems]; updated[idx].children![cIdx].path = e.target.value; setNavItems(updated); }} />
                      <button onClick={() => { const updated = [...navItems]; updated[idx].children = updated[idx].children!.filter(c => c.id !== child.id); setNavItems(updated); }} className="text-red-300 ml-2">✕</button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <button onClick={handleSaveNav} className="w-full bg-[#FFCC00] text-[#003366] py-8 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl">СОХРАНИТЬ ВСЮ НАВИГАЦИЮ</button>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-xl font-black text-[#003366] uppercase tracking-tighter flex items-center gap-3">
                  <History size={20} className="text-[#FFCC00]" />
                  История действий
                </h3>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Всего записей: {logs.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                    <tr>
                      <th className="p-6">ВРЕМЯ</th>
                      <th className="p-6">ПОЛЬЗОВАТЕЛЬ</th>
                      <th className="p-6">ДЕЙСТВИЕ</th>
                      <th className="p-6">ДЕТАЛИ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {logs.map((log) => (
                      <tr key={log.id} className="text-sm hover:bg-slate-50/50 transition-colors">
                        <td className="p-6 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock size={12} />
                            {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : '...'}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2 font-bold text-[#003366]">
                            <User size={12} className="text-slate-300" />
                            {log.user}
                          </div>
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            log.action.includes('Delete') ? 'bg-red-50 text-red-500' : 
                            log.action.includes('Create') ? 'bg-green-50 text-green-500' : 
                            'bg-blue-50 text-blue-500'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-6 text-slate-500 font-medium">{log.details}</td>
                        <td className="p-6 text-right">
                          {log.action.includes('Delete') && log.data && (
                            <button 
                              onClick={() => handleRestore(log)}
                              disabled={loading}
                              className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all disabled:opacity-50"
                            >
                              {loading ? '...' : 'Восстановить'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'gallery' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white p-12 rounded-[3.5rem] border-2 border-dashed border-slate-100 text-center space-y-6">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600">
                <ImageIcon size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#003366] serif italic">Загрузить в галерею</h3>
                <p className="text-slate-400 text-xs mt-2">Эти фото будут отображаться на странице AFK</p>
              </div>
              <label className="inline-block bg-[#003366] text-white px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest cursor-pointer hover:bg-[#FFCC00] hover:text-[#003366] transition-all shadow-xl">
                {uploading ? 'ЗАГРУЗКА...' : 'ВЫБРАТЬ ФОТО'}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'gallery')} disabled={uploading} />
              </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {gallery.map(item => (
                <div key={item.id} className="group relative aspect-square rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                  <img src={item.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => handleDeleteGallery(item.id)} className="bg-red-500 text-white p-3 rounded-xl hover:bg-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'system' && (
          <div className="bg-white p-24 rounded-[4rem] border text-center space-y-10 animate-fadeIn">
            <h3 className="text-3xl font-black text-[#003366] serif italic">Система</h3>
            <button onClick={() => confirm('Вы уверены? Это действие нельзя отменить.') && bootstrapDatabase()} className="bg-red-500 text-white px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-black transition-all">ВЫПОЛНИТЬ СБРОС СИСТЕМЫ</button>
          </div>
        )}
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[2000] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fadeIn backdrop-blur-md border ${toast.type === 'error' ? 'bg-red-500/90 text-white border-red-400' : 'bg-[#003366]/90 text-white border-blue-400'}`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span className="text-xs font-black uppercase tracking-widest">{toast.msg}</span>
        </div>
      )}

      {/* TELEGRAM MODAL */}
      {showTgModal && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 backdrop-blur-xl bg-[#000d1a]/80 animate-fadeIn">
          <div className="bg-white p-8 lg:p-14 rounded-[3.5rem] shadow-2xl max-w-2xl w-full relative">
            <button onClick={() => setShowTgModal(false)} className="absolute top-8 right-8 text-slate-400 text-2xl font-bold">✕</button>
            <h3 className="text-3xl font-bold mb-4 serif italic text-[#003366]">Telegram Sync Settings</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-300 ml-4">BOT TOKEN</label>
                <input placeholder="723456:AAG..." className="w-full p-6 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#0088cc]" value={tgSettings.botToken} onChange={e => setTgSettings({...tgSettings, botToken: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <input type="checkbox" id="autosync" checked={tgSettings.autoSync} onChange={e => setTgSettings({...tgSettings, autoSync: e.target.checked})} className="w-6 h-6 rounded accent-[#0088cc]" />
                   <label htmlFor="autosync" className="text-xs font-bold text-[#003366] uppercase cursor-pointer">Авто-проверка</label>
                </div>
                <div className="flex flex-col gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <label className="text-[9px] font-black uppercase text-slate-300">Интервал (мин)</label>
                   <input type="number" min="1" max="60" className="bg-transparent border-none font-bold text-[#003366] outline-none" value={tgSettings.syncInterval} onChange={e => setTgSettings({...tgSettings, syncInterval: parseInt(e.target.value) || 1})} />
                </div>
              </div>
            </div>
            <button onClick={async () => { await saveConfig({ tgSettings }); setShowTgModal(false); alert("Настройки сохранены!"); }} className="mt-8 w-full bg-[#0088cc] text-white py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl">СОХРАНИТЬ</button>
          </div>
        </div>
      )}
    </div>
  );
};
