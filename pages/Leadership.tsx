
import React from 'react';
import { Language } from '../types';
import { Phone, Mail, Facebook, User, ShieldCheck, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';

const Leadership: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = {
    BG: {
      title: 'Академично ръководство',
      subtitle: 'Екипът, който гради бъдещето на филиала в гр. Тараклия',
      director: 'Директор',
      admin: 'Административен директор',
      contact: 'Контакти',
      social: 'Социални мрежи'
    },
    RU: {
      title: 'Академическое руководство',
      subtitle: 'Команда, созидающая будущее филиала в г. Тараклия',
      director: 'Директор',
      admin: 'Административный директор',
      contact: 'Контакты',
      social: 'Социальные сети'
    },
    RO: {
      title: 'Conducerea Academică',
      subtitle: 'Echipa care construiește viitorul filialei din or. Taraclia',
      director: 'Director',
      admin: 'Director Administrativ',
      contact: 'Contacte',
      social: 'Rețele sociale'
    },
    EN: {
      title: 'Academic Leadership',
      subtitle: 'The team building the future of the Taraclia branch',
      director: 'Director',
      admin: 'Administrative Director',
      contact: 'Contacts',
      social: 'Social Networks'
    }
  }[lang] || { title: 'Leadership', subtitle: 'Management team' };

  const leaders = [
    {
      role: t.director,
      name: lang === 'BG' ? 'Доцент доктор Валентина Василева' : 'Доцент доктор Валентина Василева',
      desc: lang === 'BG' ? 'Директор на поделение «Гр.Цамлак» - гр. Тараклия, Р.Молдова' : 'Директор подразделения «Гр.Цамлак» - г. Тараклия, Р.Молдова',
      phone: '0(294) 84 9 90',
      email: 'vvasileva@uni-ruse.bg',
      fb: 'https://www.facebook.com/RUTaraclia',
      image: 'https://profiles.uni-ruse.bg/User%20Photos/Profile%20Pictures/rk-ppi_LThumb.jpg',
      icon: <ShieldCheck size={24} />
    },
    {
      role: t.admin,
      name: lang === 'BG' ? 'Александр Боримечков' : 'Александр Боримечков',
      desc: lang === 'BG' ? 'Административен директор на поделение «Гр.Цамлак» - гр. Тараклия, Р.Молдова' : 'Административный директор подразделения «Гр.Цамлак» - г. Тараклия, Р.Молдова',
      phone: '0(294) 84 9 90',
      email: 'aborimechkov@uni-ruse.bg',
      fb: 'https://www.facebook.com/RUTaraclia',
      image: 'https://bnrnews.bg/api/media/b68c7086-e9f7-4f0f-954b-8a6a1b876421?Size=original',
      icon: <Briefcase size={24} />
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfe]">
      {/* Hero Section */}
      <section className="pt-44 pb-32 px-6 bg-[#001a33] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#FFCC00] blur-[180px] rounded-full -mr-96 -mt-96"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500 blur-[150px] rounded-full -ml-64 -mb-64"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-px bg-[#FFCC00]"></div>
              <span className="text-[#FFCC00] text-[10px] font-black uppercase tracking-[0.6em]">{lang === 'RU' ? 'АДМИНИСТРАЦИЯ' : 'АДМИНИСТРАЦИЯ'}</span>
            </div>
            <h1 className="text-7xl md:text-[10rem] font-bold serif italic leading-[0.85] mb-12 tracking-tighter">
              {t.title}
            </h1>
            <p className="text-xl md:text-3xl text-white/50 font-light max-w-3xl leading-relaxed">
              {t.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Leaders Grid */}
      <section className="py-40 px-6 max-w-7xl mx-auto">
        <div className="space-y-40">
          {leaders.map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-20 lg:gap-32 items-center`}
            >
              {/* Image Side */}
              <div className="w-full lg:w-1/2 relative">
                <div className="absolute -inset-8 bg-slate-50 rounded-[5rem] -z-10 transform rotate-3"></div>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)]">
                  <img
                    src={l.image}
                    alt={l.name}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-110 hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001a33]/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700 flex items-end p-16">
                    <div className="text-white">
                      <p className="text-xs font-black uppercase tracking-widest text-[#FFCC00] mb-4">{l.role}</p>
                      <h3 className="text-4xl font-bold serif italic">{l.name}</h3>
                    </div>
                  </div>
                </div>
                {/* Decorative Element */}
                <div className={`absolute -bottom-10 ${i % 2 === 0 ? '-right-10' : '-left-10'} w-40 h-40 bg-[#FFCC00] rounded-full flex items-center justify-center text-[#003366] shadow-2xl z-20`}>
                  {l.icon}
                </div>
              </div>

              {/* Content Side */}
              <div className="w-full lg:w-1/2 space-y-12">
                <div>
                  <span className="text-[#FFCC00] text-[10px] font-black uppercase tracking-[0.6em] block mb-6">{l.role}</span>
                  <h2 className="text-5xl md:text-7xl font-bold text-[#003366] serif italic leading-tight mb-8">
                    {l.name}
                  </h2>
                  <div className="w-20 h-1.5 bg-[#FFCC00] mb-10"></div>
                  <p className="text-slate-500 text-2xl font-light leading-relaxed italic">
                    {l.desc}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-slate-100">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300">{t.contact}</h4>
                    <div className="space-y-4">
                      <a href={`tel:${l.phone}`} className="flex items-center gap-4 text-[#003366] hover:text-[#FFCC00] transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-[#003366] group-hover:text-white transition-all">
                          <Phone size={16} />
                        </div>
                        <span className="font-bold text-sm tracking-tight">{l.phone}</span>
                      </a>
                      <a href={`mailto:${l.email}`} className="flex items-center gap-4 text-[#003366] hover:text-[#FFCC00] transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-[#003366] group-hover:text-white transition-all">
                          <Mail size={16} />
                        </div>
                        <span className="font-bold text-sm tracking-tight">{l.email}</span>
                      </a>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300">{t.social}</h4>
                    <a href={l.fb} target="_blank" rel="noreferrer" className="flex items-center gap-4 text-[#003366] hover:text-[#FFCC00] transition-colors group">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-[#003366] group-hover:text-white transition-all">
                        <Facebook size={16} />
                      </div>
                      <span className="font-black text-[10px] uppercase tracking-widest">Facebook Profile</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom CTA / Info */}
      <section className="py-40 bg-slate-50 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-40 bg-gradient-to-b from-[#001a33] to-transparent"></div>
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white p-20 md:p-32 rounded-[5rem] shadow-2xl border border-slate-100 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-[#FFCC00]"></div>
            <h3 className="text-4xl md:text-6xl font-bold text-[#003366] serif italic mb-10">
              {lang === 'RU' ? 'Открыты для диалога' : 'Отворени за диалог'}
            </h3>
            <p className="text-2xl text-slate-500 font-light leading-relaxed mb-16 max-w-3xl mx-auto">
              {lang === 'RU'
                ? 'Наше руководство всегда доступно для вопросов, предложений и сотрудничества в интересах развития образования.'
                : 'Нашето ръководство е винаги на разположение за въпроси, предложения и сътрудничество в интерес на развитието на образованието.'}
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              <a href="mailto:taraclia@uni-ruse.bg" className="bg-[#003366] text-white px-14 py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-[#FFCC00] hover:text-[#003366] transition-all shadow-[0_20px_40px_-10px_rgba(0,51,102,0.3)] hover:shadow-none">
                {lang === 'RU' ? 'СВЯЗАТЬСЯ С НАМИ' : 'СВЪРЖЕТЕ СЕ С НАС'}
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Leadership;
