
import React from 'react';
import { Language } from '../types';

interface InternationalProps {
  lang: Language;
}

const International: React.FC<InternationalProps> = ({ lang }) => {
  return (
    <div className="page-transition py-16 px-4 max-w-7xl mx-auto">
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-8">
          {lang === Language.BG ? 'Международна дейност' : 'International Activity'}
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed mb-12">
          {lang === Language.BG 
            ? 'Русенският университет е активен участник в европейското образователно пространство, осигурявайки мобилност за студенти и преподаватели.' 
            : 'The University of Ruse is an active participant in the European educational space, ensuring mobility for students and faculty.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <div className="p-10 border border-slate-200">
          <div className="w-16 h-1 w-12 bg-blue-900 mb-6"></div>
          <h2 className="text-2xl font-bold mb-4 italic serif">Erasmus+</h2>
          <p className="text-slate-500 mb-6">Програмата предлага възможност за обучение в партньорски университети в Германия, Франция, Полша и др.</p>
          <ul className="text-sm space-y-2 text-slate-700 font-medium">
            <li>• Финансова подкрепа (стипендии)</li>
            <li>• Признаване на кредити (ECTS)</li>
            <li>• Езикови курсове</li>
          </ul>
        </div>
        <div className="p-10 border border-slate-200">
          <div className="w-16 h-1 w-12 bg-blue-900 mb-6"></div>
          <h2 className="text-2xl font-bold mb-4 italic serif">Партньорства</h2>
          <p className="text-slate-500 mb-6">Сътрудничество с над 50 институции в Европа и Централна Азия за съвместни изследователски проекти.</p>
          <button className="text-xs font-bold uppercase tracking-widest text-blue-900 border-b border-blue-900">Списък на партньорите</button>
        </div>
      </div>

      <section className="bg-slate-100 p-8 md:p-16 text-center">
        <h3 className="text-2xl font-bold mb-4 italic serif">Европейски дипломи</h3>
        <p className="max-w-2xl mx-auto text-slate-600">Нашите студенти получават европейско дипломно приложение, което улеснява реализацията им навсякъде в ЕС.</p>
      </section>
    </div>
  );
};

export default International;
