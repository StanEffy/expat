import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog } from 'primereact/dialog';
import { registerGrowthTranslations } from '@/i18n/registerGrowth';
import { networkService } from '@/services/growthService';
import { useNotification } from '@/hooks/useNotification';
import { getUserId } from '@/utils/auth';
import { SegmentedControl } from '@/components/UI';
import type { CheckinEvent, Connection, CoopIntro, EndorsementSummary, EventAttendee } from '@/types/growth';
import { CITY_IDS, CITY_NAMES, errorText, formatDate } from '@/components/Growth/shared';
import { AttendeePicker } from '@/components/Growth/AttendeePicker';
import styles from '@/components/Growth/Growth.module.scss';

registerGrowthTranslations();

type Tab = 'connections' | 'events' | 'intros' | 'organiser';

const SOURCE_ICONS: Record<string, string> = {
  high_five: 'pi pi-qrcode',
  event: 'pi pi-calendar',
  coop: 'pi pi-sparkles',
  tandem: 'pi pi-comments',
  timebank: 'pi pi-clock',
  challenge: 'pi pi-flag',
};

const today = () => new Date().toISOString().slice(0, 10);

export const Network: React.FC = () => {
  const { t, i18n } = useTranslation('growth');
  const { showNotification } = useNotification();
  const [tab, setTab] = useState<Tab>('connections');
  const [code, setCode] = useState('');
  const [otherCode, setOtherCode] = useState('');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [intros, setIntros] = useState<CoopIntro[]>([]);
  const [myEvents, setMyEvents] = useState<CheckinEvent[]>([]);
  const [organised, setOrganised] = useState<CheckinEvent[]>([]);
  const [isStaff, setIsStaff] = useState(false);
  const myUserId = getUserId();
  const [eventCode, setEventCode] = useState('');
  const [openEvent, setOpenEvent] = useState<{ event: CheckinEvent; attendees: EventAttendee[] } | null>(null);
  const [endorseFor, setEndorseFor] = useState<Connection | null>(null);
  const [endorsements, setEndorsements] = useState<EndorsementSummary[]>([]);
  const [skill, setSkill] = useState('');
  const [qrEvent, setQrEvent] = useState<{ event: CheckinEvent; code: string } | null>(null);
  const [newEvent, setNewEvent] = useState({ municipality_id: 'helsinki', title: '', description: '', category: 'networking', date: today(), time: '', location: '', organizer: '' });

  const load = useCallback(() => {
    networkService.getCode().then((r) => setCode(r.code)).catch(() => undefined);
    networkService.connections().then(setConnections).catch(() => undefined);
    networkService.intros().then(setIntros).catch(() => undefined);
    networkService.myEvents().then(setMyEvents).catch(() => undefined);
    networkService.organisedEvents().then((r) => {
      setOrganised(r.events);
      setIsStaff(r.is_staff);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    registerGrowthTranslations();
    load();
  }, [load]);

  const act = async (action: () => Promise<unknown>, success?: string) => {
    try {
      await action();
      if (success) showNotification(success, 'success');
      load();
      return true;
    } catch (err) {
      showNotification(errorText(err, t('common.error', 'Something went wrong')), 'error');
      return false;
    }
  };

  const connectByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const person = await networkService.connect(otherCode);
      showNotification(t('network.connected', { name: person.name }), 'success');
      setOtherCode('');
      load();
    } catch (err) {
      showNotification(errorText(err, t('network.connectError', 'Could not connect')), 'error');
    }
  };

  const checkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await networkService.checkIn(eventCode);
      setEventCode('');
      setOpenEvent(result);
      showNotification(t('network.checkedIn', { title: result.event.title }), 'success');
      load();
    } catch (err) {
      showNotification(errorText(err, t('network.checkinError', 'Could not check in')), 'error');
    }
  };

  const openAttendees = async (event: CheckinEvent) => {
    try {
      setOpenEvent({ event, attendees: await networkService.attendees(event.id) });
    } catch (err) {
      showNotification(errorText(err, t('common.error', 'Something went wrong')), 'error');
    }
  };

  const openEndorse = async (c: Connection) => {
    setEndorseFor(c);
    setSkill('');
    setEndorsements(await networkService.endorsements(c.user_id).catch(() => []));
  };

  const endorse = async (name: string, remove = false) => {
    if (!endorseFor || !name.trim()) return;
    const ok = await act(() => (remove
      ? networkService.removeEndorsement(endorseFor.user_id, name)
      : networkService.endorse(endorseFor.user_id, name.trim())));
    if (ok) {
      setSkill('');
      setEndorsements(await networkService.endorsements(endorseFor.user_id).catch(() => []));
    }
  };

  const showQr = async (event: CheckinEvent) => {
    try {
      setQrEvent({ event, code: (await networkService.checkinCode(event.id)).code });
    } catch (err) {
      showNotification(errorText(err, t('common.error', 'Something went wrong')), 'error');
    }
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await act(() => networkService.createEvent(newEvent), t('network.eventCreated', 'Event created'));
    if (ok) setNewEvent((prev) => ({ ...prev, title: '', description: '', location: '' }));
  };

  const pendingIncoming = intros.filter((i) => i.status === 'pending' && i.to_user_id === myUserId);
  const showOrganiser = isStaff || organised.length > 0;
  const tabs: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: 'connections', label: t('network.tabs.connections', 'Connections'), icon: 'pi pi-users', count: connections.length || undefined },
    { id: 'events', label: t('network.tabs.events', 'Events'), icon: 'pi pi-calendar', count: myEvents.length || undefined },
    { id: 'intros', label: t('network.tabs.intros', 'Intros'), icon: 'pi pi-envelope', count: pendingIncoming.length || undefined },
    ...(showOrganiser ? [{ id: 'organiser' as Tab, label: t('network.tabs.organiser', 'Organiser'), icon: 'pi pi-megaphone' }] : []),
  ];
  const connectUrl = code ? `${window.location.origin}/connect/${code}` : '';

  return (
    <div className={styles.container} data-reveal-children>
      <div className={styles.header}>
        <h1>{t('network.title', 'My connections')}</h1>
        <p>{t('network.subtitle', 'People you actually met: at events, in tandems, in the time bank, in city challenges or through a quick high five.')}</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}><i className="pi pi-qrcode" /> {t('network.myCode', 'High five')}</h2>
          <p className={styles.cardSubtitle}>{t('network.myCodeHint', 'Met someone? Let them scan this with their phone camera, or tell them the code. Showing it means you agree to connect.')}</p>
          {code && (
            <>
              <div className={styles.qr}><QRCodeSVG value={connectUrl} size={168} /></div>
              <div className={styles.code}>{code}</div>
              <div className={styles.actions} style={{ justifyContent: 'center', marginTop: '0.6rem' }}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => act(async () => setCode((await networkService.rotateCode()).code), t('network.rotated', 'New code created; the old one no longer works'))}
                >
                  <i className="pi pi-refresh" /> {t('network.rotate', 'New code')}
                </button>
              </div>
            </>
          )}
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}><i className="pi pi-link" /> {t('network.enterCode', 'Enter a code')}</h2>
          <form className={styles.form} onSubmit={connectByCode}>
            <div className={styles.field}>
              <label htmlFor="other-code">{t('network.theirCode', "Someone's high-five code")}</label>
              <input id="other-code" className={styles.input} value={otherCode} onChange={(e) => setOtherCode(e.target.value)} autoComplete="off" />
            </div>
            <button type="submit" className={styles.primaryButton} disabled={otherCode.trim().length < 6}>{t('network.connect', 'Connect')}</button>
          </form>
          <form className={styles.form} onSubmit={checkIn} style={{ marginTop: '1.25rem' }}>
            <div className={styles.field}>
              <label htmlFor="event-code">{t('network.eventCode', 'Event check-in code')}</label>
              <input id="event-code" className={styles.input} value={eventCode} onChange={(e) => setEventCode(e.target.value)} autoComplete="off" />
            </div>
            <button type="submit" className={styles.secondaryButton} disabled={eventCode.trim().length < 6}>
              <i className="pi pi-check-square" /> {t('network.checkIn', 'Check in')}
            </button>
          </form>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.tabs}>
          <SegmentedControl items={tabs} value={tab} onChange={setTab} mobileLayout="grid" ariaLabel={t('network.title', 'My connections')} />
        </div>

        {tab === 'connections' && (
          connections.length === 0 ? (
            <div className={`${styles.card} ${styles.emptyState}`}>
              <i className="pi pi-users" />
              {t('network.noConnections', 'No connections yet. Go to an event, join a tandem or a city challenge — or simply high-five someone you met.')}
            </div>
          ) : (
            <ul className={styles.list} data-reveal-children>
              {connections.map((c) => (
                <li key={c.user_id} className={styles.listItem}>
                  <div className={styles.grow}>
                    <div className={styles.itemTitle}>{c.name}</div>
                    {c.email && <a className={styles.muted} href={`mailto:${c.email}`}>{c.email}</a>}
                    <div className={styles.chips}>
                      {c.sources.map((s) => (
                        <span key={s} className={styles.chip}><i className={SOURCE_ICONS[s]} /> {t(`network.sources.${s}`)}</span>
                      ))}
                      <span className={`${styles.chip} ${styles.chipBlue}`}>{t('network.since', { date: formatDate(c.since, i18n.language) })}</span>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button type="button" className={styles.secondaryButton} onClick={() => openEndorse(c)}>
                      <i className="pi pi-thumbs-up" /> {t('network.endorse', 'Endorse')}
                    </button>
                    <button
                      type="button"
                      className={styles.dangerButton}
                      aria-label={t('network.remove', 'Remove')}
                      onClick={() => {
                        if (window.confirm(t('network.removeConfirm', { name: c.name }))) {
                          void act(() => networkService.removeConnection(c.user_id));
                        }
                      }}
                    >
                      <i className="pi pi-times" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )
        )}

        {tab === 'events' && (
          myEvents.length === 0 ? (
            <div className={`${styles.card} ${styles.emptyState}`}>
              <i className="pi pi-calendar" />
              {t('network.noEvents', 'At an event, scan the organiser\'s QR code or enter the check-in code above.')}
            </div>
          ) : (
            <ul className={styles.list} data-reveal-children>
              {myEvents.map((ev) => (
                <li key={ev.id} className={styles.listItem}>
                  <div className={styles.grow}>
                    <div className={styles.itemTitle}>{ev.title}</div>
                    <div className={styles.muted}>{ev.date} · {ev.location}</div>
                  </div>
                  <button type="button" className={styles.secondaryButton} onClick={() => openAttendees(ev)}>
                    <i className="pi pi-users" /> {t('network.whoWasThere', 'Who was there')}
                  </button>
                </li>
              ))}
            </ul>
          )
        )}

        {tab === 'intros' && (
          intros.length === 0 ? (
            <div className={`${styles.card} ${styles.emptyState}`}>
              <i className="pi pi-envelope" />
              {t('network.noIntros', 'Intros from co-founder matches appear here. Send one from Team Up → Matches.')}
            </div>
          ) : (
            <ul className={styles.list} data-reveal-children>
              {intros.map((i) => {
                const incoming = i.to_user_id === myUserId;
                return (
                  <li key={i.id} className={styles.listItem}>
                    <div className={styles.grow}>
                      <div className={styles.itemTitle}>
                        {incoming ? t('network.introFrom', { name: i.from_name }) : t('network.introTo', { name: i.to_name })}
                      </div>
                      {i.message && <div className={styles.muted}>“{i.message}”</div>}
                      <div className={styles.chips}>
                        <span className={i.status === 'accepted' ? `${styles.chip} ${styles.chipGreen}` : i.status === 'declined' ? `${styles.chip} ${styles.chipOrange}` : styles.chip}>
                          {t(`network.introStatus.${i.status}`)}
                        </span>
                        <span className={`${styles.chip} ${styles.chipBlue}`}>{formatDate(i.created_at, i18n.language)}</span>
                      </div>
                    </div>
                    {incoming && i.status === 'pending' && (
                      <div className={styles.actions}>
                        <button type="button" className={styles.primaryButton} onClick={() => act(() => networkService.acceptIntro(i.id), t('network.introAccepted', 'Connected! You can now see each other\'s email.'))}>
                          {t('network.accept', 'Accept')}
                        </button>
                        <button type="button" className={styles.secondaryButton} onClick={() => act(() => networkService.declineIntro(i.id))}>
                          {t('network.decline', 'Decline')}
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )
        )}

        {tab === 'organiser' && (
          <div className={styles.grid}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}><i className="pi pi-qrcode" /> {t('network.organisedTitle', 'Check-in QR for your events')}</h2>
              {organised.length === 0 ? (
                <p className={styles.muted}>{t('network.noOrganised', 'No events yet.')}</p>
              ) : (
                <ul className={styles.list} data-reveal-children>
                  {organised.slice(0, 30).map((ev) => (
                    <li key={ev.id} className={styles.listItem}>
                      <div className={styles.grow}>
                        <div className={styles.itemTitle}>{ev.title}</div>
                        <div className={styles.muted}>{ev.date} · {CITY_NAMES[ev.municipality_id] ?? ev.municipality_id}</div>
                      </div>
                      <button type="button" className={styles.secondaryButton} onClick={() => showQr(ev)}>
                        <i className="pi pi-qrcode" /> {t('network.showQr', 'Show QR')}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {isStaff && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}><i className="pi pi-plus" /> {t('network.createEvent', 'New event with check-in')}</h2>
                <form className={styles.form} onSubmit={createEvent}>
                  <div className={styles.field}>
                    <label htmlFor="ev-title">{t('network.eventTitle', 'Title')}</label>
                    <input id="ev-title" className={styles.input} required value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label htmlFor="ev-city">{t('common.city', 'City')}</label>
                      <select id="ev-city" className={styles.input} value={newEvent.municipality_id} onChange={(e) => setNewEvent({ ...newEvent, municipality_id: e.target.value })}>
                        {CITY_IDS.map((c) => <option key={c} value={c}>{CITY_NAMES[c]}</option>)}
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="ev-date">{t('network.eventDate', 'Date')}</label>
                      <input id="ev-date" type="date" className={styles.input} required value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label htmlFor="ev-time">{t('network.eventTime', 'Time')}</label>
                      <input id="ev-time" className={styles.input} placeholder="17:30 - 19:30" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="ev-location">{t('network.eventLocation', 'Place')}</label>
                      <input id="ev-location" className={styles.input} required value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="ev-desc">{t('network.eventDescription', 'Description')}</label>
                    <textarea id="ev-desc" className={styles.input} value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
                  </div>
                  <button type="submit" className={styles.primaryButton}>{t('network.create', 'Create')}</button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog
        header={openEvent?.event.title}
        visible={openEvent !== null}
        onHide={() => setOpenEvent(null)}
        style={{ width: '92vw', maxWidth: '560px' }}
        modal
      >
        {openEvent && (
          <AttendeePicker
            eventId={openEvent.event.id}
            attendees={openEvent.attendees}
            onSaved={(n) => {
              showNotification(n > 0 ? t('network.newConnections', { count: n }) : t('network.marksSaved', 'Saved. You will be connected when they mark you too.'), 'success');
              setOpenEvent(null);
              load();
            }}
          />
        )}
      </Dialog>

      <Dialog
        header={endorseFor ? t('network.endorseTitle', { name: endorseFor.name }) : ''}
        visible={endorseFor !== null}
        onHide={() => setEndorseFor(null)}
        style={{ width: '92vw', maxWidth: '520px' }}
        modal
      >
        <p className={styles.muted}>{t('network.endorseHint', 'Vouch for something you have seen them do. Endorsements appear in their skills passport.')}</p>
        <ul className={styles.list} data-reveal-children style={{ margin: '0.75rem 0' }}>
          {endorsements.map((e) => (
            <li key={e.skill} className={styles.listItem}>
              <div className={styles.grow}>
                <div className={styles.itemTitle}>{e.skill}</div>
                <div className={styles.muted}>{e.endorsers.join(', ')}</div>
              </div>
              <button type="button" className={e.endorsed_by_me ? styles.secondaryButton : styles.primaryButton} onClick={() => endorse(e.skill, e.endorsed_by_me)}>
                {e.endorsed_by_me ? t('network.unendorse', 'Undo') : '+1'}
              </button>
            </li>
          ))}
        </ul>
        <form className={styles.actions} onSubmit={(e) => { e.preventDefault(); void endorse(skill); }}>
          <input className={styles.input} style={{ flex: 1, minWidth: '10rem' }} value={skill} onChange={(e) => setSkill(e.target.value)} placeholder={t('network.skillPlaceholder', 'e.g. Baking, Finnish paperwork, React')} />
          <button type="submit" className={styles.primaryButton} disabled={!skill.trim()}>{t('network.endorse', 'Endorse')}</button>
        </form>
      </Dialog>

      <Dialog
        header={qrEvent?.event.title}
        visible={qrEvent !== null}
        onHide={() => setQrEvent(null)}
        style={{ width: '92vw', maxWidth: '460px' }}
        modal
      >
        {qrEvent && (
          <div style={{ textAlign: 'center' }}>
            <div className={styles.qr}><QRCodeSVG value={`${window.location.origin}/checkin/${qrEvent.code}`} size={240} /></div>
            <div className={styles.code} style={{ color: 'inherit' }}>{qrEvent.code}</div>
            <p className={styles.muted}>{t('network.qrHint', 'Guests scan this with their phone camera to check in. Check-in is open from the day before until the day after the event.')}</p>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default Network;
