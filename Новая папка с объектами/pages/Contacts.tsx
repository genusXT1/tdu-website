
import React from 'react';
import { Language } from '../types';

interface ContactsProps {
  lang: Language;
}

const Contacts: React.FC<ContactsProps> = ({ lang }) => {
  const t = {
    BG: { 
      title: 'Контакти', 
      address: 'Адрес', 
      addressVal: 'ул. Котовски, 4, гр. Тараклия, Р. Молдова, 7401',
      phones: 'Телефони', 
      hours: 'Работно време',
      days: 'Пон - Пет: 08:00 - 17:00',
      break: 'Обедна почивка: 12:00 - 13:00'
    },
    RU: { 
      title: 'Контакты', 
      address: 'Адрес', 
      addressVal: 'ул. Котовского, 4, г. Тараклия, Р. Молдова, 7401',
      phones: 'Телефоны', 
      hours: 'Рабочее время',
      days: 'Пн - Пт: 08:00 - 17:00',
      break: 'Обеденный перерыв: 12:00 - 13:00'
    },
    RO: { 
      title: 'Contacte', 
      address: 'Adresă', 
      addressVal: 'str. Kotovski, 4, or. Taraclia, R. Moldova, 7401',
      phones: 'Telefoane', 
      hours: 'Program de lucru',
      days: 'Lun - Vin: 08:00 - 17:00',
      break: 'Pauză de masă: 12:00 - 13:00'
    },
    EN: { 
      title: 'Contacts', 
      address: 'Address', 
      addressVal: '4 Kotovsky Str, Taraclia, R. Moldova, 7401',
      phones: 'Phones', 
      hours: 'Working Hours',
      days: 'Mon - Fri: 08:00 - 17:00',
      break: 'Lunch break: 12:00 - 13:00'
    }
  }[lang];

  return (
    <div className="page-transition">
      <div className="py-16 px-4 max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-12">{t.title}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-10">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-blue-900 mb-4">{(t as any).address}</h4>
              <p className="text-xl text-slate-700">{(t as any).addressVal}</p>
            </div>
            
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-blue-900 mb-4">{t.phones}</h4>
              <div className="space-y-2">
                <p className="text-xl text-slate-700">+373 294 2-55-44</p>
                <p className="text-xl text-slate-700">+373 294 2-30-22</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-blue-900 mb-4">{(t as any).hours}</h4>
              <p className="text-xl text-slate-700">{(t as any).days}</p>
              <p className="text-slate-400">{(t as any).break}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-blue-900 mb-4">Email</h4>
              <p className="text-xl text-slate-700">rector@uni-ruse.bg</p>
              <p className="text-xl text-slate-700">taraclia_branch@uni-ruse.bg</p>
            </div>
          </div>

          <div className="h-[400px] md:h-full min-h-[400px] bg-slate-200 rounded-sm overflow-hidden relative grayscale hover:grayscale-0 transition-all">
             <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11003.874134988086!2d28.6534568!3d45.9011409!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b7194f87766d0b%3A0xe6796245041075d!2sTaraclia%2C%20Moldova!5e0!3m2!1sen!2sbg!4v1715421234567!5m2!1sen!2sbg" 
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                title="Google Maps"
              ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
