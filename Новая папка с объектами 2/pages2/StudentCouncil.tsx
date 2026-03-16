
import React from 'react';
import { Language } from '../types';
import { motion } from 'motion/react';
import { Users, Heart, Zap, MessageSquare, ArrowRight } from 'lucide-react';

interface StudentCouncilProps {
  lang: Language;
}

const StudentCouncil: React.FC<StudentCouncilProps> = ({ lang }) => {
  const t = {
    BG: {
      title: 'Студентски съвет',
      subtitle: 'Гласът на студентите в управлението на университета',
      tag: 'Студентско представителство',
      mission: 'Нашата мисия е да защитаваме правата на студентите, да организираме събития и да подобряваме академичната среда в Тараклийския филиал.',
      activities: [
        { title: 'Защита на правата', desc: 'Представителство в Академичния съвет и участие в комисиите по стипендии.', icon: Heart },
        { title: 'Събития и култура', desc: 'Организиране на студентски празници, благотворителни акции и спортни турнири.', icon: Zap },
        { title: 'Обратна връзка', desc: 'Постоянен диалог между студентите и администрацията на филиала.', icon: MessageSquare }
      ],
      chairman: 'Ангел Иванов',
      position: 'Председател на Студентския съвет'
    },
    RU: {
      title: 'Студенческий совет',
      subtitle: 'Голос студентов в управлении университетом',
      tag: 'Студенческое представительство',
      mission: 'Наша миссия — защищать права студентов, организовывать мероприятия и улучшать академическую среду в Тараклийском филиале.',
      activities: [
        { title: 'Защита прав', desc: 'Представительство в Академическом совете и участие в комиссиях по стипендиям.', icon: Heart },
        { title: 'Мероприятия и культура', desc: 'Организация студенческих праздников, благотворительных акций и спортивных турниров.', icon: Zap },
        { title: 'Обратная связь', desc: 'Постоянный диалог между студентами и администрацией филиала.', icon: MessageSquare }
      ],
      chairman: 'Ангел Иванов',
      position: 'Председатель Студенческого совета'
    },
    RO: {
      title: 'Consiliul Studenților',
      subtitle: 'Vocea studenților în managementul universității',
      tag: 'Reprezentarea studenților',
      mission: 'Misiunea noastră este de a proteja drepturile studenților, de a organiza evenimente și de a îmbunătăți mediul academic.',
      activities: [
        { title: 'Protecția drepturilor', desc: 'Reprezentarea în Consiliul Academic și rezolvarea problemelor studențești.', icon: Heart },
        { title: 'Evenimente și cultură', desc: 'Organizarea de concerte, sărbători sportive și acțiuni caritabile.', icon: Zap },
        { title: 'Feedback', desc: 'Dialog constant între studenți și conducerea universității.', icon: MessageSquare }
      ]
    },
    EN: {
      title: 'Student Council',
      subtitle: 'The voice of students in university management',
      tag: 'Student Representation',
      mission: 'Our mission is to protect student rights, organize events, and improve the academic environment.',
      activities: [
        { title: 'Rights Protection', desc: 'Representation in the Academic Council and solving student cases.', icon: Heart },
        { title: 'Events & Culture', desc: 'Organizing concerts, sports festivals, and charity events.', icon: Zap },
        { title: 'Feedback', desc: 'Constant dialogue between students and university management.', icon: MessageSquare }
      ]
    }
  }[lang];

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-[#FFCC00] text-[#003366] pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 skew-x-12 translate-x-1/2 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="text-[#003366] text-[10px] font-black uppercase tracking-[0.5em] block mb-6">{t.tag}</span>
          <h1 className="text-6xl md:text-9xl font-serif italic mb-8 leading-tight">{t.title}</h1>
          <p className="text-2xl font-light max-w-2xl opacity-80">{t.subtitle}</p>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-serif italic text-[#003366] mb-8 leading-tight">
              {t.mission}
            </h2>
            <div className="w-20 h-1 bg-[#FFCC00] mb-12"></div>
            <div className="space-y-12">
              {t.activities.map((activity, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-8 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#003366] group-hover:bg-[#FFCC00] transition-colors shrink-0">
                    <activity.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#003366] mb-2">{activity.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{activity.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200" 
                className="w-full h-full object-cover" 
                alt="Students"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#FFCC00] rounded-full flex items-center justify-center text-[#003366] font-black text-[10px] uppercase tracking-widest text-center p-6 shadow-xl">
              Join the Team
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-serif italic text-[#003366] mb-12">
            {lang === 'RU' ? 'Наше руководство' : 'Нашето ръководство'}
          </h2>
          <div className="flex justify-center">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm max-w-sm w-full">
              <div className="w-32 h-32 bg-slate-100 rounded-full mx-auto mb-6 overflow-hidden flex items-center justify-center text-[#003366]">
                 <Users size={48} />
              </div>
              <p className="text-2xl font-bold text-[#003366]">{t.chairman}</p>
              <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest mt-2">{t.position}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentCouncil;
