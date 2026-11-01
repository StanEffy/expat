import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { registerGrowthTranslations } from '@/i18n/registerGrowth';
import { challengesService } from '@/services/growthService';
import { useNotification } from '@/hooks/useNotification';
import type { ChallengeDetail, ChallengeTeam, CityChallenge } from '@/types/growth';
import { CITY_IDS, CITY_NAMES, errorText, formatDate } from '@/components/Growth/shared';
import styles from '@/components/Growth/Growth.module.scss';

registerGrowthTranslations();

const BUDGET_CATEGORIES = ['integration_language', 'culture_events', 'environment_parks', 'sports_outdoor', 'children_youth', 'cycling_transit'];

export const Challenges: React.FC = () => {
  const { t, i18n } = useTranslation('growth');
  const { showNotification } = useNotification();
  const [city, setCity] = useState('');
  const [challenges, setChallenges] = useState<CityChallenge[]>([]);
  const [isStaff, setIsStaff] = useState(false);
  const [selected, setSelected] = useState<ChallengeDetail | null>(null);
  const [teamName, setTeamName] = useState('');
  const [idea, setIdea] = useState({ title: '', summary: '', link: '' });
  const [newChallenge, setNewChallenge] = useState({ municipality_id: 'helsinki', title: '', description: '', deadline: '' });
  const [promote, setPromote] = useState<{ submissionId: number; category: string; required_budget: number; district: string } | null>(null);

  const loadList = useCallback(() => {
    challengesService.list(city).then((r) => {
      setChallenges(r.challenges);
      setIsStaff(r.is_staff);
    }).catch(() => undefined);
  }, [city]);

  const open = useCallback(async (id: number) => {
    try {
      const detail = await challengesService.get(id);
      setSelected(detail);
      const mine = detail.teams.find((team) => team.id === detail.challenge.my_team_id);
      setIdea(mine?.submission
        ? { title: mine.submission.title, summary: mine.submission.summary, link: mine.submission.link }
        : { title: '', summary: '', link: '' });
    } catch (err) {
      showNotification(errorText(err, t('common.error', 'Something went wrong')), 'error');
    }
  }, [showNotification, t]);

  useEffect(() => {
    registerGrowthTranslations();
    loadList();
  }, [loadList]);

  const act = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      showNotification(success, 'success');
      loadList();
      if (selected) await open(selected.challenge.id);
      return true;
    } catch (err) {
      showNotification(errorText(err, t('common.error', 'Something went wrong')), 'error');
      return false;
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await act(
      () => challengesService.create({ ...newChallenge, deadline: newChallenge.deadline || undefined }),
      t('challenges.created', 'Challenge published'),
    );
    if (ok) setNewChallenge((c) => ({ ...c, title: '', description: '', deadline: '' }));
  };

  const myTeam: ChallengeTeam | undefined = selected?.teams.find((team) => team.id === selected.challenge.my_team_id);
  const isOpen = selected?.challenge.status === 'open';

  if (selected) {
    const c = selected.challenge;
    return (
      <div className={styles.container} data-reveal-children>
        <button type="button" className={styles.secondaryButton} onClick={() => setSelected(null)} style={{ marginBottom: '1rem' }}>
          <i className="pi pi-arrow-left" /> {t('challenges.back', 'All challenges')}
        </button>
        <div className={styles.card}>
          <h1 className={styles.cardTitle} style={{ fontSize: '1.6rem' }}>{c.title}</h1>
          <div className={styles.chips}>
            <span className={`${styles.chip} ${styles.chipBlue}`}>{CITY_NAMES[c.municipality_id] ?? c.municipality_id}</span>
            <span className={isOpen ? `${styles.chip} ${styles.chipGreen}` : `${styles.chip} ${styles.chipOrange}`}>{t(`challenges.status.${c.status}`)}</span>
            {c.deadline && <span className={styles.chip}>{t('challenges.deadline', { date: formatDate(c.deadline, i18n.language) })}</span>}
          </div>
          <p style={{ whiteSpace: 'pre-line', lineHeight: 1.55 }}>{c.description}</p>
          {isStaff && (
            <div className={styles.actions}>
              {isOpen ? (
                <button type="button" className={styles.secondaryButton} onClick={() => act(() => challengesService.close(c.id), t('challenges.closedMsg', 'Closed'))}>{t('challenges.close', 'Close challenge')}</button>
              ) : (
                <button type="button" className={styles.secondaryButton} onClick={() => act(() => challengesService.reopen(c.id), t('challenges.reopened', 'Reopened'))}>{t('challenges.reopen', 'Reopen')}</button>
              )}
            </div>
          )}
        </div>

        {isOpen && !myTeam && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><i className="pi pi-users" /> {t('challenges.startTeam', 'Start a team')}</h2>
            <form className={styles.actions} onSubmit={(e) => { e.preventDefault(); void act(() => challengesService.createTeam(c.id, teamName), t('challenges.teamCreated', 'Team created')).then((ok) => ok && setTeamName('')); }}>
              <input className={styles.input} style={{ flex: 1, minWidth: '12rem' }} maxLength={80} value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder={t('challenges.teamPlaceholder', 'Team name')} />
              <button type="submit" className={styles.primaryButton} disabled={!teamName.trim()}>{t('challenges.create', 'Create')}</button>
            </form>
            <p className={styles.notice}>{t('challenges.teamHint', 'Or join one of the teams below. Teammates appear in your connections.')}</p>
          </div>
        )}

        {myTeam && isOpen && (
          <div className={`${styles.card} ${styles.highlight}`}>
            <h2 className={styles.cardTitle}><i className="pi pi-lightbulb" /> {t('challenges.yourIdea', { team: myTeam.name })}</h2>
            <form className={styles.form} onSubmit={(e) => { e.preventDefault(); void act(() => challengesService.submit(myTeam.id, idea), t('challenges.submitted', 'Idea saved')); }}>
              <input className={styles.input} required value={idea.title} onChange={(e) => setIdea({ ...idea, title: e.target.value })} placeholder={t('challenges.ideaTitle', 'Idea in one line')} aria-label={t('challenges.ideaTitle', 'Idea in one line')} />
              <textarea className={styles.input} required rows={5} value={idea.summary} onChange={(e) => setIdea({ ...idea, summary: e.target.value })} placeholder={t('challenges.ideaSummary', 'What, for whom, how it works, what it needs')} aria-label={t('challenges.ideaSummary', 'What, for whom, how it works, what it needs')} />
              <input className={styles.input} value={idea.link} onChange={(e) => setIdea({ ...idea, link: e.target.value })} placeholder={t('challenges.ideaLink', 'Link to slides or a doc (optional)')} aria-label={t('challenges.ideaLink', 'Link to slides or a doc (optional)')} />
              <div className={styles.actions}>
                <button type="submit" className={styles.primaryButton}>{myTeam.submission ? t('challenges.update', 'Update idea') : t('challenges.submit', 'Submit idea')}</button>
                <button type="button" className={styles.dangerButton} onClick={() => act(() => challengesService.leaveTeam(myTeam.id), t('challenges.left', 'You left the team'))}>{t('challenges.leave', 'Leave team')}</button>
              </div>
            </form>
          </div>
        )}

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('challenges.teams', 'Teams')} ({selected.teams.length})</h2>
          {selected.teams.length === 0 ? (
            <div className={`${styles.card} ${styles.emptyState}`}><i className="pi pi-users" />{t('challenges.noTeams', 'No teams yet — start the first one!')}</div>
          ) : (
            <div className={styles.grid}>
              {selected.teams.map((team) => (
                <div key={team.id} className={`${styles.card} ${team.id === myTeam?.id ? styles.highlight : ''}`} style={{ marginTop: 0 }}>
                  <h3 className={styles.cardTitle}>{team.name}</h3>
                  <p className={styles.muted}>{team.members.map((m) => m.name).join(', ')}</p>
                  {team.submission ? (
                    <div>
                      <div className={styles.itemTitle}>{team.submission.title}</div>
                      <p className={styles.muted} style={{ whiteSpace: 'pre-line' }}>{team.submission.summary}</p>
                      {team.submission.link && <a className={styles.muted} href={team.submission.link} target="_blank" rel="noreferrer">{team.submission.link}</a>}
                      {team.submission.proposal_id && (
                        <div className={styles.chips}><span className={`${styles.chip} ${styles.chipGreen}`}><i className="pi pi-wallet" /> {t('challenges.inBudget', 'In budget voting')}</span></div>
                      )}
                      {isStaff && !team.submission.proposal_id && (
                        <div className={styles.actions} style={{ marginTop: '0.6rem' }}>
                          <button type="button" className={styles.secondaryButton} onClick={() => setPromote({ submissionId: team.submission!.id, category: 'integration_language', required_budget: 0, district: '' })}>
                            <i className="pi pi-wallet" /> {t('challenges.promote', 'Move to budget voting')}
                          </button>
                        </div>
                      )}
                      {promote?.submissionId === team.submission.id && (
                        <form className={styles.form} style={{ marginTop: '0.75rem' }} onSubmit={(e) => {
                          e.preventDefault();
                          void act(() => challengesService.promote(promote.submissionId, promote), t('challenges.promoted', 'The idea is now in budget voting')).then((ok) => ok && setPromote(null));
                        }}>
                          <select className={styles.input} value={promote.category} onChange={(e) => setPromote({ ...promote, category: e.target.value })} aria-label={t('challenges.budgetCategory', 'Budget category')}>
                            {BUDGET_CATEGORIES.map((bc) => <option key={bc} value={bc}>{t(`challenges.budgetCategories.${bc}`)}</option>)}
                          </select>
                          <div className={styles.formRow}>
                            <input type="number" min={0} className={styles.input} value={promote.required_budget} onChange={(e) => setPromote({ ...promote, required_budget: Number(e.target.value) })} aria-label={t('challenges.budget', 'Budget, €')} placeholder={t('challenges.budget', 'Budget, €')} />
                            <input className={styles.input} value={promote.district} onChange={(e) => setPromote({ ...promote, district: e.target.value })} placeholder={t('challenges.district', 'District')} aria-label={t('challenges.district', 'District')} />
                          </div>
                          <div className={styles.actions}>
                            <button type="submit" className={styles.primaryButton}>{t('challenges.promoteConfirm', 'Publish to voting')}</button>
                            <button type="button" className={styles.secondaryButton} onClick={() => setPromote(null)}>{t('common.cancel', 'Cancel')}</button>
                          </div>
                        </form>
                      )}
                    </div>
                  ) : (
                    <p className={styles.muted}>{t('challenges.noIdeaYet', 'No idea submitted yet')}</p>
                  )}
                  {isOpen && !myTeam && (
                    <button type="button" className={styles.primaryButton} style={{ marginTop: '0.75rem' }} onClick={() => act(() => challengesService.joinTeam(team.id), t('challenges.joined', 'Welcome to the team!'))}>
                      {t('challenges.join', 'Join')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} data-reveal-children>
      <div className={styles.header}>
        <h1>{t('challenges.title', 'City challenges')}</h1>
        <p>{t('challenges.subtitle', 'Your city shares a real problem. Team up with other residents, propose a solution — the best ideas go to participatory budgeting.')}</p>
      </div>

      <div className={styles.actions} style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
        <select className={styles.input} style={{ width: 'auto' }} value={city} onChange={(e) => setCity(e.target.value)} aria-label={t('common.city', 'City')}>
          <option value="">{t('common.allCities', 'All cities')}</option>
          {CITY_IDS.map((c) => <option key={c} value={c}>{CITY_NAMES[c]}</option>)}
        </select>
      </div>

      {challenges.length === 0 ? (
        <div className={`${styles.card} ${styles.emptyState}`}>
          <i className="pi pi-flag" />
          {t('challenges.empty', 'No challenges in this city yet. They are published by city staff.')}
        </div>
      ) : (
        <div className={styles.grid}>
          {challenges.map((c) => (
            <button key={c.id} type="button" className={`${styles.card} ${styles.hubCard}`} style={{ marginTop: 0, textAlign: 'left', font: 'inherit', cursor: 'pointer' }} onClick={() => open(c.id)}>
              <span className={styles.itemTitle} style={{ fontSize: '1.1rem' }}>{c.title}</span>
              <span className={styles.muted}>{c.description.length > 160 ? `${c.description.slice(0, 160)}…` : c.description}</span>
              <span className={styles.chips}>
                <span className={`${styles.chip} ${styles.chipBlue}`}>{CITY_NAMES[c.municipality_id] ?? c.municipality_id}</span>
                <span className={c.status === 'open' ? `${styles.chip} ${styles.chipGreen}` : `${styles.chip} ${styles.chipOrange}`}>{t(`challenges.status.${c.status}`)}</span>
                <span className={styles.chip}>{t('challenges.teamsCount', { count: c.teams_count })}</span>
                {c.my_team_id && <span className={`${styles.chip} ${styles.chipGreen}`}>{t('challenges.youAreIn', 'You are in a team')}</span>}
              </span>
            </button>
          ))}
        </div>
      )}

      {isStaff && (
        <div className={`${styles.card} ${styles.section}`}>
          <h2 className={styles.cardTitle}><i className="pi pi-plus" /> {t('challenges.new', 'New challenge (city staff)')}</h2>
          <form className={styles.form} onSubmit={create}>
            <div className={styles.formRow}>
              <select className={styles.input} value={newChallenge.municipality_id} onChange={(e) => setNewChallenge({ ...newChallenge, municipality_id: e.target.value })} aria-label={t('common.city', 'City')}>
                {CITY_IDS.map((c) => <option key={c} value={c}>{CITY_NAMES[c]}</option>)}
              </select>
              <input type="date" className={styles.input} value={newChallenge.deadline} onChange={(e) => setNewChallenge({ ...newChallenge, deadline: e.target.value })} aria-label={t('challenges.deadlineLabel', 'Deadline')} />
            </div>
            <input className={styles.input} required value={newChallenge.title} onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })} placeholder={t('challenges.challengeTitle', 'The problem in one line')} aria-label={t('challenges.challengeTitle', 'The problem in one line')} />
            <textarea className={styles.input} required rows={5} value={newChallenge.description} onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })} placeholder={t('challenges.challengeDescription', 'Context, who it affects, what a good solution looks like')} aria-label={t('challenges.challengeDescription', 'Context, who it affects, what a good solution looks like')} />
            <button type="submit" className={styles.primaryButton}>{t('challenges.publish', 'Publish')}</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Challenges;
