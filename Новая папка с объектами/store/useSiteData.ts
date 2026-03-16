
import { useState, useEffect } from 'react';
import { SiteData, DynamicPage, NavLink, Language, Program } from '../types';
import { db, auth, onAuthStateChanged } from '../firebase';
import { doc, setDoc, onSnapshot, collection, writeBatch, serverTimestamp } from 'firebase/firestore';

const INITIAL_NAV: NavLink[] = [
  { id: 'n1', label: { BG: 'Начало', RU: 'Главная', RO: 'Acasă', EN: 'Home' }, path: '/' },
  { id: 'n2', label: { BG: 'Университет', RU: 'Университет', RO: 'Universitate', EN: 'University' }, children: [
    { id: 'n2-1', path: '/about', label: { BG: 'За университета', RU: 'Об университете', RO: 'Despre universitate', EN: 'About' } },
    { id: 'n2-2', path: '/management', label: { BG: 'Ръководство', RU: 'Руководство', RO: 'Conducere', EN: 'Management' } },
    { id: 'n2-3', path: '/regulations', label: { BG: 'Нормативна база', RU: 'Нормативная база', RO: 'Cadrul normativ', EN: 'Regulations' } },
    { id: 'n2-4', path: '/library', label: { BG: 'Библиотека', RU: 'Библиотека', RO: 'Biblioteca', EN: 'Library' } }
  ]},
  { id: 'n3', label: { BG: 'Студенти', RU: 'Студенты', RO: 'Studenți', EN: 'Students' }, children: [
    { id: 'n3-1', path: '/calendar', label: { BG: 'График на учебния процес', RU: 'График учебного процесса', RO: 'Calendar academic', EN: 'Academic Calendar' } },
    { id: 'n3-2', path: '/exams', label: { BG: 'Изпитна сесия', RU: 'Экзаменационная сессия', RO: 'Sesiunea de examene', EN: 'Exam Session' } },
    { id: 'n3-3', path: '/scholarships', label: { BG: 'Стипендии', RU: 'Стипендии', RO: 'Burse', EN: 'Scholarships' } }
  ]},
  { id: 'n4', label: { BG: 'Прием', RU: 'Поступление', RO: 'Admitere', EN: 'Admission' }, path: '/admission' },
  { id: 'n5', label: { BG: 'Новини', RU: 'Новости', RO: 'Știri', EN: 'News' }, path: '/news' },
  { id: 'n6', label: { BG: 'Контакти', RU: 'Контакты', RO: 'Contacte', EN: 'Contacts' }, path: '/contacts' }
];

