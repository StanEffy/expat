import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { registerCommunityTranslations } from '@/i18n/registerCommunity';
import { useCommunity, type CommunityTab } from '@/hooks/useCommunity';
import { EventCard } from '@/components/Community/EventCard';
import { NoticeCard } from '@/components/Community/NoticeCard';
import { MentorCard } from '@/components/Community/MentorCard';
import { NewNoticeDialog } from '@/components/Community/NewNoticeDialog';
import {
  SearchInput,
  FilterDropdown,
  SegmentedControl,
  FilterCard,
  FilterRow,
  FilterActions,
  ResetButton,
  PrimaryActionButton,
} from '@/components/UI';
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

  const tabItems: { id: CommunityTab; label: string; icon: string; count: number }[] = [
    {
      id: 'events',
      label: t('tabs.events', 'Events & Meetups'),
      icon: 'pi pi-calendar',
      count: rawCounts.events,
    },
    {
      id: 'notices',
      label: t('tabs.notices', 'Notice Board'),
      icon: 'pi pi-comments',
      count: rawCounts.notices,
    },
    {
      id: 'mentors',
      label: t('tabs.mentors', 'Expat Mentors'),
      icon: 'pi pi-users',
      count: rawCounts.mentors,
    },
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

      <div className={styles.tabNavigationWrapper}>
        <SegmentedControl
          items={tabItems}
          value={activeTab}
          onChange={(id) => setActiveTab(id)}
          mobileLayout="stack"
          ariaLabel="Community sections"
        />
      </div>

      <FilterCard ariaLabel="Community filters">
        <FilterRow>
          <div className={styles.searchField}>
            <SearchInput
              id="comm-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder', 'Search events, notices, or mentors by keyword...')}
              label={t('filters.search_label', 'Search')}
            />
          </div>

          <div className={styles.filterField}>
            <FilterDropdown
              id="comm-city"
              value={selectedCity}
              options={cityOptions}
              onChange={(e) => setCity(e.value)}
              label={t('filters.city_label', 'City')}
              labelIcon="pi pi-map-marker"
            />
          </div>

          {activeTab === 'events' && (
            <div className={styles.filterField}>
              <FilterDropdown
                id="comm-event-cat"
                value={selectedEventCategory}
                options={eventCategoryOptions}
                onChange={(e) => setEventCategory(e.value)}
                label={t('filters.category_label', 'Category')}
                labelIcon="pi pi-tag"
              />
            </div>
          )}

          {activeTab === 'notices' && (
            <div className={styles.filterField}>
              <FilterDropdown
                id="comm-notice-cat"
                value={selectedNoticeCategory}
                options={noticeCategoryOptions}
                onChange={(e) => setNoticeCategory(e.value)}
                label={t('filters.category_label', 'Category')}
                labelIcon="pi pi-tag"
              />
            </div>
          )}

          <FilterActions>
            {activeTab === 'notices' && (
              <PrimaryActionButton
                label={t('notice.post_btn', 'Post a Notice')}
                icon="pi pi-plus"
                onClick={() => setNoticeDialogVisible(true)}
              />
            )}
            <ResetButton
              tooltip={t('filters.reset_tooltip', 'Reset demo data')}
              onClick={resetData}
            />
          </FilterActions>
        </FilterRow>
      </FilterCard>

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
