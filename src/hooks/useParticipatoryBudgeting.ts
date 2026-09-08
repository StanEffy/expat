import { useState, useEffect, useMemo, useCallback } from 'react';
import type { MunicipalityId } from '@/types/onboarding';
import type { BudgetProposal, ProposalCategory, UserVotingWallet } from '@/types/budgeting';
import { budgetingService } from '@/services/budgetingService';

export function useParticipatoryBudgeting() {
  const [wallet, setWallet] = useState<UserVotingWallet>({ totalTokens: 5, allocatedVotes: {} });
  const [proposals, setProposals] = useState<BudgetProposal[]>([]);
  const [selectedCity, setSelectedCity] = useState<MunicipalityId | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<ProposalCategory | 'all'>('all');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const w = budgetingService.getWallet();
    const p = budgetingService.getProposals();
    setWallet(w);
    setProposals(p);
    setIsLoaded(true);
  }, []);

  const usedTokens = useMemo(() => {
    return Object.values(wallet.allocatedVotes).reduce((sum, val) => sum + val, 0);
  }, [wallet]);

  const remainingTokens = Math.max(0, wallet.totalTokens - usedTokens);

  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      if (selectedCity !== 'all' && p.municipalityId !== selectedCity) {
        return false;
      }
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [proposals, selectedCity, selectedCategory]);

  const castVote = useCallback((proposalId: string) => {
    try {
      const result = budgetingService.castVote(proposalId);
      setWallet(result.wallet);
      setProposals(result.proposals);
    } catch (err) {
      console.warn(err);
    }
  }, []);

  const withdrawVote = useCallback((proposalId: string) => {
    const result = budgetingService.withdrawVote(proposalId);
    setWallet(result.wallet);
    setProposals(result.proposals);
  }, []);

  const resetVotes = useCallback(() => {
    const result = budgetingService.resetAllVotes();
    setWallet(result.wallet);
    setProposals(result.proposals);
  }, []);

  return {
    isLoaded,
    wallet,
    proposals: filteredProposals,
    allProposalsCount: proposals.length,
    selectedCity,
    selectedCategory,
    usedTokens,
    remainingTokens,
    castVote,
    withdrawVote,
    resetVotes,
    setCity: setSelectedCity,
    setCategory: setSelectedCategory,
  };
}
