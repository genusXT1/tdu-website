
import React from 'react';
import { motion } from 'motion/react';
import { Language } from '../types';
import { useSiteData } from '../store/useSiteData';
import { APP_CONFIG } from '../constants';
import { Landmark, Book, Users, GraduationCap, ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StructureProps {
  lang: Language;
}

const Structure: React.FC<StructureProps> = ({ lang }) => {
  const { data } = useSiteData();
  const universityName = data.universityName?.[lang] || APP_CONFIG.universityName[lang];

  const t = {
    BG: {
      title: 'Структура',
      subtitle: 'Организационни звена и академични ресурси',
      sections: [
        { 
          id: 'departments', 
          title: 'Катедри', 
          desc: 'Академични звена, отговарящи за обучението и научната дейност.', 
          icon: GraduationCap, 
          color: 'bg-blue-500',
          path: '/departments'
        },
        { 
          id: 'museum', 
          title: 'Музей', 
          desc: 'История и културно наследство на университета и региона.', 
          icon: Landmark, 
          color: 'bg-amber-500',
          path: '/museum'
        },
        { 
          id: 'library', 
          title: 'Библиотека', 
          desc: 'Богат фонд от научна и учебна литература за студентите.', 
          icon: Book, 
          color: 'bg-emerald-500',
          path: '/library'
        },
        { 
          id: 'council', 
          title: 'Студентски съвет', 
          desc: 'Орган за представителство и защита на интересите на студентите.', 
          icon: Users, 
          color: 'bg-rose-500',
          path: '/student-council'
        }
      ]
    },
    RU: {
      title: 'Структура',
      subtitle: 'Организационные подразделения и академические ресурсы',
      sections: [
        { 
          id: 'departments', 
          title: 'Кафедры', 
          desc: 'Академические подразделения, отвечающие за обучение и научную деятельность.', 
          icon: GraduationCap, 
          color: 'bg-blue-500',
          path: '/departments'
        },
        { 
          id: 'museum', 
          title: 'Музей', 
          desc: 'История и культурное наследие университета и региона.', 
          icon: Landmark, 
          color: 'bg-amber-500',
          path: '/museum'
        },
        { 
          id: 'library', 
          title: 'Библиотека', 
          desc: 'Богатый фонд научной и учебной литературы для студентов.', 
          icon: Book, 
          color: 'bg-emerald-500',
          path: '/library'
        },
        { 
          id: 'council', 
          title: 'Студенческий совет', 
          desc: 'Орган представительства и защиты интересов студентов.', 
          icon: Users, 
          color: 'bg-rose-500',
          path: '/student-council'
        }
      ]
    },
    RO: {
      title: 'Structură',
      subtitle: 'Unități organizaționale și resurse academice',
      sections: [
        { 
          id: 'departments', 
          title: 'Catedre', 
          desc: 'Unități academice responsabile de predare și activități științifice.', 
          icon: GraduationCap, 
          color: 'bg-blue-500',
          path: '/departments'
        },
        { 
          id: 'museum', 
          title: 'Muzeu', 
          desc: 'Istoria și patrimoniul cultural al universității și regiunii.', 
          icon: Landmark, 
          color: 'bg-amber-500',
          path: '/museum'
        },
        { 
          id: 'library', 
          title: 'Bibliotecă', 
          desc: 'Fond bogat de literatură științifică și educațională pentru studenți.', 
          icon: Book, 
          color: 'bg-emerald-500',
          path: '/library'
        },
        { 
          id: 'council', 
          title: 'Consiliul Studenților', 
          desc: 'Organ de reprezentare și protecție a intereselor studenților.', 
          icon: Users, 
          color: 'bg-rose-500',
          path: '/student-council'
        }
      ]
    },
    EN: {
      title: 'Structure',
      subtitle: 'Organizational units and academic resources',
      sections: [
        { 
          id: 'departments', 
          title: 'Departments', 
          desc: 'Academic units responsible for teaching and scientific activities.', 
          icon: GraduationCap, 
          color: 'bg-blue-500',
          path: '/departments'
        },
        { 
          id: 'museum', 
          title: 'Museum', 
          desc: 'History and cultural heritage of the university and the region.', 
          icon: Landmark, 
          color: 'bg-amber-500',
          path: '/museum'
        },
        { 
          id: 'library', 
          title: 'Library', 
          desc: 'Rich fund of scientific and educational literature for students.', 
          icon: Book, 
          color: 'bg-emerald-500',
          path: '/library'
        },
        { 
          id: 'council', 
          title: 'Student Council', 
          desc: 'Body for representation and protection of students\' interests.', 
          icon: Users, 
          color: 'bg-rose-500',
          path: '/student-council'
        }
      ]
    }
  }[lang];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-[#001a33] text-white pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#FFCC00]/5 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-8"
          >
            <div className="w-1.5 h-1.5 bg-[#FFCC00] rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">Organization</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-bold mb-6 serif italic leading-none tracking-tight"
          >
            {t.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-lg md:text-xl font-light max-w-2xl leading-relaxed"
          >
            {t.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Grid Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {t.sections.map((section, idx) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link 
                to={section.path}
                className="group block bg-white rounded-[3rem] p-10 md:p-12 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden h-full"
              >
                {/* Background Accent */}
                <div className={`absolute top-0 right-0 w-40 h-40 ${section.color} opacity-[0.03] -mr-10 -mt-10 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className={`w-16 h-16 ${section.color} rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    <section.icon size={32} />
                  </div>
                  
                  <h3 className="text-3xl font-bold text-[#003366] mb-4 serif italic group-hover:text-[#FFCC00] transition-colors">
                    {section.title}
                  </h3>
                  
                  <p className="text-slate-500 text-lg font-light leading-relaxed mb-10 flex-grow">
                    {section.desc}
                  </p>
                  
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#003366]">
                    <span className="relative">
                      {lang === 'RU' ? 'Перейти' : 'Виж повече'}
                      <span className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-[#FFCC00] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                    </span>
                    <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer Decoration */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-1 bg-[#FFCC00] mx-auto mb-10"></div>
          <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.5em] leading-loose">
            {universityName} <br/> Organizational Structure
          </p>
        </div>
      </section>
    </div>
  );
};

export default Structure;
