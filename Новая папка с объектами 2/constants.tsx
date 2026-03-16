
import { Language, NavLink } from './types';

export const NAV_LINKS: NavLink[] = [
  { id: '1', path: '/', label: { BG: 'Начало', RU: 'Главная', RO: 'Acasă', EN: 'Home' } },
  { id: '2', path: '/education', label: { BG: 'Образование', RU: 'Образование', RO: 'Educație', EN: 'Education' } },
  { id: '3', path: '/admission', label: { BG: 'Прием', RU: 'Поступление', RO: 'Admitere', EN: 'Admission' } },
  { id: '4', path: '/international', label: { BG: 'Международна дейност', RU: 'Международная деятельность', RO: 'Activitate Internațională', EN: 'International' } },
  { id: '5', path: '/news', label: { BG: 'Новини', RU: 'Новости', RO: 'Știri', EN: 'News' } },
  { id: '6', path: '/about', label: { BG: 'Университет', RU: 'Университет', RO: 'Universitate', EN: 'About' } },
  { id: '7', path: '/contacts', label: { BG: 'Контакти', RU: 'Контакты', RO: 'Contacte', EN: 'Contacts' } },
];

export const LANGUAGES = [
  { code: Language.BG, name: 'БГ' },
  { code: Language.RU, name: 'РУ' },
  { code: Language.RO, name: 'RO' },
  { code: Language.EN, name: 'EN' },
];

export const APP_CONFIG = {
  universityName: {
    BG: 'Русенски университет "Ангел Кънчев"',
    RU: 'Русенский университет "Ангел Кънчев"',
    RO: 'Universitatea „Angel Kanchev" din Ruse',
    EN: '“Angel Kanchev” University of Ruse'
  },
  branchLocation: {
    BG: 'филиал в гр. Тараклия',
    RU: 'филиал в гр. Тараклия',
    RO: 'sucursala Taraclia',
    EN: 'Taraclia Branch'
  }
};