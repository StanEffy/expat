import type { MunicipalityId } from './onboarding';

export type EventCategory =
  | 'language_exchange'
  | 'cultural'
  | 'sports_outdoor'
  | 'family'
  | 'networking';

export interface CommunityEvent {
  id: string;
  municipalityId: MunicipalityId;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  time: string;
  location: string;
  organizer: string;
  attendeesCount: number;
  maxAttendees?: number;
  languages: string[];
  price?: string;
}

export type NoticeCategory =
  | 'housing_sharing'
  | 'goods_giveaway'
  | 'study_buddy'
  | 'advice';

export interface NoticeBoardPost {
  id: string;
  municipalityId: MunicipalityId;
  author: string;
  title: string;
  content: string;
  category: NoticeCategory;
  createdAt: string;
  contact: string;
}

export interface MentorProfile {
  id: string;
  municipalityId: MunicipalityId;
  name: string;
  originCountry: string;
  yearsInFinland: number;
  profession: string;
  languages: string[];
  bio: string;
  specialties: string[];
  contactEmail: string;
}
