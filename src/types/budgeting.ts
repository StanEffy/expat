import type { MunicipalityId } from './onboarding';

export type ProposalCategory =
  | 'environment_parks'
  | 'culture_events'
  | 'integration_language'
  | 'sports_outdoor'
  | 'children_youth'
  | 'cycling_transit';

export type ProposalStatus = 'active' | 'funded' | 'closed';

export interface BudgetProposal {
  id: string;
  municipalityId: MunicipalityId;
  titleKey: string;
  descriptionKey: string;
  category: ProposalCategory;
  requiredBudget: number; // in EUR
  district: string;
  votesCount: number;
  targetVotes: number;
  submittedBy: string;
  status: ProposalStatus;
}

export interface UserVotingWallet {
  totalTokens: number;
  allocatedVotes: Record<string, number>; // proposalId -> number of tokens given
}
