import React, { useState, useEffect } from 'react';
import { Language, ContentBlock, Program, DynamicPage } from '../types';
import { useSiteData } from '../store/useSiteData';
import { useLocation, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Settings, Plus, Trash2, ArrowUp, ArrowDown, X, Image as ImageIcon, Check, Edit3, Users, BarChart3, Globe, Mail, Facebook, Clock, Coffee, CheckCircle2, Phone, Book, FilePlus, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/* =======================================================
   PROGRAMS LIST
======================================================= */

const ProgramsList: React.FC<{ lang: Language }> = ({ lang }) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = collection(db, "programs");
    return onSnapshot(q, (snap) => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as Program));
      const sorted = fetched.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setPrograms(sorted);
      setLoading(false);
    }, (err) => {
      console.error("ProgramsList Error:", err);
      setLoading(false);
    });
  }, []);

  const t = {
    BG: {
      apply: 'Кандидатствай',
      duration: 'Продължителност',
      level: 'Степен',
      loadingPrograms: 'Зареждане на програми...',
      noPrograms: 'Няма налични програми',
      format: 'Форма',
      fullTime: 'Редовна',
    },
    RU: {
      apply: 'Подать заявку',
      duration: 'Срок обучения',
      level: 'Уровень',
      loadingPrograms: 'Загрузка программ...',
      noPrograms: 'Нет доступных программ',
      format: 'Формат',
      fullTime: 'Очная',
    },
    RO: {
      apply: 'Aplică',
      duration: 'Durată',
      level: 'Nivel',
      loadingPrograms: 'Se încarcă programe...',
      noPrograms: 'Nu există programe disponibile',
      format: 'Forma',
      fullTime: 'Cu frecvență',
    },
    EN: {
      apply: 'Apply',
      duration: 'Duration',
      level: 'Level',
      loadingPrograms: 'Loading programs...',
      noPrograms: 'No programs available',
      format: 'Format',
      fullTime: 'Full-time',
    }
  }[lang] || { apply: 'Apply', duration: 'Duration', level: 'Level', loadingPrograms: 'Loading programs...', noPrograms: 'No programs available', format: 'Format', fullTime: 'Full-time' };

  if (loading) return (
    <div className="py-20 text-center flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-[#FFCC00] border-t-transparent rounded-full animate-spin"></div>
      <p className="animate-pulse text-slate-300 font-black text-[10px] uppercase tracking-widest">{t.loadingPrograms}</p>
    </div>
  );

  if (programs.length === 0) return (
    <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest">
      {t.noPrograms}
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-6 my-12 animate-fadeIn">
      {programs.map(p => (
        <div key={p.id} className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFCC00]/5 -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[9px] font-black text-[#FFCC00] bg-[#003366] px-4 py-1.5 rounded-lg uppercase tracking-widest shadow-sm">
                  {Array.isArray(p.level) 
                    ? p.level.map(l => l.toUpperCase()).join(' / ') 
                    : String(p.level || '').toUpperCase()
                  }
                </span>
                <div className="h-px w-8 bg-slate-100"></div>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-[#003366] serif italic group-hover:text-blue-700 transition-colors leading-tight">
                {p.title?.[lang] || p.title?.RU || 'Без названия'}
              </h3>
              
              <div className="flex flex-wrap gap-8 mt-6">
                <div>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1">{t.duration}</span>
                  <p className="text-sm font-bold text-slate-600 uppercase">
                    {p.duration?.[lang] || p.duration?.RU || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1">{t.format}</span>
                  <p className="text-sm font-bold text-slate-600 uppercase">
                    {p.form?.[lang] || p.form?.RU || t.fullTime}
                  </p>
                </div>
              </div>
            </div>

            <Link 
              to="/admission" 
              className="w-full md:w-auto bg-[#003366] text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#FFCC00] hover:text-[#003366] transition-all shadow-lg text-center"
            >
              {t.apply}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

/* =======================================================
   LIGHTBOX
======================================================= */

const Lightbox: React.FC<{ image: string; onClose: () => void }> = ({ image, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-[2000] p-4 md:p-12"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative max-w-full max-h-full"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={image}
          alt="Lightbox"
          className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/10"
          referrerPolicy="no-referrer"
        />
        <button 
          onClick={onClose} 
          className="absolute -top-12 -right-12 md:top-0 md:-right-16 text-white/50 hover:text-white transition-colors p-2"
        >
          <X size={32} />
        </button>
      </motion.div>
    </div>
  );
};

/* =======================================================
   BLOCK RENDERER
======================================================= */

const BlockRenderer: React.FC<{
  block: ContentBlock;
  lang: Language;
  isEditMode?: boolean;
  updateBlock?: (data: any) => void;
}> = ({ block, lang, isEditMode, updateBlock }) => {
  const data = block.data || {};
  const [lightbox, setLightbox] = useState<string | null>(null);

  const t = (field: string) => {
    const val = data[field];
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      return val[lang] || val['RU'] || '';
    }
    return val || '';
  };

  const tBlock = {
    BG: {
      imageURLPlaceholder: 'URL изображение',
      enterToAdd: 'Нажмите Enter для добавления',
      title: 'Контакты',
      content: 'Дополнительная информация...'
    },
    RU: {
      imageURLPlaceholder: 'URL изображения',
      enterToAdd: 'Нажмите Enter для добавления',
      title: 'Контакты',
      content: 'Дополнительная информация...'
    },
    RO: {
      imageURLPlaceholder: 'URL imagine',
      enterToAdd: 'Apăsați Enter pentru a adăuga',
      title: 'Contacte',
      content: 'Informații suplimentare...'
    },
    EN: {
      imageURLPlaceholder: 'Image URL',
      enterToAdd: 'Press Enter to add',
      title: 'Contacts',
      content: 'Additional information...'
    }
  }[lang] || { imageURLPlaceholder: 'Image URL', enterToAdd: 'Press Enter to add', title: 'Contacts', content: 'Additional information...' };

  const wrapperStyle = `
    ${block.style?.padding || 'py-16'}
    ${block.style?.rounded || ''}
    ${block.style?.shadow ? 'shadow-2xl' : ''}
  `;

  const ComponentMap: { [key: string]: React.FC<any> } = {
    // Add your custom React components here
    // Example: MyCustomComponent: MyCustomComponent,
  };

  switch (block.type) {
    case 'hero':
      return (
        <section className={`bg-[#001a33] text-white px-12 rounded-[4rem] relative overflow-hidden mb-16 ${wrapperStyle}`}>
          <div className="relative z-10 max-w-3xl text-left">
            <h1
              contentEditable={isEditMode}
              suppressContentEditableWarning
              onBlur={(e) =>
                updateBlock?.({
                  ...data,
                  title: { ...data.title, [lang]: e.currentTarget.innerText },
                })
              }
              className={`text-5xl md:text-7xl font-bold serif italic mb-8 leading-tight outline-none ${isEditMode ? 'focus:ring-2 focus:ring-[#FFCC00] rounded-lg p-2 -m-2' : ''}`}
            >
              {t('title') || 'Hero title'}
            </h1>
            <p
              contentEditable={isEditMode}
              suppressContentEditableWarning
              onBlur={(e) =>
                updateBlock?.({
                  ...data,
                  content: { ...data.content, [lang]: e.currentTarget.innerText },
                })
              }
              className={`text-xl text-white/60 font-light leading-relaxed outline-none ${isEditMode ? 'focus:ring-2 focus:ring-[#FFCC00] rounded-lg p-2 -m-2' : ''}`}
            >
              {t('content') || t('subtitle') || 'Hero content'}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#FFCC00]/5 to-transparent"></div>
        </section>
      );

    case 'text':
      return (
        <div className={`bg-slate-50/50 px-12 rounded-[3rem] mb-16 text-left ${wrapperStyle}`}>
          <div
            contentEditable={isEditMode}
            suppressContentEditableWarning
            onBlur={(e) =>
              updateBlock?.({
                ...data,
                content: { ...data.content, [lang]: e.currentTarget.innerHTML },
              })
            }
            dangerouslySetInnerHTML={{ __html: t('content') || '<p>Text...</p>' }}
            className={`prose prose-slate max-w-none text-lg leading-relaxed text-slate-700 font-light outline-none ${isEditMode ? 'focus:ring-2 focus:ring-[#FFCC00] rounded-lg p-2 -m-2' : ''}`}
          />
        </div>
      );

    case 'image-text':
      return (
        <div className={`flex flex-col md:flex-row gap-16 items-center mb-24 ${data.reverse ? 'md:flex-row-reverse' : ''} ${wrapperStyle}`}>
          <div className="w-full md:w-1/2 relative group/img">
            <img src={data.image || 'https://picsum.photos/800/1000'} alt="" className="rounded-[3.5rem] shadow-2xl w-full aspect-[4/5] object-cover" />
            {isEditMode && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity rounded-[3.5rem]">
                <input 
                  type="text" 
                  placeholder="URL изображения" 
                  className="bg-white p-4 rounded-xl text-xs w-2/3"
                  value={data.image || ''}
                  onChange={(e) => updateBlock?.({ ...data, image: e.target.value })}
                />
              </div>
            )}
          </div>
          <div className="w-full md:w-1/2 text-left">
            <h2
              contentEditable={isEditMode}
              suppressContentEditableWarning
              onBlur={(e) =>
                updateBlock?.({
                  ...data,
                  title: { ...data.title, [lang]: e.currentTarget.innerText },
                })
              }
              className={`text-4xl font-bold text-[#003366] serif italic mb-8 leading-tight outline-none ${isEditMode ? 'focus:ring-2 focus:ring-[#FFCC00] rounded-lg p-2 -m-2' : ''}`}
            >
              {t('title') || 'Title'}
            </h2>
            <div
              contentEditable={isEditMode}
              suppressContentEditableWarning
              onBlur={(e) =>
                updateBlock?.({
                  ...data,
                  content: { ...data.content, [lang]: e.currentTarget.innerHTML },
                })
              }
              dangerouslySetInnerHTML={{ __html: t('content') || '<p>Content...</p>' }}
              className={`text-slate-600 leading-relaxed font-light text-xl outline-none ${isEditMode ? 'focus:ring-2 focus:ring-[#FFCC00] rounded-lg p-2 -m-2' : ''}`}
            />
          </div>
        </div>
      );

    case 'gallery':
      return (
        <section className={`mb-24 ${wrapperStyle}`}>
          <div className="flex items-center gap-6 mb-12">
            <h2
              contentEditable={isEditMode}
              suppressContentEditableWarning
              onBlur={(e) =>
                updateBlock?.({
                    ...data,
                    title: { ...data.title, [lang]: e.currentTarget.innerText },
                  })
                }
              className={`text-4xl md:text-6xl font-bold text-[#003366] serif italic text-left outline-none ${isEditMode ? 'focus:ring-2 focus:ring-[#FFCC00] rounded-lg p-2 -m-2' : ''}`}
            >
              {t('title') || 'Gallery'}
            </h2>
            <div className="h-px flex-grow bg-slate-100"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.images?.map((img: string, i: number) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={i}
                className="relative aspect-square overflow-hidden rounded-[2.5rem] shadow-lg group cursor-zoom-in border border-slate-100 bg-slate-50"
                onClick={() => !isEditMode && setLightbox(img)}
              >
                <img
                  src={img}
                  alt={`Gallery ${i}`}
                  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/' + i + '/800/800';
                  }}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
                      <Maximize2 size={20} />
                   </div>
                </div>
                {isEditMode && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const newImages = data.images.filter((_: any, idx: number) => idx !== i);
                      updateBlock?.({ ...data, images: newImages });
                    }}
                    className="absolute top-4 right-4 bg-red-500 text-white p-3 rounded-2xl shadow-lg z-20 hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </motion.div>
            ))}
            {isEditMode && (
              <div className="aspect-square rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 p-8 bg-slate-50/50">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ImageIcon size={24} />
                </div>
                <input 
                  type="text" 
                  placeholder={tBlock.imageURLPlaceholder} 
                  className="w-full p-4 bg-white rounded-2xl text-xs shadow-sm outline-none focus:ring-2 focus:ring-[#FFCC00]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = e.currentTarget.value;
                      if (val) {
                        updateBlock?.({ ...data, images: [...(data.images || []), val] });
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
                <p className="text-[8px] font-black uppercase text-slate-300 tracking-widest">{tBlock.enterToAdd}</p>
              </div>
            )}
          </div>

          <AnimatePresence>
            {lightbox && <Lightbox image={lightbox} onClose={() => setLightbox(null)} />}
          </AnimatePresence>
        </section>
      );

    case 'programs':
      return <ProgramsList lang={lang} />;

    case 'stats':
      return (
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 mb-24 ${wrapperStyle}`}>
          {(data.stats || [
            { label: { RU: 'Показатель', BG: '' }, value: '100', sub: { RU: 'описание', BG: '' } },
            { label: { RU: 'Показатель', BG: '' }, value: '200', sub: { RU: 'описание', BG: '' } }
          ]).map((stat: any, i: number) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center group hover:shadow-xl transition-all">
              <div 
                contentEditable={isEditMode}
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newStats = [...data.stats];
                  newStats[i].value = e.currentTarget.innerText;
                  updateBlock?.({ ...data, stats: newStats });
                }}
                className="text-4xl font-black text-[#003366] mb-2 group-hover:text-[#FFCC00] transition-colors outline-none"
              >
                {stat.value}
              </div>
              <div 
                contentEditable={isEditMode}
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newStats = [...data.stats];
                  newStats[i].label = { ...newStats[i].label, [lang]: e.currentTarget.innerText };
                  updateBlock?.({ ...data, stats: newStats });
                }}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 outline-none"
              >
                {stat.label?.[lang] || stat.label?.RU}
              </div>
            </div>
          ))}
        </div>
      );

    case 'person-grid':
      return (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 mb-24 ${wrapperStyle}`}>
          {(data.people || [
            { name: 'Имя Фамилия', role: { RU: 'Должность', BG: '' }, email: 'email@example.com', phone: '000', image: 'https://picsum.photos/seed/1/400/500' }
          ]).map((person: any, i: number) => (
            <div key={i} className="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col md:flex-row h-full group">
              <div className="md:w-2/5 relative overflow-hidden aspect-[4/5] md:aspect-auto">
                <img src={person.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
              </div>
              <div className="md:w-3/5 p-8 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#003366]/40 mb-4 block">
                    {person.role?.[lang] || person.role?.RU}
                  </span>
                  <h3 className="text-2xl font-serif text-[#003366] mb-4">{person.name}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                      <Phone size={14} /> {person.phone}
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                      <Mail size={14} /> {person.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case 'service-grid':
      return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24 ${wrapperStyle}`}>
          {(data.services || [
            { title: { RU: 'Услуга', BG: '' }, desc: { RU: 'Описание услуги...', BG: '' } }
          ]).map((service: any, i: number) => (
            <div key={i} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#FFCC00] flex items-center justify-center text-[#003366] mb-6">
                <CheckCircle2 size={18} />
              </div>
              <h3 className="text-lg font-bold text-[#003366] mb-3">{service.title?.[lang] || service.title?.RU}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{service.desc?.[lang] || service.desc?.RU}</p>
            </div>
          ))}
        </div>
      );

    case 'contact-card':
      return (
        <div className={`bg-[#003366] text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden mb-24 ${wrapperStyle}`}>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-serif italic mb-8">{tBlock.title || 'Контакты'}</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#FFCC00]">
                    <Mail size={20} />
                  </div>
                  <span className="text-lg font-medium">{data.email || 'email@uni-ruse.bg'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#FFCC00]">
                    <Clock size={20} />
                  </div>
                  <span className="text-lg font-medium">{data.hours || '08:00 - 17:00'}</span>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-8 border border-white/10">
               <p className="text-white/60 italic leading-relaxed">{tBlock.content || 'Дополнительная информация...'}</p>
            </div>
          </div>
        </div>
      );

    case 'react-component':
      const Component = ComponentMap[data.componentName];
      if (!Component) return <div className="text-red-500">Component '{data.componentName}' not found.</div>;
      return <Component {...data.props} />;

    default:
      return null;
  }
};

/* =======================================================
   GENERIC PAGE
======================================================= */

const GenericPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const { data, updatePage, isAdmin } = useSiteData();
  const location = useLocation();
  const slug = location.pathname.replace('/', '').toLowerCase();

  const [isEditMode, setIsEditMode] = useState(false);
  const [showCreatePageModal, setShowCreatePageModal] = useState(false);

  const t = {
    BG: {
      deleteBlockConfirm: 'Изтриване на този блок?',
      newBlockTitle: 'Нов блок',
      newBlockContent: 'Съдържание на блока...',
      finishEdit: 'Завърши',
      edit: 'Редактиране',
      emptyPage: 'Празна страница',
      createNewPage: 'Създайте нова страница',
      pageSlug: 'Псевдоним на страницата (URL)',
      pageTitle: 'Заглавие на страницата',
      create: 'Създай',
      cancel: 'Отказ',
      slugExists: 'Псевдонимът вече съществува!',
      pageCreated: 'Страницата е създадена успешно!',
      allFieldsRequired: 'Всички полета са задължителни'
    },
    RU: {
      deleteBlockConfirm: 'Удалить этот блок?',
      newBlockTitle: 'Новый блок',
      newBlockContent: 'Содержимое блока...',
      finishEdit: 'Завершить',
      edit: 'Редактировать',
      emptyPage: 'Пустая страница',
      createNewPage: 'Создать новую страницу',
      pageSlug: 'Адрес страницы (URL)',
      pageTitle: 'Заголовок страницы',
      create: 'Создать',
      cancel: 'Отмена',
      slugExists: 'Адрес уже существует!',
      pageCreated: 'Страница успешно создана!',
      allFieldsRequired: 'Все поля обязательны'
    },
    RO: {
      deleteBlockConfirm: 'Șterge този блок?',
      newBlockTitle: 'Bloc nou',
      newBlockContent: 'Conținutul blocului...',
      finishEdit: 'Finalizează',
      edit: 'Editează',
      emptyPage: 'Pagina goală',
      createNewPage: 'Creați o pagină nouă',
      pageSlug: 'Slug pagină (URL)',
      pageTitle: 'Titlul paginii',
      create: 'Creează',
      cancel: 'Anulează',
      slugExists: 'Slug-ul există deja!',
      pageCreated: 'Pagina a fost creată cu succes!',
      allFieldsRequired: 'Toate câmpurile sunt obligatorii'
    },
    EN: {
      deleteBlockConfirm: 'Delete this block?',
      newBlockTitle: 'New block',
      newBlockContent: 'Block content...',
      finishEdit: 'Finish',
      edit: 'Edit',
      emptyPage: 'Empty page',
      createNewPage: 'Create New Page',
      pageSlug: 'Page Slug (URL)',
      pageTitle: 'Page Title',
      create: 'Create',
      cancel: 'Cancel',
      slugExists: 'Slug already exists!',
      pageCreated: 'Page created successfully!',
      allFieldsRequired: 'All fields are required'
    }
  }[lang] || { deleteBlockConfirm: 'Delete this block?', newBlockTitle: 'New block', newBlockContent: 'Block content...', finishEdit: 'Finish', edit: 'Edit', emptyPage: 'Empty page', createNewPage: 'Create New Page', pageSlug: 'Page Slug (URL)', pageTitle: 'Page Title', create: 'Create', cancel: 'Cancel', slugExists: 'Slug already exists!', pageCreated: 'Page created successfully!', allFieldsRequired: 'All fields are required' };

  const pages = data.pages || [];
  const page = pages.find(p => p.slug === slug);

  if (!page) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-1 bg-slate-100 mb-12"></div>
        <h1 className="text-xl font-bold text-slate-200 uppercase tracking-[0.8em]">{t.emptyPage}</h1>
      </div>
    );
  }

  const handleUpdateBlock = (index: number, newData: any) => {
    const newBlocks = [...page.blocks];
    newBlocks[index].data = newData;
    updatePage({ ...page, blocks: newBlocks });
  };

  const moveBlock = (index: number, dir: 'up' | 'down') => {
    const newBlocks = [...page.blocks];
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newBlocks.length) return;
    [newBlocks[index], newBlocks[target]] = [newBlocks[target], newBlocks[index]];
    updatePage({ ...page, blocks: newBlocks });
  };

  const deleteBlock = (index: number) => {
    if (!window.confirm(t.deleteBlockConfirm)) return;
    const newBlocks = page.blocks.filter((_, i) => i !== index);
    updatePage({ ...page, blocks: newBlocks });
  };

  const addBlock = (type: string) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type: type as any,
      data: {
        title: { RU: t.newBlockTitle, BG: '', EN: '', RO: '' },
        content: { RU: t.newBlockContent, BG: '', EN: '', RO: '' }
      },
      style: { padding: 'py-24' },
    };

    updatePage({ ...page, blocks: [...page.blocks, newBlock] });
  };

  return (
    <div className="min-h-screen bg-white pb-40">

      {/* EDIT BUTTON */}
      {isAdmin && (
        <div className="fixed bottom-10 right-10 z-[1000] flex flex-col gap-4 items-end">
          {isEditMode && (
            <div className="bg-white p-4 rounded-3xl shadow-2xl border border-slate-100 flex flex-wrap gap-2 animate-fadeIn max-w-[80vw]">
              {(['hero', 'text', 'image-text', 'gallery', 'cta', 'programs', 'stats', 'person-grid', 'service-grid', 'contact-card', 'react-component'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => addBlock(type)}
                  className="px-4 py-2 bg-slate-50 text-[#003366] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#FFCC00] transition-all"
                >
                  + {type}
                </button>
              ))}
              <button
                onClick={() => setShowCreatePageModal(true)}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2"
              >
                <FilePlus size={12} /> {t.createNewPage}
              </button>
            </div>
          )}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all ${isEditMode ? 'bg-[#FFCC00] text-[#003366]' : 'bg-[#003366] text-white'}`}
          >
            {isEditMode ? <Check size={16} /> : <Edit3 size={16} />}
            {isEditMode ? t.finishEdit : t.edit}
          </button>
        </div>
      )}

      {showCreatePageModal && (
        <CreatePageModal
          lang={lang}
          onClose={() => setShowCreatePageModal(false)}
          existingSlugs={pages.map(p => p.slug)}
          onCreate={async (slug, title) => {
            const newPage: DynamicPage = {
              id: '', // Firebase will assign this
              slug: slug,
              title: { BG: title, RU: title, RO: title, EN: title },
              blocks: [
                {
                  id: 'hero-initial',
                  type: 'hero',
                  data: {
                    title: { BG: title, RU: title, RO: title, EN: title },
                    content: { BG: 'Добре дошли на новата страница!', RU: 'Добро пожаловать на новую страницу!', RO: 'Bine ați venit pe noua pagină!', EN: 'Welcome to your new page!' }
                  },
                  style: { padding: 'py-24' }
                },
                {
                  id: 'text-initial',
                  type: 'text',
                  data: {
                    content: { BG: '<p>Начните редактировать эту страницу, добавляя или изменяя блоки.</p>', RU: '<p>Начните редактировать эту страницу, добавляя или изменяя блоки.</p>', RO: '<p>Începeți să editați această pagină adăugând sau modificând blocuri.</p>', EN: '<p>Start editing this page by adding or modifying blocks.</p>' }
                  },
                  style: { padding: 'py-16' }
                }
              ],
              isPublished: true,
            };
            await addDoc(collection(db, 'pages'), { ...newPage, timestamp: serverTimestamp() });
            setShowCreatePageModal(false);
            alert(t.pageCreated);
          }}
        />
      )}

      <div className="max-w-6xl mx-auto px-6 pt-32">

        {page.blocks && page.blocks.length > 0 ? (
          page.blocks.map((block, index) => (
            <div key={block.id} className="relative group">
              {isEditMode && (
                <div className="absolute -left-16 top-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  <button onClick={() => moveBlock(index, 'up')} className="bg-white p-2 rounded-lg shadow-md hover:bg-slate-50 text-slate-400 hover:text-[#003366]"><ArrowUp size={16} /></button>
                  <button onClick={() => moveBlock(index, 'down')} className="bg-white p-2 rounded-lg shadow-md hover:bg-slate-50 text-slate-400 hover:text-[#003366]"><ArrowDown size={16} /></button>
                  <button onClick={() => deleteBlock(index)} className="bg-white p-2 rounded-lg shadow-md hover:bg-red-50 text-red-300 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              )}

              <BlockRenderer
                block={block}
                lang={lang}
                isEditMode={isEditMode}
                updateBlock={(newData) => handleUpdateBlock(index, newData)}
              />
            </div>
          ))
        ) : (
          <div className="py-40 text-center">
             <ProgramsList lang={lang} />
          </div>
        )}

      </div>
    </div>
  );
};

interface CreatePageModalProps {
  lang: Language;
  onClose: () => void;
  existingSlugs: string[];
  onCreate: (slug: string, title: string) => Promise<void>;
}

const CreatePageModal: React.FC<CreatePageModalProps> = ({ lang, onClose, existingSlugs, onCreate }) => {
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const t = {
    BG: {
      createNewPage: 'Създайте нова страница',
      pageSlug: 'Псевдоним на страницата (URL)',
      pageTitle: 'Заглавие на страницата',
      create: 'Създай',
      cancel: 'Отказ',
      slugExists: 'Псевдонимът вече съществува!',
      pageCreated: 'Страницата е създадена успешно!',
      allFieldsRequired: 'Всички полета са задължителни'
    },
    RU: {
      createNewPage: 'Создать новую страницу',
      pageSlug: 'Адрес страницы (URL)',
      pageTitle: 'Заголовок страницы',
      create: 'Создать',
      cancel: 'Отмена',
      slugExists: 'Адрес уже существует!',
      pageCreated: 'Страница успешно создана!',
      allFieldsRequired: 'Все поля обязательны'
    },
    RO: {
      createNewPage: 'Creați o pagină nouă',
      pageSlug: 'Slug pagină (URL)',
      pageTitle: 'Titlul paginii',
      create: 'Creează',
      cancel: 'Anulează',
      slugExists: 'Slug-ul există deja!',
      pageCreated: 'Pagina a fost creată cu succes!',
      allFieldsRequired: 'Toate câmpurile sunt obligatorii'
    },
    EN: {
      createNewPage: 'Create New Page',
      pageSlug: 'Page Slug (URL)',
      pageTitle: 'Page Title',
      create: 'Create',
      cancel: 'Cancel',
      slugExists: 'Slug already exists!',
      pageCreated: 'Page created successfully!',
      allFieldsRequired: 'All fields are required'
    }
  }[lang] || { createNewPage: 'Create New Page', pageSlug: 'Page Slug (URL)', pageTitle: 'Page Title', create: 'Create', cancel: 'Cancel', slugExists: 'Slug already exists!', pageCreated: 'Page created successfully!', allFieldsRequired: 'All fields are required' };

  const handleSubmit = async () => {
    if (existingSlugs.includes(slug.toLowerCase())) {
      setError(t.slugExists);
      return;
    }
    if (!slug || !title) {
      setError(t.allFieldsRequired);
      return;
    }
    setError('');
    await onCreate(slug.toLowerCase(), title);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[2000] animate-fadeIn p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md animate-slideUp">
        <h3 className="text-2xl font-bold text-[#003366] mb-6">{t.createNewPage}</h3>
        <div className="space-y-4 mb-8">
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-slate-700 mb-2">{t.pageSlug}</label>
            <input
              type="text"
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/gi, '').toLowerCase())}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#FFCC00] outline-none"
              placeholder="например, museum-page"
            />
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">{t.pageTitle}</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#FFCC00] outline-none"
              placeholder="например, Музей истории"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors">
            {t.cancel}
          </button>
          <button onClick={handleSubmit} className="px-6 py-3 rounded-xl bg-[#003366] text-white font-medium hover:bg-[#FFCC00] hover:text-[#003366] transition-colors">
            {t.create}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenericPage;
