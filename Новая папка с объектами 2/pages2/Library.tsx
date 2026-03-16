
import React from 'react';
import { Language } from '../types';
import { motion } from 'motion/react';
import { Book, Users, BarChart3, Globe, Mail, Facebook, Clock, Coffee, CheckCircle2 } from 'lucide-react';

interface LibraryProps {
  lang: Language;
}

const Library: React.FC<LibraryProps> = ({ lang }) => {
  const t = {
    BG: {
      title: 'Библиотека',
      subtitle: 'Вашият портал към знанието и научните ресурси',
      tag: 'Хранилище на знания',
      history: 'Основана през 2004 г., библиотеката е сърцето на нашия университет, осигуряваща достъп до над 27 000 тома специализирана литература.',
      missionTitle: 'Мисия и развитие',
      missionItems: [
        'Осигуряване на достъп до висококачествени информационни ресурси.',
        'Развитие на изследователски и образователни компетенции.',
        'Модернизация на библиотечните услуги и дигитализация.'
      ],
      statsTitle: 'Библиотеката в цифри',
      stats: [
        { label: 'Книжен фонд', value: '27K', sub: 'екземпляра' },
        { label: 'Учебници', value: '7K', sub: 'пособия' },
        { label: 'Потребители', value: '200+', sub: 'активни' },
        { label: 'Заемания', value: '2K', sub: 'годишно' }
      ],
      servicesTitle: 'Услуги за студенти',
      services: [
        { title: 'Заемане на книги', desc: 'Достъп до целия фонд за домашно ползване.' },
        { title: 'Дигитални ресурси', desc: 'Достъп до научни бази данни и интернет.' },
        { title: 'Консултации', desc: 'Помощ при библиографско търсене и каталози.' },
        { title: 'Читалня', desc: 'Тихо пространство за учене и работа.' }
      ],
      partnersTitle: 'Академична мрежа',
      partnersText: 'Сътрудничим си с водещи библиотеки в България и Молдова, включително ЮЗУ Благоевград и БАН.',
      staffTitle: 'Контакти',
      librarian: 'Библиотекар',
      name: 'Валентина Будаева',
      workingHours: 'Работно време',
      hours: '08:00 - 17:00',
      break: 'Обяд: 12:00 - 13:00',
      facebook: 'Facebook страница'
    },
    RU: {
      title: 'Библиотека',
      subtitle: 'Ваш портал к знаниям и научным ресурсам',
      tag: 'Хранилище знаний',
      history: 'Основанная в 2004 году, библиотека является сердцем нашего университета, обеспечивая доступ к более чем 27 000 томов литературы.',
      missionTitle: 'Миссия и развитие',
      missionItems: [
        'Обеспечение доступа к высококачественным информационным ресурсам.',
        'Развитие исследовательских и образовательных компетенций.',
        'Модернизация библиотечных услуг и дигитализация.'
      ],
      statsTitle: 'Библиотека в цифрах',
      stats: [
        { label: 'Книжный фонд', value: '27K', sub: 'экземпляров' },
        { label: 'Учебники', value: '7K', sub: 'пособий' },
        { label: 'Пользователи', value: '200+', sub: 'активных' },
        { label: 'Книговыдача', value: '2K', sub: 'ежегодно' }
      ],
      servicesTitle: 'Услуги для студентов',
      services: [
        { title: 'Выдача книг', desc: 'Доступ ко всему фонду для домашнего пользования.' },
        { title: 'Цифровые ресурсы', desc: 'Доступ к научным базам данных и интернету.' },
        { title: 'Консультации', desc: 'Помощь в библиографическом поиске и каталогах.' },
        { title: 'Читальный зал', desc: 'Тихое пространство для учебы и работы.' }
      ],
      partnersTitle: 'Академическая сеть',
      partnersText: 'Сотрудничаем с ведущими библиотеками Болгарии и Молдовы, включая ЮЗУ Благоевград и БАН.',
      staffTitle: 'Контакты',
      librarian: 'Библиотекарь',
      name: 'Валентина Будаева',
      workingHours: 'Часы работы',
      hours: '08:00 - 17:00',
      break: 'Обед: 12:00 - 13:00',
      facebook: 'Facebook страница'
    },
    RO: {
      title: 'Bibliotecă',
      subtitle: 'Portalul tău către cunoaștere și resurse științifice',
      tag: 'Depozit de cunoștințe',
      history: 'Fondată în 2004, biblioteca este inima universității noastre, oferind acces la peste 27.000 de volume de literatură de specialitate.',
      missionTitle: 'Misiune și dezvoltare',
      missionItems: [
        'Asigurarea accesului la resurse informaționale de înaltă calitate.',
        'Dezvoltarea competențelor de cercetare și educație.',
        'Modernizarea serviciilor de bibliotecă și digitalizarea.'
      ],
      statsTitle: 'Biblioteca în cifre',
      stats: [
        { label: 'Fond de carte', value: '27K', sub: 'exemplare' },
        { label: 'Manuale', value: '7K', sub: 'auxiliare' },
        { label: 'Utilizatori', value: '200+', sub: 'activi' },
        { label: 'Împrumuturi', value: '2K', sub: 'anual' }
      ],
      servicesTitle: 'Servicii pentru studenți',
      services: [
        { title: 'Împrumut de cărți', desc: 'Acces la întregul fond pentru utilizare la domiciliu.' },
        { title: 'Resurse digitale', desc: 'Acces la baze de date științifice și internet.' },
        { title: 'Consultanță', desc: 'Ajutor în căutarea bibliografică și cataloage.' },
        { title: 'Sală de lectură', desc: 'Spațiu liniștit pentru studiu și lucru.' }
      ],
      partnersTitle: 'Rețea academică',
      partnersText: 'Colaborăm cu biblioteci de top din Bulgaria și Moldova, inclusiv SWU Blagoevgrad și BAS.',
      staffTitle: 'Contacte',
      librarian: 'Bibliotecar',
      name: 'Valentina Budaeva',
      workingHours: 'Program de lucru',
      hours: '08:00 - 17:00',
      break: 'Prânz: 12:00 - 13:00',
      facebook: 'Pagina Facebook'
    }
  }[lang] || { title: 'Library', subtitle: 'Resources', tag: 'Knowledge Repository' };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero with Image Overlay */}
      <section className="relative h-[60vh] flex items-center overflow-hidden bg-[#003366]">
        <div className="absolute inset-0 opacity-30">
          <img 
            src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover" 
            alt="Library background"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#003366] via-[#003366]/80 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl"
          >
            <span className="text-[#FFCC00] text-[10px] font-black uppercase tracking-[0.5em] block mb-6">{(t as any).tag}</span>
            <h1 className="text-5xl md:text-8xl font-serif italic text-white mb-8 leading-tight">{t.title}</h1>
            <p className="text-xl text-white/70 font-light">{t.subtitle}</p>
          </motion.div>
        </div>
      </section>

      {/* Stats Bento Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 bg-slate-50 rounded-[3rem] p-12 flex flex-col justify-center border border-slate-100">
            <h2 className="text-3xl font-serif text-[#003366] mb-6 italic">{t.missionTitle}</h2>
            <p className="text-slate-600 leading-relaxed mb-8">{t.history}</p>
            <div className="space-y-4">
              {t.missionItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-medium text-[#003366]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FFCC00]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:col-span-2 gap-6">
            {t.stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-xl transition-all group"
              >
                <div className="text-5xl font-black text-[#003366] mb-2 group-hover:text-[#FFCC00] transition-colors">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
                <div className="text-[10px] text-slate-300 italic mt-1">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Cards */}
      <section className="py-24 bg-[#001a33] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-serif italic mb-6">{t.servicesTitle}</h2>
            <div className="h-1 w-20 bg-[#FFCC00] mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[2.5rem] hover:bg-white hover:text-[#003366] transition-all duration-500 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FFCC00] flex items-center justify-center text-[#003366] mb-8 group-hover:scale-110 transition-transform">
                  <Book size={20} />
                </div>
                <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                <p className="text-sm opacity-60 group-hover:opacity-100 leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Info */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col lg:flex-row">
          <div className="lg:w-1/2 p-12 md:p-20 flex flex-col justify-center">
            <h2 className="text-4xl font-serif text-[#003366] mb-12 italic">{t.staffTitle}</h2>
            <div className="space-y-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-[#003366]">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{t.librarian}</p>
                  <p className="text-2xl font-bold text-[#003366]">{t.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-500">
                    <Clock size={16} className="text-[#FFCC00]" />
                    <span className="text-sm font-bold">{t.hours}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 italic">
                    <Coffee size={16} />
                    <span className="text-xs">{t.break}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <a href="mailto:vbudaeva@uni-ruse.bg" className="flex items-center gap-3 text-[#003366] hover:text-[#FFCC00] transition-colors font-bold text-sm">
                    <Mail size={16} /> vbudaeva@uni-ruse.bg
                  </a>
                  <a href="https://www.facebook.com/RUTaraclia" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#003366] hover:text-[#FFCC00] transition-colors font-bold text-sm">
                    <Facebook size={16} /> {t.facebook}
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 bg-slate-100 relative min-h-[400px]">
            <img 
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=1200" 
              className="absolute inset-0 w-full h-full object-cover grayscale" 
              alt="Library"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Library;
