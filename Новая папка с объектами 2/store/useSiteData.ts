
import { useState, useEffect } from 'react';
import { SiteData, DynamicPage, NavLink, Language, Program } from '../types';
import { auth, onAuthStateChanged } from '../firebase';

const UPLOAD_SECRET = (import.meta as any).env.VITE_UPLOAD_SECRET || 'default-secret-change-me';

const INITIAL_NAV: NavLink[] = [
  { id: 'n1', label: { BG: 'Начало', RU: 'Начало', RO: 'Acasă', EN: 'Home' }, children: [
    { id: 'n1-1', path: '/news', label: { BG: 'Новини', RU: 'Новости', RO: 'Știri', EN: 'News' } }
  ]},
  { id: 'n2', label: { BG: 'Университет', RU: 'Университет', RO: 'Universitate', EN: 'University' }, children: [
    { id: 'n2-1', path: '/about', label: { BG: 'За университета', RU: 'Об университете', RO: 'Despre universitate', EN: 'About' } },
    { id: 'n2-2', path: '/management', label: { BG: 'Администрация', RU: 'Администрация', RO: 'Administrație', EN: 'Administration' } },
    { id: 'n2-3', path: '/regulations', label: { BG: 'Нормативна база', RU: 'Нормативная база', RO: 'Cadrul normativ', EN: 'Regulations' } },
    { id: 'n2-4', path: '/library', label: { BG: 'Библиотека', RU: 'Библиотека', RO: 'Biblioteca', EN: 'Library' } },
    { id: 'n2-5', path: '/international', label: { BG: 'Международна дейност', RU: 'Международная деятельность', RO: 'Activitate internațională', EN: 'International Activity' } }
  ]},
  { id: 'n3', label: { BG: 'Студенти', RU: 'Студенти', RO: 'Studenți', EN: 'Students' }, children: [
    { id: 'n3-1', path: '/students?tab=calendar', label: { BG: 'График на учебния процес', RU: 'График учебного процесса', RO: 'Calendar academic', EN: 'Academic Calendar' } },
    { id: 'n3-2', path: '/students?tab=schedules', label: { BG: 'Разписание на занятията', RU: 'Расписание занятий', RO: 'Orarul lecțiilor', EN: 'Class Schedule' } },
    { id: 'n3-3', path: '/students?tab=exams', label: { BG: 'Изпитна сесия', RU: 'Экзаменационная сессия', RO: 'Sesiunea de examene', EN: 'Exam Session' } },
    { id: 'n3-4', path: '/scholarships', label: { BG: 'Стипендии', RU: 'Стипендии', RO: 'Burse', EN: 'Scholarships' } },
    { id: 'n3-5', path: '/afk', label: { BG: 'Отдих', RU: 'Отдых', RO: 'Relaxare', EN: 'Relax' } }
  ]},
  { id: 'n6', label: { BG: 'Структура', RU: 'Структура', RO: 'Structură', EN: 'Structure' }, children: [
    { id: 'n6-1', path: '/departments', label: { BG: 'Катедри', RU: 'Кафедры', RO: 'Catedre', EN: 'Departments' } },
    { id: 'n6-2', path: '/museum', label: { BG: 'Музей', RU: 'Музей', RO: 'Muzeu', EN: 'Museum' } },
    { id: 'n6-3', path: '/library', label: { BG: 'Библиотека', RU: 'Библиотека', RO: 'Biblioteca', EN: 'Library' } },
    { id: 'n6-4', path: '/student-council', label: { BG: 'Студентски съвет', RU: 'Студенческий совет', RO: 'Consiliul Studenților', EN: 'Student Council' } }
  ]}
];

