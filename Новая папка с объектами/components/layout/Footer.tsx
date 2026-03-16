
import React from 'react';
import { Link } from 'react-router-dom';
import { Language } from '../../types';
import { APP_CONFIG } from '../../constants';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = {
    BG: { 
      legal: "Юридическа информация",
      privacy: "Поверителност",
      cookies: "Бисквитки",
      address: "гр. Тараклия, ул. Котовски, 4",
      phone: "Телефон",
      links: "Бързи връзки",
      edu: "Обучение",
      adm: "Прием",
      elearning: "e-Learning портал",
      accessibility: "Достъпност",
      connect: "Свържете се с нас",
      contacts: "Контакти",
      life: "Животът в университета"
    },
    RU: { 
      legal: "Правовая информация",
      privacy: "Конфиденциальность",
      cookies: "Cookie",
      address: "г. Тараклия, ул. Котовского, 4",
      phone: "Телефон",
      links: "Ссылки",
      edu: "Обучение",
      adm: "Поступление",
      elearning: "e-Learning портал",
      accessibility: "Достъпность",
      life: "Жизнь в университете"
    },
    RO: { 
      legal: "Info juridică",
      privacy: "Confidențialitate",
      cookies: "Cookie-uri",
      address: "Taraclia, str. Kotovski, 4",
      phone: "Telefon",
      links: "Link-uri rapide",
      edu: "Educație",
      adm: "Admitere",
      elearning: "e-Learning portal",
      accessibility: "Accesibilitate",
      connect: "Conectează-te",
      contacts: "Contacte",
      life: "Viața universitară"
    },
    EN: { 
      legal: "Legal Info",
      privacy: "Privacy Policy",
      cookies: "Cookies",
      address: "4 Kotovsky Str, Taraclia",
      phone: "Phone",
      links: "Quick Links",
      edu: "Education",
      adm: "Admission",
      elearning: "e-Learning Portal",
      accessibility: "Accessibility",
      connect: "Connect",
      contacts: "Contacts",
      life: "University Life"
    }
  }[lang];

  return (
    <footer className="bg-[#000d1a] pt-24 pb-12 px-6 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/[0.02] to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-16 mb-20">
          {/* Logo & About */}
          <div className="md:col-span-1">
            <img src="https://www.uni-ruse.bg/_layouts/15/images/UniRuse/ru-default-logo.png" alt="Uni Ruse" className="h-10 brightness-200 mb-8" />
            <p className="text-white/40 text-[10px] leading-loose uppercase tracking-widest font-black">
              {APP_CONFIG.universityName[lang]}<br/>
              {APP_CONFIG.branchLocation[lang]}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[#FFCC00] text-[10px] font-black uppercase tracking-[0.3em] mb-8">{t.phone}</h4>
            <div className="space-y-4 text-white/60 text-sm font-medium">
              <p>+373 294 2-55-44</p>
              <p>taraclia_branch@uni-ruse.bg</p>
              <p className="mt-6 text-[11px] font-black uppercase text-white/40 leading-relaxed">{t.address}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#FFCC00] text-[10px] font-black uppercase tracking-[0.3em] mb-8">{t.links}</h4>
            <ul className="space-y-4 text-sm text-white/60 font-medium">
              <li><Link to="/education" className="hover:text-white transition-colors">{t.edu}</Link></li>
              <li><Link to="/admission" className="hover:text-white transition-colors">{t.adm}</Link></li>
              <li><a href="https://e-learning.uni-ruse.bg/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">{t.elearning}</a></li>
              <li><Link to="/contacts" className="hover:text-white transition-colors">{(t as any).contacts}</Link></li>
              <li><Link to="/afk" className="hover:text-white transition-colors">{(t as any).life}</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-[#FFCC00] text-[10px] font-black uppercase tracking-[0.3em] mb-8">{(t as any).connect}</h4>
            <div className="flex gap-4 mb-10">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#FFCC00] hover:text-[#000d1a] transition-all text-xs font-black">FB</a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#FFCC00] hover:text-[#000d1a] transition-all text-xs font-black">YT</a>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
          <p className="text-center md:text-left">© 2026 Angel Kanchev University of Ruse. All Rights Reserved.</p>
          <div className="flex gap-6 flex-wrap justify-center">
            <Link to="/privacy" className="hover:text-white">{t.privacy}</Link>
            <Link to="/cookies" className="hover:text-white">{t.cookies}</Link>
            <Link to="/legal" className="hover:text-white">{t.legal}</Link>
            <Link to="/accessibility" className="hover:text-white">{t.accessibility}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
