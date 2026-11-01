import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from 'primereact/dialog';
import { registerGrowthTranslations } from '@/i18n/registerGrowth';
import { timebankService } from '@/services/growthService';
import { useNotification } from '@/hooks/useNotification';
import { getUserId } from '@/utils/auth';
import type { TimebankAccount, TimebankCategory, TimebankListing } from '@/types/growth';
import { CITY_IDS, CITY_NAMES, errorText, formatDate } from '@/components/Growth/shared';
import styles from '@/components/Growth/Growth.module.scss';

registerGrowthTranslations();

const CATEGORIES: TimebankCategory[] = ['language', 'paperwork', 'career', 'tech', 'home', 'childcare', 'cooking', 'transport', 'culture', 'other'];

export const Timebank: React.FC = () => {
  const { t, i18n } = useTranslation('growth');
  const { showNotification } = useNotification();
  const me = getUserId();
  const [account, setAccount] = useState<TimebankAccount | null>(null);
  const [listings, setListings] = useState<TimebankListing[]>([]);
  const [kind, setKind] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [form, setForm] = useState({ kind: 'offer' as 'offer' | 'request', title: '', description: '', category: 'paperwork' as TimebankCategory, municipality_id: '' });
  const [exchangeFor, setExchangeFor] = useState<TimebankListing | null>(null);
  const [hours, setHours] = useState(1);
  const [note, setNote] = useState('');

  const load = useCallback(() => {
    timebankService.account().then(setAccount).catch(() => undefined);
    timebankService.listings(kind, category, city).then(setListings).catch(() => undefined);
  }, [kind, category, city]);

  useEffect(() => {
    registerGrowthTranslations();
    load();
  }, [load]);

  const act = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      showNotification(success, 'success');
      load();
      return true;
    } catch (err) {
      showNotification(errorText(err, t('common.error', 'Something went wrong')), 'error');
      return false;
    }
  };

  const createListing = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await act(
      () => timebankService.createListing({ ...form, municipality_id: form.municipality_id || undefined }),
      t('timebank.listingCreated', 'Published'),
    );
    if (ok) setForm((f) => ({ ...f, title: '', description: '' }));
  };

  const recordExchange = async () => {
    if (!exchangeFor) return;
    // On someone's offer I received help; on someone's request I gave help
    const ok = await act(
      () => timebankService.propose({
        counterpart_id: exchangeFor.user_id,
        i_am_provider: exchangeFor.kind === 'request',
        hours,
        note,
        listing_id: exchangeFor.id,
      }),
      t('timebank.proposed', 'Recorded. It counts once they confirm.'),
    );
    if (ok) {
      setExchangeFor(null);
      setNote('');
      setHours(1);
    }
  };

  const pendingForMe = account?.exchanges.filter((x) => x.status === 'pending' && x.proposed_by !== me) ?? [];

  return (
    <div className={styles.container} data-reveal-children>
      <div className={styles.header}>
        <h1>{t('timebank.title', 'Time bank')}</h1>
        <p>{t('timebank.subtitle', 'An hour for an hour. Help someone with Kela forms, get help with your CV. Everyone starts with 3 hours so newcomers can ask first.')}</p>
      </div>

      {account && (
        <div className={styles.stats}>
          <div className={styles.stat}><div className={styles.statValue}>{account.balance}</div><div className={styles.statLabel}>{t('timebank.balance', 'Hours on your balance')}</div></div>
          <div className={styles.stat}><div className={styles.statValue}>{account.hours_given}</div><div className={styles.statLabel}>{t('timebank.given', 'Hours you gave')}</div></div>
          <div className={styles.stat}><div className={styles.statValue}>{account.hours_received}</div><div className={styles.statLabel}>{t('timebank.received', 'Hours you received')}</div></div>
          <div className={styles.stat}><div className={styles.statValue}>{account.listings.filter((l) => l.active).length}</div><div className={styles.statLabel}>{t('timebank.myActive', 'Your active posts')}</div></div>
        </div>
      )}

      {pendingForMe.length > 0 && (
        <div className={`${styles.card} ${styles.highlight} ${styles.section}`}>
          <h2 className={styles.cardTitle}><i className="pi pi-inbox" /> {t('timebank.toConfirm', 'Please confirm')}</h2>
          <ul className={styles.list} data-reveal-children>
            {pendingForMe.map((x) => (
              <li key={x.id} className={styles.listItem}>
                <div className={styles.grow}>
                  <div className={styles.itemTitle}>{t('timebank.exchangeLine', { provider: x.provider_name, receiver: x.receiver_name, hours: x.hours })}</div>
                  {x.note && <div className={styles.muted}>“{x.note}”</div>}
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.primaryButton} onClick={() => act(() => timebankService.confirm(x.id), t('timebank.confirmed', 'Confirmed. Thank you for helping each other!'))}>{t('timebank.confirm', 'Confirm')}</button>
                  <button type="button" className={styles.secondaryButton} onClick={() => act(() => timebankService.decline(x.id), t('timebank.declined', 'Declined'))}>{t('network.decline', 'Decline')}</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={`${styles.grid} ${styles.section}`}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}><i className="pi pi-search" /> {t('timebank.browse', 'Offers and requests')}</h2>
          <div className={styles.formRow} style={{ marginBottom: '0.9rem' }}>
            <select className={styles.input} value={kind} onChange={(e) => setKind(e.target.value)} aria-label={t('timebank.kind', 'Type')}>
              <option value="">{t('timebank.allKinds', 'Offers and requests')}</option>
              <option value="offer">{t('timebank.offers', 'People offering help')}</option>
              <option value="request">{t('timebank.requests', 'People asking for help')}</option>
            </select>
            <select className={styles.input} value={category} onChange={(e) => setCategory(e.target.value)} aria-label={t('timebank.category', 'Category')}>
              <option value="">{t('timebank.allCategories', 'All topics')}</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{t(`timebank.categories.${c}`)}</option>)}
            </select>
          </div>
          <select className={styles.input} value={city} onChange={(e) => setCity(e.target.value)} style={{ marginBottom: '0.9rem' }} aria-label={t('common.city', 'City')}>
            <option value="">{t('common.allCities', 'All cities')}</option>
            {CITY_IDS.map((c) => <option key={c} value={c}>{CITY_NAMES[c]}</option>)}
          </select>
          {listings.filter((l) => l.user_id !== me).length === 0 ? (
            <p className={styles.muted}>{t('timebank.noListings', 'Nothing here yet. Be the first to offer an hour!')}</p>
          ) : (
            <ul className={styles.list} data-reveal-children>
              {listings.filter((l) => l.user_id !== me).map((l) => (
                <li key={l.id} className={styles.listItem}>
                  <div className={styles.grow}>
                    <div className={styles.itemTitle}>{l.title}</div>
                    <div className={styles.muted}>{l.user_name}{l.description && ` — ${l.description}`}</div>
                    <div className={styles.chips}>
                      <span className={l.kind === 'offer' ? `${styles.chip} ${styles.chipGreen}` : `${styles.chip} ${styles.chipOrange}`}>{t(`timebank.kinds.${l.kind}`)}</span>
                      <span className={styles.chip}>{t(`timebank.categories.${l.category}`)}</span>
                      {l.municipality_id && <span className={`${styles.chip} ${styles.chipBlue}`}>{CITY_NAMES[l.municipality_id] ?? l.municipality_id}</span>}
                    </div>
                  </div>
                  <button type="button" className={styles.secondaryButton} onClick={() => setExchangeFor(l)}>
                    <i className="pi pi-clock" /> {l.kind === 'offer' ? t('timebank.gotHelp', 'I got help') : t('timebank.gaveHelp', 'I helped')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}><i className="pi pi-plus" /> {t('timebank.newPost', 'New post')}</h2>
          <form className={styles.form} onSubmit={createListing}>
            <div className={styles.formRow}>
              <select className={styles.input} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as 'offer' | 'request' })} aria-label={t('timebank.kind', 'Type')}>
                <option value="offer">{t('timebank.kinds.offer', 'I can help')}</option>
                <option value="request">{t('timebank.kinds.request', 'I need help')}</option>
              </select>
              <select className={styles.input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TimebankCategory })} aria-label={t('timebank.category', 'Category')}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{t(`timebank.categories.${c}`)}</option>)}
              </select>
            </div>
            <input className={styles.input} required maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t('timebank.titlePlaceholder', 'e.g. Help with Kela and tax card forms')} aria-label={t('timebank.postTitle', 'Title')} />
            <textarea className={styles.input} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t('timebank.descriptionPlaceholder', 'When, where, in which languages')} aria-label={t('timebank.postDescription', 'Description')} />
            <select className={styles.input} value={form.municipality_id} onChange={(e) => setForm({ ...form, municipality_id: e.target.value })} aria-label={t('common.city', 'City')}>
              <option value="">{t('timebank.anywhere', 'Anywhere / online')}</option>
              {CITY_IDS.map((c) => <option key={c} value={c}>{CITY_NAMES[c]}</option>)}
            </select>
            <button type="submit" className={styles.primaryButton}>{t('timebank.publish', 'Publish')}</button>
          </form>

          {account && account.listings.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>{t('timebank.myPosts', 'Your posts')}</h3>
              <ul className={styles.list} data-reveal-children>
                {account.listings.map((l) => (
                  <li key={l.id} className={styles.listItem}>
                    <span className={styles.grow}>{l.title}</span>
                    {l.active ? (
                      <button type="button" className={styles.secondaryButton} onClick={() => act(() => timebankService.closeListing(l.id), t('timebank.closed', 'Closed'))}>{t('timebank.close', 'Close')}</button>
                    ) : (
                      <span className={styles.muted}>{t('timebank.closedChip', 'closed')}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {account && account.exchanges.length > 0 && (
        <div className={`${styles.card} ${styles.section}`}>
          <h2 className={styles.cardTitle}><i className="pi pi-history" /> {t('timebank.history', 'History')}</h2>
          <ul className={styles.list} data-reveal-children>
            {account.exchanges.map((x) => (
              <li key={x.id} className={styles.listItem}>
                <div className={styles.grow}>
                  <div>{t('timebank.exchangeLine', { provider: x.provider_name, receiver: x.receiver_name, hours: x.hours })}</div>
                  <div className={styles.muted}>{formatDate(x.created_at, i18n.language)} · {t(`timebank.categories.${x.category}`)}</div>
                </div>
                <span className={x.status === 'confirmed' ? `${styles.chip} ${styles.chipGreen}` : x.status === 'declined' ? `${styles.chip} ${styles.chipOrange}` : styles.chip}>
                  {t(`timebank.status.${x.status}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog
        header={exchangeFor?.title}
        visible={exchangeFor !== null}
        onHide={() => setExchangeFor(null)}
        style={{ width: '92vw', maxWidth: '460px' }}
        modal
      >
        {exchangeFor && (
          <div className={styles.form}>
            <p className={styles.muted}>
              {exchangeFor.kind === 'offer'
                ? t('timebank.recordReceived', { name: exchangeFor.user_name })
                : t('timebank.recordGiven', { name: exchangeFor.user_name })}
            </p>
            <div className={styles.field}>
              <label htmlFor="tb-hours">{t('timebank.hours', 'Hours')}</label>
              <input id="tb-hours" type="number" min={0.5} max={12} step={0.5} className={styles.input} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
            </div>
            <div className={styles.field}>
              <label htmlFor="tb-note">{t('timebank.note', 'Note (optional)')}</label>
              <input id="tb-note" className={styles.input} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <button type="button" className={styles.primaryButton} onClick={recordExchange}>{t('timebank.record', 'Record')}</button>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default Timebank;
