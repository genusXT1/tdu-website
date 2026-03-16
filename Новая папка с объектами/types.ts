
export enum Language {
  BG = 'BG',
  RU = 'RU',
  RO = 'RO',
  EN = 'EN'
}

export type UserRole = 'system_admin' | 'admin' | 'moderator' | 'editor';

export type BlockType = 'hero' | 'text' | 'image-text' | 'grid' | 'accordion' | 'cta' | 'programs' | 'gallery' | 'stats' | 'person-grid' | 'service-grid' | 'partners-block' | 'contact-card' | 'react-component';

export interface ContentBlock {
  id: string;
  type: BlockType;
  data: Record<string, any>;
  style?: Record<string, any>;
  // For 'react-component' type
  componentName?: string;
  props?: Record<string, any>;
}

export interface DynamicPage {
  id: string;
  slug: string;
  title: Record<Language, string>;
  blocks: ContentBlock[];
  seoTitle?: string;
  seoDescription?: string;
  isPublished: boolean;
}

export interface NavLink {
  id: string;
  label: Record<Language, string>;
  path?: string;
  children?: NavLink[];
  isHeader?: boolean;
}

export interface SiteData {
  pages: DynamicPage[];
  navLinks: NavLink[];
  lastUpdated: string;
  adminTabOrder?: string[]; 
  tgSettings?: {
    botToken: string;
    autoSync: boolean;
    syncInterval?: number; // Интервал в минутах
  };
}

export interface Program {
  id: string;
  level: ('college' | 'bachelor' | 'master' | 'doctor') | ('college' | 'bachelor' | 'master' | 'doctor')[];
  title: Record<Language, string>;
  duration: Record<Language, string>;
  language: string;
  form: Record<Language, string>;
  timestamp?: any;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  link: string;
}

export interface AdmissionApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  status: 'new' | 'processing' | 'accepted' | 'rejected';
  timestamp: any;
  message?: string;
}

export interface NewsItem {
  id: string;
  date: string;
  category: string;
  title: Record<Language, string>;
  excerpt: Record<Language, string>;
  fullContent: Record<Language, string>;
  images: string[]; // Изменено с image на images
  timestamp: any;
  tgMessageId?: number;
  author?: string; // Кто добавил новость
}

export interface LogEntry {
  id: string;
  action: string;
  details: string;
  user: string;
  timestamp: any;
}
