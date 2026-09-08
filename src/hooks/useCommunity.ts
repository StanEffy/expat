import { useState, useEffect, useMemo, useCallback } from 'react';
import type { MunicipalityId } from '@/types/onboarding';
import type {
  CommunityEvent,
  NoticeBoardPost,
  MentorProfile,
  EventCategory,
  NoticeCategory,
} from '@/types/community';
import { communityService } from '@/services/communityService';

export type CommunityTab = 'events' | 'notices' | 'mentors';

export function useCommunity() {
  const [activeTab, setActiveTab] = useState<CommunityTab>('events');
  const [selectedCity, setSelectedCity] = useState<MunicipalityId | 'all'>('all');
  const [selectedEventCategory, setSelectedEventCategory] = useState<EventCategory | 'all'>('all');
  const [selectedNoticeCategory, setSelectedNoticeCategory] = useState<NoticeCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [events, setEvents] = useState<(CommunityEvent & { isRegistered: boolean })[]>([]);
  const [notices, setNotices] = useState<NoticeBoardPost[]>([]);
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadData = useCallback(() => {
    setEvents(communityService.getEvents());
    setNotices(communityService.getNotices());
    setMentors(communityService.getMentors());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (selectedCity !== 'all' && ev.municipalityId !== selectedCity) return false;
      if (selectedEventCategory !== 'all' && ev.category !== selectedEventCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchDesc = ev.description.toLowerCase().includes(q);
        const matchLoc = ev.location.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLoc) return false;
      }
      return true;
    });
  }, [events, selectedCity, selectedEventCategory, searchQuery]);

  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      if (selectedCity !== 'all' && n.municipalityId !== selectedCity) return false;
      if (selectedNoticeCategory !== 'all' && n.category !== selectedNoticeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchContent = n.content.toLowerCase().includes(q);
        const matchAuthor = n.author.toLowerCase().includes(q);
        if (!matchTitle && !matchContent && !matchAuthor) return false;
      }
      return true;
    });
  }, [notices, selectedCity, selectedNoticeCategory, searchQuery]);

  const filteredMentors = useMemo(() => {
    return mentors.filter((m) => {
      if (selectedCity !== 'all' && m.municipalityId !== selectedCity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = m.name.toLowerCase().includes(q);
        const matchBio = m.bio.toLowerCase().includes(q);
        const matchProf = m.profession.toLowerCase().includes(q);
        const matchSpecs = m.specialties.some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchBio && !matchProf && !matchSpecs) return false;
      }
      return true;
    });
  }, [mentors, selectedCity, searchQuery]);

  const handleToggleRsvp = useCallback((eventId: string) => {
    const res = communityService.toggleRsvp(eventId);
    setEvents(res.events);
  }, []);

  const handleAddNotice = useCallback((input: Omit<NoticeBoardPost, 'id' | 'createdAt'>) => {
    const created = communityService.addNotice(input);
    setNotices((prev) => [created, ...prev]);
    return created;
  }, []);

  const handleReset = useCallback(() => {
    communityService.resetData();
    loadData();
  }, [loadData]);

  return {
    isLoaded,
    activeTab,
    selectedCity,
    selectedEventCategory,
    selectedNoticeCategory,
    searchQuery,
    events: filteredEvents,
    notices: filteredNotices,
    mentors: filteredMentors,
    rawCounts: {
      events: events.length,
      notices: notices.length,
      mentors: mentors.length,
    },
    setActiveTab,
    setCity: setSelectedCity,
    setEventCategory: setSelectedEventCategory,
    setNoticeCategory: setSelectedNoticeCategory,
    setSearchQuery,
    toggleRsvp: handleToggleRsvp,
    addNotice: handleAddNotice,
    resetData: handleReset,
  };
}
