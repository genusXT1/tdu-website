
import React, { useState } from 'react';
import { Language } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, X, ChevronDown, MessageSquare, Phone, Mail } from 'lucide-react';

interface FAQProps {
  lang: Language;
}

export const FAQ: React.FC<FAQProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const t = {
    BG: {
      title: 'Често задавани въпроси',
      subtitle: 'Намерете бързи отговори на най-честите въпроси',
      close: 'Затвори',
      contactUs: 'Не намерихте отговор?',
      contactBtn: 'Свържете се с нас',
      questions: [
        {
          q: 'Какви са документите за кандидатстване?',
          a: 'Основните документи включват диплома за средно образование, медицинско свидетелство и документ за самоличност. За чуждестранни студенти се изисква и легализиран превод на дипломата.'
        },
        {
          q: 'Има ли общежитие за студентите?',
          a: 'Да, филиалът разполага с обновено студентско общежитие, което предлага отлични условия за живот на достъпни цени.'
        },
        {
          q: 'Какви специалности се предлагат?',
          a: 'Предлагаме бакалавърски програми в областите на бизнес управлението, информационните технологии и педагогиката.'
        },
        {
          q: 'Как се формира балът за прием?',
          a: 'Балът се формира от оценките от държавните зрелостни изпити и оценки от дипломата за средно образование по определени предмети.'
        }
      ]
    },
    RU: {
      title: 'Часто задаваемые вопросы',
      subtitle: 'Найдите быстрые ответы на самые частые вопросы',
      close: 'Закрыть',
      contactUs: 'Не нашли ответ?',
      contactBtn: 'Связаться с нами',
      questions: [
        {
          q: 'Какие документы нужны для поступления?',
          a: 'Основные документы включают аттестат о среднем образовании, медицинскую справку и удостоверение личности. Для иностранных студентов требуется легализованный перевод аттестата.'
        },
        {
          q: 'Есть ли общежитие для студентов?',
          a: 'Да, филиал располагает обновленным студенческим общежитием, которое предлагает отличные условия для жизни по доступным ценам.'
        },
        {
          q: 'Какие специальности предлагаются?',
          a: 'Мы предлагаем программы бакалавриата в области бизнес-управления, информационных технологий и педагогики.'
        },
        {
          q: 'Как формируется балл для поступления?',
          a: 'Балл формируется на основе оценок государственных экзаменов и оценок из аттестата по профильным предметам.'
        }
      ]
    }
  }[lang] || { title: 'FAQ', questions: [] };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[900] w-16 h-16 bg-[#FFCC00] text-[#003366] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all group"
        title={t.title}
      >
        <HelpCircle size={28} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-bounce">FAQ</span>
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-[#000d1a]/80 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-8 md:p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-2xl font-bold serif italic text-[#003366]">{t.title}</h3>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">{t.subtitle}</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Questions List */}
              <div className="flex-grow overflow-y-auto p-8 md:p-10 space-y-4">
                {t.questions.map((item, idx) => (
                  <div key={idx} className="border border-slate-100 rounded-2xl overflow-hidden transition-all">
                    <button
                      onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
                      className={`w-full p-6 text-left flex justify-between items-center gap-4 transition-colors ${activeIndex === idx ? 'bg-[#003366] text-white' : 'bg-white text-[#003366] hover:bg-slate-50'}`}
                    >
                      <span className="font-bold text-sm md:text-base">{item.q}</span>
                      <ChevronDown size={20} className={`transition-transform duration-300 ${activeIndex === idx ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {activeIndex === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 text-slate-500 text-sm leading-relaxed bg-slate-50/50 border-t border-slate-100">
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Footer / Contact */}
              <div className="p-8 bg-slate-50 border-t border-slate-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.contactUs}</p>
                    <div className="flex gap-4 text-[#003366]">
                      <a href="tel:+37329424906" className="flex items-center gap-2 text-xs font-bold hover:text-[#FFCC00] transition-colors">
                        <Phone size={14} /> +373 294 24 906
                      </a>
                      <a href="mailto:taraclia_branch@uni-ruse.bg" className="flex items-center gap-2 text-xs font-bold hover:text-[#FFCC00] transition-colors">
                        <Mail size={14} /> Email
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="bg-[#003366] text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all shadow-lg"
                  >
                    {t.close}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