const DEFAULT_PROGRAMS: Partial<Program>[] = [
  {
    level: 'bachelor',
    title: { RU: 'Предучилищная и начальная школьная педагогика', BG: 'Предучилищна и начална училищна педагогика', EN: 'Preschool and Primary School Pedagogy', RO: 'Pedagogie preșcolară și școlară primară' },
    description: {
      BG: 'Подготвя учители за работа с деца в предучилищна и начална училищна възраст с акцент върху педагогиката и психологията.',
      RU: 'Подготовка учителей для работы с детьми дошкольного и младшего школьного возраста с акцентом на педагогику и психологию.',
      EN: 'Prepares teachers for working with preschool and primary school children with an emphasis on pedagogy and psychology.',
      RO: 'Pregătește profesori pentru lucrul cu copiii de vârstă preșcolară și școlară primară, cu accent pe pedagogie și psihologie.'
    },
    duration: { RU: '4 года', BG: '4 години', EN: '4 years', RO: '4 ani' },
    language: 'Български / Руски',
    form: { RU: 'Очная', BG: 'Редовна', EN: 'Full-time', RO: 'Full-time' }
  },
  {
    level: 'bachelor',
    title: { RU: 'Болгарский язык и история', BG: 'Български език и история', EN: 'Bulgarian Language and History', RO: 'Limba bulgară și istorie' },
    description: {
      BG: 'Квалификация за учител по български език, литература и история. Реализация в училища, музеи и архиви.',
      RU: 'Квалификация учителя болгарского языка, литературы и истории. Реализация в школах, музеях и архивах.',
      EN: 'Qualification for a teacher of Bulgarian language, literature, and history. Career in schools, museums, and archives.',
      RO: 'Calificare pentru profesor de limba bulgară, literatură și istorie. Realizare în școli, muzee și arhive.'
    },
    duration: { RU: '4 года', BG: '4 години', EN: '4 years', RO: '4 ani' },
    language: 'Български / Руски',
    form: { RU: 'Очная', BG: 'Редовна', EN: 'Full-time', RO: 'Full-time' }
  },
  {
    level: 'bachelor',
    title: { RU: 'Педагогика обучения болгарскому и чужому языку (английский или румынский)', BG: 'Педагогика на обучението по български език и чужд език (английски или румънски)', EN: 'Pedagogy of Teaching Bulgarian and Foreign Language', RO: 'Pedagogia predării limbii bulgare și a unei limbi străine' },
    description: {
      BG: 'Подготовка на учители по български език и чужд език (английски или румънски) за училища и езикови центрове.',
      RU: 'Подготовка учителей болгарского и иностранного языков (английский или румынский) для школ и языковых центров.',
      EN: 'Training of teachers of Bulgarian and foreign languages (English or Romanian) for schools and language centers.',
      RO: 'Pregătirea profesorilor de limba bulgară și limba străină (engleză sau română) pentru școli și centre lingvistice.'
    },
    duration: { RU: '4 года', BG: '4 години', EN: '4 years', RO: '4 ani' },
    language: 'Български / Английски / Румънски',
    form: { RU: 'Очная', BG: 'Редовна', EN: 'Full-time', RO: 'Full-time' }
  },
  {
    level: 'bachelor',
    title: { RU: 'Педагогика обучения музыке', BG: 'Педагогика на обучението по музика', EN: 'Music Teaching Pedagogy', RO: 'Pedagogia învățământului muzical' },
    description: {
      BG: 'Квалификация за учител по музика. Реализация в училища, читалища и културни институции.',
      RU: 'Квалификация учителя музыки. Реализация в школах, домах культуры и культурных учреждениях.',
      EN: 'Qualification for a music teacher. Career in schools, community centers, and cultural institutions.',
      RO: 'Calificare pentru profesor de muzică. Realizare în școli, centre comunitare și instituții culturale.'
    },
    duration: { RU: '4 года', BG: '4 години', EN: '4 years', RO: '4 ani' },
    language: 'Български / Руски',
    form: { RU: 'Очная', BG: 'Редовна', EN: 'Full-time', RO: 'Full-time' }
  },
  {
    level: 'bachelor',
    title: { RU: 'Бизнес-менеджмент', BG: 'Бизнес мениджмънт', EN: 'Business Management', RO: 'Managementul afacerilor' },
    description: {
      BG: 'Подготовка на специалисти по управление и администрация за бизнес сектора и държавната администрация.',
      RU: 'Подготовка специалистов по управлению и администрации для бизнес-сектора и государственного управления.',
      EN: 'Training of management and administration specialists for the business sector and public administration.',
      RO: 'Pregătirea specialiștilor în management și administrație pentru sectorul de afaceri și administrația publică.'
    },
    duration: { RU: '4 года', BG: '4 години', EN: '4 years', RO: '4 ani' },
    language: 'Български / Руски',
    form: { RU: 'Дистанционная', BG: 'Дистанционна', EN: 'Distance learning', RO: 'Învățământ la distanță' }
  },
  {
    level: 'bachelor',
    title: { RU: 'Компьютерные науки', BG: 'Компютърни науки', EN: 'Computer Science', RO: 'Informatică' },
    description: {
      BG: 'Комплексна подготовка по програмиране, софтуерни системи и мрежи. Реализация в ИТ компании.',
      RU: 'Комплексная подготовка по программированию, программным системам и сетям. Реализация в ИТ-компаниях.',
      EN: 'Comprehensive training in programming, software systems, and networks. Career in IT companies.',
      RO: 'Pregătire cuprinzătoare în programare, sisteme software și rețele. Realizare în companii IT.'
    },
    duration: { RU: '4 года', BG: '4 години', EN: '4 years', RO: '4 ani' },
    language: 'Български / Руски',
    form: { RU: 'Очная', BG: 'Редовна', EN: 'Full-time', RO: 'Full-time' }
  },
  {
    level: 'bachelor',
    title: { RU: 'Земедельческая и автотранспортная техника', BG: 'Земеделска и автотранспортна техника', EN: 'Agricultural and Transport Engineering', RO: 'Inginerie agricolă și de transport' },
    description: {
      BG: 'Подготовка на инженери за проектиране и поддръжка на земеделска и транспортна техника.',
      RU: 'Подготовка инженеров для проектирования и обслуживания сельскохозяйственной и транспортной техники.',
      EN: 'Training of engineers for the design and maintenance of agricultural and transport equipment.',
      RO: 'Pregătirea inginerilor pentru proiectarea și întreținerea echipamentelor agricole și de transport.'
    },
    duration: { RU: '4 года', BG: '4 години', EN: '4 years', RO: '4 ani' },
    language: 'Български / Руски',
    form: { RU: 'Очная', BG: 'Редовна', EN: 'Full-time', RO: 'Full-time' }
  }
];

