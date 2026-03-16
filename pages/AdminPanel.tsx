
import React, { useState, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { auth, db, storage, signInWithEmailAndPassword, onAuthStateChanged, signOut } from '../firebase';
import { seedAllSchedules } from '../src/services/scheduleSeeder';
import { seedProgramDescriptions } from '../src/services/programSeeder';
import { useSiteData } from '../store/useSiteData';
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, onSnapshot, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Language, Program, AdmissionApplication, DynamicPage, NavLink, Partner, BlockType, ContentBlock } from '../types';
import { LEGAL_CONTENT } from '../constants/legalContent';
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
  User,
  Calendar,
  Coffee,
  Award,
  Download,
  Upload,
  Sparkles,
  BookOpen,
  Globe
} from 'lucide-react';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const TAB_INFO: Record<string, { label: string, icon: any }> = {
  dash: { label: 'Обзор', icon: LayoutDashboard },
  news: { label: 'Новости', icon: Newspaper },
  programs: { label: 'Программы', icon: GraduationCap },
  docs: { label: 'Документы', icon: FileText },
  apps: { label: 'Заявки', icon: Inbox },
  partners: { label: 'Спонсоры', icon: Handshake },
  academic: { label: 'Учебный процесс', icon: Calendar },
  gallery: { label: 'Галерея', icon: ImageIcon },
  pages: { label: 'Страницы', icon: FileText },
  site: { label: 'Контент', icon: Sparkles },
  nav: { label: 'Навигация', icon: LinkIcon },
  logs: { label: 'Логи', icon: History },
  security: { label: 'Безопасность', icon: Settings },
  users: { label: 'Пользователи', icon: User },
  schedules: { label: 'Расписание', icon: Clock },
  system: { label: 'Система', icon: Settings },
};

const ROLE_PERMISSIONS: Record<'admin' | 'sysadmin', string[]> = {
  admin: ['dash', 'news', 'programs', 'docs', 'apps', 'partners', 'academic', 'gallery', 'pages', 'site', 'nav', 'users', 'schedules'],
  sysadmin: ['dash', 'news', 'programs', 'docs', 'apps', 'partners', 'academic', 'gallery', 'pages', 'site', 'nav', 'logs', 'security', 'users', 'schedules', 'system'],
};

