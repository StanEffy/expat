import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  OnboardingAnswers,
  MunicipalityId,
  CitizenshipCategory,
  RelocationReason,
  FamilyStatus,
} from '@/types/onboarding';
import styles from './OnboardingWizard.module.scss';

interface Props {
  initialAnswers?: OnboardingAnswers | null;
  onComplete: (answers: OnboardingAnswers) => void;
}

export const OnboardingWizard: React.FC<Props> = ({ initialAnswers, onComplete }) => {
  const { t } = useTranslation('onboarding');

  const [step, setStep] = useState<number>(1);
  const [municipality, setMunicipality] = useState<MunicipalityId>(
    initialAnswers?.municipality || 'helsinki',
  );
  const [citizenship, setCitizenship] = useState<CitizenshipCategory>(
    initialAnswers?.citizenship || 'non_eu',
  );
  const [reason, setReason] = useState<RelocationReason>(
    initialAnswers?.reason || 'employed',
  );
  const [family, setFamily] = useState<FamilyStatus>(
    initialAnswers?.family || 'solo',
  );

  const totalSteps = 4;
  const progressPercent = Math.round((step / totalSteps) * 100);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      onComplete({
        municipality,
        citizenship,
        reason,
        family,
      });
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const municipalitiesList: { id: MunicipalityId; icon: string }[] = [
    { id: 'helsinki', icon: 'pi pi-building-columns' },
    { id: 'espoo', icon: 'pi pi-compass' },
    { id: 'vantaa', icon: 'pi pi-send' },
    { id: 'tampere', icon: 'pi pi-wrench' },
    { id: 'turku', icon: 'pi pi-globe' },
    { id: 'oulu', icon: 'pi pi-star' },
    { id: 'other', icon: 'pi pi-map-marker' },
  ];

  const citizenshipsList: { id: CitizenshipCategory; icon: string }[] = [
    { id: 'eu_eea', icon: 'pi pi-id-card' },
    { id: 'nordic', icon: 'pi pi-flag' },
    { id: 'non_eu', icon: 'pi pi-file' },
  ];

  const reasonsList: { id: RelocationReason; icon: string }[] = [
    { id: 'employed', icon: 'pi pi-briefcase' },
    { id: 'specialist', icon: 'pi pi-bolt' },
    { id: 'entrepreneur', icon: 'pi pi-chart-line' },
    { id: 'student', icon: 'pi pi-book' },
    { id: 'family', icon: 'pi pi-heart' },
    { id: 'jobseeker', icon: 'pi pi-search' },
  ];

  const familyList: { id: FamilyStatus; icon: string }[] = [
    { id: 'solo', icon: 'pi pi-user' },
    { id: 'couple', icon: 'pi pi-users' },
    { id: 'children_preschool', icon: 'pi pi-face-smile' },
    { id: 'children_school', icon: 'pi pi-graduation-cap' },
  ];

  return (
    <div className={styles.wizardContainer}>
      <div className={styles.stepIndicator}>
        <div className={styles.progressBarTrack}>
          <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
        </div>
        <div className={styles.stepLabels}>
          <span>
            {t('common.step', { defaultValue: 'Step' })} {step} / {totalSteps}
          </span>
          <span>{progressPercent}%</span>
        </div>
      </div>

      <div className={styles.stepContent}>
        {step === 1 && (
          <>
            <div className={styles.stepHeader}>
              <h2>{t('wizard.step1_title')}</h2>
              <p>{t('wizard.step1_desc')}</p>
            </div>
            <div className={styles.optionsGrid}>
              {municipalitiesList.map((item) => {
                const isSelected = municipality === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.optionCard} ${isSelected ? styles.selected : ''}`}
                    onClick={() => setMunicipality(item.id)}
                  >
                    <div className={styles.optionIcon}>
                      <i className={item.icon} />
                    </div>
                    <div className={styles.optionText}>
                      <div className={styles.title}>
                        {t(`wizard.municipalities.${item.id}`)}
                      </div>
                    </div>
                    <i className={`pi pi-check-circle ${styles.checkMark}`} />
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className={styles.stepHeader}>
              <h2>{t('wizard.step2_title')}</h2>
              <p>{t('wizard.step2_desc')}</p>
            </div>
            <div className={styles.optionsGrid}>
              {citizenshipsList.map((item) => {
                const isSelected = citizenship === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.optionCard} ${isSelected ? styles.selected : ''}`}
                    onClick={() => setCitizenship(item.id)}
                  >
                    <div className={styles.optionIcon}>
                      <i className={item.icon} />
                    </div>
                    <div className={styles.optionText}>
                      <div className={styles.title}>
                        {t(`wizard.citizenships.${item.id}`)}
                      </div>
                    </div>
                    <i className={`pi pi-check-circle ${styles.checkMark}`} />
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className={styles.stepHeader}>
              <h2>{t('wizard.step3_title')}</h2>
              <p>{t('wizard.step3_desc')}</p>
            </div>
            <div className={styles.optionsGrid}>
              {reasonsList.map((item) => {
                const isSelected = reason === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.optionCard} ${isSelected ? styles.selected : ''}`}
                    onClick={() => setReason(item.id)}
                  >
                    <div className={styles.optionIcon}>
                      <i className={item.icon} />
                    </div>
                    <div className={styles.optionText}>
                      <div className={styles.title}>
                        {t(`wizard.reasons.${item.id}`)}
                      </div>
                    </div>
                    <i className={`pi pi-check-circle ${styles.checkMark}`} />
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className={styles.stepHeader}>
              <h2>{t('wizard.step4_title')}</h2>
              <p>{t('wizard.step4_desc')}</p>
            </div>
            <div className={styles.optionsGrid}>
              {familyList.map((item) => {
                const isSelected = family === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.optionCard} ${isSelected ? styles.selected : ''}`}
                    onClick={() => setFamily(item.id)}
                  >
                    <div className={styles.optionIcon}>
                      <i className={item.icon} />
                    </div>
                    <div className={styles.optionText}>
                      <div className={styles.title}>
                        {t(`wizard.family.${item.id}`)}
                      </div>
                    </div>
                    <i className={`pi pi-check-circle ${styles.checkMark}`} />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className={styles.footerActions}>
        <button
          type="button"
          className={`${styles.navBtn} ${styles.prev}`}
          onClick={handlePrev}
          disabled={step === 1}
        >
          <i className="pi pi-arrow-left" />
          {t('wizard.prev_btn')}
        </button>

        {step < totalSteps ? (
          <button
            type="button"
            className={`${styles.navBtn} ${styles.next}`}
            onClick={handleNext}
          >
            {t('wizard.next_btn')}
            <i className="pi pi-arrow-right" />
          </button>
        ) : (
          <button
            type="button"
            className={`${styles.navBtn} ${styles.finish}`}
            onClick={handleNext}
          >
            <i className="pi pi-sparkles" />
            {t('wizard.generate_btn')}
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;
