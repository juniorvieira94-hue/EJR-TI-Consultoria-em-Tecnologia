export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface ServiceInfo {
  id: string;
  title: string;
  description: string;
  icon: string;
  keywords: string[];
}