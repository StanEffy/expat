import type { CommunityEvent, NoticeBoardPost, MentorProfile } from '@/types/community';
import {
  INITIAL_COMMUNITY_EVENTS,
  INITIAL_NOTICES,
  INITIAL_MENTORS,
} from '@/constants/communityData';

const RSVP_STORAGE_KEY = 'expat_event_rsvps';
const NOTICES_STORAGE_KEY = 'expat_community_notices';

export const communityService = {
  getRsvps(): string[] {
    try {
      const stored = localStorage.getItem(RSVP_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse RSVPs from localStorage', e);
    }
    return [];
  },

  getEvents(): (CommunityEvent & { isRegistered: boolean })[] {
    const rsvps = new Set(this.getRsvps());
    return INITIAL_COMMUNITY_EVENTS.map((event) => ({
      ...event,
      isRegistered: rsvps.has(event.id),
      attendeesCount: event.attendeesCount + (rsvps.has(event.id) ? 1 : 0),
    }));
  },

  toggleRsvp(eventId: string): { isRegistered: boolean; events: (CommunityEvent & { isRegistered: boolean })[] } {
    const rsvps = new Set(this.getRsvps());
    let isRegistered = false;
    if (rsvps.has(eventId)) {
      rsvps.delete(eventId);
    } else {
      rsvps.add(eventId);
      isRegistered = true;
    }
    try {
      localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(Array.from(rsvps)));
    } catch (e) {
      console.warn('Failed to save RSVPs to localStorage', e);
    }
    return { isRegistered, events: this.getEvents() };
  },

  getNotices(): NoticeBoardPost[] {
    try {
      const stored = localStorage.getItem(NOTICES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse notices from localStorage', e);
    }
    return INITIAL_NOTICES;
  },

  addNotice(input: Omit<NoticeBoardPost, 'id' | 'createdAt'>): NoticeBoardPost {
    const notices = this.getNotices();
    const newNotice: NoticeBoardPost = {
      ...input,
      id: `notice-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newNotice, ...notices];
    try {
      localStorage.setItem(NOTICES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save notice to localStorage', e);
    }
    return newNotice;
  },

  getMentors(): MentorProfile[] {
    return INITIAL_MENTORS;
  },

  resetData() {
    try {
      localStorage.removeItem(RSVP_STORAGE_KEY);
      localStorage.removeItem(NOTICES_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to reset community data in localStorage', e);
    }
  },
};
