import type { MunicipalityId } from '@/types/onboarding';
import type { BudgetProposal, UserVotingWallet } from '@/types/budgeting';
import { INITIAL_PROPOSALS, TOTAL_TOKENS_PER_USER } from '@/constants/budgetingData';

const WALLET_STORAGE_KEY = 'expat_pb_wallet_v1';
const PROPOSALS_STORAGE_KEY = 'expat_pb_proposals_v1';

export const budgetingService = {
  getWallet(): UserVotingWallet {
    try {
      const data = localStorage.getItem(WALLET_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load wallet', e);
    }
    return {
      totalTokens: TOTAL_TOKENS_PER_USER,
      allocatedVotes: {},
    };
  },

  saveWallet(wallet: UserVotingWallet): void {
    try {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
    } catch (e) {
      console.error('Failed to save wallet', e);
    }
  },

  getProposals(municipalityId?: MunicipalityId): BudgetProposal[] {
    let list: BudgetProposal[] = INITIAL_PROPOSALS;
    try {
      const data = localStorage.getItem(PROPOSALS_STORAGE_KEY);
      if (data) {
        list = JSON.parse(data);
      } else {
        localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(INITIAL_PROPOSALS));
      }
    } catch (e) {
      console.error('Failed to load proposals', e);
    }

    if (municipalityId) {
      return list.filter((p) => p.municipalityId === municipalityId);
    }
    return list;
  },

  saveProposals(proposals: BudgetProposal[]): void {
    try {
      localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(proposals));
    } catch (e) {
      console.error('Failed to save proposals', e);
    }
  },

  castVote(proposalId: string): { wallet: UserVotingWallet; proposals: BudgetProposal[] } {
    const wallet = this.getWallet();
    const usedTokens = Object.values(wallet.allocatedVotes).reduce((sum, val) => sum + val, 0);

    if (usedTokens >= wallet.totalTokens) {
      throw new Error('No remaining tokens');
    }

    const currentGiven = wallet.allocatedVotes[proposalId] || 0;
    wallet.allocatedVotes[proposalId] = currentGiven + 1;
    this.saveWallet(wallet);

    const proposals = this.getProposals().map((p) => {
      if (p.id === proposalId) {
        const updatedVotes = p.votesCount + 1;
        return {
          ...p,
          votesCount: updatedVotes,
          status: updatedVotes >= p.targetVotes ? ('funded' as const) : p.status,
        };
      }
      return p;
    });

    this.saveProposals(proposals);
    return { wallet, proposals };
  },

  withdrawVote(proposalId: string): { wallet: UserVotingWallet; proposals: BudgetProposal[] } {
    const wallet = this.getWallet();
    const currentGiven = wallet.allocatedVotes[proposalId] || 0;

    if (currentGiven <= 0) {
      return { wallet, proposals: this.getProposals() };
    }

    if (currentGiven === 1) {
      delete wallet.allocatedVotes[proposalId];
    } else {
      wallet.allocatedVotes[proposalId] = currentGiven - 1;
    }
    this.saveWallet(wallet);

    const proposals = this.getProposals().map((p) => {
      if (p.id === proposalId) {
        const updatedVotes = Math.max(0, p.votesCount - 1);
        return {
          ...p,
          votesCount: updatedVotes,
          status: updatedVotes < p.targetVotes && p.status === 'funded' ? ('active' as const) : p.status,
        };
      }
      return p;
    });

    this.saveProposals(proposals);
    return { wallet, proposals };
  },

  resetAllVotes(): { wallet: UserVotingWallet; proposals: BudgetProposal[] } {
    localStorage.removeItem(WALLET_STORAGE_KEY);
    localStorage.removeItem(PROPOSALS_STORAGE_KEY);
    return {
      wallet: { totalTokens: TOTAL_TOKENS_PER_USER, allocatedVotes: {} },
      proposals: INITIAL_PROPOSALS,
    };
  },
};
