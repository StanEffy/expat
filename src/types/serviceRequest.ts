import type { MunicipalityId } from './onboarding';

export type ServiceTicketCategory =
  | 'daycare_school'
  | 'housing_permits'
  | 'social_integration'
  | 'waste_environment'
  | 'tax_business'
  | 'general_inquiry';

export type ServiceTicketStatus =
  | 'submitted'
  | 'under_review'
  | 'in_progress'
  | 'resolved';

export type ServiceTicketPriority = 'low' | 'medium' | 'high';

export interface ServiceTicket {
  id: string;
  referenceNumber: string; // e.g. "HEL-2026-4012"
  municipalityId: MunicipalityId;
  category: ServiceTicketCategory;
  status: ServiceTicketStatus;
  priority: ServiceTicketPriority;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  estimatedResolutionDays: number;
  assignedDepartment: string;
  officialResponse?: string;
  userEmail?: string;
}

export interface CreateServiceTicketInput {
  municipalityId: MunicipalityId;
  category: ServiceTicketCategory;
  priority: ServiceTicketPriority;
  title: string;
  description: string;
  userEmail?: string;
}
