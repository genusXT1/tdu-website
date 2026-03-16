
import React from 'react';
import { motion } from 'motion/react';
import { Language } from '../types';
import { FileText, Download, Shield, Book, CheckCircle, ExternalLink, Scale } from 'lucide-react';

interface RegulationsProps {
  lang: Language;
}

const Regulations: React.FC<RegulationsProps> = ({ lang }) => {
  const t = {
    BG: {
      title: 'Нормативна база',
      subtitle: 'Официални документи и правилници, уреждащи дейността на университета и неговите поделения',
      mainRules: 'Основни правилници',
      download: 'Изтегли PDF',
      readMore: 'Прочети повече',
      lastUpdated: 'Последна актуализация',
      rules: [
        {
          id: 'ruse-2022',
          title: 'Правилник за дейността на Русенски университет „Ангел Кънчев“',
          year: '2022',
          desc: 'Урежда специфични въпроси за дейността и управлението на университета в съответствие със ЗВО.',
          highlights: ['Общи положения', 'Състав и структура', 'Управление', 'Учебен процес']
        },
        {
          id: 'taraclia-2025',
          title: 'Правилник за дейността на поделенията на Русенски университет „А. Кънчев“',
          year: '2025',
          desc: 'Конкретизира специфичните особености в дейността на поделенията на университета в чужбина.',
          highlights: ['Управление на поделенията', 'Административен директор', 'Учебна дейност', 'Студентски офис']
        }
      ]
    },
    RU: {
      title: 'Нормативная база',
      subtitle: 'Официальные документы и регламенты, регулирующие деятельность университета и его подразделений',
      mainRules: 'Основные регламенты',
      download: 'Скачать PDF',
      readMore: 'Читать далее',
      lastUpdated: 'Последнее обновление',
      rules: [
        {
          id: 'ruse-2022',
          title: 'Регламент деятельности Русенского университета «Ангел Кънчев»',
          year: '2022',
          desc: 'Регулирует специфические вопросы деятельности и управления университетом в соответствии с законом.',
          highlights: ['Общие положения', 'Состав и структура', 'Управление', 'Учебный процесс']
        },
        {
          id: 'taraclia-2025',
          title: 'Регламент деятельности подразделений Русенского университета «А. Кънчев»',
          year: '2025',
          desc: 'Конкретизирует специфические особенности деятельности зарубежных подразделений университета.',
          highlights: ['Управление подразделениями', 'Административный директор', 'Учебная деятельность', 'Студенческий офис']
        }
      ]
    },
    RO: {
      title: 'Cadrul normativ',
      subtitle: 'Documente oficiale și regulamente care guvernează activitatea universității și a subdiviziunilor sale',
      mainRules: 'Regulamente principale',
      download: 'Descarcă PDF',
      readMore: 'Citește mai mult',
      lastUpdated: 'Ultima actualizare',
      rules: [
        {
          id: 'ruse-2022',
          title: 'Regulamentul de activitate al Universității din Ruse „Angel Kanchev”',
          year: '2022',
          desc: 'Reglementează aspecte specifice ale activității și managementului universității în conformitate cu legea.',
          highlights: ['Dispoziții generale', 'Componență și structură', 'Management', 'Proces educațional']
        },
        {
          id: 'taraclia-2025',
          title: 'Regulamentul de activitate al subdiviziunilor Universității din Ruse „A. Kanchev”',
          year: '2025',
          desc: 'Concretizează trăsăturile specifice în activitatea subdiviziunilor universității în străinătate.',
          highlights: ['Managementul subdiviziunilor', 'Director administrativ', 'Activitate educațională', 'Birou studențesc']
        }
      ]
    }
  }[lang] || { title: 'Regulations', subtitle: 'Legal Framework' };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header Section */}
      <section className="relative pt-32 pb-24 px-6 bg-[#003366] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://www.uni-ruse.bg/PublishingImages/Main_Building.jpg')] bg-cover bg-center"></div>
        </div>
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFCC00]/20 text-[#FFCC00] text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              <Scale size={14} /> {lang === 'BG' ? 'Легитимност и прозрачност' : 'Legitimacy & Transparency'}
            </div>
            <h1 className="text-5xl md:text-7xl font-serif italic text-white mb-8 leading-tight">
              {t.title}
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-3xl mx-auto font-light leading-relaxed">
              {t.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Documents Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-16">
          <div className="h-px flex-grow bg-slate-200"></div>
          <h2 className="text-sm font-black uppercase tracking-[0.4em] text-slate-400">{t.mainRules}</h2>
          <div className="h-px flex-grow bg-slate-200"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {t.rules.map((rule, index) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group relative bg-white rounded-[3rem] p-10 md:p-12 shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-700 overflow-hidden"
            >
              {/* Year Badge */}
              <div className="absolute top-0 right-0 bg-[#003366] text-[#FFCC00] px-8 py-3 rounded-bl-[2rem] font-black text-xs tracking-widest">
                {rule.year}
              </div>

              <div className="flex flex-col h-full">
                <div className="mb-10">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-[#003366] mb-8 group-hover:bg-[#003366] group-hover:text-white transition-colors duration-500">
                    <FileText size={32} />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif italic text-[#003366] mb-6 leading-tight group-hover:text-[#FFCC00] transition-colors">
                    {rule.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed font-light mb-8">
                    {rule.desc}
                  </p>
                </div>

                <div className="space-y-4 mb-12">
                  {rule.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle size={16} className="text-[#FFCC00]" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex flex-wrap gap-4">
                  <button className="flex items-center gap-3 px-8 py-4 bg-[#003366] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all shadow-lg">
                    <Download size={16} /> {t.download}
                  </button>
                  <button className="flex items-center gap-3 px-8 py-4 bg-slate-50 text-[#003366] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">
                    <Book size={16} /> {t.readMore}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Info Banner */}
      <section className="pb-32 px-6 max-w-7xl mx-auto">
        <div className="bg-[#FFCC00] rounded-[4rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 shadow-xl">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-serif italic text-[#003366] mb-6">
              {lang === 'BG' ? 'Стабилност и качество' : 'Stability & Quality'}
            </h2>
            <p className="text-[#003366]/80 text-lg font-medium leading-relaxed">
              {lang === 'BG' 
                ? 'Чрез тази стабилна нормативна база Русенският университет гарантира европейско качество на обучение за българската общност и гражданите на Молдова.'
                : 'Through this stable regulatory framework, the University of Ruse guarantees European quality of education for the Bulgarian community and citizens of Moldova.'}
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full border-4 border-[#003366]/20 flex items-center justify-center">
              <Shield size={64} className="text-[#003366]" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Regulations;
