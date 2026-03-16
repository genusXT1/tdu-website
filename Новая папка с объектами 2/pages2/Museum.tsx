
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { motion } from 'motion/react';
import { Landmark, History, Camera, MapPin, Clock, Mail, Facebook, User } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface MuseumProps {
  lang: Language;
}

const Museum: React.FC<MuseumProps> = ({ lang }) => {
  const [gallery, setGallery] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "gallery"), where("category", "==", "Музей"));
    const unsub = onSnapshot(q, (snapshot) => {
      setGallery(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const t = {
    BG: {
      title: 'Етнографски музей',
      subtitle: 'Учебен етнографски музей на филиала',
      tag: 'Културно наследство',
      history: 'Създаден по инициатива на проф. по исторически науки Н. Д. Русев и проф. по исторически науки Н. Н. Червенков, работна група с участието на магистър Н. Н. Каракаш и магистър Н. Н. Мостовой.',
      mission: 'Целите на музея са изучаване, проучване, събиране, консервация, реставрация, изследване и експониране на движими паметници на културата, отразяващи творческата изява на българската диаспора.',
      sections: [
        { title: 'Кухня', desc: 'Традиционни предмети и уредба на битовата кухня.' },
        { title: 'Спалня', desc: 'Автентична подредба на спалното помещение.' },
        { title: 'Домакински принадлежности', desc: 'Инструменти и предмети от ежедневието на бесарабските българи.' }
      ],
      personnel: 'Персонал',
      guide: 'Музеен екскурзовод: Асистент Николай Николаевич Мостовой',
      hours: 'Работно време: 8:00 - 17:00 ч.',
      lunch: 'Обяд: 12:00 - 13:00 ч.',
      galleryTitle: 'Фотогалерия на музея'
    },
    RU: {
      title: 'Этнографический музей',
      subtitle: 'Учебный этнографический музей филиала',
      tag: 'Культурное наследие',
      history: 'Создан по инициативе проф. ист. наук Руссева Н.Д. и проф. ист. наук Червенкова Н.Н., рабочей группы с участием магистра Каракаша Н.Н. и магистра Мостового Н.Н.',
      mission: 'Задачами музея являются изучение, изыскание, сбор, консервация, реставрация, исследования, экспонирования движимых памятников культуры, отражающие проявления творчества болгарской диаспоры.',
      sections: [
        { title: 'Кухня', desc: 'Традиционные предметы и устройство бытовой кухни.' },
        { title: 'Спальня', desc: 'Аутентичная обстановка спального помещения.' },
        { title: 'Хозяйственный инвентарь', desc: 'Инструменты и предметы повседневного быта бессарабских болгар.' }
      ],
      personnel: 'Персонал',
      guide: 'Гид музея: ассистент Мостовой Николай Николаевич',
      hours: 'Часы работы: 8:00-17:00',
      lunch: 'Обеденный перерыв: 12:00 – 13:00',
      galleryTitle: 'Фотогалерея музея'
    }
  }[lang] || { title: 'Museum', galleryTitle: 'Gallery' };

  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-[#001a33]">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover" 
            alt="Museum background"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-white" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-[#FFCC00] text-[10px] font-black uppercase tracking-[0.8em] block mb-8">{t.tag}</span>
            <h1 className="text-6xl md:text-8xl font-serif italic text-white mb-8 leading-tight">{t.title}</h1>
            <p className="text-2xl text-white/80 font-light max-w-3xl mx-auto">{t.subtitle}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-20 h-1 bg-[#FFCC00] mb-8"></div>
            <h2 className="text-4xl font-bold text-[#003366] serif italic mb-8">История и мисия</h2>
            <p className="text-xl text-slate-600 leading-relaxed mb-6 font-light">
              {t.history}
            </p>
            <p className="text-lg text-slate-500 leading-relaxed italic">
              {t.mission}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-[#FFCC00]/10 rounded-[4rem] -rotate-3"></div>
            <img src="https://picsum.photos/id/180/800/1000" className="relative z-10 rounded-[3rem] shadow-2xl" alt="Museum" />
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {t.sections.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-12 rounded-[3rem] border border-slate-100 hover:shadow-2xl transition-all duration-500 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#003366] flex items-center justify-center text-white mb-8 group-hover:bg-[#FFCC00] group-hover:text-[#003366] transition-colors">
                  <Landmark size={28} />
                </div>
                <h3 className="text-2xl font-bold text-[#003366] mb-6 serif italic">{section.title}</h3>
                <p className="text-slate-500 leading-relaxed font-light">
                  {section.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-12">
            <h2 className="text-4xl font-bold text-[#003366] serif italic">{t.personnel}</h2>
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-[#003366]">
                  <User size={32} />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#003366]">{t.guide}</p>
                </div>
              </div>
              <div className="space-y-4 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-4 text-slate-600">
                  <Mail size={20} className="text-[#FFCC00]" />
                  <span className="font-medium">nmostovoy@uni-ruse.bg</span>
                </div>
                <a href="https://www.facebook.com/RUTaraclia" target="_blank" rel="noreferrer" className="flex items-center gap-4 text-[#003366] hover:text-[#FFCC00] transition-colors">
                  <Facebook size={20} className="text-[#FFCC00]" />
                  <span className="font-black text-[10px] uppercase tracking-widest">Facebook: RUTaraclia</span>
                </a>
              </div>
            </div>
          </div>
          <div className="space-y-12">
            <h2 className="text-4xl font-bold text-[#003366] serif italic">Контакт и посещение</h2>
            <div className="bg-[#003366] p-10 rounded-[3rem] text-white space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-16 -mt-16 rounded-full"></div>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-[#FFCC00]">
                  <Clock size={32} />
                </div>
                <div>
                  <p className="text-xl font-bold">{t.hours}</p>
                  <p className="text-white/60 text-sm">{t.lunch}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-[#FFCC00]">
                  <MapPin size={32} />
                </div>
                <div>
                  <p className="text-xl font-bold">гр. Тараклия</p>
                  <p className="text-white/60 text-sm">ул. „Мира“ 9</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Gallery Section */}
      {gallery.length > 0 && (
        <section className="py-24 bg-slate-50 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#FFCC00] text-[10px] font-black uppercase tracking-[0.5em] block mb-4">Галерия</span>
              <h2 className="text-4xl md:text-6xl font-serif italic text-[#003366]">{t.galleryTitle}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {gallery.map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="aspect-square rounded-[2rem] overflow-hidden shadow-lg group cursor-pointer"
                >
                  <img 
                    src={item.url} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={item.titleRU || 'Exhibit'}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Museum;
