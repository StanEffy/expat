import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { RadioButton } from 'primereact/radiobutton';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { useTranslation } from 'react-i18next';
import { usePolls } from '../contexts/PollsContext';
import { useNotification } from '../contexts/NotificationContext';
import { useUserProfile } from '../hooks/useUserProfile';
import SEO from '../components/SEO';
import styles from './PollDetail.module.scss';

const genderOptions = [
  { label: 'Female', value: 'Female' },
  { label: 'Male', value: 'Male' },
  { label: 'Non-binary', value: 'Non-binary' },
  { label: 'Prefer not to say', value: 'Prefer not to say' },
];

const ageRangeOptions = [
  { label: '18-24', value: '18-24' },
  { label: '25-34', value: '25-34' },
  { label: '35-44', value: '35-44' },
  { label: '45-54', value: '45-54' },
  { label: '55+', value: '55+' },
  { label: 'Prefer not to say', value: 'Prefer not to say' },
];

const experienceOptions = [
  { label: '0-2', value: '0-2' },
  { label: '3-4', value: '3-4' },
  { label: '5-7', value: '5-7' },
  { label: '8-10', value: '8-10' },
  { label: '10+', value: '10+' },
  { label: 'Prefer not to say', value: 'Prefer not to say' },
];

const ensureNumber = (value: unknown): number | null => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
};

const PollDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    pollsById,
    loadingPollIds,
    fetchPollById,
    fetchPublicPollById,
    submitPollResponse,
    closePoll,
  } = usePolls();
  const { showNotification } = useNotification();
  const { profile, hasRole, managedCompanies } = useUserProfile();

  const pollId = ensureNumber(id);
  const poll = pollId ? pollsById[pollId] : undefined;
  const isLoading = pollId != null && loadingPollIds.has(pollId) && !poll;

  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [textResponse, setTextResponse] = useState('');
  const [metadata, setMetadata] = useState({
    gender: '',
    age_range: '',
    native_language: '',
    years_experience: '',
  });
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [alreadyResponded, setAlreadyResponded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (pollId == null) {
      setError(t('polls.errors.invalidPoll'));
      return;
    }

    let isMounted = true;
    const loadPoll = async () => {
      try {
        const data = await fetchPollById(pollId, { forceRefresh: true });
        if (!isMounted) return;
        if (!data) {
          setError(t('polls.errors.notFound'));
          return;
        }
        setError(null);
        setAlreadyResponded(Boolean(data.hasResponded));
        if (data.status === 'closed') {
          await fetchPublicPollById(pollId);
        }
      } catch (err) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : t('polls.errors.loadFailed');
        setError(message);
        showNotification(message, 'error');
      }
    };

    loadPoll();
    return () => {
      isMounted = false;
    };
  }, [pollId, fetchPollById, fetchPublicPollById, showNotification, t]);

  useEffect(() => {
    if (poll) {
      setAlreadyResponded(Boolean(poll.hasResponded));
    }
  }, [poll]);

  const userId = useMemo(() => {
    if (!profile) return null;
    if (typeof profile.id === 'number') return profile.id;
    if (typeof profile.user_id === 'number') return profile.user_id;
    return null;
  }, [profile]);

  const canClosePoll = useMemo(() => {
    if (!poll || poll.status === 'closed') return false;
    if (hasRole('admin') || hasRole('editor')) return true;
    if (userId && poll.created_by && poll.created_by === userId) return true;
    if (poll.company_id && managedCompanies.some((company) => company.id === poll.company_id)) {
      return true;
    }
    return false;
  }, [poll, hasRole, userId, managedCompanies]);

  const optionStats = useMemo(() => {
    if (!poll) return [];
    const optionCounts = poll.statistics?.option_counts ?? {};
    return poll.options.map((option) => {
      const responses = option.responsesCount ?? optionCounts[option.id] ?? 0;
      const percentage =
        poll.statistics?.optionPercentages?.[option.id] ??
        (poll.statistics?.total_responses && poll.statistics.total_responses > 0
          ? Math.round((responses / poll.statistics.total_responses) * 1000) / 10
          : 0);
      return {
        ...option,
        responses,
        percentage,
      };
    });
  }, [poll]);

  const demographics = poll?.statistics?.demographics;
  const textResponses = poll?.statistics?.text_responses ?? poll?.text_responses ?? [];

  const isClosed = poll?.status === 'closed';
  const disableResponses = isClosed || alreadyResponded;

  const handleMultiSelect = (optionId: number, checked: boolean | undefined) => {
    setSelectedOptions((prev) => {
      if (checked) {
        if (prev.includes(optionId)) return prev;
        return [...prev, optionId];
      }
      return prev.filter((idValue) => idValue !== optionId);
    });
  };

  const handleSubmit = async () => {
    if (!pollId || !poll) return;
    setSubmissionError(null);

    const trimmedText = poll.allow_text_response ? textResponse.trim() : '';
    const optionIds = poll.allow_multiple_choice
      ? selectedOptions
      : selectedOption != null
      ? [selectedOption]
      : [];

    if (!trimmedText && optionIds.length === 0) {
      const validationMessage = poll.allow_text_response
        ? t('polls.detail.validation.optionOrText')
        : t('polls.detail.validation.optionRequired');
      setSubmissionError(validationMessage);
      return;
    }

    setSubmitting(true);
    try {
      await submitPollResponse(pollId, {
        option_ids: optionIds.length ? optionIds : undefined,
        text_response: poll.allow_text_response ? trimmedText || '' : undefined,
        gender: metadata.gender || '',
        age_range: metadata.age_range || '',
        native_language: metadata.native_language || '',
        years_experience: metadata.years_experience || '',
      });
      showNotification(t('polls.detail.success'), 'success');
      setAlreadyResponded(true);
      setSubmissionError(null);
      setSelectedOption(null);
      setSelectedOptions([]);
      setTextResponse('');
      setMetadata({
        gender: '',
        age_range: '',
        native_language: '',
        years_experience: '',
      });
      await fetchPollById(pollId, { forceRefresh: true });
      await fetchPublicPollById(pollId);
    } catch (err) {
      const payloadMessage = (err as any)?.payload?.message;
      if (payloadMessage && payloadMessage.toLowerCase().includes('already responded')) {
        setAlreadyResponded(true);
        setSubmissionError(t('polls.detail.alreadyResponded'));
        showNotification(t('polls.detail.alreadyResponded'), 'info');
      } else if (payloadMessage && payloadMessage.toLowerCase().includes('poll is closed')) {
        setSubmissionError(t('polls.detail.pollClosed'));
        showNotification(t('polls.detail.pollClosed'), 'warning');
      } else {
        const message = err instanceof Error ? err.message : t('polls.detail.error');
        setSubmissionError(message);
        showNotification(message, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClosePoll = async () => {
    if (!pollId) return;
    setClosing(true);
    try {
      await closePoll(pollId);
      showNotification(t('polls.detail.closed'), 'success');
      await fetchPollById(pollId, { forceRefresh: true });
      await fetchPublicPollById(pollId);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('polls.detail.closeError');
      showNotification(message, 'error');
    } finally {
      setClosing(false);
    }
  };

  const expirationLabel = formatDateTime(poll?.expires_at);
  const closedAtLabel = formatDateTime(poll?.closed_at);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (pollId == null) {
    return (
      <div className={styles.container}>
        <Message severity="error" text={t('polls.errors.invalidPoll')} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <>
        <SEO
          title={`${t('polls.detail.titleFallback')} - ${t('app.title')}`}
          description={t('polls.pageDescription')}
          url={currentUrl}
        />
        <div className={styles.loading}>
          <ProgressSpinner />
          <p>{t('common.loading')}</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEO
          title={`${t('polls.detail.titleFallback')} - ${t('app.title')}`}
          description={t('polls.pageDescription')}
          url={currentUrl}
        />
        <div className={styles.container}>
          <Message severity="error" text={error} className={styles.errorMessage} />
          <Button
            label={t('common.back')}
            icon="pi pi-arrow-left"
            className={styles.backButton}
            onClick={() => navigate('/polls')}
            text
          />
        </div>
      </>
    );
  }

  if (!poll) {
    return (
      <>
        <SEO
          title={`${t('polls.detail.titleFallback')} - ${t('app.title')}`}
          description={t('polls.pageDescription')}
          url={currentUrl}
        />
        <div className={styles.container}>
          <Message severity="warn" text={t('polls.errors.notFound')} className={styles.errorMessage} />
          <Button
            label={t('common.back')}
            icon="pi pi-arrow-left"
            className={styles.backButton}
            onClick={() => navigate('/polls')}
            text
          />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${poll.title} - ${t('app.title')}`}
        description={poll.description ?? t('polls.pageDescription')}
        url={currentUrl}
      />
      <div className={styles.container}>
        <div className={styles.header}>
          <Button
            icon="pi pi-arrow-left"
            label={t('common.back')}
            text
            onClick={() => navigate('/polls')}
            className={styles.backButton}
          />
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>{poll.title}</h1>
            <Tag
              value={t(`polls.status.${poll.status}`)}
              severity={poll.status === 'closed' ? 'danger' : 'success'}
            />
          </div>
          <div className={styles.meta}>
            {poll.company_name && (
              <span>{t('polls.labels.company', { company: poll.company_name })}</span>
            )}
            {expirationLabel && (
              <span>{t('polls.labels.expires', { date: expirationLabel })}</span>
            )}
            {closedAtLabel && (
              <span>{t('polls.labels.closedAt', { date: closedAtLabel })}</span>
            )}
          </div>
        </div>

        {poll.description && (
          <Card className={styles.descriptionCard}>
            <p>{poll.description}</p>
          </Card>
        )}

        {alreadyResponded && (
          <Message
            severity="info"
            text={t('polls.detail.alreadyResponded')}
            className={styles.banner}
          />
        )}

        {isClosed && (
          <Message
            severity="warn"
            text={t('polls.detail.pollClosed')}
            className={styles.banner}
          />
        )}

        <div className={styles.content}>
          <Card className={styles.responseCard} title={t('polls.detail.responseTitle')}>
            <div className={styles.options}>
              {poll.options.map((option) => (
                <label key={option.id} className={styles.optionRow}>
                  {poll.allow_multiple_choice ? (
                    <Checkbox
                      inputId={`option-${option.id}`}
                      checked={selectedOptions.includes(option.id)}
                      onChange={(e) => handleMultiSelect(option.id, e.checked)}
                      disabled={disableResponses}
                    />
                  ) : (
                    <RadioButton
                      inputId={`option-${option.id}`}
                      value={option.id}
                      checked={selectedOption === option.id}
                      onChange={(e) => setSelectedOption(e.value)}
                      disabled={disableResponses}
                    />
                  )}
                  <span className={styles.optionLabel}>{option.text}</span>
                </label>
              ))}
            </div>

            {poll.allow_text_response && (
              <div className={styles.formRow}>
                <label htmlFor="poll-text-response">
                  {t('polls.detail.textResponse')} <span className={styles.optional}>({t('common.optional')})</span>
                </label>
                <InputTextarea
                  id="poll-text-response"
                  value={textResponse}
                  onChange={(e) => setTextResponse(e.target.value)}
                  rows={4}
                  disabled={disableResponses}
                />
              </div>
            )}

            <div className={styles.metadataGrid}>
              <div className={styles.formRow}>
                <label htmlFor="poll-gender">{t('polls.detail.gender')}</label>
                <Dropdown
                  id="poll-gender"
                  value={metadata.gender}
                  options={genderOptions}
                  onChange={(e) => setMetadata((prev) => ({ ...prev, gender: e.value ?? '' }))}
                  placeholder={t('polls.detail.selectPlaceholder')}
                  disabled={disableResponses}
                  appendTo="self"
                />
              </div>
              <div className={styles.formRow}>
                <label htmlFor="poll-age">{t('polls.detail.ageRange')}</label>
                <Dropdown
                  id="poll-age"
                  value={metadata.age_range}
                  options={ageRangeOptions}
                  onChange={(e) => setMetadata((prev) => ({ ...prev, age_range: e.value ?? '' }))}
                  placeholder={t('polls.detail.selectPlaceholder')}
                  disabled={disableResponses}
                  appendTo="self"
                />
              </div>
              <div className={styles.formRow}>
                <label htmlFor="poll-native-language">{t('polls.detail.nativeLanguage')}</label>
                <InputText
                  id="poll-native-language"
                  value={metadata.native_language}
                  onChange={(e) => setMetadata((prev) => ({ ...prev, native_language: e.target.value }))}
                  placeholder={t('polls.detail.nativeLanguagePlaceholder')}
                  disabled={disableResponses}
                />
              </div>
              <div className={styles.formRow}>
                <label htmlFor="poll-experience">{t('polls.detail.yearsExperience')}</label>
                <Dropdown
                  id="poll-experience"
                  value={metadata.years_experience}
                  options={experienceOptions}
                  onChange={(e) => setMetadata((prev) => ({ ...prev, years_experience: e.value ?? '' }))}
                  placeholder={t('polls.detail.selectPlaceholder')}
                  disabled={disableResponses}
                  appendTo="self"
                />
              </div>
            </div>

            {submissionError && (
              <Message severity="error" text={submissionError} className={styles.errorMessage} />
            )}

            <div className={styles.actions}>
              {canClosePoll && (
                <Button
                  label={t('polls.detail.closePoll')}
                  icon="pi pi-lock"
                  severity="warning"
                  onClick={handleClosePoll}
                  disabled={closing}
                  loading={closing}
                  outlined
                />
              )}
              <Button
                label={disableResponses ? t('polls.detail.disabledButton') : t('polls.detail.submit')}
                icon="pi pi-check"
                onClick={handleSubmit}
                disabled={disableResponses || submitting}
                loading={submitting}
              />
            </div>
          </Card>

          {(poll.statistics?.total_responses ?? 0) > 0 && (
            <Card className={styles.statsCard} title={t('polls.detail.resultsTitle')}>
              <div className={styles.statSummary}>
                <strong>{t('polls.detail.totalResponses')}:</strong>{' '}
                {poll.statistics?.total_responses}
              </div>
              <div className={styles.optionStats}>
                {optionStats.map((option) => (
                  <div key={option.id} className={styles.optionStat}>
                    <div className={styles.optionStatHeader}>
                      <span>{option.text}</span>
                      <span className={styles.optionStatValue}>
                        {option.responses} ({option.percentage ?? 0}%)
                      </span>
                    </div>
                    <ProgressBar value={option.percentage ?? 0} showValue={false} />
                  </div>
                ))}
              </div>

              {textResponses.length > 0 && (
                <div className={styles.textResponses}>
                  <h3>{t('polls.detail.textResponsesTitle')}</h3>
                  <ul>
                    {textResponses.map((response, index) => (
                      <li key={`${response}-${index}`}>{response}</li>
                    ))}
                  </ul>
                </div>
              )}

              {demographics && (
                <div className={styles.demographics}>
                  <h3>{t('polls.detail.demographicsTitle')}</h3>
                  {Object.entries(demographics).map(([key, breakdown]) => {
                    if (!breakdown) return null;
                    return (
                      <div key={key} className={styles.demographicSection}>
                        <h4 className={styles.demographicTitle}>{t(`polls.detail.demographic.${key}`, { defaultValue: key })}</h4>
                        <ul>
                          {Object.entries(breakdown).map(([label, value]) => (
                            <li key={`${key}-${label}`}>
                              <span>{label}</span>
                              <span>{value}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default PollDetailPage;


