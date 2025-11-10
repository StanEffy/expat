import { useEffect, useMemo, useState } from 'react';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import Button from '../../components/Common/Button';
import SEO from '../../components/Common/SEO';
import { ADMIN_ENDPOINTS } from '../../constants/api';
import { getAdminHeaders } from '../../utils/auth';
import { useNotification } from '../../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import styles from './InviteCodes.module.scss';

const INVITE_STORAGE_KEY = 'admin_editor_invite';
const WARNING_THRESHOLD_HOURS = 12;

interface InviteCodeResponse {
  code: string;
  role: string;
  expires_at: string;
}

interface StoredInviteCode {
  code: string;
  expiresAt: string;
  storedAt: number;
}

const InviteCodes = () => {
  const { t, i18n } = useTranslation();
  const { showNotification } = useNotification();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [sessionMissing, setSessionMissing] = useState(false);

  useEffect(() => {
    try {
      const storedRaw = sessionStorage.getItem(INVITE_STORAGE_KEY);
      if (!storedRaw) {
        return;
      }
      const stored: StoredInviteCode = JSON.parse(storedRaw);
      if (stored?.code && stored?.expiresAt) {
        setInviteCode(stored.code);
        setExpiresAt(stored.expiresAt);
      }
    } catch (err) {
      console.warn('[InviteCodes] Failed to parse stored invite code', err);
      sessionStorage.removeItem(INVITE_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (inviteCode && expiresAt) {
      const payload: StoredInviteCode = {
        code: inviteCode,
        expiresAt,
        storedAt: Date.now(),
      };
      sessionStorage.setItem(INVITE_STORAGE_KEY, JSON.stringify(payload));
    }
  }, [inviteCode, expiresAt]);

  const parsedExpiry = useMemo(() => {
    if (!expiresAt) return null;
    const parsed = new Date(expiresAt);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [expiresAt]);

  const isExpired = useMemo(() => {
    if (!parsedExpiry) return false;
    return parsedExpiry.getTime() <= Date.now();
  }, [parsedExpiry]);

  const isExpiringSoon = useMemo(() => {
    if (!parsedExpiry || isExpired) return false;
    const diffMs = parsedExpiry.getTime() - Date.now();
    return diffMs <= WARNING_THRESHOLD_HOURS * 60 * 60 * 1000;
  }, [parsedExpiry, isExpired]);

  const formattedExpiry = useMemo(() => {
    if (!parsedExpiry) return null;
    try {
      return new Intl.DateTimeFormat(i18n.language, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(parsedExpiry);
    } catch {
      return parsedExpiry.toLocaleString();
    }
  }, [parsedExpiry, i18n.language]);

  const formattedTimeRemaining = useMemo(() => {
    if (!parsedExpiry) return null;
    const diffMs = parsedExpiry.getTime() - Date.now();
    if (diffMs <= 0) {
      return null;
    }
    const totalMinutes = Math.floor(diffMs / 60000);
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    const parts: string[] = [];

    if (days > 0) {
      parts.push(t('admin.inviteCodes.timeRemaining.days', { count: days }));
    }
    if (hours > 0) {
      parts.push(t('admin.inviteCodes.timeRemaining.hours', { count: hours }));
    }
    if (minutes > 0 && parts.length < 2) {
      parts.push(t('admin.inviteCodes.timeRemaining.minutes', { count: minutes }));
    }

    return parts.slice(0, 2).join(', ');
  }, [parsedExpiry, t]);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setSessionMissing(false);

    try {
      const headers = getAdminHeaders();
      if (!headers) {
        setSessionMissing(true);
        setError('');
        showNotification(t('admin.inviteCodes.missingSession'), 'warning');
        return;
      }

      const response = await fetch(ADMIN_ENDPOINTS.CREATE_EDITOR_INVITE_CODE, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        throw new Error(t('admin.inviteCodes.generateFailed'));
      }

      const data: InviteCodeResponse = await response.json();
      setInviteCode(data.code);
      setExpiresAt(data.expires_at);
      showNotification(t('admin.inviteCodes.generateSuccess'), 'success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('admin.inviteCodes.generateFailed');
      setError(message);
      showNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteCode) return;
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
      showNotification(t('admin.inviteCodes.copyUnsupported'), 'warning');
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteCode);
      showNotification(t('admin.inviteCodes.copySuccess'), 'success');
    } catch {
      showNotification(t('admin.inviteCodes.copyFailed'), 'error');
    }
  };

  const handleShare = async () => {
    if (!inviteCode) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('admin.inviteCodes.shareTitle'),
          text: t('admin.inviteCodes.shareMessage', { inviteCode }),
        });
        showNotification(t('admin.inviteCodes.shareSuccess'), 'success');
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        showNotification(t('admin.inviteCodes.shareFailed'), 'error');
      }
    } else {
      showNotification(t('admin.inviteCodes.shareUnsupported'), 'warning');
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      <SEO
        title={`${t('admin.inviteCodes.title')} - ${t('app.title')}`}
        description="Admin invite codes management"
        url={currentUrl}
        noindex={true}
      />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('admin.inviteCodes.title')}</h1>
          <Button
            label={t('admin.inviteCodes.generateButton')}
            icon="pi pi-plus-circle"
            onClick={handleGenerate}
            loading={loading}
            disabled={loading}
          />
        </div>

        <p className={styles.helperText}>{t('admin.inviteCodes.helperText')}</p>

        {error && (
          <Message
            severity="error"
            text={error}
            className={styles.message}
          />
        )}

        {sessionMissing && (
          <Message
            severity="warn"
            text={t('admin.inviteCodes.missingSession')}
            className={styles.message}
          />
        )}

        <Card className={styles.card}>
          {!inviteCode ? (
            <div className={styles.emptyState}>
              <i className="pi pi-key" aria-hidden />
              <p>{t('admin.inviteCodes.noCode')}</p>
              <Button
                label={t('admin.inviteCodes.generateButton')}
                icon="pi pi-plus-circle"
                onClick={handleGenerate}
                loading={loading}
                disabled={loading}
              />
            </div>
          ) : (
            <div className={styles.codeWrapper}>
              <div className={styles.codeRow}>
                <div className={styles.codeDisplay}>
                  <span className={styles.codeLabel}>{t('admin.inviteCodes.latestCode')}</span>
                  <span className={styles.codeValue}>{inviteCode}</span>
                </div>
                <div className={styles.actions}>
                  <Button
                    label={t('admin.inviteCodes.copyButton')}
                    icon="pi pi-copy"
                    onClick={handleCopy}
                    severity="secondary"
                    outlined
                  />
                  <Button
                    label={t('admin.inviteCodes.shareButton')}
                    icon="pi pi-share-alt"
                    onClick={handleShare}
                    severity="help"
                    outlined
                  />
                </div>
              </div>

              <div className={styles.expiryInfo}>
                {formattedExpiry && (
                  <p>
                    <strong>{t('admin.inviteCodes.expiresAtLabel')}:</strong>{' '}
                    {formattedExpiry}
                  </p>
                )}
                {formattedTimeRemaining && (
                  <p className={styles.remaining}>
                    {t('admin.inviteCodes.timeRemainingLabel', { time: formattedTimeRemaining })}
                  </p>
                )}
              </div>

              {isExpired && (
                <Message
                  severity="error"
                  text={t('admin.inviteCodes.expiredMessage')}
                  className={styles.message}
                />
              )}

              {!isExpired && isExpiringSoon && (
                <Message
                  severity="warn"
                  text={t('admin.inviteCodes.expiringSoonMessage')}
                  className={styles.message}
                />
              )}

              {!isExpired && !isExpiringSoon && (
                <Message
                  severity="info"
                  text={t('admin.inviteCodes.validMessage')}
                  className={styles.message}
                />
              )}
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

export default InviteCodes;

