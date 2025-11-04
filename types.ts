export interface Job {
  id: string;
  title: string;
  department: string;
  category: string;
  description: string;
  qualification: string;
  vacancies: string;
  postedDate: string;
  lastDate: string;
  applyLink: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
}

export type JobStatus = 'active' | 'expired' | 'draft' | 'archived';

export interface ContentPost {
  id: string;
  title: string;
  content: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  description?: string;
}

export interface AdSettings {
  googleAdClient: string;
  googleAdSlots: Record<PlacementKey, string>;
  popupAdEnabled: boolean;
}

export type PlacementKey = 
  | 'header'
  | 'sidebar'
  | 'content'
  | 'footer'
  | 'mobileBanner'
  | 'interstitial';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Session {
  user?: User;
  expires: Date;
}