import { useState, useEffect, useMemo, useCallback } from 'react';
import type { MunicipalityId } from '@/types/onboarding';
import type {
  ServiceTicket,
  ServiceTicketCategory,
  ServiceTicketStatus,
  CreateServiceTicketInput,
} from '@/types/serviceRequest';
import { serviceRequestService } from '@/services/serviceRequestService';

export function useServiceRequests() {
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [selectedCity, setSelectedCity] = useState<MunicipalityId | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ServiceTicketStatus | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<ServiceTicketCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTickets(serviceRequestService.getTickets());
    setIsLoaded(true);
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (selectedCity !== 'all' && t.municipalityId !== selectedCity) return false;
      if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(query);
        const matchRef = t.referenceNumber.toLowerCase().includes(query);
        const matchDesc = t.description.toLowerCase().includes(query);
        if (!matchTitle && !matchRef && !matchDesc) return false;
      }
      return true;
    });
  }, [tickets, selectedCity, selectedStatus, selectedCategory, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: tickets.length,
      submitted: tickets.filter((t) => t.status === 'submitted').length,
      under_review: tickets.filter((t) => t.status === 'under_review').length,
      in_progress: tickets.filter((t) => t.status === 'in_progress').length,
      resolved: tickets.filter((t) => t.status === 'resolved').length,
    };
  }, [tickets]);

  const addTicket = useCallback((input: CreateServiceTicketInput) => {
    const created = serviceRequestService.createTicket(input);
    setTickets((prev) => [created, ...prev]);
    return created;
  }, []);

  const resetAll = useCallback(() => {
    const resetList = serviceRequestService.resetTickets();
    setTickets(resetList);
  }, []);

  return {
    isLoaded,
    tickets: filteredTickets,
    rawTickets: tickets,
    counts,
    selectedCity,
    selectedStatus,
    selectedCategory,
    searchQuery,
    setCity: setSelectedCity,
    setStatus: setSelectedStatus,
    setCategory: setSelectedCategory,
    setSearchQuery,
    createTicket: addTicket,
    resetTickets: resetAll,
  };
}