const DEFAULT_PROGRAMS: Partial<Program>[] = [
  {
    level: 'bachelor',
    title: { RU: 'Дошкольная и начальная школьная педагогика', BG: 'Предучилищна и начална училищна педагогика', EN: 'Preschool and Primary School Pedagogy', RO: 'Pedagogie preșcolară și școlară primară' },
    duration: { RU: '4 года', BG: '4 години', EN: '4 years', RO: '4 ani' },
    language: 'Български / Руски',
    form: { RU: 'Очная', BG: 'Редовна', EN: 'Full-time', RO: 'Full-time' }
  },
  {
    level: 'bachelor',
    title: { RU: 'Педагогика обучения музыке', BG: 'Педагогика на обучението по музика', EN: 'Music Teaching Pedagogy', RO: 'Pedagogia învățământului muzical' },
    duration: { RU: '4 года', BG: '4 години', EN: '4 years', RO: '4 ani' },
    language: 'Български / Руски',
    form: { RU: 'Очная', BG: 'Редовна', EN: 'Full-time', RO: 'Full-time' }
  },
  {
    level: 'bachelor',
    title: { RU: 'Болгарский язык и история', BG: 'Български език и история', EN: 'Bulgarian Language and History', RO: 'Limba bulgară și istorie' },
    duration: { RU: '4 года', BG: '4 години', EN: '4 years', RO: '4 ani' },
    language: 'Български / Руски',
    form: { RU: 'Очная', BG: 'Редовна', EN: 'Full-time', RO: 'Full-time' }
  },
  {
    level: 'bachelor',
    title: { RU: 'Болгарский язык и иностранный язык', BG: 'Български език и чужд език', EN: 'Bulgarian and Foreign Language', RO: 'Limba bulgară și limbă străină' },
    duration: { RU: '4 года', BG: '4 години', EN: '4 years', RO: '4 ani' },
    language: 'Български / Руски',
    form: { RU: 'Очная', BG: 'Редовна', EN: 'Full-time', RO: 'Full-time' }
  },
  {
    level: 'bachelor',
    title: { RU: 'Бизнес-менеджмент', BG: 'Бизнес мениджмънт', EN: 'Business Management', RO: 'Managementul afacerilor' },
    duration: { RU: '4 года', BG: '4 години', EN: '4 years', RO: '4 ani' },
    language: 'Български / Руски',
    form: { RU: 'Очная', BG: 'Редовна', EN: 'Full-time', RO: 'Full-time' }
  },
  {
    level: 'bachelor',
    title: { RU: 'Компьютерные науки', BG: 'Компютърни науки', EN: 'Computer Science', RO: 'Informatică' },
    duration: { RU: '4 года', BG: '4 години', EN: '4 years', RO: '4 ani' },
    language: 'Български / Руски',
    form: { RU: 'Очная', BG: 'Редовна', EN: 'Full-time', RO: 'Full-time' }
  },
  {
    level: 'bachelor',
    title: { RU: 'Сельскохозяйственная и автотранспортная техника', BG: 'Земеделска и автотранспортна техника', EN: 'Agricultural and Transport Engineering', RO: 'Inginerie agricolă și de transport' },
    duration: { RU: '4 года', BG: '4 години', EN: '4 years', RO: '4 ani' },
    language: 'Български / Руски',
    form: { RU: 'Очная', BG: 'Редовна', EN: 'Full-time', RO: 'Full-time' }
  }
];

const INITIAL_DATA: SiteData = {
  pages: [],
  navLinks: INITIAL_NAV,
  lastUpdated: new Date().toISOString(),
  adminTabOrder: ['dash', 'news', 'programs', 'apps', 'partners', 'pages', 'nav', 'system']
};

export const useSiteData = () => {
  const [data, setData] = useState<SiteData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => setIsAdmin(!!user));
    
    const unsub = onSnapshot(doc(db, "site", "config"), (docSnap) => {
      if (docSnap.exists()) {
        const fetchedData = docSnap.data() as SiteData;
        setData({
          ...INITIAL_DATA,
          ...fetchedData,
          pages: fetchedData.pages || [],
          adminTabOrder: fetchedData.adminTabOrder || INITIAL_DATA.adminTabOrder
        });
      }
      setLoading(false);
    });
    
    return () => unsub();
  }, []);

  const saveConfig = async (newData: Partial<SiteData>) => {
    try {
      const mergedData = { ...data, ...newData, lastUpdated: new Date().toISOString() };
      await setDoc(doc(db, "site", "config"), mergedData, { merge: true });
    } catch (e) { 
      console.error("Save Error:", e);
      throw e;
    }
  };

  const updatePage = async (updatedPage: DynamicPage) => {
    const pages = [...(data.pages || [])];
    const index = pages.findIndex(p => p.id === updatedPage.id);
    if (index !== -1) {
      pages[index] = updatedPage;
    } else {
      pages.push(updatedPage);
    }
    await saveConfig({ pages });
  };

  const deletePage = async (pageId: string) => {
    const pages = (data.pages || []).filter(p => p.id !== pageId);
    await saveConfig({ pages });
  };

  const updateNav = async (newLinks: NavLink[]) => {
    await saveConfig({ navLinks: newLinks });
  };

  const bootstrapDatabase = async () => {
    const batch = writeBatch(db);
    const configRef = doc(db, "site", "config");
    batch.set(configRef, INITIAL_DATA);
    DEFAULT_PROGRAMS.forEach(prog => {
      const progRef = doc(collection(db, "programs"));
      batch.set(progRef, { ...prog, timestamp: serverTimestamp() });
    });
    await batch.commit();
    alert("Система сброшена!");
  };

  return { data, loading, updatePage, deletePage, updateNav, isAdmin, bootstrapDatabase, saveConfig };
};
