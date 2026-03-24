export type Platform = 'whatsapp' | 'imessage' | 'messenger' | 'instagram' | 'android' | 'ios';
export type Sender = 'me' | 'them';
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type CallType = 'voice' | 'video';
export type CallDirection = 'incoming' | 'outgoing';
export type CallStatus = 'ringing' | 'calling' | 'connected' | 'ended' | 'missed';

export interface ChatMessage {
  id: string;
  text: string;
  sender: Sender;
  timestamp: string;
  status?: MessageStatus;
  image?: string;
  reactions?: string[];
}

export interface ChatSettings {
  battery: number;
  signal: number;
  wifi: boolean;
  time: string;
  showTyping: boolean;
  wallpaper?: string;
  showOnline?: boolean;
  showLastSeen?: boolean;
  lastSeen?: string;
  verified?: boolean;
}

export interface Chat {
  id: string;
  ownerId: string;
  platform: Platform;
  contactName: string;
  contactPhoto?: string;
  messages: ChatMessage[];
  settings: ChatSettings;
  isPublic: boolean;
  likes: number;
  createdAt: any;
}

export interface Call {
  id: string;
  platform: Platform;
  type: CallType;
  direction: CallDirection;
  contactName: string;
  phoneNumber?: string;
  username?: string;
  contactPhoto?: string;
  verified?: boolean;
  duration?: number; // in seconds
  status?: CallStatus;
  timestamp: any;
  ringtoneUrl?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isPremium: boolean;
  createdAt: any;
}

export interface Feedback {
  id: string;
  userId?: string;
  email: string;
  message: string;
  createdAt: any;
}

export type Tone = 'funny' | 'savage' | 'smart' | 'sad' | 'friendly' | 'professional' | 'rizz';

export type WritingMode = 'texting' | 'study';
export type TextingType = 'start' | 'continue' | 'apology' | 'rizz' | 'funny' | 'friendly' | 'professional' | 'emotional';
export type StudyType = 'email' | 'letter' | 'note' | 'notice';
export type WritingTone = 'formal' | 'friendly' | 'funny' | 'romantic' | 'savage' | 'short' | 'long' | 'simple';

export interface WritingResult {
  id: string;
  content: string;
  tone: WritingTone;
  type: TextingType | StudyType;
}
