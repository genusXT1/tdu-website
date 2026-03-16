
import React from 'react';
import { motion } from 'motion/react';
import { Language } from '../types';
import { BookOpen, Award, Globe, CheckCircle, Calendar, ShieldCheck, Landmark } from 'lucide-react';

interface AboutProps {
  lang: Language;
}

const About: React.FC<AboutProps> = ({ lang }) => {
  const t = {
    BG: {
      title: 'За университета',
      subtitle: 'История на успеха и международно сътрудничество',
      historyTitle: 'Институционално развитие',
      qualityTitle: 'Европейско качество',
      qualityDesc: 'Русенският университет гарантира високи стандарти на обучение за българската общност и гражданите на Молдова.',
      legalTitle: 'Пълна правосубектност',
      legalDesc: 'Официално вписан в регистъра БУЛСТАТ, потвърждавайки легитимността на филиала.',
      timeline: [
        { date: 'Март 2024', event: 'Междудържавно споразумение за създаване на поделение в Молдова.' },
        { date: 'Септември 2024', event: 'Постановление № 277 на МС на Република България за легитимиране на структурата.' },
        { date: 'Ноември 2024', event: 'Ратификация от Парламента и Президента на Република Молдова.' },
        { date: 'Януари 2025', event: 'Приемане на специализиран правилник от Академичния съвет.' }
      ]
    },
    RU: {
      title: 'Об университете',
      subtitle: 'История успеха и международное сотрудничество',
      historyTitle: 'Институциональное развитие',
      qualityTitle: 'Европейское качество',
      qualityDesc: 'Русенский университет гарантирует высокие стандарты обучения для болгарской общины и граждан Молдовы.',
      legalTitle: 'Полная правосубъектность',
      legalDesc: 'Официально внесен в реестр БУЛСТАТ, подтверждая легитимность филиала.',
      timeline: [
        { date: 'Март 2024', event: 'Межгосударственное соглашение о создании подразделения в Молдове.' },
        { date: 'Сентябрь 2024', event: 'Постановление № 277 СМ Республики Болгария о легитимации структуры.' },
        { date: 'Ноябрь 2024', event: 'Ратификация Парламентом и Президентом Республики Молдова.' },
        { date: 'Январь 2025', event: 'Принятие специализированного регламента Академическим советом.' }
      ]
    },
    RO: {
      title: 'Despre universitate',
      subtitle: 'O istorie de succes și cooperare internațională',
      historyTitle: 'Dezvoltare instituțională',
      qualityTitle: 'Calitate europeană',
      qualityDesc: 'Universitatea din Ruse garantează standarde înalte de educație pentru comunitatea bulgară și cetățenii Moldovei.',
      legalTitle: 'Personalitate juridică deplină',
      legalDesc: 'Înregistrat oficial în registrul BULSTAT, confirmând legitimitatea filialei.',
      timeline: [
        { date: 'Martie 2024', event: 'Acord interstatal pentru crearea unei unități în Moldova.' },
        { date: 'Septembrie 2024', event: 'Hotărârea nr. 277 a Consiliului de Miniștri al Bulgariei pentru legitimarea structurii.' },
        { date: 'Noiembrie 2024', event: 'Ratificare de către Parlamentul și Președintele Republicii Moldova.' },
        { date: 'Ianuarie 2025', event: 'Adoptarea regulamentului specializat de către Consiliul Academic.' }
      ]
    },
    EN: {
      title: 'About University',
      subtitle: 'A history of success and international cooperation',
      historyTitle: 'Institutional Development',
      qualityTitle: 'European Quality',
      qualityDesc: 'The University of Ruse guarantees high standards of education for the Bulgarian community and citizens of Moldova.',
      legalTitle: 'Full Legal Capacity',
      legalDesc: 'Officially entered in the BULSTAT register, confirming the legitimacy of the branch.',
      timeline: [
        { date: 'March 2024', event: 'Interstate agreement for the creation of a unit in Moldova.' },
        { date: 'September 2024', event: 'Decree No. 277 of the Council of Ministers of Bulgaria for legitimizing the structure.' },
        { date: 'November 2024', event: 'Ratification by the Parliament and President of the Republic of Moldova.' },
        { date: 'January 2025', event: 'Adoption of specialized regulations by the Academic Council.' }
      ]
    }
  }[lang];

  const fullText = "Русенският университет „Ангел Кънчев“ официално разкри свое поделение в Република Молдова след успешно преминат процес на държавно и институционално съгласуване. Основите бяха положени с Междудържавно споразумение от март 2024 г., последвано от Постановление № 277 на МС на Република България, с което структурата бе легитимирана. През ноември 2024 г. Парламентът и Президентът на Република Молдова ратифицираха и промулгираха законовите актове, осигуряващи управлението на активите и образователната дейност на молдовска територия. Вътрешната уредба бе финализирана през януари 2025 г. с приемането на специализиран правилник от Академичния съвет на университета. Актуалният статут на филиала е официално вписан в регистъра БУЛСТАТ, потвърждавайки неговата пълна правосубектност. Чрез тази стабилна нормативна база Русенският университет гарантира европейско качество на обучение за българската общност и гражданите на Молдова.";

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* HERO SECTION */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-[#003366]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://www.uni-ruse.bg/PublishingImages/Main_Building.jpg')] bg-cover bg-center scale-110 blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#003366] via-transparent to-[#003366]"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-[10px] font-black tracking-[0.3em] uppercase bg-[#FFCC00] text-[#003366] rounded-full">
              {lang === 'BG' ? 'Официално представителство' : 'Official Representation'}
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 serif italic leading-tight">
              {t.title}
            </h1>
            <p className="text-xl md:text-2xl text-white/70 font-light max-w-3xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#f8fafc] to-transparent"></div>
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-6xl mx-auto px-6 -mt-20 relative z-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Main Text */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white p-10 md:p-16 rounded-[3rem] shadow-xl border border-slate-100"
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-[#003366]/5 rounded-2xl flex items-center justify-center text-[#003366]">
                  <Landmark size={24} />
                </div>
                <h2 className="text-3xl font-bold text-[#003366] serif italic">{t.historyTitle}</h2>
              </div>
              
              <div className="prose prose-slate max-w-none">
                <p className="text-xl text-slate-600 leading-[1.8] font-light first-letter:text-5xl first-letter:font-bold first-letter:text-[#003366] first-letter:mr-3 first-letter:float-left">
                  {fullText}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-[#003366] transition-all duration-500">
                  <ShieldCheck className="text-[#FFCC00] mb-4 group-hover:scale-110 transition-transform" size={32} />
                  <h3 className="text-lg font-bold text-[#003366] mb-2 group-hover:text-white">{t.legalTitle}</h3>
                  <p className="text-sm text-slate-500 group-hover:text-white/70 leading-relaxed">{t.legalDesc}</p>
                </div>
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-[#003366] transition-all duration-500">
                  <Award className="text-[#FFCC00] mb-4 group-hover:scale-110 transition-transform" size={32} />
                  <h3 className="text-lg font-bold text-[#003366] mb-2 group-hover:text-white">{t.qualityTitle}</h3>
                  <p className="text-sm text-slate-500 group-hover:text-white/70 leading-relaxed">{t.qualityDesc}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Timeline */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-[#003366] p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-16 -mt-16 rounded-full"></div>
              
              <h3 className="text-2xl font-bold mb-10 serif italic flex items-center gap-3">
                <Calendar className="text-[#FFCC00]" size={24} />
                {lang === 'BG' ? 'Хронология' : 'Timeline'}
              </h3>

              <div className="space-y-10 relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/10"></div>
                
                {t.timeline.map((item, i) => (
                  <div key={i} className="relative pl-12 group">
                    <div className="absolute left-0 top-1.5 w-8 h-8 bg-[#003366] border-2 border-[#FFCC00] rounded-full z-10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <div className="w-2 h-2 bg-[#FFCC00] rounded-full"></div>
                    </div>
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-widest text-[#FFCC00] mb-1">
                        {item.date}
                      </span>
                      <p className="text-sm text-white/80 leading-relaxed font-light">
                        {item.event}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-[#FFCC00] p-10 rounded-[3rem] shadow-xl text-[#003366]"
            >
              <Globe className="mb-4" size={32} />
              <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Global Reach</h3>
              <p className="text-sm font-medium leading-relaxed opacity-80">
                {lang === 'BG' 
                  ? 'Свързваме академичните общности на България и Молдова чрез знание и иновации.' 
                  : 'Connecting the academic communities of Bulgaria and Moldova through knowledge and innovation.'}
              </p>
            </motion.div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default About;
