import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { registerCommunityTranslations } from '@/i18n/registerCommunity';
import { useCommunity } from '@/hooks/useCommunity';
import { EventCard } from '@/components/Community/EventCard';
import { NoticeCard } from '@/components/Community/NoticeCard';
import { MentorCard } from '@/components/Community/MentorCard';
import { NewNoticeDialog } from '@/components/Community/NewNoticeDialog';
import type { MunicipalityId } from '@/types/onboarding';
import type { EventCategory, NoticeCategory } from '@/types/community';
import styles from './Community.module.scss';

registerCommunityTranslations();

export const Community: React.FC = () => {
  const { t } = useTranslation('community');
  const [noticeDialogVisible, setNoticeDialogVisible] = useState(false);

  useEffect(() => {
    registerCommunityTranslations();
  }, []);

  const {
    isLoaded,
    activeTab,
    selectedCity,
    selectedEventCategory,
    selectedNoticeCategory,
    searchQuery,
    events,
    notices,
    mentors,
    rawCounts,
    setActiveTab,
    setCity,
    setEventCategory,
    setNoticeCategory,
    setSearchQuery,
    toggleRsvp,
    addNotice,
    resetData,
  } = useCommunity();

  const cityOptions: { label: string; value: MunicipalityId | 'all' }[] = [
    { label: t('filters.city_all', 'All Cities'), value: 'all' },
    { label: 'Helsinki', value: 'helsinki' },
    { label: 'Espoo', value: 'espoo' },
    { label: 'Tampere', value: 'tampere' },
    { label: 'Vantaa', value: 'vantaa' },
    { label: 'Turku', value: 'turku' },
    { label: 'Oulu', value: 'oulu' },
  ];

  const eventCategoryOptions: { label: string; value: EventCategory | 'all' }[] = [
    { label: t('filters.category_all', 'All Categories'), value: 'all' },
    { label: t('filters.event_categories.language_exchange', 'Language & Cafe'), value: 'language_exchange' },
    { label: t('filters.event_categories.cultural', 'Culture & Heritage'), value: 'cultural' },
    { label: t('filters.event_categories.sports_outdoor', 'Outdoors & Saunas'), value: 'sports_outdoor' },
    { label: t('filters.event_categories.family', 'Family & Kids'), value: 'family' },
    { label: t('filters.event_categories.networking', 'Tech & Careers'), value: 'networking' },
  ];

  const noticeCategoryOptions: { label: string; value: NoticeCategory | 'all' }[] = [
    { label: t('filters.category_all', 'All Categories'), value: 'all' },
    { label: t('filters.notice_categories.housing_sharing', 'Housing & Flatmates'), value: 'housing_sharing' },
    { label: t('filters.notice_categories.goods_giveaway', 'Free & Secondhand'), value: 'goods_giveaway' },
    { label: t('filters.notice_categories.study_buddy', 'Study & Language'), value: 'study_buddy' },
    { label: t('filters.notice_categories.advice', 'General Advice'), value: 'advice' },
  ];

  if (!isLoaded) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <h1>{t('title', 'Municipal Expat Community Hub')}</h1>
        <p>{t('subtitle', 'Connect with local events, peer notice board, and experienced expat mentors across Finland')}</p>
      </div>

      <div className={styles.tabNavigation}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'events' ? styles.active : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <i className="pi pi-calendar" />
          <span>{t('tabs.events', 'Events & Meetups')}</span>
          <span className={styles.tabCount}>{rawCounts.events}</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'notices' ? styles.active : ''}`}
          onClick={() => setActiveTab('notices')}
        >
          <i className="pi pi-comments" />
          <span>{t('tabs.notices', 'Notice Board')}</span>
          <span className={styles.tabCount}>{rawCounts.notices}</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'mentors' ? styles.active : ''}`}
          onClick={() => setActiveTab('mentors')}
        >
          <i className="pi pi-users" />
          <span>{t('tabs.mentors', 'Expat Mentors')}</span>
          <span className={styles.tabCount}>{rawCounts.mentors}</span>
        </button>
      </div>

      <div className={styles.filterCard}>
        <div className={styles.searchAndFilters}>
          <div className={styles.searchInput}>
            <span className="p-input-icon-left" style={{ width: '100%' }}>
              <i className="pi pi-search" />
              <InputText
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder', 'Search events, notices, or mentors by keyword...')}
                style={{ width: '100%' }}
              />
            </span>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="comm-city">City:</label>
            <Dropdown
              id="comm-city"
              value={selectedCity}
              options={cityOptions}
              onChange={(e) => setCity(e.value)}
            />
          </div>

          {activeTab === 'events' && (
            <div className={styles.filterField}>
              <label htmlFor="comm-event-cat">Category:</label>
              <Dropdown
                id="comm-event-cat"
                value={selectedEventCategory}
                options={eventCategoryOptions}
                onChange={(e) => setEventCategory(e.value)}
              />
            </div>
          )}

          {activeTab === 'notices' && (
            <div className={styles.filterField}>
              <label htmlFor="comm-notice-cat">Category:</label>
              <Dropdown
                id="comm-notice-cat"
                value={selectedNoticeCategory}
                options={noticeCategoryOptions}
                onChange={(e) => setNoticeCategory(e.value)}
              />
            </div>
          )}
        </div>

        <div className={styles.extraActions}>
          {activeTab === 'notices' && (
            <Button
              label={t('notice.post_btn', 'Post a Notice')}
              icon="pi pi-plus"
              onClick={() => setNoticeDialogVisible(true)}
            />
          )}
          <Button
            icon="pi pi-refresh"
            severity="secondary"
            outlined
            tooltip="Reset demo data"
            onClick={resetData}
          />
        </div>
      </div>

      {activeTab === 'events' && (
        events.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="pi pi-calendar-times" />
            <h3>{t('empty.events_title', 'No upcoming events found')}</h3>
            <p>{t('empty.events_desc', 'Check back later or change your municipality filter.')}</p>
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {events.map((ev) => (
              <EventCard key={ev.id} event={ev} onToggleRsvp={toggleRsvp} />
            ))}
          </div>
        )
      )}

      {activeTab === 'notices' && (
        notices.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="pi pi-inbox" />
            <h3>{t('empty.notices_title', 'No notices match your criteria')}</h3>
            <p>{t('empty.notices_desc', 'Be the first to post a notice in this category!')}</p>
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {notices.map((notice) => (
              <NoticeCard key={notice.id} notice={notice} />
            ))}
          </div>
        )
      )}

      {activeTab === 'mentors' && (
        mentors.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="pi pi-users" />
            <h3>{t('empty.mentors_title', 'No mentors found')}</h3>
            <p>{t('empty.mentors_desc', 'Try selecting another municipality or clearing search terms.')}</p>
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {mentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        )
      )}

      <NewNoticeDialog
        visible={noticeDialogVisible}
        onHide={() => setNoticeDialogVisible(false)}
        onSubmit={addNotice}
      />
    </div>
  );
};

export default Community;