export const AdminPanel: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<'admin' | 'sysadmin'>('admin');

  const startSubscriptions = (unsubs: (() => void)[]) => {
    unsubs.push(onSnapshot(collection(db, "news"), (s) => {
      setNews(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
    }, (err) => setErrorMsg("Error News: " + err.message)));

    unsubs.push(onSnapshot(collection(db, "applications"), (s) => {
      setApps(s.docs.map(d => ({ id: d.id, ...d.data() } as AdmissionApplication)).sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
    }, (err) => setErrorMsg("Error Apps: " + err.message)));

    unsubs.push(onSnapshot(collection(db, "programs"), (s) => {
      setPrograms(s.docs.map(d => ({ id: d.id, ...d.data() } as Program)).sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
    }, (err) => setErrorMsg("Error Programs: " + err.message)));

    unsubs.push(onSnapshot(collection(db, "partners"), (s) => {
      setPartners(s.docs.map(d => ({ id: d.id, ...d.data() } as Partner)));
    }, (err) => setErrorMsg("Error Partners: " + err.message)));

    unsubs.push(onSnapshot(query(collection(db, "documents"), orderBy("timestamp", "desc")), (s) => {
      setDocsList(s.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => setErrorMsg("Error Documents: " + err.message)));

    unsubs.push(onSnapshot(query(collection(db, "academic_calendar"), orderBy("order", "asc")), (s) => {
      setCalendar(s.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => setErrorMsg("Error Calendar: " + err.message)));

    unsubs.push(onSnapshot(query(collection(db, "exam_schedule"), orderBy("timestamp", "desc")), (s) => {
      setExams(s.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => setErrorMsg("Error Exams: " + err.message)));

    unsubs.push(onSnapshot(query(collection(db, "scholarships"), orderBy("order", "asc")), (s) => {
      setScholarships(s.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => setErrorMsg("Error Scholarships: " + err.message)));

    unsubs.push(onSnapshot(collection(db, "site_content"), (s) => {
      const content: any = {};
      s.docs.forEach(d => content[d.id] = d.data());
      setSiteContent(content);
    }, (err) => setErrorMsg("Error Site Content: " + err.message)));

    unsubs.push(onSnapshot(query(collection(db, "afk_activities"), orderBy("order", "asc")), (s) => {
      setAfkActivities(s.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => setErrorMsg("Error AFK: " + err.message)));

    unsubs.push(onSnapshot(collection(db, "gallery"), (s) => {
      setGallery(s.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => setErrorMsg("Error Gallery: " + err.message)));

    unsubs.push(onSnapshot(query(collection(db, "logs"), orderBy("timestamp", "desc")), (s) => {
      setLogs(s.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => setErrorMsg("Error Logs: " + err.message)));

    unsubs.push(onSnapshot(collection(db, "admin_users"), (s) => {
      setAdminUsers(s.docs.map(d => ({ id: d.id, ...d.data() })));
    }));

    unsubs.push(onSnapshot(collection(db, "schedules"), (s) => {
      setSchedules(s.docs.map(d => ({ id: d.id, ...d.data() })));
    }));
  };
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('tab') || 'dash';
    }
    return 'dash';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (activeTab === 'dash') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', activeTab);
      }
      window.history.replaceState({}, '', url.toString());
    }
  }, [activeTab]);
  const [adminLang, setAdminLang] = useState<Language>(Language.RU);
  const { data, updatePage, deletePage, updateNav, syncNav, bootstrapDatabase, seedFirestore, saveConfig } = useSiteData();

  const [news, setNews] = useState<any[]>([]);
  const [apps, setApps] = useState<AdmissionApplication[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [docsList, setDocsList] = useState<any[]>([]);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [afkActivities, setAfkActivities] = useState<any[]>([]);
  const [siteContent, setSiteContent] = useState<Record<string, any>>({});
  const [editingSiteDoc, setEditingSiteDoc] = useState<string | null>(null);
  const [siteForm, setSiteForm] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncingFb, setSyncingFb] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Telegram Integration State
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false); // New state for delete confirmation
  const [newsForm, setNewsForm] = useState({
    title: { RU: '', BG: '', RO: '', EN: '' },
    content: { RU: '', BG: '', RO: '', EN: '' },
    category: 'academic',
    images: [] as string[],
    slug: ''
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [galleryForm, setGalleryForm] = useState({ title: { RU: '', BG: '', RO: '', EN: '' }, category: 'Университет' });
  const [docForm, setDocForm] = useState({ title: { RU: '', BG: '', RO: '', EN: '' }, url: '', storagePath: '', category: 'study-plan' as any });
  const [calendarForm, setCalendarForm] = useState({ date: '', event: { RU: '', BG: '', RO: '', EN: '' }, order: 0 });
  const [examForm, setExamForm] = useState({ discipline: { RU: '', BG: '', RO: '', EN: '' }, date: '', room: '', teacher: { RU: '', BG: '', RO: '', EN: '' } });
  const [scholarshipForm, setScholarshipForm] = useState({ title: { RU: '', BG: '', RO: '', EN: '' }, description: { RU: '', BG: '', RO: '', EN: '' }, order: 0 });
  const [afkForm, setAfkForm] = useState({ title: { RU: '', BG: '', RO: '', EN: '' }, description: { RU: '', BG: '', RO: '', EN: '' }, order: 0 });

  const [userForm, setUserForm] = useState({ uniqueId: '', email: '', password: '', role: 'admin' as 'admin' | 'sysadmin', firstName: '', lastName: '' });
  const [scheduleForm, setScheduleForm] = useState({
    group: '',
    days: [] as string[],
    startTime: '',
    endTime: '',
    subject: { RU: '', BG: '', RO: '', EN: '' },
    room: '',
    teacher: { RU: '', BG: '', RO: '', EN: '' },
    week: 'all'
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'news' | 'partners' | 'pages' | 'gallery' | 'docs' | 'programs') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const UPLOAD_SECRET = (import.meta as any).env.VITE_UPLOAD_SECRET || 'default-secret-change-me';

    if (target !== 'docs' && target !== 'programs' && !file.type.startsWith('image/')) {
      showToast("Пожалуйста, выберите изображение", "error");
      return;
    }

    if ((target === 'docs' || target === 'programs') && file.type !== 'application/pdf') {
      showToast("Пожалуйста, выберите PDF файл", "error");
      return;
    }

    setUploading(true);
    showToast("Начинаем загрузку...", "success");

    try {
      let fileToUpload: File | Blob = file;
      let finalFileName = file.name;

      if (target !== 'docs' && target !== 'programs') {
        // Try compression for images only
        try {
          console.log("Starting image compression...");
          const options = {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 1920,
            useWebWorker: false, // Disabled WebWorker as it can hang in some environments
            initialQuality: 0.8
          };

          // Add a safety timeout for compression
          const compressionPromise = imageCompression(file as File, options);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Compression timeout")), 15000)
          );

          const compressed = await Promise.race([compressionPromise, timeoutPromise]) as File;

          if (compressed) {
            fileToUpload = compressed;
            const baseName = file.name.includes('.') ? file.name.split('.').slice(0, -1).join('.') : file.name;
            finalFileName = `${baseName}.webp`;
            console.log("Compression successful:", finalFileName);
          }
        } catch (compressionError) {
          console.warn("Compression failed or timed out, uploading original file", compressionError);
          // We continue with the original file
        }
      }

      console.log("Uploading to local server...");
      const formData = new FormData();
      formData.append('file', fileToUpload, finalFileName);

      let url = '';
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'x-upload-auth': encodeURIComponent(UPLOAD_SECRET)
          },
          body: formData
        });
        if (response.ok) {
          const resData = await response.json();
          url = resData.url;
        } else {
          throw new Error("Local upload failed");
        }
      } catch (localErr) {
        console.error("Local upload failed:", localErr);
        throw localErr;
      }

      console.log("Upload complete, URL:", url);

      if (target === 'news') {
        setNewsForm(prev => ({ ...prev, images: [...prev.images, url] }));
      } else if (target === 'partners') {
        setPartnerForm(prev => ({ ...prev, logo: url }));
      } else if (target === 'docs') {
        const baseName = file.name.includes('.') ? file.name.split('.').slice(0, -1).join('.') : file.name;
        setDocForm(prev => ({ ...prev, url, storagePath: url, title: { ...prev.title, [adminLang]: prev.title[adminLang] || baseName } }));
      } else if (target === 'programs') {
        setProgramForm(prev => ({ ...prev, studyPlanUrl: url }));
      } else if (target === 'gallery') {
        await addDoc(collection(db, "gallery"), {
          url,
          title: { RU: galleryForm.title.RU || finalFileName, BG: galleryForm.title.BG || finalFileName, EN: galleryForm.title.EN || finalFileName, RO: galleryForm.title.RO || finalFileName },
          category: galleryForm.category,
          timestamp: serverTimestamp()
        });
        setGalleryForm({ title: { RU: '', BG: '', RO: '', EN: '' }, category: 'Университет' });
      }
      showToast("Файл загружен успешно");
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Ошибка при загрузке", "error");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const initialProgramForm: Partial<Program> = {
    level: ['bachelor'],
    title: { BG: '', RU: '', RO: '', EN: '' } as Record<Language, string>,
    duration: { BG: '', RU: '', RO: '', EN: '' } as Record<Language, string>,
    language: 'Български / Руски',
    form: { BG: 'Редовна', RU: 'Очная', RO: 'Full-time', EN: 'Full-time' } as Record<Language, string>,
    description: { BG: '', RU: '', RO: '', EN: '' } as Record<Language, string>,
    studyPlanUrl: '',
    slug: '',
    faculty: 'pedagogy',
    tags: []
  };
  const [programForm, setProgramForm] = useState<Partial<Program>>(initialProgramForm);

  const handleDeleteDoc = async (id: string, path?: string) => {
    if (!window.confirm("Удалить документ?")) return;
    try {
      await deleteDoc(doc(db, "documents", id));
      if (path) await deleteObject(ref(storage, path));
      showToast("Документ удален");
    } catch (e) {
      showToast("Ошибка удаления", "error");
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm("Удалить фото из галереи?")) return;
    try {
      await deleteDoc(doc(db, "gallery", id));
      showToast("Фото удалено");
    } catch (e) {
      showToast("Ошибка удаления", "error");
    }
  };

  const bootstrapLegalPages = async () => {
    if (!window.confirm("Это создаст стандартные страницы Поверителност, Бисквитки и др. Продолжить?")) return;
    try {
      const legalSlugs = ['privacy', 'cookies', 'legal', 'accessibility'];
      const batch = [];

      for (const slug of legalSlugs) {
        const content = LEGAL_CONTENT[slug as keyof typeof LEGAL_CONTENT];
        if (!content) continue;

        const newPage: DynamicPage = {
          id: `system-${slug}`,
          slug: slug,
          title: { BG: content.BG.title, RU: content.RU.title, RO: content.BG.title, EN: content.BG.title },
          blocks: [
            {
              id: `hero-${slug}`,
              type: 'hero',
              data: {
                title: { BG: content.BG.title, RU: content.RU.title, RO: content.BG.title, EN: content.BG.title },
                content: { BG: '', RU: '', RO: '', EN: '' }
              },
              style: { padding: 'py-24' }
            },
            {
              id: `text-${slug}`,
              type: 'text',
              data: {
                content: { BG: content.BG.content, RU: content.RU.content, RO: content.BG.content, EN: content.BG.content }
              },
              style: { padding: 'py-16' }
            }
          ],
          isPublished: true
        };
        batch.push(addDoc(collection(db, 'pages'), { ...newPage, timestamp: serverTimestamp() }));
      }
      await Promise.all(batch);
      showToast("Юридические страницы созданы!");
    } catch (e) {
      showToast("Ошибка при создании страниц", "error");
    }
  };

  const [editingPage, setEditingPage] = useState<DynamicPage | null>(null);
  const [navItems, setNavItems] = useState<NavLink[]>([]);
  const [partnerForm, setPartnerForm] = useState<Partial<Partner>>({
    name: '',
    logo: '',
    link: '',
    description: { RU: '', BG: '', RO: '', EN: '' }
  });
  const [navLang, setNavLang] = useState<Language>(Language.RU);
  const [globalSettings, setGlobalSettings] = useState({
    universityNameRU: '', universityNameBG: '', universityNameRO: '',
    branchLocationRU: '', branchLocationBG: '', branchLocationRO: '',
    logoUrl: ''
  });
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (data.universityName || data.branchLocation) {
      setGlobalSettings({
        universityNameRU: data.universityName?.RU || '',
        universityNameBG: data.universityName?.BG || '',
        universityNameRO: data.universityName?.RO || '',
        branchLocationRU: data.branchLocation?.RU || '',
        branchLocationBG: data.branchLocation?.BG || '',
        branchLocationRO: data.branchLocation?.RO || '',
        logoUrl: data.logoUrl || ''
      });
    }
  }, [data.universityName, data.branchLocation]);

  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const unsubAuth = onAuthStateChanged(auth, u => {
      setUser(u);

      // Clean up previous listeners if any
      unsubs.forEach(unsub => unsub());
      unsubs = [];

      if (u) {
        // Default role based on email for bootstrap
        const isSys = u.email?.toLowerCase().includes('sysadmin') ||
          u.email === 'admin@tdu-tr.md' ||
          u.email === 'ketyschool@gmail.com' ||
          u.email === 'kara_andrei@bk.ru';
        setRole(isSys ? 'sysadmin' : 'admin');

        // Security Check: Verify user exists in admin_users or is bootstrap
        // We use a try-catch pattern with the promise to avoid crashing the listener
        getDocs(query(collection(db, "admin_users"), where("email", "==", u.email)))
          .then(snap => {
            if (snap.empty && !isSys) {
              // User not in registry, sign out for security
              signOut(auth);
              showToast("Доступ запрещен: пользователь не в реестре", "error");
              return;
            }

            if (!snap.empty) {
              const userData = snap.docs[0].data();
              if (userData.role) setRole(userData.role);
            }

            startSubscriptions(unsubs);
          })
          .catch(err => {
            console.error("Registry check error:", err);
            // If we can't check the registry (permission error), 
            // we allow bootstrap users but might need to restrict others
            if (isSys) {
              startSubscriptions(unsubs);
            } else {
              signOut(auth);
              showToast("Ошибка проверки прав доступа", "error");
            }
          });
      }
    });

    return () => {
      unsubAuth();
      unsubs.forEach(unsub => unsub());
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'nav' && data.navLinks) setNavItems(JSON.parse(JSON.stringify(data.navLinks)));
  }, [activeTab]);

  const logAction = async (action: string, details: string, data?: any) => {
    try {
      const userIdentifier = user?.email || 'System';

      // Use server-side logging to bypass client-side Firestore permission issues
      fetch('/api/admin/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          details,
          data: data ? JSON.stringify(data) : null,
          userIdentifier
        })
      }).catch(e => console.warn("Log failed (silent):", e));
    } catch (e) {
      console.warn("Log error (caught):", e);
    }
  };

  const generateSlug = (text: string) => {
    const cyrillicToLatinMap: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
      'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
      'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
      'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
      'я': 'ya', 'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't'
    };

    const transliterated = text
      .toLowerCase()
      .split('')
      .map(char => cyrillicToLatinMap[char] ?? char)
      .join('');

    return transliterated
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSaveNews = async () => {
    if (!newsForm.title[adminLang]) return alert("Введите заголовок!");
    if (newsForm.images.length === 0) return alert("Добавьте хотя бы одно изображение!");

    setLoading(true);

    const slug = newsForm.slug || generateSlug(newsForm.title.RU || newsForm.title[adminLang]);
    const stripHtml = (html: any) => (typeof html === 'string' ? html.replace(/<[^>]*>?/gm, '') : '');

    const payload = {
      title: newsForm.title,
      excerpt: {
        RU: stripHtml(newsForm.content?.RU).substring(0, 150),
        BG: stripHtml(newsForm.content?.BG).substring(0, 150),
        EN: stripHtml(newsForm.content?.EN).substring(0, 150),
        RO: stripHtml(newsForm.content?.RO).substring(0, 150)
      },
      fullContent: newsForm.content,
      category: newsForm.category,
      images: newsForm.images,
      slug: slug,
      date: new Date().toLocaleDateString(),
      timestamp: serverTimestamp(),
      author: user?.email || 'Admin'
    };

    try {
      if (editingNewsId) {
        await updateDoc(doc(db, "news", editingNewsId), payload);
        logAction("News Update", `Обновлена новость: ${newsForm.title[adminLang]}`);
        showToast("Новость обновлена");
      } else {
        await addDoc(collection(db, "news"), payload);

        // 🌟 Auto-sync News images to Gallery
        if (payload.images && payload.images.length > 0) {
          const promises = payload.images.map(imgUrl => {
            return addDoc(collection(db, "gallery"), {
              title: {
                RU: newsForm.title.RU || "Новость",
                BG: newsForm.title.BG || newsForm.title.RU || "Новина",
                EN: newsForm.title.EN || newsForm.title.RU || "News",
                RO: newsForm.title.RO || newsForm.title.RU || "Știre"
              },
              category: "Новости",
              image: imgUrl,
              timestamp: serverTimestamp()
            });
          });
          await Promise.allSettled(promises);
        }

        logAction("News Create", `Создана новость: ${newsForm.title[adminLang]}`);
        showToast("Новость создана");
      }
      setEditingNewsId(null);
      setNewsForm({
        title: { RU: '', BG: '', RO: '', EN: '' },
        content: { RU: '', BG: '', RO: '', EN: '' },
        category: 'academic',
        images: [],
        slug: ''
      });
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

  const generateUniqueId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit ID
  };

  const handleSaveUser = async () => {
    const id = userForm.uniqueId || generateUniqueId();
    const virtualEmail = `${id}@tdu-tr.edu`;

    setLoading(true);
    try {
      const q = query(collection(db, "admin_users"), where("uniqueId", "==", id));
      const snap = await getDocs(q);

      if (!snap.empty) {
        // Update existing Firestore doc
        const userData = {
          uniqueId: id,
          email: virtualEmail,
          role: userForm.role,
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          timestamp: serverTimestamp()
        };
        await updateDoc(doc(db, "admin_users", snap.docs[0].id), userData);
        logAction("User Update", `Обновлен пользователь ${id}`);
        showToast(`Пользователь ${id} обновлен`);
      } else {
        // Create new user via Server API
        if (!userForm.password) {
          showToast("Для нового пользователя нужен пароль", "error");
          return;
        }

        const UPLOAD_SECRET = (import.meta as any).env.VITE_UPLOAD_SECRET || 'default-secret-change-me';
        const response = await fetch('/api/admin/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-upload-auth': encodeURIComponent(UPLOAD_SECRET)
          },
          body: JSON.stringify({
            uniqueId: id,
            password: userForm.password,
            role: userForm.role,
            firstName: userForm.firstName,
            lastName: userForm.lastName
          })
        });

        const result = await response.json();
        if (result.success) {
          logAction("User Create", `Создан новый пользователь ${id}`);
          showToast(`Пользователь ${id} создан`);
        } else {
          showToast(result.error || "Ошибка создания пользователя", "error");
          return;
        }
      }
      setUserForm({ uniqueId: '', email: '', password: '', role: 'admin', firstName: '', lastName: '' });
    } catch (e) {
      showToast("Ошибка сохранения", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    const targetUser = adminUsers.find(u => u.id === id);
    if (!targetUser) return;
    if (!window.confirm(`Удалить пользователя ${targetUser.uniqueId || targetUser.email}?`)) return;

    setLoading(true);
    try {
      const UPLOAD_SECRET = (import.meta as any).env.VITE_UPLOAD_SECRET || 'default-secret-change-me';
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-upload-auth': encodeURIComponent(UPLOAD_SECRET)
        },
        body: JSON.stringify({
          uniqueId: targetUser.uniqueId || targetUser.email.split('@')[0]
        })
      });

      const result = await response.json();
      if (result.success) {
        showToast("Пользователь удален");
      } else {
        // Fallback: just delete from Firestore if Auth deletion fails (e.g. user doesn't exist in Auth)
        await deleteDoc(doc(db, "admin_users", id));
        showToast("Пользователь удален из базы");
      }
    } catch (e) {
      console.error("Delete error:", e);
      // Fallback
      await deleteDoc(doc(db, "admin_users", id));
      showToast("Пользователь удален из базы");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncFacebook = async () => {
    setSyncingFb(true);
    try {
      const UPLOAD_SECRET = (import.meta as any).env.VITE_UPLOAD_SECRET || 'default-secret-change-me';
      const response = await fetch('/api/sync/facebook', {
        method: 'POST',
        headers: {
          'x-upload-auth': encodeURIComponent(UPLOAD_SECRET)
        }
      });
      const result = await response.json();
      if (result.success) {
        showToast(`Синхронизация завершена! Добавлено ${result.syncedCount} новостей.`, "success");
      } else {
        showToast(result.error || "Ошибка синхронизации", "error");
      }
    } catch (e) {
      showToast("Ошибка при подключении к серверу", "error");
    } finally {
      setSyncingFb(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!scheduleForm.group || scheduleForm.days.length === 0 || !scheduleForm.startTime || !scheduleForm.endTime) {
      return showToast("Заполните все обязательные поля", 'error');
    }
    setLoading(true);
    try {
      const timeString = `${scheduleForm.startTime} - ${scheduleForm.endTime}`;

      // Create a document for each selected day
      const promises = scheduleForm.days.map(day => {
        const { days, startTime, endTime, ...rest } = scheduleForm;
        return addDoc(collection(db, "schedules"), {
          ...rest,
          day,
          time: timeString,
          timestamp: serverTimestamp()
        });
      });

      await Promise.all(promises);

      setScheduleForm({
        group: '',
        days: [],
        startTime: '',
        endTime: '',
        subject: { RU: '', BG: '', RO: '', EN: '' },
        room: '',
        teacher: { RU: '', BG: '', RO: '', EN: '' },
        week: 'all'
      });
      showToast("Расписание добавлено");
    } catch (e) {
      showToast("Ошибка сохранения", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm("Удалить запись?")) return;
    try {
      await deleteDoc(doc(db, "schedules", id));
      showToast("Запись удалена");
    } catch (e) {
      showToast("Ошибка удаления", 'error');
    }
  };

  // PARTNERS LOGIC
  const handleSavePartner = async () => {
    if (!partnerForm.name || !partnerForm.logo) return showToast("Заполните поля", 'error');
    setLoading(true);
    try {
      await addDoc(collection(db, "partners"), partnerForm);
      setPartnerForm({
        name: '',
        logo: '',
        link: '',
        description: { RU: '', BG: '', RO: '', EN: '' }
      });
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
          newData[field] = { ...(newData[field] || {}), [adminLang]: val };
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

    const slug = programForm.slug || programForm.title.RU.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    const payload = { ...programForm, title: finalTitle, duration: finalDuration, slug, timestamp: serverTimestamp() };

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
      setProgramForm({ ...programForm, level: currentLevels.filter(l => l !== lvl) as any });
    } else {
      setProgramForm({ ...programForm, level: [...currentLevels, lvl] as any });
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
  const handleSaveDoc = async () => {
    if (!docForm.title[adminLang] || !docForm.url) {
      showToast("Заполните название и загрузите файл", "error");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "documents"), {
        title: docForm.title,
        url: docForm.url,
        storagePath: docForm.storagePath,
        category: docForm.category,
        timestamp: serverTimestamp()
      });
      setDocForm({ title: { RU: '', BG: '', RO: '', EN: '' }, url: '', storagePath: '', category: 'study-plan' });
      showToast("Документ сохранен");
    } catch (e) {
      showToast("Ошибка при сохранении", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCalendar = async () => {
    if (!calendarForm.date || !calendarForm.event[adminLang]) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "academic_calendar"), {
        date: calendarForm.date,
        event: calendarForm.event,
        order: Number(calendarForm.order) || 0,
        timestamp: serverTimestamp()
      });
      setCalendarForm({ date: '', event: { RU: '', BG: '', RO: '', EN: '' }, order: 0 });
      showToast("Событие добавлено");
    } catch (e) {
      console.error(e);
      showToast("Ошибка", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExam = async () => {
    if (!examForm.discipline[adminLang] || !examForm.date) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "exam_schedule"), {
        discipline: examForm.discipline,
        date: examForm.date,
        room: examForm.room,
        teacher: examForm.teacher,
        timestamp: serverTimestamp()
      });
      setExamForm({ discipline: { RU: '', BG: '', RO: '', EN: '' }, date: '', room: '', teacher: { RU: '', BG: '', RO: '', EN: '' } });
      showToast("Экзамен добавлен");
    } catch (e) {
      console.error(e);
      showToast("Ошибка", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveScholarship = async () => {
    if (!scholarshipForm.title[adminLang]) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "scholarships"), {
        title: scholarshipForm.title,
        description: scholarshipForm.description,
        order: Number(scholarshipForm.order) || 0,
        timestamp: serverTimestamp()
      });
      setScholarshipForm({
        title: { RU: '', BG: '', RO: '', EN: '' },
        description: { RU: '', BG: '', RO: '', EN: '' },
        order: 0
      });
      showToast("Стипендия добавлена");
    } catch (e) { console.error(e); showToast("Ошибка", "error"); }
    setLoading(false);
  };

  const handleSaveAfk = async () => {
    if (!afkForm.title[adminLang]) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "afk_activities"), {
        title: afkForm.title,
        description: afkForm.description,
        order: Number(afkForm.order) || 0,
        timestamp: serverTimestamp()
      });
      setAfkForm({
        title: { RU: '', BG: '', RO: '', EN: '' },
        description: { RU: '', BG: '', RO: '', EN: '' },
        order: 0
      });
      showToast("Активность добавлена");
    } catch (e) { console.error(e); showToast("Ошибка", "error"); }
    setLoading(false);
  };

  const handleDeleteCalendar = async (id: string) => {
    if (window.confirm('Удалить?')) {
      await deleteDoc(doc(db, "academic_calendar", id));
      showToast("Удалено");
    }
  };
  const handleDeleteExam = async (id: string) => {
    if (window.confirm('Удалить?')) {
      await deleteDoc(doc(db, "exam_schedule", id));
      showToast("Удалено");
    }
  };
  const handleDeleteScholarship = async (id: string) => {
    if (window.confirm('Удалить?')) {
      await deleteDoc(doc(db, "scholarships", id));
      showToast("Удалено");
    }
  };
  const handleDeleteAfk = async (id: string) => {
    if (window.confirm('Удалить?')) {
      await deleteDoc(doc(db, "afk_activities", id));
      showToast("Удалено");
    }
  };
  const handleSaveNav = async () => {
    setLoading(true);
    try {
      await updateNav(navItems);
      logAction("Nav Update", "Обновлена навигация сайта");
      showToast("Навигация сохранена");
    } finally { setLoading(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const email = target.email.value;
    const pass = target.pass.value;

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      logAction("Login Success", `Успешный вход: ${email}`);
      setLoginError(null);
    } catch (err: any) {
      logAction("Login Failure", `Ошибка входа для ${email}: ${err.message}`);

      let msg = "Ошибка входа: Неверный Email или пароль";
      if (err.code === 'auth/user-not-found') msg = "Ошибка: Пользователь не найден";
      if (err.code === 'auth/wrong-password') msg = "Ошибка: Неверный пароль";

      setLoginError(msg);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#001a33] flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-white p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md space-y-6">
          <h2 className="text-3xl font-bold text-[#003366] text-center serif italic">Admin Access</h2>
          {loginError && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold text-center">{loginError}</div>}
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input name="email" type="email" placeholder="Email" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border outline-none focus:ring-2 focus:ring-[#FFCC00]" required />
            </div>
            <div className="relative">
              <Settings className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input name="pass" type="password" placeholder="Password" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border outline-none focus:ring-2 focus:ring-[#FFCC00]" required />
            </div>
          </div>
          <button className="w-full bg-[#003366] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all shadow-xl">Войти</button>
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
          {ROLE_PERMISSIONS[role].map(tabId => {
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
          </div>

          {/* Language Selector */}
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
            {(Object.keys(Language) as Array<keyof typeof Language>).map(l => (
              <button
                key={l}
                onClick={() => setAdminLang(Language[l])}
                className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all ${adminLang === Language[l] ? 'bg-[#003366] text-white shadow-lg' : 'text-slate-400 hover:text-[#003366]'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </header>

        {/* Safety check for restricted tabs */}
        {!ROLE_PERMISSIONS[role].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <AlertCircle size={48} className="text-red-500" />
            <h2 className="text-2xl font-bold text-[#003366]">Доступ ограничен</h2>
            <p className="text-slate-400">У вас нет прав для просмотра этого раздела.</p>
            <button onClick={() => setActiveTab('dash')} className="bg-[#003366] text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest">Вернуться в обзор</button>
          </div>
        )}

        {activeTab === 'dash' && (
          <div className="space-y-12 animate-fadeIn">
            {/* Quick Actions / Seeding */}
            {role === 'sysadmin' && (
              <div className="bg-[#003366] p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFCC00]/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-black text-white serif italic mb-4">Начало работы</h2>
                    <p className="text-white/60 max-w-xl">Если разделы "Студенты" или "Расписание" пусты, нажмите кнопку ниже, чтобы заполнить базу данных демонстрационными данными.</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (window.confirm("Это заполнит базу данных начальными данными (расписание, календарь, экзамены). Продолжить?")) {
                        setLoading(true);
                        await seedAllSchedules();
                        setLoading(false);
                        showToast("Данные успешно загружены", "success");
                      }
                    }}
                    className="bg-[#FFCC00] text-[#003366] px-10 py-5 rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] hover:scale-105 transition-all shadow-xl whitespace-nowrap"
                  >
                    🚀 Загрузить данные (Seed)
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { l: 'НОВОСТИ', v: news.length, c: 'text-blue-600', bg: 'bg-blue-50', icon: Newspaper },
                { l: 'ЗАЯВКИ', v: apps.length, c: 'text-amber-600', bg: 'bg-amber-50', icon: Inbox },
                { l: 'РАСПИСАНИЕ', v: schedules.length, c: 'text-emerald-600', bg: 'bg-emerald-50', icon: Clock },
                { l: 'КАЛЕНДАРЬ', v: calendar.length, c: 'text-indigo-600', bg: 'bg-indigo-50', icon: Calendar },
                { l: 'ЭКЗАМЕНЫ', v: exams.length, c: 'text-rose-600', bg: 'bg-rose-50', icon: GraduationCap },
                { l: 'ПРОГРАММЫ', v: programs.length, c: 'text-violet-600', bg: 'bg-violet-50', icon: BookOpen },
                { l: 'ПАРТНЕРЫ', v: partners.length, c: 'text-teal-600', bg: 'bg-teal-50', icon: Handshake }
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <div className="lg:col-span-1 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold text-[#003366] serif italic mb-8">Быстрые действия</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => { setActiveTab('news'); setShowNewsModal(true); }}
                    className="w-full flex items-center gap-4 p-4 bg-blue-50 text-blue-700 rounded-2xl hover:bg-blue-100 transition-all font-bold text-sm"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"><Plus size={18} /></div>
                    Опубликовать новость
                  </button>
                  <button
                    onClick={() => setActiveTab('programs')}
                    className="w-full flex items-center gap-4 p-4 bg-indigo-50 text-indigo-700 rounded-2xl hover:bg-indigo-100 transition-all font-bold text-sm"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"><GraduationCap size={18} /></div>
                    Управление программами
                  </button>
                  <button
                    onClick={() => setActiveTab('site')}
                    className="w-full flex items-center gap-4 p-4 bg-slate-50 text-slate-700 rounded-2xl hover:bg-slate-100 transition-all font-bold text-sm"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"><Settings size={18} /></div>
                    Настройки сайта
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold text-[#003366] serif italic mb-8">Последние новости</h3>
                <div className="space-y-6">
                  {news.slice(0, 5).map(n => (
                    <div key={n.id} className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100">
                          <img src={n.images?.[0] || n.image} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#003366] text-sm line-clamp-1">{n.title?.RU}</h4>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{n.date}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab('news');
                          setEditingNewsId(n.id);
                          setNewsForm({
                            title: n.title || { RU: n.titleRU || '', BG: '', RO: '', EN: '' },
                            content: n.fullContent || { RU: n.contentRU || '', BG: '', RO: '', EN: '' },
                            category: n.category,
                            images: n.images || [n.image],
                            slug: n.slug || ''
                          });
                          setShowNewsModal(true);
                        }}
                        className="p-2 text-slate-300 hover:text-[#FFCC00] transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                  ))}
                  {news.length === 0 && <p className="text-center py-10 text-slate-300 italic">Нет новостей</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'partners' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white p-8 rounded-3xl border shadow-xl border-slate-100">
              <h3 className="text-xl font-bold text-[#003366] italic serif mb-6">Добавление партнера / спонсора</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Название партнера</label>
                  <input placeholder="Напр: Erasmus+" className="w-full p-4 bg-slate-50 rounded-xl outline-none" value={partnerForm.name} onChange={e => setPartnerForm({ ...partnerForm, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Ссылка (URL)</label>
                  <input placeholder="https://..." className="w-full p-4 bg-slate-50 rounded-xl outline-none" value={partnerForm.link} onChange={e => setPartnerForm({ ...partnerForm, link: e.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Логотип партнера</label>
                  <div className="flex gap-2">
                    <input placeholder="https://..." className="flex-grow p-4 bg-slate-50 rounded-xl outline-none" value={partnerForm.logo} onChange={e => setPartnerForm({ ...partnerForm, logo: e.target.value })} />
                    <label className="cursor-pointer bg-blue-50 text-blue-600 p-4 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center">
                      <ImageIcon size={20} />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'partners')} />
                    </label>
                  </div>
                </div>

                {/* Multilingual Descriptions */}
                <div className="md:col-span-2 border-t border-slate-100 pt-6 mt-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#003366] mb-4">Описание спонсора (переводы)</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {['RU', 'BG', 'RO', 'EN'].map(lang => (
                      <div key={lang} className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400">Описание ({lang})</label>
                        <textarea
                          rows={3}
                          placeholder={`Описание на ${lang}...`}
                          className="w-full p-4 bg-slate-50 rounded-xl outline-none resize-none text-sm"
                          value={partnerForm.description?.[lang as Language] || ''}
                          onChange={e => setPartnerForm({ ...partnerForm, description: { ...partnerForm.description!, [lang as Language]: e.target.value } })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={handleSavePartner} disabled={loading} className="w-full bg-[#003366] text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all">
                {loading ? '...' : 'ДОБАВИТЬ ПАРТНЕРА'}
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {partners.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 text-center relative group shadow-sm flex flex-col items-center">
                  <button onClick={() => handleDeletePartner(p.id)} className="absolute top-4 right-4 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  <div className="h-16 w-16 mb-4 flex items-center justify-center bg-slate-50 rounded-2xl p-2 mx-auto">
                    <img src={p.logo} className="max-w-full max-h-full grayscale group-hover:grayscale-0 transition-all object-contain" />
                  </div>
                  <p className="text-[11px] font-black uppercase text-[#003366] mb-2">{p.name}</p>

                  {p.description?.RU ? (
                    <p className="text-[9px] text-slate-400 line-clamp-2 leading-relaxed mb-4 text-center px-2">{p.description.RU}</p>
                  ) : (
                    <p className="text-[9px] text-slate-300 italic mb-4">Нет описания</p>
                  )}

                  {p.link && (
                    <span className="mt-auto text-[8px] bg-slate-50 text-slate-500 font-bold px-3 py-1.5 rounded-lg truncate w-full max-w-full">
                      {p.link}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="space-y-12 animate-fadeIn">
            {/* Calendar Management */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
              <h3 className="text-xl font-bold text-[#003366] mb-8 flex items-center gap-3">
                <Calendar className="text-[#FFCC00]" /> График учебного процесса
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Дата/Период</label>
                  <input placeholder="Напр: 15.09 - 26.12.2025" className="w-full p-4 bg-slate-50 rounded-xl outline-none" value={calendarForm.date} onChange={e => setCalendarForm({ ...calendarForm, date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Событие ({adminLang})</label>
                  <input placeholder="Напр: Зимний семестр" className="w-full p-4 bg-slate-50 rounded-xl outline-none" value={calendarForm.event[adminLang] || ''} onChange={e => setCalendarForm({ ...calendarForm, event: { ...calendarForm.event, [adminLang]: e.target.value } })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Порядок (число)</label>
                  <input type="number" className="w-full p-4 bg-slate-50 rounded-xl outline-none" value={calendarForm.order} onChange={e => setCalendarForm({ ...calendarForm, order: Number(e.target.value) })} />
                </div>
              </div>
              <button onClick={handleSaveCalendar} disabled={loading} className="w-full bg-[#003366] text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all">
                {loading ? '...' : 'ДОБАВИТЬ СОБЫТИЕ'}
              </button>

              <div className="mt-12 space-y-4">
                {calendar.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group">
                    <div className="flex items-center gap-6">
                      <span className="text-xs font-black text-slate-300 w-8">{c.order}</span>
                      <div>
                        <p className="font-bold text-[#003366]">{c.event?.[adminLang] || c.event?.RU}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.date}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteCalendar(c.id)} className="text-red-200 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Exam Management */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
              <h3 className="text-xl font-bold text-[#003366] mb-8 flex items-center gap-3">
                <GraduationCap className="text-[#FFCC00]" /> Расписание экзаменов
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Дисциплина ({adminLang})</label>
                  <input placeholder="Напр: Высшая математика" className="w-full p-4 bg-slate-50 rounded-xl outline-none" value={examForm.discipline[adminLang] || ''} onChange={e => setExamForm({ ...examForm, discipline: { ...examForm.discipline, [adminLang]: e.target.value } })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Дата и время</label>
                  <input placeholder="Напр: 20.01.2026, 10:00" className="w-full p-4 bg-slate-50 rounded-xl outline-none" value={examForm.date} onChange={e => setExamForm({ ...examForm, date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Аудитория</label>
                  <input placeholder="Напр: 38" className="w-full p-4 bg-slate-50 rounded-xl outline-none" value={examForm.room} onChange={e => setExamForm({ ...examForm, room: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Преподаватель ({adminLang})</label>
                  <input placeholder="Напр: Доц. Иванов И.И." className="w-full p-4 bg-slate-50 rounded-xl outline-none" value={examForm.teacher[adminLang] || ''} onChange={e => setExamForm({ ...examForm, teacher: { ...examForm.teacher, [adminLang]: e.target.value } })} />
                </div>
              </div>
              <button onClick={handleSaveExam} disabled={loading} className="w-full bg-[#003366] text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all">
                {loading ? '...' : 'ДОБАВИТЬ ЭКЗАМЕН'}
              </button>

              <div className="mt-12 space-y-4">
                {exams.map(ex => (
                  <div key={ex.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-grow">
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase">Дисциплина</p>
                        <p className="font-bold text-[#003366]">{ex.discipline?.[adminLang] || ex.discipline?.RU}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase">Дата</p>
                        <p className="text-sm font-medium">{ex.date}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase">Аудитория</p>
                        <p className="text-sm font-medium">{ex.room}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase">Преподаватель</p>
                        <p className="text-sm font-medium">{ex.teacher?.[adminLang] || ex.teacher?.RU}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteExam(ex.id)} className="text-red-200 hover:text-red-500 transition-colors ml-4">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Scholarships Management */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
              <h3 className="text-xl font-bold text-[#003366] mb-8 flex items-center gap-3">
                <Award className="text-[#FFCC00]" /> Стипендии
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Название ({adminLang})</label>
                  <input placeholder="Напр: Социальная стипендия" className="w-full p-4 bg-slate-50 rounded-xl outline-none" value={scholarshipForm.title[adminLang] || ''} onChange={e => setScholarshipForm({ ...scholarshipForm, title: { ...scholarshipForm.title, [adminLang]: e.target.value } })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Описание ({adminLang})</label>
                  <input placeholder="Напр: Для студентов с трайни увреждания..." className="w-full p-4 bg-slate-50 rounded-xl outline-none" value={scholarshipForm.description[adminLang] || ''} onChange={e => setScholarshipForm({ ...scholarshipForm, description: { ...scholarshipForm.description, [adminLang]: e.target.value } })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Порядок</label>
                  <input type="number" className="w-full p-4 bg-slate-50 rounded-xl outline-none" value={scholarshipForm.order} onChange={e => setScholarshipForm({ ...scholarshipForm, order: Number(e.target.value) })} />
                </div>
              </div>
              <button onClick={handleSaveScholarship} disabled={loading} className="w-full bg-[#003366] text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all">
                {loading ? '...' : 'ДОБАВИТЬ СТИПЕНДИЮ'}
              </button>

              <div className="mt-12 space-y-4">
                {scholarships.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group">
                    <div className="flex items-center gap-6">
                      <span className="text-xs font-black text-slate-300 w-8">{s.order}</span>
                      <div>
                        <p className="font-bold text-[#003366]">{s.title?.[adminLang] || s.title?.RU}</p>
                        <p className="text-[10px] font-medium text-slate-400 line-clamp-1">{s.description?.[adminLang] || s.description?.RU}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteScholarship(s.id)} className="text-red-200 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* AFK Management */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
              <h3 className="text-xl font-bold text-[#003366] mb-8 flex items-center gap-3">
                <Coffee className="text-[#FFCC00]" /> Отдых и досуг
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Название ({adminLang})</label>
                  <input placeholder="Напр: Студенческий совет" className="w-full p-4 bg-slate-50 rounded-xl outline-none" value={afkForm.title[adminLang] || ''} onChange={e => setAfkForm({ ...afkForm, title: { ...afkForm.title, [adminLang]: e.target.value } })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Описание ({adminLang})</label>
                  <input placeholder="Напр: Мы создаем будущее вместе..." className="w-full p-4 bg-slate-50 rounded-xl outline-none" value={afkForm.description[adminLang] || ''} onChange={e => setAfkForm({ ...afkForm, description: { ...afkForm.description, [adminLang]: e.target.value } })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Порядок</label>
                  <input type="number" className="w-full p-4 bg-slate-50 rounded-xl outline-none" value={afkForm.order} onChange={e => setAfkForm({ ...afkForm, order: Number(e.target.value) })} />
                </div>
              </div>
              <button onClick={handleSaveAfk} disabled={loading} className="w-full bg-[#003366] text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all">
                {loading ? '...' : 'ДОБАВИТЬ АКТИВНОСТЬ'}
              </button>

              <div className="mt-12 space-y-4">
                {afkActivities.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group">
                    <div className="flex items-center gap-6">
                      <span className="text-xs font-black text-slate-300 w-8">{a.order}</span>
                      <div>
                        <p className="font-bold text-[#003366]">{a.title?.[adminLang] || a.title?.RU}</p>
                        <p className="text-[10px] font-medium text-slate-400 line-clamp-1">{a.description?.[adminLang] || a.description?.RU}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteAfk(a.id)} className="text-red-200 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents Management */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
              <h3 className="text-xl font-bold text-[#003366] mb-8 flex items-center gap-3">
                <FileText className="text-[#FFCC00]" /> Документы для студентов
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Название ({adminLang})</label>
                  <input placeholder="Напр: Учебный план" className="w-full p-4 bg-slate-50 rounded-xl outline-none" value={docForm.title[adminLang] || ''} onChange={e => setDocForm({ ...docForm, title: { ...docForm.title, [adminLang]: e.target.value } })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Категория</label>
                  <select className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold text-slate-600" value={docForm.category} onChange={e => setDocForm({ ...docForm, category: e.target.value as any })}>
                    <option value="study-plan">Учебный план</option>
                    <option value="regulation">Норматив</option>
                    <option value="form">Бланк</option>
                    <option value="other">Прочее</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Файл</label>
                  <div className="flex gap-2">
                    <input placeholder="URL файла" className="flex-grow p-4 bg-slate-50 rounded-xl outline-none" value={docForm.url} onChange={e => setDocForm({ ...docForm, url: e.target.value })} />
                    <label className="cursor-pointer bg-blue-50 text-blue-600 p-4 rounded-xl hover:bg-blue-100 transition-colors">
                      <Upload size={20} />
                      <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'docs')} />
                    </label>
                  </div>
                </div>
              </div>
              <button onClick={handleSaveDoc} disabled={loading} className="w-full bg-[#003366] text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all">
                {loading ? '...' : 'ДОБАВИТЬ ДОКУМЕНТ'}
              </button>

              <div className="mt-12 space-y-4">
                {docs.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group">
                    <div className="flex items-center gap-6">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#003366] shadow-sm">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-[#003366]">{d.title?.[adminLang] || d.title?.RU}</p>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{d.category}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href={d.url} target="_blank" rel="noreferrer" className="p-2 text-slate-300 hover:text-blue-500 transition-colors">
                        <Download size={18} />
                      </a>
                      <button onClick={() => handleDeleteDoc(d.id)} className="text-red-200 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
                      <h4 className="font-bold text-xl mb-4 serif italic text-[#003366]">{p.title?.[adminLang] || p.title?.RU}</h4>
                      <p className="text-[10px] font-mono text-slate-400">/{p.slug}</p>
                    </div>
                    <div className="flex gap-2 mt-8">
                      <button onClick={() => setEditingPage({ ...p })} className="flex-grow bg-[#003366] text-white px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest">ИЗМЕНИТЬ</button>
                      <button onClick={() => deletePage(p.id)} className="bg-red-50 text-red-400 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all">🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 lg:p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 space-y-10">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Название страницы ({adminLang})</label>
                    <input placeholder="Напр: Документы" className="w-full p-6 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#FFCC00]" value={editingPage.title?.[adminLang] || ''} onChange={e => {
                      const title = e.target.value;
                      const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                      setEditingPage({ ...editingPage, title: { ...(editingPage.title || {}), [adminLang]: title } as any, slug: editingPage.slug || slug });
                    }} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Slug (URL путь)</label>
                    <input placeholder="documents" className="w-full p-6 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#FFCC00]" value={editingPage.slug} onChange={e => setEditingPage({ ...editingPage, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-8 border-t border-slate-100">
                  {(['hero', 'text', 'image-text', 'cta', 'programs', 'gallery', 'stats', 'person-grid', 'service-grid', 'contact-card'] as BlockType[]).map(t => (<button key={t} onClick={() => addBlock(t)} className="bg-[#003366] text-white px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-[#FFCC00] transition-colors">+ {t}</button>))}
                </div>

                <div className="space-y-8">
                  {editingPage.blocks.map((b, bIdx) => (
                    <div key={b.id} className="p-10 bg-slate-50 rounded-[2.5rem] relative border border-slate-100 shadow-inner group">
                      <div className="absolute top-6 right-6 flex gap-2">
                        <button onClick={() => {
                          const newBlocks = [...editingPage.blocks];
                          [newBlocks[bIdx], newBlocks[bIdx - 1]] = [newBlocks[bIdx - 1], newBlocks[bIdx]];
                          setEditingPage({ ...editingPage, blocks: newBlocks });
                        }} disabled={bIdx === 0} className="text-slate-300 hover:text-[#003366] disabled:opacity-0">↑</button>
                        <button onClick={() => setEditingPage({ ...editingPage, blocks: editingPage.blocks.filter(block => block.id !== b.id) })} className="text-red-300 hover:text-red-500">✕ Удалить</button>
                      </div>
                      <span className="text-[10px] font-black uppercase text-slate-300 mb-6 block tracking-widest">Блок: {b.type}</span>

                      <div className="space-y-4">
                        {b.type !== 'programs' && (
                          <div className="grid grid-cols-1 gap-4">
                            <input placeholder={`Заголовок (${adminLang})`} className="w-full bg-white p-4 rounded-xl font-bold border-none outline-none shadow-sm" value={b.data.title?.[adminLang] || ''} onChange={e => updateBlock(b.id, 'title', e.target.value)} />
                            <textarea placeholder={`Текст/Контент (${adminLang}) (HTML поддерживается)`} className="w-full bg-white p-4 rounded-xl min-h-[120px] border-none outline-none shadow-sm" value={b.data.content?.[adminLang] || ''} onChange={e => updateBlock(b.id, 'content', e.target.value)} />
                          </div>
                        )}
                        {['hero', 'image-text'].includes(b.type) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input placeholder="URL изображения" className="w-full bg-white p-4 rounded-xl border-none outline-none shadow-sm" value={b.data.image || ''} onChange={e => updateBlock(b.id, 'image', e.target.value)} />
                            {b.data.image && <img src={b.data.image} className="h-20 w-auto rounded-xl object-cover" />}
                          </div>
                        )}
                        {b.type === 'cta' && (
                          <div className="grid grid-cols-2 gap-4">
                            <input placeholder={`Текст кнопки (${adminLang})`} className="bg-white p-4 rounded-xl" value={b.data.buttonText?.[adminLang] || ''} onChange={e => updateBlock(b.id, 'buttonText', e.target.value)} />
                            <input placeholder="Ссылка (URL)" className="bg-white p-4 rounded-xl" value={b.data.link || ''} onChange={e => updateBlock(b.id, 'link', e.target.value)} />
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
                                <input placeholder={`Подпись (${adminLang})`} className="p-2 border rounded" value={s.label?.[adminLang] || ''} onChange={e => {
                                  const newStats = [...b.data.stats];
                                  newStats[idx].label = { ...newStats[idx].label, [adminLang]: e.target.value };
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
                                  <input placeholder={`Должность (${adminLang})`} className="p-2 border rounded" value={p.role?.[adminLang] || ''} onChange={e => {
                                    const newPeople = [...b.data.people];
                                    newPeople[idx].role = { ...newPeople[idx].role, [adminLang]: e.target.value };
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
                                <input placeholder={`Заголовок услуги (${adminLang})`} className="w-full p-2 border rounded font-bold" value={s.title?.[adminLang] || ''} onChange={e => {
                                  const newServices = [...b.data.services];
                                  newServices[idx].title = { ...newServices[idx].title, [adminLang]: e.target.value };
                                  updateBlock(b.id, 'services', newServices, true);
                                }} />
                                <textarea placeholder={`Описание услуги (${adminLang})`} className="w-full p-2 border rounded text-sm" value={s.desc?.[adminLang] || ''} onChange={e => {
                                  const newServices = [...b.data.services];
                                  newServices[idx].desc = { ...newServices[idx].desc, [adminLang]: e.target.value };
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
                            <input placeholder="Email" className="bg-white p-4 rounded-xl" value={b.data.email || ''} onChange={e => updateBlock(b.id, 'email', e.target.value, true)} />
                            <input placeholder="Часы работы" className="bg-white p-4 rounded-xl" value={b.data.hours || ''} onChange={e => updateBlock(b.id, 'hours', e.target.value, true)} />
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
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    setEditingNewsId(null);
                    setNewsForm({
                      title: { RU: '', BG: '', RO: '', EN: '' },
                      content: { RU: '', BG: '', RO: '', EN: '' },
                      category: 'academic',
                      images: [],
                      slug: ''
                    });
                    setShowNewsModal(true);
                  }}
                  className="bg-[#FFCC00] text-[#003366] px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2"
                >
                  <Plus size={16} /> СОЗДАТЬ НОВОСТЬ
                </button>

                <button
                  onClick={handleSyncFacebook}
                  disabled={syncingFb}
                  className="bg-[#1877F2] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {syncingFb ? <RefreshCw size={16} className="animate-spin" /> : <Globe size={16} />}
                  {syncingFb ? 'СИНХРОНИЗАЦИЯ...' : 'СИНХРОНИЗИРОВАТЬ С FACEBOOK'}
                </button>
              </div>

              {role === 'sysadmin' && (
                <div className="flex gap-3 w-full sm:w-auto">
                  <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl text-[9px] font-bold text-amber-700">
                    <AlertCircle size={12} />
                    <span>Внимание: ссылки на фото из Telegram временные и могут устареть.</span>
                  </div>
                </div>
              )}
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
                    <h4 className="font-bold text-xs text-[#003366] serif italic line-clamp-2 mb-4 flex-grow leading-relaxed">{n.title?.[adminLang] || n.title?.RU}</h4>
                    <button
                      onClick={() => {
                        setEditingNewsId(n.id);
                        setNewsForm({
                          title: n.title || { RU: n.titleRU || '', BG: '', RO: '', EN: '' },
                          content: n.fullContent || { RU: n.contentRU || '', BG: '', RO: '', EN: '' },
                          category: n.category,
                          images: n.images || [n.image],
                          slug: n.slug || ''
                        });
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
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Заголовок ({adminLang})</label>
                      <input
                        placeholder="Введите заголовок..."
                        className="w-full p-6 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#FFCC00] font-bold text-lg"
                        value={newsForm.title[adminLang] || ''}
                        onChange={e => setNewsForm({ ...newsForm, title: { ...newsForm.title, [adminLang]: e.target.value } })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Короткий номер / Slug (необязательно)</label>
                      <input
                        placeholder="Например: den-pobedy-2025"
                        className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#FFCC00] text-sm font-mono"
                        value={newsForm.slug || ''}
                        onChange={e => setNewsForm({ ...newsForm, slug: e.target.value })}
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
                            onClick={() => { if (newImageUrl) { setNewsForm({ ...newsForm, images: [...newsForm.images, newImageUrl] }); setNewImageUrl(''); } }}
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
                                  setNewsForm({ ...newsForm, images: newsForm.images.filter((_, idx) => idx !== i) });
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
                              onClick={() => setNewsForm({ ...newsForm, category: cat.id })}
                              className={`p-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border ${newsForm.category === cat.id ? 'bg-[#003366] text-white border-[#003366] shadow-lg' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'}`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Текст новости ({adminLang}) (WYSIWYG)</label>
                      <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-[#FFCC00] transition-shadow">
                        <ReactQuill
                          theme="snow"
                          value={newsForm.content[adminLang] || ''}
                          onChange={(content) => setNewsForm({ ...newsForm, content: { ...newsForm.content, [adminLang]: content } })}
                          className="min-h-[300px]"
                          modules={{
                            toolbar: [
                              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                              ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                              [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                              ['link', 'image', 'video'],
                              ['clean']
                            ]
                          }}
                        />
                      </div>
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
                  <input placeholder="Бизнес и менеджмент" className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#FFCC00]" value={programForm.title?.RU || ''} onChange={e => setProgramForm({ ...programForm, title: { ...(programForm.title as any), RU: e.target.value } })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Срок обучения (RU) - только цифра</label>
                  <input placeholder="4" className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#FFCC00]" value={programForm.duration?.RU || ''} onChange={e => setProgramForm({ ...programForm, duration: { ...(programForm.duration as any), RU: e.target.value } })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Slug (URL путь)</label>
                  <input placeholder="business-management" className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#FFCC00]" value={programForm.slug || ''} onChange={e => setProgramForm({ ...programForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">URL учебного плана (PDF)</label>
                  <div className="flex gap-2">
                    <input placeholder="https://..." className="flex-grow p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#FFCC00]" value={programForm.studyPlanUrl || ''} onChange={e => setProgramForm({ ...programForm, studyPlanUrl: e.target.value })} />
                    <label className="cursor-pointer bg-blue-50 text-blue-600 p-4 rounded-xl hover:bg-blue-100 transition-colors">
                      <Upload size={20} />
                      <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleFileUpload(e, 'programs')} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Факультет / Категория</label>
                  <select
                    className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#FFCC00]"
                    value={programForm.faculty || 'pedagogy'}
                    onChange={e => setProgramForm({ ...programForm, faculty: e.target.value })}
                  >
                    <option value="pedagogy">Педагогика</option>
                    <option value="tech">Педагогика на обучението по</option>
                    <option value="masino">Машинно Инженерство</option>
                    <option value="pc">Информатика и компютьрни науки</option>
                    <option value="admis">Администрация и управление</option>
                    <option value="other">Друго</option>
                  </select>
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
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">Описание специальности ({adminLang})</label>
                <textarea
                  rows={6}
                  placeholder="Подробное описание программы, квалификации и возможностей трудоустройства..."
                  className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#FFCC00] resize-none"
                  value={programForm.description?.[adminLang] || ''}
                  onChange={e => setProgramForm({ ...programForm, description: { ...(programForm.description || {}), [adminLang]: e.target.value } as Record<Language, string> })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">Теги (через запятую)</label>
                <input
                  placeholder="история, филология, музыка"
                  className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#FFCC00]"
                  value={programForm.tags?.join(', ') || ''}
                  onChange={e => setProgramForm({ ...programForm, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                />
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
                  <tr><th className="p-6">СПЕЦИАЛЬНОСТЬ</th><th className="p-6">ФАКУЛЬТЕТ / ТЕГИ</th><th className="p-6">УРОВНИ</th><th className="p-6">СРОК</th><th className="p-6 text-right">ДЕЙСТВИЯ</th></tr>
                </thead>
                <tbody>
                  {programs.map((p) => (
                    <tr key={p.id} className="border-b text-sm group hover:bg-slate-50/50 transition-colors">
                      <td className="p-6"><div className="font-bold text-[#003366]">{p.title?.RU}</div></td>
                      <td className="p-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-blue-600 uppercase">{p.faculty || 'other'}</span>
                          <div className="flex flex-wrap gap-1">
                            {p.tags?.map(t => (
                              <span key={t} className="text-[7px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">#{t}</span>
                            ))}
                          </div>
                        </div>
                      </td>
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

        {activeTab === 'docs' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Название документа ({adminLang})</label>
                  <input placeholder="Учебный план 2025" className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#FFCC00]" value={docForm.title[adminLang] || ''} onChange={e => setDocForm({ ...docForm, title: { ...docForm.title, [adminLang]: e.target.value } })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Категория</label>
                  <select className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#FFCC00]" value={docForm.category} onChange={e => setDocForm({ ...docForm, category: e.target.value as any })}>
                    <option value="study-plan">Учебный план</option>
                    <option value="regulation">Нормативный акт</option>
                    <option value="form">Бланк/Заявление</option>
                    <option value="other">Другое</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-grow">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileText className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        {docForm.url ? "Файл загружен" : "Загрузить PDF"}
                      </p>
                    </div>
                    <input type="file" className="hidden" accept=".pdf" onChange={e => handleFileUpload(e, 'docs')} />
                  </label>
                </div>
                <button onClick={handleSaveDoc} disabled={loading || uploading} className="h-32 px-12 bg-[#003366] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all shadow-lg">
                  {loading ? '...' : 'СОХРАНИТЬ'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {docsList.map(d => (
                <div key={d.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <FileText size={24} />
                    </div>
                    <div className="overflow-hidden flex-grow">
                      <a href={d.url} target="_blank" rel="noopener noreferrer" className="font-bold text-[#003366] truncate hover:text-[#FFCC00] transition-colors block">
                        {d.title?.RU}
                      </a>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{d.category}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteDoc(d.id, d.storagePath)} className="text-red-200 hover:text-red-500 transition-colors p-2">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
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
                      className={`p-2 rounded-xl text-[10px] font-black border-none outline-none cursor-pointer transition-colors ${a.status === 'new' ? 'bg-amber-100 text-amber-800' :
                        a.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      value={a.status}
                      onChange={e => {
                        updateDoc(doc(db, "applications", a.id), { status: e.target.value });
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
            {/* Global Settings Section */}
            <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-xl font-bold text-[#003366] serif italic">Глобальные настройки</h3>
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await saveConfig({
                        universityName: {
                          RU: globalSettings.universityNameRU,
                          BG: globalSettings.universityNameBG,
                          RO: globalSettings.universityNameRO,
                          EN: globalSettings.universityNameRU // Fallback EN to RU for now
                        } as any,
                        branchLocation: {
                          RU: globalSettings.branchLocationRU,
                          BG: globalSettings.branchLocationBG,
                          RO: globalSettings.branchLocationRO,
                          EN: globalSettings.branchLocationRU // Fallback EN to RU for now
                        } as any,
                        logoUrl: globalSettings.logoUrl
                      });
                      showToast("Настройки сохранены");
                    } catch (e) {
                      showToast("Ошибка сохранения", "error");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="bg-[#003366] text-white px-6 py-2 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all"
                >
                  {loading ? '...' : 'СОХРАНИТЬ НАСТРОЙКИ'}
                </button>
              </div>

              <div className="space-y-8">
                {/* LOGO */}
                <div className="p-6 bg-slate-50 rounded-2xl space-y-4 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-[#003366]" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Логотип университета</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">URL логотипа</label>
                      <input
                        className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#FFCC00]"
                        value={globalSettings.logoUrl}
                        onChange={e => setGlobalSettings({ ...globalSettings, logoUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="flex justify-center p-4 bg-white rounded-xl border border-dashed border-slate-200">
                      {globalSettings.logoUrl ? (
                        <img src={globalSettings.logoUrl} alt="Preview" className="h-12 object-contain" />
                      ) : (
                        <span className="text-[9px] text-slate-300 uppercase font-black">Нет логотипа</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* RU */}
                <div className="p-6 bg-slate-50 rounded-2xl space-y-4 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <img src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/ru.svg" className="w-6 h-4 rounded shadow-sm" alt="RU" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Русский язык</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">Название университета</label>
                      <input
                        className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#FFCC00]"
                        value={globalSettings.universityNameRU}
                        onChange={e => setGlobalSettings({ ...globalSettings, universityNameRU: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">Локация / Филиал</label>
                      <input
                        className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#FFCC00]"
                        value={globalSettings.branchLocationRU}
                        onChange={e => setGlobalSettings({ ...globalSettings, branchLocationRU: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* BG */}
                <div className="p-6 bg-slate-50 rounded-2xl space-y-4 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <img src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/bg.svg" className="w-6 h-4 rounded shadow-sm" alt="BG" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Български език</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">Име на университета</label>
                      <input
                        className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#FFCC00]"
                        value={globalSettings.universityNameBG}
                        onChange={e => setGlobalSettings({ ...globalSettings, universityNameBG: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">Локация / Филиал</label>
                      <input
                        className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#FFCC00]"
                        value={globalSettings.branchLocationBG}
                        onChange={e => setGlobalSettings({ ...globalSettings, branchLocationBG: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* RO */}
                <div className="p-6 bg-slate-50 rounded-2xl space-y-4 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <img src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/md.svg" className="w-6 h-4 rounded shadow-sm" alt="RO" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Limba Română</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">Numele universității</label>
                      <input
                        className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#FFCC00]"
                        value={globalSettings.universityNameRO}
                        onChange={e => setGlobalSettings({ ...globalSettings, universityNameRO: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">Locație / Filială</label>
                      <input
                        className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#FFCC00]"
                        value={globalSettings.branchLocationRO}
                        onChange={e => setGlobalSettings({ ...globalSettings, branchLocationRO: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest italic">* Изменения вступят в силу для всех пользователей после сохранения.</p>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                {Object.values(Language).map(l => (
                  <button
                    key={l}
                    onClick={() => setNavLang(l)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${navLang === l ? 'bg-white text-[#003366] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <div className="h-8 w-px bg-slate-200 mx-2"></div>
              <button onClick={addTopLevelNav} className="bg-[#003366] text-white px-8 py-4 rounded-full font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-all">+ ДОБАВИТЬ РАЗДЕЛ</button>
              <button
                onClick={() => {
                  if (window.confirm("Это заменит текущую навигацию на стандартную системную. Продолжить?")) {
                    syncNav();
                  }
                }}
                className="bg-amber-500 text-white px-8 py-4 rounded-full font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-all"
              >
                СИНХРОНИЗИРОВАТЬ НАВИГАЦИЮ
              </button>
            </div>
            <div className="space-y-6">
              {navItems.map((item, idx) => (
                <div key={item.id} className="bg-white p-8 rounded-3xl border shadow-sm">
                  <div className="flex gap-4 items-end">
                    <div className="flex flex-col gap-1 mr-2">
                      <button onClick={() => moveTopNav(idx, -1)} disabled={idx === 0} className="p-2 bg-slate-50 rounded text-xs">▲</button>
                      <button onClick={() => moveTopNav(idx, 1)} disabled={idx === navItems.length - 1} className="p-2 bg-slate-50 rounded text-xs">▼</button>
                    </div>
                    <div className="flex-grow">
                      <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">Название раздела ({navLang})</label>
                      <input className="w-full text-2xl font-bold text-[#003366] serif italic bg-slate-50 p-4 rounded-xl" value={item.label?.[navLang] || ''} onChange={e => { const updated = [...navItems]; updated[idx].label = { ...(updated[idx].label || {}), [navLang]: e.target.value } as any; setNavItems(updated); }} />
                    </div>
                    <div className="w-48">
                      <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">Путь (URL)</label>
                      <input className="w-full p-4 bg-slate-50 rounded-xl text-xs font-mono" placeholder="/url" value={item.path} onChange={e => { const updated = [...navItems]; updated[idx].path = e.target.value; setNavItems(updated); }} />
                    </div>
                    <button onClick={() => addSubNav(item.id)} className="bg-blue-50 text-blue-600 px-6 py-4 rounded-xl font-black text-[10px] uppercase">+ ПОДПУНКТ</button>
                    <button onClick={() => deleteNav(item.id)} className="bg-red-50 text-red-300 p-4 rounded-xl">🗑</button>
                  </div>
                  {item.children?.map((child, cIdx) => (
                    <div key={child.id} className="ml-10 mt-4 flex gap-4 bg-slate-50 p-4 rounded-xl items-center">
                      <div className="flex flex-col gap-1">
                        <button onClick={() => moveSubNav(idx, cIdx, -1)} disabled={cIdx === 0} className="p-1 bg-white rounded text-[10px]">▲</button>
                        <button onClick={() => moveSubNav(idx, cIdx, 1)} disabled={cIdx === (item.children?.length || 0) - 1} className="p-1 bg-white rounded text-[10px]">▼</button>
                      </div>
                      <div className="flex-grow">
                        <input className="bg-transparent border-none font-bold text-[#003366] w-full outline-none" placeholder={`Название подпункта (${navLang})`} value={child.label?.[navLang] || ''} onChange={e => { const updated = [...navItems]; updated[idx].children![cIdx].label = { ...(updated[idx].children![cIdx].label || {}), [navLang]: e.target.value } as any; setNavItems(updated); }} />
                      </div>
                      <input className="bg-transparent border-none text-xs text-slate-400 w-32 outline-none text-right" placeholder="/path" value={child.path} onChange={e => { const updated = [...navItems]; updated[idx].children![cIdx].path = e.target.value; setNavItems(updated); }} />
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
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${log.action.includes('Delete') ? 'bg-red-50 text-red-500' :
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
        {activeTab === 'security' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Всего пользователей</p>
                <p className="text-4xl font-black text-[#003366]">{adminUsers.length}</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Попыток входа (24ч)</p>
                <p className="text-4xl font-black text-amber-500">{logs.filter(l => l.action.includes('Login') && (Date.now() - (l.timestamp?.seconds * 1000 || 0)) < 86400000).length}</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Нарушений безопасности</p>
                <p className="text-4xl font-black text-red-500">{logs.filter(l => l.action === 'Security Violation').length}</p>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                <h3 className="text-xl font-black text-[#003366] uppercase tracking-tighter flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-500" />
                  Журнал безопасности
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                    <tr>
                      <th className="p-6">ВРЕМЯ</th>
                      <th className="p-6">СОБЫТИЕ</th>
                      <th className="p-6">ДЕТАЛИ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {logs.filter(l => l.action.includes('Login') || l.action.includes('Security') || l.action.includes('User')).slice(0, 50).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-6 text-[10px] font-mono text-slate-400">
                          {log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleString() : '...'}
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${log.action.includes('Success') ? 'bg-emerald-50 text-emerald-600' :
                            log.action.includes('Failure') || log.action.includes('Violation') ? 'bg-red-50 text-red-600' :
                              'bg-blue-50 text-blue-600'
                            }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-6 text-xs text-slate-600 font-medium">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 space-y-8">
              <h3 className="text-2xl font-bold text-[#003366] serif italic">Управление доступом</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Имя</label>
                  <input placeholder="Иван" className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#FFCC00]" value={userForm.firstName} onChange={e => setUserForm({ ...userForm, firstName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Фамилия</label>
                  <input placeholder="Иванов" className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#FFCC00]" value={userForm.lastName} onChange={e => setUserForm({ ...userForm, lastName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Unique ID</label>
                  <div className="flex gap-2">
                    <input placeholder="123456" className="flex-grow p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#FFCC00]" value={userForm.uniqueId} onChange={e => setUserForm({ ...userForm, uniqueId: e.target.value })} />
                    <button onClick={() => setUserForm({ ...userForm, uniqueId: generateUniqueId() })} className="bg-blue-50 text-blue-600 p-5 rounded-2xl hover:bg-blue-100 transition-colors">
                      <RefreshCw size={20} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Пароль (для новых)</label>
                  <input type="password" placeholder="••••••••" className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#FFCC00]" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Роль</label>
                  <select className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-600 focus:ring-2 focus:ring-[#FFCC00]" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value as any })}>
                    <option value="admin">Администратор</option>
                    <option value="sysadmin">Суперадмин</option>
                  </select>
                </div>
              </div>
              <button onClick={handleSaveUser} disabled={loading} className="w-full bg-[#003366] text-white py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all shadow-lg">
                {loading ? '...' : 'СОХРАНИТЬ ПОЛЬЗОВАТЕЛЯ'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminUsers.map(u => (
                <div key={u.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg ${u.role === 'sysadmin' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                      {u.role === 'sysadmin' ? 'S' : 'A'}
                    </div>
                    <div>
                      <p className="font-bold text-[#003366] text-lg leading-none mb-2">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-slate-400 mb-1">ID: {u.uniqueId || u.email}</p>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{u.role}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteUser(u.id)} className="text-red-200 hover:text-red-500 transition-colors p-3 bg-red-50/0 hover:bg-red-50 rounded-xl">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'schedules' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
              <h3 className="text-xl font-bold text-[#003366] serif italic">Добавить расписание</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Группа</label>
                  <input placeholder="Напр: ИТ-21" className="w-full p-4 bg-slate-50 rounded-xl outline-none border border-transparent focus:border-[#FFCC00] transition-all" value={scheduleForm.group} onChange={e => setScheduleForm({ ...scheduleForm, group: e.target.value })} />
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Дни недели (выберите несколько)</label>
                  <div className="flex flex-wrap gap-2">
                    {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'].map(d => (
                      <button
                        key={d}
                        onClick={() => {
                          const newDays = scheduleForm.days.includes(d)
                            ? scheduleForm.days.filter(day => day !== d)
                            : [...scheduleForm.days, d];
                          setScheduleForm({ ...scheduleForm, days: newDays });
                        }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${scheduleForm.days.includes(d)
                          ? 'bg-[#003366] text-white border-[#003366] shadow-lg'
                          : 'bg-white text-slate-400 border-slate-100 hover:border-[#003366] hover:text-[#003366]'
                          }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Время начала и конца</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="time"
                      className="flex-grow p-4 bg-slate-50 rounded-xl outline-none border border-transparent focus:border-[#FFCC00] transition-all"
                      value={scheduleForm.startTime}
                      onChange={e => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                    />
                    <div className="w-4 h-px bg-slate-200"></div>
                    <input
                      type="time"
                      className="flex-grow p-4 bg-slate-50 rounded-xl outline-none border border-transparent focus:border-[#FFCC00] transition-all"
                      value={scheduleForm.endTime}
                      onChange={e => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Неделя</label>
                  <select className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold text-slate-600" value={scheduleForm.week} onChange={e => setScheduleForm({ ...scheduleForm, week: e.target.value })}>
                    <option value="all">Все недели</option>
                    <option value="1">Неделя 1</option>
                    <option value="2">Неделя 2</option>
                    <option value="3">Неделя 3</option>
                    <option value="4">Неделя 4</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Предмет ({adminLang})</label>
                  <input placeholder="Название предмета" className="w-full p-4 bg-slate-50 rounded-xl outline-none" value={scheduleForm.subject[adminLang] || ''} onChange={e => setScheduleForm({ ...scheduleForm, subject: { ...scheduleForm.subject, [adminLang]: e.target.value } })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Аудитория</label>
                  <input placeholder="Напр: 302" className="w-full p-4 bg-slate-50 rounded-xl outline-none" value={scheduleForm.room} onChange={e => setScheduleForm({ ...scheduleForm, room: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Преподаватель ({adminLang})</label>
                  <input placeholder="ФИО преподавателя" className="w-full p-4 bg-slate-50 rounded-xl outline-none" value={scheduleForm.teacher[adminLang] || ''} onChange={e => setScheduleForm({ ...scheduleForm, teacher: { ...scheduleForm.teacher, [adminLang]: e.target.value } })} />
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={handleSaveSchedule} disabled={loading} className="flex-grow bg-[#003366] text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all">
                  {loading ? '...' : 'ДОБАВИТЬ В РАСПИСАНИЕ'}
                </button>
                <button onClick={async () => { setLoading(true); await seedAllSchedules(); setLoading(false); showToast("Расписание загружено", "success"); }} disabled={loading} className="bg-emerald-500 text-white px-6 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all">
                  SEED
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {Array.from(new Set(schedules.map(s => s.group))).sort().map(group => (
                <div key={group} className="space-y-4">
                  <h4 className="text-2xl font-black text-[#003366] serif italic border-b-4 border-[#FFCC00] inline-block pb-2">{group}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schedules.filter(s => s.group === group).sort((a, b) => {
                      const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
                      return days.indexOf(a.day) - days.indexOf(b.day);
                    }).map(s => (
                      <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group">
                        <button onClick={() => handleDeleteSchedule(s.id)} className="absolute top-4 right-4 text-red-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 size={16} />
                        </button>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="bg-slate-50 text-[#003366] px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100">{s.day}</span>
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{s.time}</span>
                          {s.week && s.week !== 'all' && (
                            <span className="bg-[#FFCC00] text-[#003366] px-2 py-0.5 rounded text-[8px] font-black uppercase">Неделя {s.week}</span>
                          )}
                        </div>
                        <h5 className="font-bold text-[#003366] mb-2">{s.subject[adminLang] || s.subject.RU}</h5>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                          <span>🚪 {s.room}</span>
                          <span>👤 {s.teacher[adminLang] || s.teacher.RU}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white p-12 rounded-[3.5rem] border shadow-sm">
              <h3 className="text-2xl font-bold text-[#003366] serif italic mb-8">Загрузить в галерею</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Название ({adminLang})</label>
                  <input
                    placeholder="Студенческая весна..."
                    className="w-full p-6 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#FFCC00]"
                    value={galleryForm.title[adminLang] || ''}
                    onChange={e => setGalleryForm({ ...galleryForm, title: { ...galleryForm.title, [adminLang]: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Категория</label>
                  <select
                    className="w-full p-6 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#FFCC00] font-bold text-slate-600"
                    value={galleryForm.category}
                    onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })}
                  >
                    <option value="Университет">Университет</option>
                    <option value="Студенты">Студенты</option>
                    <option value="Мероприятия">Мероприятия</option>
                    <option value="Музей">Музей</option>
                    <option value="Спорт">Спорт</option>
                    <option value="Другое">Другое</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Действие</label>
                  <label className="w-full bg-[#003366] text-white py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest cursor-pointer hover:bg-[#FFCC00] hover:text-[#003366] transition-all shadow-lg flex items-center justify-center gap-3">
                    {uploading ? <RefreshCw size={18} className="animate-spin" /> : <Upload size={18} />}
                    <span className="truncate">{uploading ? 'ЗАГРУЗКА...' : 'ВЫБРАТЬ И ЗАГРУЗИТЬ'}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'gallery')} disabled={uploading} />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {gallery.map(item => (
                <div key={item.id} className="group relative aspect-[4/3] rounded-3xl overflow-hidden border border-slate-100 shadow-sm transition-all hover:shadow-xl">
                  <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#003366]/90 via-[#003366]/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>

                  {/* Content */}
                  <div className="absolute inset-0 p-5 flex flex-col justify-end">
                    <span className="bg-[#FFCC00] text-[#003366] px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest w-fit mb-2">
                      {item.category || 'Без категории'}
                    </span>
                    <h4 className="text-white font-bold text-sm leading-tight line-clamp-2">
                      {item.title?.[adminLang] || item.title?.RU || 'Без названия'}
                    </h4>
                  </div>

                  {/* Delete Button (Appears on hover) */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all z-10">
                    <button
                      onClick={() => {
                        if (window.confirm("Удалить изображение?")) {
                          handleDeleteGallery(item.id);
                        }
                      }}
                      className="bg-red-500/90 backdrop-blur-md text-white p-2.5 rounded-xl hover:bg-red-600 hover:scale-110 active:scale-95 transition-all shadow-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'system' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white p-12 rounded-[3.5rem] border shadow-sm space-y-8">
              <div className="flex items-center gap-4 border-b pb-6">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#003366] serif italic">Исправление CORS (Ошибка загрузки файлов)</h3>
                  <p className="text-slate-400 text-xs">Если вы видите ошибку "blocked by CORS policy" при загрузке фото</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-600">
                <p>Для исправления этой ошибки необходимо настроить CORS в Google Cloud Console:</p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Откройте <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-600 underline">Google Cloud Console</a></li>
                  <li>Выберите проект <b>tdu-tr</b></li>
                  <li>Откройте Cloud Shell (иконка терминала вверху справа)</li>
                  <li>Создайте файл конфигурации: <code className="bg-slate-100 p-1 rounded">nano cors.json</code></li>
                  <li>Вставьте следующий текст:
                    <pre className="bg-slate-900 text-green-400 p-4 rounded-xl mt-2 text-[10px] overflow-x-auto">
                      {`[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "responseHeader": ["Content-Type", "Authorization", "x-goog-resumable"],
    "maxAgeSeconds": 3600
  }
]`}
                    </pre>
                  </li>
                  <li>Сохраните (Ctrl+O, Enter) и выйдите (Ctrl+X)</li>
                  <li>Выполните команду: <code className="bg-slate-100 p-1 rounded">gsutil cors set cors.json gs://tdu-tr.firebasestorage.app</code></li>
                </ol>
              </div>
            </div>

            <div className="bg-white p-12 rounded-[4rem] border shadow-sm space-y-10">
              <h3 className="text-3xl font-black text-[#003366] serif italic text-center">Управление системой</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-blue-50 rounded-[3rem] border border-blue-100 space-y-6">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#003366]">Юридические страницы</h4>
                    <p className="text-sm text-slate-500 mt-2">Автоматическое создание и заполнение страниц: Поверителност, Бисквитки, Юридическа информация и Достъпност.</p>
                  </div>
                  <button
                    onClick={bootstrapLegalPages}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#003366] transition-all shadow-lg"
                  >
                    Инициализировать страницы
                  </button>
                </div>

                <div className="p-8 bg-red-50 rounded-[3rem] border border-red-100 space-y-6">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm">
                    <RefreshCw size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#003366]">Сброс системы</h4>
                    <p className="text-sm text-slate-500 mt-2">Полная очистка базы данных и восстановление начальных настроек. Все созданные страницы и новости будут удалены.</p>
                  </div>
                  <button
                    onClick={() => confirm('Вы уверены? Это действие нельзя отменить.') && bootstrapDatabase()}
                    className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-lg"
                  >
                    Выполнить сброс
                  </button>
                </div>

                <div className="p-8 bg-emerald-50 rounded-[3rem] border border-emerald-100 space-y-6">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#003366]">Наполнение данными</h4>
                    <p className="text-sm text-slate-500 mt-2">Заполнение пустых разделов (Программы, Новости, Документы) начальными данными для корректного отображения сайта.</p>
                  </div>
                  <button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        await seedFirestore(db, serverTimestamp);
                        showToast("Данные успешно добавлены!");
                      } catch (e) {
                        showToast("Ошибка при наполнении", "error");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition-all shadow-lg"
                  >
                    {loading ? 'ЗАГРУЗКА...' : 'ЗАПОЛНИТЬ ДАННЫМИ'}
                  </button>
                </div>

                <div className="p-8 bg-amber-50 rounded-[3rem] border border-amber-100 space-y-6">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
                    <GraduationCap size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#003366]">Описания программ</h4>
                    <p className="text-sm text-slate-500 mt-2">Обновление описаний для существующих специальностей на основе предоставленных текстов (болгарский язык).</p>
                  </div>
                  <button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        await seedProgramDescriptions();
                        showToast("Описания обновлены!");
                      } catch (e) {
                        showToast("Ошибка при обновлении", "error");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="w-full bg-amber-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-700 transition-all shadow-lg"
                  >
                    {loading ? 'ЗАГРУЗКА...' : 'ОБНОВИТЬ ОПИСАНИЯ'}
                  </button>
                </div>
              </div>
            </div>
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
    </div>
  );
};
