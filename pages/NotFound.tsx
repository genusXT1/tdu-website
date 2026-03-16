
import React from 'react';
import { Link } from 'react-router-dom';
import { Language } from '../types';

export const NotFound: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = {
    BG: { title: '404 - Страницата не е намерена', back: 'Назад към началото' },
    RU: { title: '404 - Страница не найдена', back: 'Вернуться на главную' },
    RO: { title: '404 - Pagina nu a fost găsită', back: 'Înapoi la început' },
    EN: { title: '404 - Page Not Found', back: 'Back to home' }
  }[lang];

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-[120px] font-black text-[#003366]/10 serif italic leading-none mb-8">404</h1>
      <h2 className="text-3xl font-bold text-[#003366] mb-8 serif italic">{t.title}</h2>
      <Link 
        to="/" 
        className="bg-[#003366] text-white px-10 py-4 font-bold uppercase text-[10px] tracking-widest hover:bg-[#FFCC00] hover:text-[#003366] transition-all shadow-xl"
      >
        {t.back}
      </Link>
    </div>
  );
};
