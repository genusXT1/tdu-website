
import React, { useState, useEffect } from 'react';
import { Language, Partner } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, ExternalLink, CheckCircle2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface InternationalProps {
  lang: Language;
}

const International: React.FC<InternationalProps> = ({ lang }) => {
  const [showPartners, setShowPartners] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "partners"), (snapshot) => {
      setPartners(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Partner[]);
    });
    return () => unsub();
  }, []);

  const t = {
    BG: {
      title: 'Международна дейност',
      subtitle: 'Русенският университет е активен участник в европейското образователно пространство, осигурявайки мобилност за студенти и преподаватели.',
      partnersTitle: 'Списък на партньорите',
      close: 'Затвори',
      country: 'Държава',
      city: 'Град',
      university: 'Университет',
      noPartners: 'Списъкът се актуализира...'
    },
    RU: {
      title: 'Международная деятельность',
      subtitle: 'Русенский университет является активным участником европейского образовательного пространства, обеспечивая мобильность студентов и преподавателей.',
      partnersTitle: 'Список партнеров',
      close: 'Закрыть',
      country: 'Страна',
      city: 'Город',
      university: 'Университет',
      noPartners: 'Список обновляется...'
    }
  }[lang] || { title: 'International Activity', partnersTitle: 'Partner List', close: 'Close', noPartners: 'Updating...' };

  return (
    <div className="page-transition min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-[#001a33] text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold serif italic mb-8">{t.title}</h1>
            <p className="text-white/60 text-xl max-w-3xl font-light leading-relaxed">
              {t.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-12 bg-slate-50 rounded-[3rem] border border-slate-100"
          >
            <div className="w-16 h-1 bg-[#FFCC00] mb-8"></div>
            <h2 className="text-3xl font-bold mb-6 italic serif text-[#003366]">Erasmus+</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              {lang === 'BG'
                ? 'Програмата предлага възможност за обучение в партньорски университети в Германия, Франция, Полша и др. Студентите могат да прекарат един семестър или цяла академична година в чужбина.'
                : lang === 'RU'
                  ? 'Программа предлагает возможность обучения в партнерских университетах в Германии, Франции, Польше и др. Студенты могут провести один семестр или целый академический год за рубежом.'
                  : lang === 'RO'
                    ? 'Programul oferă oportunitatea de a studia în universități partenere din Germania, Franța, Polonia, etc. Studenții pot petrece un semestru sau un an academic întreg în străinătate.'
                    : 'The program offers the opportunity to study at partner universities in Germany, France, Poland, etc. Students can spend a semester or an entire academic year abroad.'}
            </p>
            <ul className="space-y-4 text-sm text-[#003366] font-bold uppercase tracking-widest">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#FFCC00] rounded-full"></div>
                {lang === 'BG' ? 'Финансова подкрепа (стипендии)' : lang === 'RU' ? 'Финансовая поддержка (стипендии)' : lang === 'RO' ? 'Suport financiar (burse)' : 'Financial support (scholarships)'}
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#FFCC00] rounded-full"></div>
                {lang === 'BG' ? 'Признаване на кредити (ECTS)' : lang === 'RU' ? 'Признание кредитов (ECTS)' : lang === 'RO' ? 'Recunoașterea creditelor (ECTS)' : 'Credit recognition (ECTS)'}
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#FFCC00] rounded-full"></div>
                {lang === 'BG' ? 'Езикови курсове' : lang === 'RU' ? 'Языковые курсы' : lang === 'RO' ? 'Cursuri de limbi străine' : 'Language courses'}
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-12 bg-[#003366] text-white rounded-[3.5rem] shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -skew-x-12 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="w-16 h-1 bg-[#FFCC00] mb-8"></div>
            <h2 className="text-3xl font-bold mb-6 italic serif text-[#FFCC00]">Партньорства</h2>
            <p className="text-white/60 mb-10 leading-relaxed">
              {lang === 'BG'
                ? 'Сътрудничество с над 50 институции в Европа и Централна Азия за съвместни изследователски проекти, обмен на опит и иновации в образованието.'
                : lang === 'RU'
                  ? 'Сотрудничество с более чем 50 учреждениями в Европе и Центральной Азии для совместных исследовательских проектов, обмена опытом и инноваций в образовании.'
                  : lang === 'RO'
                    ? 'Colaborare cu peste 50 de instituții din Europa și Asia Centrală pentru proiecte comune de cercetare, schimb de experiență și inovații în educație.'
                    : 'Cooperation with over 50 institutions in Europe and Central Asia for joint research projects, exchange of experience, and innovations in education.'}
            </p>
            <button
              onClick={() => setShowPartners(true)}
              className="inline-flex items-center gap-3 bg-[#FFCC00] text-[#003366] px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-xl"
            >
              <Globe size={16} />
              {t.partnersTitle}
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            {
              title: lang === 'BG' ? 'Мобилност' : lang === 'RU' ? 'Мобильность' : lang === 'RO' ? 'Mobilitate' : 'Mobility',
              desc: lang === 'BG' ? 'Възможности за краткосрочни специализации.' : lang === 'RU' ? 'Возможности для краткосрочных специализаций.' : lang === 'RO' ? 'Oportunități pentru specializări pe termen scurt.' : 'Opportunities for short-term specializations.',
              icon: Globe
            },
            {
              title: lang === 'BG' ? 'Проекти' : lang === 'RU' ? 'Проекты' : lang === 'RO' ? 'Proiecte' : 'Projects',
              desc: lang === 'BG' ? 'Участие в международни научни мрежи.' : lang === 'RU' ? 'Участие в международных научных сетях.' : lang === 'RO' ? 'Participare la rețele științifice internaționale.' : 'Participation in international scientific networks.',
              icon: ExternalLink
            },
            {
              title: lang === 'BG' ? 'Сертификати' : lang === 'RU' ? 'Сертификаты' : lang === 'RO' ? 'Certificate' : 'Certificates',
              desc: lang === 'BG' ? 'Международно признати сертификати.' : lang === 'RU' ? 'Международно признанные сертификаты.' : lang === 'RO' ? 'Certificate recunoscute la nivel internațional.' : 'Internationally recognized certificates.',
              icon: CheckCircle2
            }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#003366] mb-6">
                  <Icon size={24} />
                </div>
                <h4 className="text-lg font-bold text-[#003366] mb-2">{item.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <section className="bg-slate-50 p-12 md:p-20 rounded-[4rem] text-center border border-slate-100">
          <h3 className="text-3xl font-bold mb-6 italic serif text-[#003366]">Европейски дипломи</h3>
          <p className="max-w-3xl mx-auto text-slate-500 text-lg leading-relaxed">
            {lang === 'BG'
              ? 'Нашите студенти получават европейско дипломно приложение, което улеснява реализацията им навсякъде в ЕС.'
              : lang === 'RU'
                ? 'Наши студенты получают европейское дипломное приложение, которое облегчает их реализацию в любой точке ЕС.'
                : lang === 'RO'
                  ? 'Studenții noștri primesc un supliment la diplomă european, care le facilitează cariera oriunde în UE.'
                  : 'Our students receive a European diploma supplement, which facilitates their career anywhere in the EU.'}
          </p>
        </section>
      </div>

      {/* Partners Modal */}
      <AnimatePresence>
        {showPartners && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-[#000d1a]/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-8 md:p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-3xl font-bold serif italic text-[#003366]">{t.partnersTitle}</h3>
                <button
                  onClick={() => setShowPartners(false)}
                  className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto p-8 md:p-12">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                      <th className="pb-4">{t.university}</th>
                      <th className="pb-4">{t.country}</th>
                      <th className="pb-4">{t.city}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {partners.length > 0 ? partners.map((p, idx) => (
                      <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-4 font-bold text-[#003366]">{p.name}</td>
                        <td className="py-4 text-slate-500">{p.country}</td>
                        <td className="py-4 text-slate-500">{p.city}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="py-20 text-center text-slate-400 font-light italic">
                          {t.noPartners}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => setShowPartners(false)}
                  className="bg-[#003366] text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all shadow-lg"
                >
                  {t.close}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default International;