const INITIAL_DATA: SiteData = {
  pages: [],
  navLinks: INITIAL_NAV,
  documents: [],
  lastUpdated: new Date().toISOString(),
  adminTabOrder: ['dash', 'news', 'programs', 'apps', 'partners', 'docs', 'pages', 'nav', 'system'],
  universityName: {
    BG: 'Русенски университет "Ангел Кънчев"',
    RU: 'Русенский университет "Ангел Кънчев"',
    RO: 'Universitatea „Angel Kanchev" din Ruse',
    EN: '“Angel Kanchev” University of Ruse'
  },
  branchLocation: {
    BG: 'филиал в гр. Тараклия',
    RU: 'филиал в гр. Тараклия',
    RO: 'sucursala Taraclia',
    EN: 'Taraclia Branch'
  },
  logoUrl: 'https://www.uni-ruse.bg/_layouts/15/images/UniRuse/ru-default-logo.png'
};

// Shared state for useSiteData to prevent multiple polling intervals
let globalData: SiteData = INITIAL_DATA;
let globalLoading = true;
let globalIsAdmin = false;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach(l => l());

// Initial fetch
const fetchData = async () => {
  try {
    const resp = await fetch('/api/site');
    if (resp.ok) {
      const text = await resp.text();
      try {
        const fetchedData = JSON.parse(text);
        if (fetchedData && typeof fetchedData === 'object') {
          globalData = {
            ...INITIAL_DATA,
            ...fetchedData,
            pages: fetchedData.pages || [],
            adminTabOrder: fetchedData.adminTabOrder || INITIAL_DATA.adminTabOrder,
            universityName: fetchedData.universityName || INITIAL_DATA.universityName,
            branchLocation: fetchedData.branchLocation || INITIAL_DATA.branchLocation,
            logoUrl: fetchedData.logoUrl || INITIAL_DATA.logoUrl
          };
        }
      } catch (parseErr) {
        console.error("JSON Parse Error:", parseErr, "Response text:", text.substring(0, 100));
      }
    }
  } catch (e) {
    console.error("Fetch Network Error:", e);
  } finally {
    globalLoading = false;
    notify();
  }
};

// Start polling only once
if (typeof window !== 'undefined') {
  fetchData();
  
  // Poll for changes every 2 minutes, only if the tab is visible
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      fetchData();
    }
  }, 120000); 
  
  onAuthStateChanged(auth, (user) => {
    globalIsAdmin = !!user;
    notify();
  });
}

