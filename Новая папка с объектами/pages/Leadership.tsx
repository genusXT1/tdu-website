
import React from 'react';
import { Language } from '../types';
import { Phone, Mail, Facebook } from 'lucide-react';

const Leadership: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = {
    BG: { title: 'Ръководство', subtitle: 'Управление на филиала', director: 'Директор', admin: 'Административен директор' },
    RU: { title: 'Руководство', subtitle: 'Управление филиалом', director: 'Директор', admin: 'Административный директор' },
    RO: { title: 'Conducere', subtitle: 'Managementul filialei', director: 'Director', admin: 'Director administrativ' },
    EN: { title: 'Leadership', subtitle: 'Branch Management', director: 'Director', admin: 'Administrative Director' }
  }[lang];

  const leaders = [
    {
      role: t.director,
      name: 'Доцент доктор Валентина Василева',
      phone: '0(294) 84 9 90',
      email: 'vvasileva@uni-ruse.bg',
      fb: 'https://www.facebook.com/RUTaraclia',
      image: 'https://picsum.photos/seed/vasileva/800/1000'
    },
    {
      role: t.admin,
      name: 'Александр Боримечков',
      phone: '0(294) 84 9 90',
      email: 'aborimechkov@uni-ruse.bg',
      fb: 'https://www.facebook.com/RUTaraclia',
      image: 'https://picsum.photos/seed/borimechkov/800/1000'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-serif italic text-[#003366] mb-4">{t.title}</h1>
        <p className="text-slate-500 mb-16">{t.subtitle}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {leaders.map((l, i) => (
            <div key={i} className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-slate-100 flex flex-col">
              <img src={l.image} alt={l.name} className="h-96 w-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
              <div className="p-10">
                <span className="text-[#FFCC00] font-black text-[10px] uppercase tracking-widest block mb-2">{l.role}</span>
                <h2 className="text-3xl font-serif text-[#003366] mb-6">{l.name}</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-slate-600">
                    <Phone size={18} /> <span className="font-bold">{l.phone}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600">
                    <Mail size={18} /> <span className="font-bold">{l.email}</span>
                  </div>
                  <a href={l.fb} target="_blank" rel="noreferrer" className="flex items-center gap-4 text-[#003366] hover:text-[#FFCC00]">
                    <Facebook size={18} /> <span className="font-black text-[10px] uppercase tracking-widest">Facebook</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leadership;
