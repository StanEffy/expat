import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { TabView, TabPanel } from 'primereact/tabview';
import { useTranslation } from 'react-i18next';
import { usePolls, PollSummary } from '../contexts/PollsContext';
import { useNotification } from '../contexts/NotificationContext';
import { useUserProfile } from '../hooks/useUserProfile';
import SEO from '../components/Common/SEO';
import styles from './Polls.module.scss';

interface OptionField {
  id: string;
  value: string;
}

interface ContextOption {
  label: string;
  value: 'global' | number;
}

const createOptionField = (): OptionField => ({
  id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `opt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  value: '',
});

const ensureISO8601 = (value: string): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const formatDateTime = (value?: string | null): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
};

const PRIVILEGED_ROLES = ['admin', 'editor', 'company_rep', 'company_manager', 'company_admin'];

const PollsPage = () => {
  const { t } = useTranslation();
  const {
    pollsById,
    activePollIds,
    myPollIds,
    companyPollIds,
    loadingLists,
    fetchActivePolls,
    fetchMyPolls,
    fetchCompanyPolls,
    createPoll,
  } = usePolls();
  const { showNotification } = useNotification();
  const { profile, loading: profileLoading, hasRole, managedCompanies } = useUserProfile();

  const [activeTab, setActiveTab] = useState(0);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [creatingPoll, setCreatingPoll] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [myPollsError, setMyPollsError] = useState<string | null>(null);
  const [companyPollsError, setCompanyPollsError] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    allowMultipleChoice: false,
    allowTextResponse: false,
    expiresAt: '',
    scope: 'global' as 'global' | number,
  });

  const [optionFields, setOptionFields] = useState<OptionField[]>([createOptionField(), createOptionField()]);
  const [debouncedOptionFields, setDebouncedOptionFields] = useState<OptionField[]>([...optionFields]);
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const canManagePolls = useMemo(
    () => PRIVILEGED_ROLES.some((role) => hasRole(role)) || managedCompanies.length > 0,
    [hasRole, managedCompanies.length],
  );
  const canCreateGlobalPoll = useMemo(() => hasRole('admin') || hasRole('editor'), [hasRole]);
  const canCreateCompanyPoll = useMemo(
    () => managedCompanies.length > 0 || hasRole('company_rep') || hasRole('company_manager') || hasRole('company_admin') || canCreateGlobalPoll,
    [managedCompanies.length, hasRole, canCreateGlobalPoll],
  );

  const contextOptions = useMemo<ContextOption[]>(() => {
    const options: ContextOption[] = [];
    if (canCreateGlobalPoll) {
      options.push({
        label: t('polls.create.globalOption'),
        value: 'global',
      });
    }
    managedCompanies.forEach((company) => {
      options.push({
        label: company.name ? company.name : t('polls.create.companyPlaceholder', { id: company.id }),
        value: company.id,
      });
    });
    return options;
  }, [canCreateGlobalPoll, managedCompanies, t]);

  const activePolls = useMemo<PollSummary[]>(
    () => activePollIds.map((id) => pollsById[id]).filter(Boolean),
    [activePollIds, pollsById],
  );

  const myPolls = useMemo<PollSummary[]>(
    () => myPollIds.map((id) => pollsById[id]).filter(Boolean),
    [myPollIds, pollsById],
  );

  const companyPolls = useMemo<PollSummary[]>(() => {
    if (selectedCompanyId == null) return [];
    const ids = companyPollIds[selectedCompanyId] ?? [];
    return ids.map((id) => pollsById[id]).filter(Boolean);
  }, [companyPollIds, pollsById, selectedCompanyId]);

  useEffect(() => {
    let isMounted = true;
    const loadActive = async () => {
      try {
        await fetchActivePolls();
        if (isMounted) {
          setDashboardError(null);
        }
      } catch (err) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : t('polls.errors.loadFailed');
        setDashboardError(message);
        showNotification(message, 'error');
      }
    };
    loadActive();
    return () => {
      isMounted = false;
    };
  }, [fetchActivePolls, showNotification, t]);

  useEffect(() => {
    if (profileLoading) return;
    if (!profile || !canManagePolls) return;

    let isMounted = true;
    const loadMyPolls = async () => {
      try {
        await fetchMyPolls();
        if (isMounted) {
          setMyPollsError(null);
        }
      } catch (err) {
        if (!isMounted) return;
        const status = (err as any)?.status;
        if (status === 403) {
          setMyPollsError(t('polls.errors.notAuthorized'));
          return;
        }
        const message = err instanceof Error ? err.message : t('polls.errors.loadFailed');
        setMyPollsError(message);
        showNotification(message, 'error');
      }
    };

    loadMyPolls();
    return () => {
      isMounted = false;
    };
  }, [profileLoading, profile, canManagePolls, fetchMyPolls, showNotification, t]);

  useEffect(() => {
    if (managedCompanies.length === 0) {
      setSelectedCompanyId(null);
      if (!canCreateGlobalPoll) {
        setCreateForm((prev) => ({ ...prev, scope: 'global' }));
      }
      return;
    }

    const defaultCompanyId = managedCompanies[0]?.id ?? null;
    setSelectedCompanyId((current) => (current == null ? defaultCompanyId : current));
    setCreateForm((prev) => {
      if (prev.scope === 'global' && !canCreateGlobalPoll) {
        return { ...prev, scope: defaultCompanyId ?? prev.scope };
      }
      return prev;
    });
  }, [managedCompanies, canCreateGlobalPoll]);

  useEffect(() => {
    if (selectedCompanyId == null) return;
    let isMounted = true;
    const loadCompanyPolls = async () => {
      try {
        await fetchCompanyPolls(selectedCompanyId);
        if (isMounted) {
          setCompanyPollsError(null);
        }
      } catch (err) {
        if (!isMounted) return;
        const status = (err as any)?.status;
        if (status === 403) {
          setCompanyPollsError(t('polls.errors.notAuthorized'));
          return;
        }
        const message = err instanceof Error ? err.message : t('polls.errors.loadFailed');
        setCompanyPollsError(message);
        showNotification(message, 'error');
      }
    };

    loadCompanyPolls();
    return () => {
      isMounted = false;
    };
  }, [selectedCompanyId, fetchCompanyPolls, showNotification, t]);

  const handleOptionChange = (id: string, value: string) => {
    setOptionFields((prev) =>
      prev.map((option) => (option.id === id ? { ...option, value } : option)),
    );

    if (debounceTimers.current[id]) {
      clearTimeout(debounceTimers.current[id]);
    }
    debounceTimers.current[id] = setTimeout(() => {
      setDebouncedOptionFields((prev) =>
        prev.map((option) => (option.id === id ? { ...option, value } : option)),
      );
      delete debounceTimers.current[id];
    }, 250);
  };

  const addOptionField = () => {
    const newField = createOptionField();
    setOptionFields((prev) => [...prev, newField]);
    setDebouncedOptionFields((prev) => [...prev, newField]);
  };

  const removeOptionField = (id: string) => {
    setOptionFields((prev) => prev.filter((option) => option.id !== id));
    setDebouncedOptionFields((prev) => prev.filter((option) => option.id !== id));
    if (debounceTimers.current[id]) {
      clearTimeout(debounceTimers.current[id]);
      delete debounceTimers.current[id];
    }
  };

  const flushOptionDebounce = () => {
    Object.values(debounceTimers.current).forEach((timer) => clearTimeout(timer));
    debounceTimers.current = {};
    setDebouncedOptionFields(optionFields);
  };

  const resetCreateForm = () => {
    const freshOptions = [createOptionField(), createOptionField()];
    setCreateForm({
      title: '',
      description: '',
      allowMultipleChoice: false,
      allowTextResponse: false,
      expiresAt: '',
      scope: canCreateGlobalPoll ? 'global' : managedCompanies[0]?.id ?? 'global',
    });
    setOptionFields(freshOptions);
    setDebouncedOptionFields(freshOptions);
    Object.values(debounceTimers.current).forEach((timer) => clearTimeout(timer));
    debounceTimers.current = {};
  };

  const sanitizedOptions = useMemo(() => {
    return debouncedOptionFields
      .map((option) => option.value.trim())
      .filter((value) => value.length > 0);
  }, [debouncedOptionFields]);

  const formIsValid = useMemo(() => {
    const hasTitle = createForm.title.trim().length > 0;
    const hasOptions = sanitizedOptions.length > 0 || createForm.allowTextResponse;
    return hasTitle && hasOptions;
  }, [createForm.title, createForm.allowTextResponse, sanitizedOptions.length]);

  const handleCreatePoll = async (event: FormEvent) => {
    event.preventDefault();
    flushOptionDebounce();

    const optionValues = optionFields
      .map((option) => option.value.trim())
      .filter((value) => value.length > 0);

    if (!createForm.allowTextResponse && optionValues.length === 0) {
      showNotification(t('polls.create.optionRequired'), 'error');
      return;
    }

    if (!createForm.title.trim()) {
      showNotification(t('polls.create.titleRequired'), 'error');
      return;
    }

    if (!canCreateCompanyPoll && !canCreateGlobalPoll) {
      showNotification(t('polls.errors.notAuthorized'), 'error');
      return;
    }

    const expiresAtIso = ensureISO8601(createForm.expiresAt ?? '');

    const payload = {
      title: createForm.title.trim(),
      description: createForm.description.trim() || undefined,
      allow_multiple_choice: createForm.allowMultipleChoice,
      allow_text_response: createForm.allowTextResponse,
      options: optionValues,
      expires_at: expiresAtIso ?? undefined,
    };

    const companyId = typeof createForm.scope === 'number' ? createForm.scope : null;
    if (!canCreateGlobalPoll && companyId == null) {
      showNotification(t('polls.create.companySelectionRequired'), 'error');
      return;
    }

    setCreatingPoll(true);
    try {
      await createPoll(payload, { companyId });
      showNotification(t('polls.create.success'), 'success');
      setCreateDialogVisible(false);
      resetCreateForm();
      await fetchActivePolls();
      if (canManagePolls) {
        await fetchMyPolls();
      }
      if (companyId != null) {
        await fetchCompanyPolls(companyId);
      }
    } catch (err) {
      const message =
        (err as any)?.payload?.message ??
        (err instanceof Error ? err.message : t('polls.create.error'));
      showNotification(message, 'error');
    } finally {
      setCreatingPoll(false);
    }
  };

  const handleRefreshActive = async () => {
    try {
      await fetchActivePolls();
    } catch (err) {
      const message = err instanceof Error ? err.message : t('polls.errors.loadFailed');
      setDashboardError(message);
      showNotification(message, 'error');
    }
  };

  const handleRefreshMine = async () => {
    try {
      await fetchMyPolls();
      setMyPollsError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('polls.errors.loadFailed');
      setMyPollsError(message);
      showNotification(message, 'error');
    }
  };

  const handleRefreshCompany = async () => {
    if (selectedCompanyId == null) return;
    try {
      await fetchCompanyPolls(selectedCompanyId);
      setCompanyPollsError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('polls.errors.loadFailed');
      setCompanyPollsError(message);
      showNotification(message, 'error');
    }
  };

  const renderPollCard = (poll: PollSummary) => {
    const expiresLabel = formatDateTime(poll.expires_at);
    const severity = poll.status === 'closed' ? 'danger' : 'success';
    return (
      <Card key={poll.id} className={styles.pollCard}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>{poll.title}</h3>
            {poll.description && <p className={styles.cardDescription}>{poll.description}</p>}
          </div>
          <Tag value={t(`polls.status.${poll.status}`)} severity={severity as any} />
        </div>
        <div className={styles.cardMeta}>
          {poll.company_name && (
            <span>{t('polls.labels.company', { company: poll.company_name })}</span>
          )}
          {expiresLabel && (
            <span>{t('polls.labels.expires', { date: expiresLabel })}</span>
          )}
          {poll.status === 'closed' && poll.closed_at && (
            <span>{t('polls.labels.closedAt', { date: formatDateTime(poll.closed_at) })}</span>
          )}
        </div>
        <div className={styles.cardFooter}>
          <Link to={`/polls/${poll.id}`} className={styles.linkButton}>
            {t('polls.actions.viewDetails')}
          </Link>
        </div>
      </Card>
    );
  };

  const renderEmptyState = (message: string) => (
    <div className={styles.emptyState}>
      <p>{message}</p>
    </div>
  );

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      <SEO
        title={`${t('polls.pageTitle')} - ${t('app.title')}`}
        description={t('polls.pageDescription')}
        url={currentUrl}
      />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('polls.pageTitle')}</h1>
          <div className={styles.headerActions}>
            <Button
              icon="pi pi-refresh"
              label={t('common.refresh')}
              onClick={handleRefreshActive}
              outlined
            />
            {canCreateCompanyPoll && (
              <Button
                icon="pi pi-plus"
                label={t('polls.actions.create')}
                onClick={() => setCreateDialogVisible(true)}
                disabled={!canCreateGlobalPoll && managedCompanies.length === 0}
              />
            )}
          </div>
        </div>

        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
          <TabPanel header={t('polls.tabs.active')}>
            {dashboardError && (
              <Message severity="error" text={dashboardError} className={styles.errorMessage} />
            )}
            {loadingLists && !activePolls.length ? (
              <div className={styles.spinner}>
                <ProgressSpinner />
              </div>
            ) : activePolls.length ? (
              <div className={styles.pollList}>
                {activePolls.map(renderPollCard)}
              </div>
            ) : (
              renderEmptyState(t('polls.empty.active'))
            )}
          </TabPanel>

          {canManagePolls && (
            <TabPanel header={t('polls.tabs.mine')}>
              <div className={styles.tabHeader}>
                <Button
                  icon="pi pi-refresh"
                  label={t('common.refresh')}
                  onClick={handleRefreshMine}
                  outlined
                  size="small"
                />
              </div>
              {myPollsError && (
                <Message severity="warn" text={myPollsError} className={styles.errorMessage} />
              )}
              {loadingLists && !myPolls.length ? (
                <div className={styles.spinner}>
                  <ProgressSpinner />
                </div>
              ) : myPolls.length ? (
                <div className={styles.pollList}>
                  {myPolls.map(renderPollCard)}
                </div>
              ) : (
                renderEmptyState(t('polls.empty.mine'))
              )}
            </TabPanel>
          )}

          {managedCompanies.length > 0 && (
            <TabPanel header={t('polls.tabs.company')}>
              <div className={styles.tabHeader}>
                <div className={styles.companySelector}>
                  <label htmlFor="company-selector">{t('polls.labels.selectCompany')}</label>
                  <Dropdown
                    id="company-selector"
                    value={selectedCompanyId}
                    options={managedCompanies.map((company) => ({
                      label: company.name ? company.name : t('polls.create.companyPlaceholder', { id: company.id }),
                      value: company.id,
                    }))}
                    onChange={(e) => setSelectedCompanyId(e.value)}
                    placeholder={t('polls.labels.selectCompanyPlaceholder')}
                    className={styles.dropdown}
                    appendTo="self"
                  />
                </div>
                <Button
                  icon="pi pi-refresh"
                  label={t('common.refresh')}
                  onClick={handleRefreshCompany}
                  outlined
                  size="small"
                  disabled={selectedCompanyId == null}
                />
              </div>
              {companyPollsError && (
                <Message severity="warn" text={companyPollsError} className={styles.errorMessage} />
              )}
              {loadingLists && !companyPolls.length ? (
                <div className={styles.spinner}>
                  <ProgressSpinner />
                </div>
              ) : companyPolls.length ? (
                <div className={styles.pollList}>
                  {companyPolls.map(renderPollCard)}
                </div>
              ) : (
                renderEmptyState(t('polls.empty.company'))
              )}
            </TabPanel>
          )}
        </TabView>

        <Dialog
          header={t('polls.create.title')}
          visible={createDialogVisible}
          onHide={() => {
            setCreateDialogVisible(false);
            resetCreateForm();
          }}
          style={{ width: '95vw', maxWidth: '600px' }}
          modal
        >
          <form className={styles.createForm} onSubmit={handleCreatePoll}>
            <div className={styles.formRow}>
              <label htmlFor="poll-title">{t('polls.create.form.title')}</label>
              <InputText
                id="poll-title"
                value={createForm.title}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
                required
                placeholder={t('polls.create.form.titlePlaceholder')}
              />
            </div>

            <div className={styles.formRow}>
              <label htmlFor="poll-description">{t('polls.create.form.description')}</label>
              <InputTextarea
                id="poll-description"
                value={createForm.description}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder={t('polls.create.form.descriptionPlaceholder')}
              />
            </div>

            {contextOptions.length > 0 && (
              <div className={styles.formRow}>
                <label htmlFor="poll-scope">{t('polls.create.form.scope')}</label>
                <Dropdown
                  id="poll-scope"
                  value={createForm.scope}
                  options={contextOptions}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, scope: e.value }))}
                  disabled={!canCreateCompanyPoll}
                  placeholder={t('polls.create.form.scopePlaceholder')}
                  appendTo="self"
                />
              </div>
            )}

            <div className={styles.toggleGroup}>
              <div className={styles.toggleItem}>
                <Checkbox
                  inputId="poll-allow-multiple"
                  checked={createForm.allowMultipleChoice}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, allowMultipleChoice: e.checked ?? false }))}
                />
                <label htmlFor="poll-allow-multiple">{t('polls.create.form.allowMultiple')}</label>
              </div>
              <div className={styles.toggleItem}>
                <Checkbox
                  inputId="poll-allow-text"
                  checked={createForm.allowTextResponse}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, allowTextResponse: e.checked ?? false }))}
                />
                <label htmlFor="poll-allow-text">{t('polls.create.form.allowText')}</label>
              </div>
            </div>

            <div className={styles.formRow}>
              <label>{t('polls.create.form.options')}</label>
              <div className={styles.optionList}>
                {optionFields.map((option, index) => (
                  <div key={option.id} className={styles.optionRow}>
                    <InputText
                      value={option.value}
                      onChange={(e) => handleOptionChange(option.id, e.target.value)}
                      placeholder={t('polls.create.form.optionPlaceholder', { index: index + 1 })}
                      className={styles.optionInput}
                    />
                    <Button
                      icon="pi pi-times"
                      type="button"
                      severity="danger"
                      text
                      rounded
                      onClick={() => removeOptionField(option.id)}
                      disabled={optionFields.length <= 1 && !createForm.allowTextResponse}
                    />
                  </div>
                ))}
                <Button
                  icon="pi pi-plus"
                  type="button"
                  label={t('polls.create.form.addOption')}
                  onClick={addOptionField}
                  text
                  className={styles.addOptionButton}
                />
              </div>
              {!createForm.allowTextResponse && sanitizedOptions.length === 0 && (
                <small className={styles.validationMessage}>
                  {t('polls.create.optionRequired')}
                </small>
              )}
            </div>

            <div className={styles.formRow}>
              <label htmlFor="poll-expiration">
                {t('polls.create.form.expiresAt')} <span className={styles.optional}>({t('common.optional')})</span>
              </label>
              <InputText
                id="poll-expiration"
                type="datetime-local"
                value={createForm.expiresAt}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
              />
            </div>

            <div className={styles.dialogFooter}>
              <Button
                label={t('common.cancel')}
                type="button"
                severity="secondary"
                outlined
                onClick={() => {
                  setCreateDialogVisible(false);
                  resetCreateForm();
                }}
              />
              <Button
                label={t('polls.create.submit')}
                type="submit"
                disabled={!formIsValid || creatingPoll}
                loading={creatingPoll}
              />
            </div>
          </form>
        </Dialog>
      </div>
    </>
  );
};

export default PollsPage;