export const useSiteData = () => {
  const [data, setDataState] = useState<SiteData>(globalData);
  const [loading, setLoadingState] = useState(globalLoading);
  const [isAdmin, setIsAdminState] = useState(globalIsAdmin);

  useEffect(() => {
    const listener = () => {
      setDataState(globalData);
      setLoadingState(globalLoading);
      setIsAdminState(globalIsAdmin);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const saveConfig = async (newData: Partial<SiteData>) => {
    try {
      const mergedData = { ...globalData, ...newData, lastUpdated: new Date().toISOString() };
      const resp = await fetch('/api/site', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-upload-auth': UPLOAD_SECRET
        },
        body: JSON.stringify(mergedData)
      });
      if (resp.ok) {
        globalData = mergedData;
        notify();
      }
    } catch (e) { 
      console.error("Save Error:", e);
      throw e;
    }
  };

  const updatePage = async (updatedPage: DynamicPage) => {
    const pages = [...(globalData.pages || [])];
    const index = pages.findIndex(p => p.id === updatedPage.id);
    if (index !== -1) {
      pages[index] = updatedPage;
    } else {
      pages.push(updatedPage);
    }
    await saveConfig({ pages });
  };

  const deletePage = async (pageId: string) => {
    const pages = (globalData.pages || []).filter(p => p.id !== pageId);
    await saveConfig({ pages });
  };

  const updateNav = async (newLinks: NavLink[]) => {
    await saveConfig({ navLinks: newLinks });
  };

  const syncNav = async () => {
    await saveConfig({ navLinks: INITIAL_NAV });
    alert("Навигация синхронизирована с системными настройками!");
  };

  const bootstrapDatabase = async () => {
    try {
      await saveConfig(INITIAL_DATA);
      alert("Системные настройки сброшены!");
      fetchData();
    } catch (e) {
      console.error("Bootstrap Error:", e);
    }
  };

  const seedFirestore = async (db: any, serverTimestamp: any) => {
    const { collection, addDoc, getDocs, query, limit } = await import('firebase/firestore');
    
    try {
      // 1. Seed Programs if empty
      const progSnap = await getDocs(query(collection(db, "programs"), limit(1)));
      if (progSnap.empty) {
        for (const prog of DEFAULT_PROGRAMS) {
          await addDoc(collection(db, "programs"), {
            ...prog,
            timestamp: serverTimestamp()
          });
        }
      }

      // 2. Seed News if empty
      const newsSnap = await getDocs(query(collection(db, "news"), limit(1)));
      if (newsSnap.empty) {
        await addDoc(collection(db, "news"), {
          title: { 
            RU: 'Добро пожаловать в филиал Русенского университета в Тараклии', 
            BG: 'Добре дошли във филиала на Русенския университет в Тараклия',
            EN: 'Welcome to the Taraclia Branch of the University of Ruse',
            RO: 'Bun venit la filiala Taraclia a Universității din Ruse'
          },
          excerpt: { 
            RU: 'Мы рады приветствовать вас на нашем новом официальном сайте.', 
            BG: 'Радваме се да ви приветстваме на нашия нов официален уебсайт.',
            EN: 'We are happy to welcome you to our new official website.',
            RO: 'Suntem bucuroși să vă urăm bun venit pe noul nostru site oficial.'
          },
          fullContent: { 
            RU: 'Это первая новость на нашем сайте. Здесь вы найдете самую актуальную информацию о жизни университета.', 
            BG: 'Това е първата новина на нашия сайт. Тук ще намерите най-актуалната информация за живота на университета.',
            EN: 'This is the first news on our site. Here you will find the most up-to-date information about university life.',
            RO: 'Aceasta este prima știre de pe site-ul nostru. Aceasta este prima știre de pe site-ul nostru. Aici veți găsi cele mai actuale informații despre viața universitară.'
          },
          category: 'academic',
          images: ['https://www.uni-ruse.bg/PublishingImages/Main_Building.jpg'],
          date: new Date().toLocaleDateString(),
          timestamp: serverTimestamp(),
          author: 'System'
        });
      }

      // 3. Seed Documents if empty
      const docSnap = await getDocs(query(collection(db, "documents"), limit(1)));
      if (docSnap.empty) {
        await addDoc(collection(db, "documents"), {
          title: { 
            RU: 'Устав Русенского университета', 
            BG: 'Устав на Русенския университет',
            EN: 'Statutes of the University of Ruse',
            RO: 'Statutul Universității din Ruse'
          },
          url: 'https://www.uni-ruse.bg/files/Pravilnik_RU_2022.pdf',
          category: 'regulations',
          timestamp: serverTimestamp()
        });
      }

      return true;
    } catch (e) {
      console.error("Seed Error:", e);
      throw e;
    }
  };

  return { data, loading, updatePage, deletePage, updateNav, syncNav, isAdmin, bootstrapDatabase, seedFirestore, saveConfig };
};
