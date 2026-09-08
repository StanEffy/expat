import type { ServiceTicket, CreateServiceTicketInput } from '@/types/serviceRequest';
import { INITIAL_SERVICE_TICKETS } from '@/constants/serviceRequestData';

const STORAGE_KEY = 'expat_service_tickets';

const MUNICIPALITY_CODES: Record<string, string> = {
  helsinki: 'HEL',
  espoo: 'ESP',
  tampere: 'TAM',
  vantaa: 'VAN',
  turku: 'TUR',
  oulu: 'OUL',
};

const DEPARTMENTS: Record<string, string> = {
  daycare_school: 'Education & Early Childhood Division',
  housing_permits: 'Urban Environment & Building Inspection',
  social_integration: 'Immigrant Integration Services',
  waste_environment: 'Environmental & Municipal Services',
  tax_business: 'Business Development & Enterprise Advisory',
  general_inquiry: 'Citizen Service Point (Asiakaspalvelu)',
};

export const serviceRequestService = {
  getTickets(): ServiceTicket[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse service tickets from localStorage', e);
    }
    return INITIAL_SERVICE_TICKETS;
  },

  createTicket(input: CreateServiceTicketInput): ServiceTicket {
    const tickets = this.getTickets();
    const cityCode = MUNICIPALITY_CODES[input.municipalityId] || 'MUN';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toISOString();

    const newTicket: ServiceTicket = {
      id: `ticket-${Date.now()}`,
      referenceNumber: `${cityCode}-2026-${randomSuffix}`,
      municipalityId: input.municipalityId,
      category: input.category,
      status: 'submitted',
      priority: input.priority,
      title: input.title,
      description: input.description,
      createdAt: now,
      updatedAt: now,
      estimatedResolutionDays: input.priority === 'high' ? 2 : 4,
      assignedDepartment: DEPARTMENTS[input.category] || 'Municipal Services',
      userEmail: input.userEmail,
    };

    const updated = [newTicket, ...tickets];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save service ticket to localStorage', e);
    }

    return newTicket;
  },

  resetTickets(): ServiceTicket[] {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to remove service tickets from localStorage', e);
    }
    return INITIAL_SERVICE_TICKETS;
  },
};
