import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { registerGrowthTranslations } from '@/i18n/registerGrowth';
import { venturesService } from '@/services/growthService';
import { useNotification } from '@/hooks/useNotification';
import type { RegistryCompany, Venture } from '@/types/growth';
import { errorText, formatDate } from '@/components/Growth/shared';
import styles from '@/components/Growth/Growth.module.scss';

registerGrowthTranslations();

export const Ventures: React.FC = () => {
  const { t, i18n } = useTranslation('growth');
  const { showNotification } = useNotification();
  const [ventures, setVentures] = useState<Venture[] | null>(null);
  const [businessId, setBusinessId] = useState('');
  const [preview, setPreview] = useState<RegistryCompany | null>(null);
  const [metOnPlatform, setMetOnPlatform] = useState(true);
  const [busy, setBusy] = useState(false);
  const [inviteFor, setInviteFor] = useState<number | null>(null);
  const [inviteName, setInviteName] = useState('');

  const load = useCallback(() => {
    venturesService.list().then(setVentures).catch(() => setVentures([]));
  }, []);

  useEffect(() => {
    registerGrowthTranslations();
    load();
  }, [load]);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setPreview(null);
    try {
      setPreview(await venturesService.lookup(businessId));
    } catch (err) {
      showNotification(errorText(err, t('ventures.lookupError', 'Could not find this company')), 'error');
    } finally {
      setBusy(false);
    }
  };

  const add = async () => {
    if (!preview) return;
    setBusy(true);
    try {
      await venturesService.create(preview.business_id, metOnPlatform);
      setPreview(null);
      setBusinessId('');
      showNotification(t('ventures.added', 'Added. Congratulations on your company!'), 'success');
      load();
    } catch (err) {
      showNotification(errorText(err, t('ventures.addError', 'Could not add the company')), 'error');
    } finally {
      setBusy(false);
    }
  };

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      showNotification(success, 'success');
      load();
    } catch (err) {
      showNotification(errorText(err, t('common.error', 'Something went wrong')), 'error');
    }
  };

  const invite = async (ventureId: number) => {
    if (!inviteName.trim()) return;
    await run(() => venturesService.invite(ventureId, inviteName.trim()), t('ventures.invited', 'Invitation sent'));
    setInviteFor(null);
    setInviteName('');
  };

  const companyFacts = (c: RegistryCompany) => (
    <div className={styles.chips}>
      <span className={c.is_active ? `${styles.chip} ${styles.chipGreen}` : `${styles.chip} ${styles.chipOrange}`}>
        {c.is_active ? t('ventures.active', 'Active') : t('ventures.inactive', 'Not active')}
      </span>
      {c.company_form && <span className={styles.chip}>{c.company_form}</span>}
      {c.city && <span className={`${styles.chip} ${styles.chipBlue}`}>{c.city}</span>}
      {c.registration_date && (
        <span className={styles.chip}>{t('ventures.registered', { date: formatDate(c.registration_date, i18n.language) })}</span>
      )}
    </div>
  );

  return (
    <div className={styles.container} data-reveal-children>
      <div className={styles.header}>
        <h1>{t('ventures.title', 'My ventures')}</h1>
        <p>{t('ventures.subtitle', 'Started something? Add your company by its business ID. We check it in the Finnish Trade Register, so your passport and the city statistics show real, verified ventures.')}</p>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}><i className="pi pi-plus-circle" /> {t('ventures.addTitle', 'Add a company')}</h2>
        <form className={styles.form} onSubmit={lookup}>
          <div className={styles.field}>
            <label htmlFor="business-id">{t('ventures.businessId', 'Business ID (Y-tunnus)')}</label>
            <input
              id="business-id"
              className={styles.input}
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              placeholder="1234567-8"
              autoComplete="off"
            />
          </div>
          <div className={styles.actions}>
            <button type="submit" className={styles.secondaryButton} disabled={busy || businessId.trim().length < 8}>
              <i className="pi pi-search" /> {t('ventures.check', 'Check in the register')}
            </button>
          </div>
        </form>

        {preview && (
          <div className={styles.section}>
            <div className={styles.listItem}>
              <div className={styles.grow}>
                <div className={styles.itemTitle}>{preview.name}</div>
                <div className={styles.muted}>{preview.business_id} · {preview.main_business_line}</div>
                {companyFacts(preview)}
              </div>
            </div>
            <label className={styles.checkbox} style={{ marginTop: '0.9rem' }}>
              <input type="checkbox" checked={metOnPlatform} onChange={(e) => setMetOnPlatform(e.target.checked)} />
              <span>{t('ventures.metOnPlatform', 'Our team met or came together on EXPAT')}</span>
            </label>
            <div className={styles.actions} style={{ marginTop: '0.9rem' }}>
              <button type="button" className={styles.primaryButton} onClick={add} disabled={busy}>
                <i className="pi pi-check" /> {t('ventures.confirmAdd', 'Yes, this is my company')}
              </button>
              <button type="button" className={styles.secondaryButton} onClick={() => setPreview(null)}>
                {t('common.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        )}
        <p className={styles.notice}>
          {t('ventures.source', 'Company data: Finnish Patent and Registration Office (PRH), open data, CC BY 4.0. We re-check it weekly.')}
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('ventures.listTitle', 'Your companies')}</h2>
        {ventures === null ? null : ventures.length === 0 ? (
          <div className={`${styles.card} ${styles.emptyState}`}>
            <i className="pi pi-briefcase" />
            {t('ventures.empty', 'No companies yet. When you register one — a café, a studio, a startup — add it here.')}
          </div>
        ) : (
          <ul className={styles.list} data-reveal-children>
            {ventures.map((v) => (
              <li key={v.id} className={`${styles.card} ${v.my_confirmed ? '' : styles.highlight}`}>
                <div className={styles.itemTitle}>{v.name}</div>
                <div className={styles.muted}>{v.business_id} · {v.main_business_line}</div>
                {companyFacts(v)}
                {v.met_on_platform && (
                  <div className={styles.chips}><span className={`${styles.chip} ${styles.chipGreen}`}><i className="pi pi-sparkles" /> {t('ventures.metChip', 'Team formed on EXPAT')}</span></div>
                )}
                <p className={styles.muted} style={{ marginTop: '0.7rem' }}>
                  {t('ventures.team', 'Team')}: {v.members.map((m) => (m.confirmed ? m.name : `${m.name} (${t('ventures.invitedShort', 'invited')})`)).join(', ')}
                </p>

                {!v.my_confirmed ? (
                  <div className={styles.actions}>
                    <span className={styles.muted}>{t('ventures.inviteQuestion', 'You were added as a co-founder. Is that right?')}</span>
                    <button type="button" className={styles.primaryButton} onClick={() => run(() => venturesService.accept(v.id), t('ventures.joined', 'You are on the team'))}>
                      {t('ventures.accept', 'Yes, confirm')}
                    </button>
                    <button type="button" className={styles.secondaryButton} onClick={() => run(() => venturesService.leave(v.id), t('ventures.declined', 'Declined'))}>
                      {t('ventures.decline', 'No')}
                    </button>
                  </div>
                ) : inviteFor === v.id ? (
                  <div className={styles.actions}>
                    <input
                      className={styles.input}
                      style={{ maxWidth: '16rem' }}
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder={t('ventures.usernamePlaceholder', 'Co-founder username')}
                    />
                    <button type="button" className={styles.primaryButton} onClick={() => invite(v.id)}>{t('ventures.sendInvite', 'Invite')}</button>
                    <button type="button" className={styles.secondaryButton} onClick={() => setInviteFor(null)}>{t('common.cancel', 'Cancel')}</button>
                  </div>
                ) : (
                  <div className={styles.actions}>
                    <button type="button" className={styles.secondaryButton} onClick={() => setInviteFor(v.id)}>
                      <i className="pi pi-user-plus" /> {t('ventures.addCofounder', 'Add co-founder')}
                    </button>
                    <button
                      type="button"
                      className={styles.dangerButton}
                      onClick={() => {
                        if (window.confirm(t('ventures.leaveConfirm', 'Remove yourself from this company?'))) {
                          void run(() => venturesService.leave(v.id), t('ventures.left', 'Removed'));
                        }
                      }}
                    >
                      {t('ventures.leave', 'Leave')}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Ventures;
