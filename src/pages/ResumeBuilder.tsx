import { useMemo, useState } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import Button from '../components/Common/Button';
import styles from './ResumeBuilder.module.scss';

type PersonalInfo = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
};

type StarEntry = {
  situation: string;
  task: string;
  action: string;
  result: string;
};

type WorkExperience = {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  starEntries: StarEntry[];
};

type Education = {
  school: string;
  degree: string;
  year: string;
};

type FunFields = {
  haiku: [string, string, string];
  spiritAnimal: string;
  superpower: string;
  survivalSkill: string;
  emojiDay: string;
  themeSong: string;
  workBff: string;
  meetingTolerance: '😊' | '😐' | '😫' | '';
  snack: string;
  resumeSmell: string;
};

type Skills = {
  technical: string;
  soft: string;
};

type FormData = {
  personalInfo: PersonalInfo;
  summary: string;
  experiences: WorkExperience[];
  education: Education[];
  skills: Skills;
  certifications: string[];
  fun: FunFields;
};

const ACTION_VERB_KEYS = [
  'led',
  'developed',
  'implemented',
  'optimized',
  'spearheaded',
  'accelerated',
  'transformed',
  'orchestrated',
  'delivered',
  'championed',
  'streamlined',
  'pioneered',
  'elevated',
  'engineered',
  'negotiated',
] as const;

const SUPERPOWER_KEYS = [
  'telepathicCommunicator',
  'deadlineVanisher',
  'coffeePoweredMachine',
  'spreadsheetSorcerer',
  'stakeholderWhisperer',
] as const;

const SURVIVAL_SKILL_KEYS = [
  'microwaveTimingNinja',
  'printerWhisperer',
  'conferenceCallEscapeArtist',
  'snackStashCurator',
  'meetingAgendaConjurer',
] as const;

const RESUME_SCENT_KEYS = [
  'freshlySignedContract',
  'mondayMorningEspresso',
  'polishedBoardroomOak',
  'startupWhiteboardMarker',
  'deadlineAdrenaline',
] as const;

const CharacterCountTextarea: React.FC<{
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  maxLength: number;
  helperText?: string;
  onChange: (value: string) => void;
}> = ({ id, label, value, placeholder, maxLength, helperText, onChange }) => (
  <div className={styles.fieldGroup}>
    <label htmlFor={id} className={styles.label}>
      {label}
    </label>
    {helperText && <p className={styles.helperText}>{helperText}</p>}
    <textarea
      id={id}
      className={styles.textarea}
      value={value}
      placeholder={placeholder}
      maxLength={maxLength}
      onChange={(event) => onChange(event.target.value)}
    />
    <div className={styles.characterCount}>
      {value.length}/{maxLength} characters
    </div>
  </div>
);

const TextInput: React.FC<{
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel';
  helperText?: string;
  onChange: (value: string) => void;
}> = ({ id, label, value, placeholder, type = 'text', helperText, onChange }) => (
  <div className={styles.fieldGroup}>
    <label htmlFor={id} className={styles.label}>
      {label}
    </label>
    {helperText && <p className={styles.helperText}>{helperText}</p>}
    <input
      id={id}
      className={styles.input}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
);

const SectionCard: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
  accent?: 'primary' | 'secondary';
}> = ({ title, description, children, accent = 'primary' }) => (
  <section className={[styles.sectionCard, styles[accent]].join(' ')}>
    <header className={styles.sectionHeader}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </header>
    <div className={styles.sectionBody}>{children}</div>
  </section>
);

const StarTooltip: React.FC = () => {
  const { t } = useTranslation('resume');
  return (
    <div className={styles.starTooltip} role="note">
      <span className={styles.tooltipLabel}>{t('tooltips.star.title')}</span>
      <ul>
        <li>
          <strong>S</strong>
          {t('tooltips.star.items.s')}
        </li>
        <li>
          <strong>T</strong>
          {t('tooltips.star.items.t')}
        </li>
        <li>
          <strong>A</strong>
          {t('tooltips.star.items.a')}
        </li>
        <li>
          <strong>R</strong>
          {t('tooltips.star.items.r')}
        </li>
      </ul>
      <p>{t('tooltips.star.footer')}</p>
    </div>
  );
};

const ActionVerbSelector: React.FC<{
  options: Array<{ key: string; value: string }>;
  onAdd: (verb: string) => void;
}> = ({ options, onAdd }) => {
  const { t } = useTranslation('resume');
  const [selectedVerb, setSelectedVerb] = useState('');

  return (
    <div className={styles.actionVerbSelector}>
      <label htmlFor="action-verb-selector">{t('actionVerbs.label')}</label>
      <div className={styles.actionVerbControls}>
        <select
          id="action-verb-selector"
          value={selectedVerb}
          onChange={(event) => setSelectedVerb(event.target.value)}
        >
          <option value="">{t('actionVerbs.placeholder')}</option>
          {options.map((option) => (
            <option key={option.key} value={option.value}>
              {option.value}
            </option>
          ))}
        </select>
        <Button
          type="button"
          size="small"
          onClick={() => {
            if (selectedVerb) {
              onAdd(selectedVerb);
              setSelectedVerb('');
            }
          }}
        >
          {t('actionVerbs.insert')}
        </Button>
      </div>
      <p className={styles.helperText}>{t('actionVerbs.helper')}</p>
    </div>
  );
};

const MeetingToleranceSelector: React.FC<{
  value: FunFields['meetingTolerance'];
  onChange: (value: FunFields['meetingTolerance']) => void;
}> = ({ value, onChange }) => {
  const { t } = useTranslation('resume');
  const options: FunFields['meetingTolerance'][] = ['😊', '😐', '😫'];
  return (
    <div className={styles.meetingTolerance}>
      {options.map((emoji) => (
        <label
          key={emoji}
          className={[styles.radioPill, value === emoji ? styles.active : ''].filter(Boolean).join(' ')}
        >
          <input
            type="radio"
            name="meetingTolerance"
            value={emoji}
            checked={value === emoji}
            onChange={() => onChange(emoji)}
          />
          <span aria-label={t('fun.meetingTolerance.optionAria', { emoji })} role="img">
            {emoji}
          </span>
        </label>
      ))}
    </div>
  );
};

const EmojiPicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const { t } = useTranslation('resume');
  const emojis = ['😊', '🚀', '☕', '💡', '🎯', '🧠', '📝', '🎧', '🌈', '🔥', '✨'];
  return (
    <div className={styles.emojiPicker}>
      <input
        type="text"
        value={value}
        placeholder={t('fun.emojis.placeholder')}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className={styles.emojiGrid}>
        {emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(value ? `${value}${emoji}` : emoji)}
            aria-label={t('fun.emojis.addEmoji', { emoji })}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

const createEmptyStarEntry = (): StarEntry => ({
  situation: '',
  task: '',
  action: '',
  result: '',
});

const createEmptyExperience = (): WorkExperience => ({
  company: '',
  title: '',
  startDate: '',
  endDate: '',
  starEntries: [createEmptyStarEntry()],
});

const createEmptyEducation = (): Education => ({
  school: '',
  degree: '',
  year: '',
});

const createInitialFormData = (): FormData => ({
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    linkedin: '',
  },
  summary: '',
  experiences: [createEmptyExperience()],
  education: [createEmptyEducation()],
  skills: {
    technical: '',
    soft: '',
  },
  certifications: [''],
  fun: {
    haiku: ['', '', ''],
    spiritAnimal: '',
    superpower: '',
    survivalSkill: '',
    emojiDay: '',
    themeSong: '',
    workBff: '',
    meetingTolerance: '',
    snack: '',
    resumeSmell: '',
  },
});

const generateStarBullet = (entry: StarEntry, t: TFunction<'resume'>) => {
  const trimmedSituation = entry.situation.trim();
  const trimmedTask = entry.task.trim();
  const trimmedAction = entry.action.trim();
  const trimmedResult = entry.result.trim();

  const parts: string[] = [];

  if (trimmedSituation) {
    parts.push(t('preview.starBullet.context', { value: trimmedSituation }));
  }
  if (trimmedTask) {
    parts.push(t('preview.starBullet.task', { value: trimmedTask }));
  }
  if (trimmedAction) {
    parts.push(t('preview.starBullet.action', { value: trimmedAction }));
  }
  if (trimmedResult) {
    parts.push(t('preview.starBullet.result', { value: trimmedResult }));
  }

  return parts.join(` ${t('preview.starBullet.separator')} `);
};

const ResumePreview: React.FC<{ data: FormData; t: TFunction<'resume'> }> = ({ data, t }) => {
  const haikuFilled = data.fun.haiku.some((line) => line.trim());
  return (
    <div className={styles.preview}>
      <header className={styles.previewHeader}>
        <h1>{data.personalInfo.name || t('preview.fallbacks.name')}</h1>
        <div className={styles.previewContact}>
          {[data.personalInfo.email, data.personalInfo.phone, data.personalInfo.linkedin]
            .filter(Boolean)
            .map((item) => (
              <span key={item}>{item}</span>
            ))}
        </div>
      </header>
      {data.summary && (
        <section className={styles.previewSection}>
          <h2>{t('preview.sections.summary')}</h2>
          <p>{data.summary}</p>
        </section>
      )}

      <section className={styles.previewSection}>
        <h2>{t('preview.sections.experience')}</h2>
        {data.experiences.map((experience, index) => (
          <div key={`${experience.company}-${index}`} className={styles.previewItem}>
            <div className={styles.previewItemHeader}>
              <h3>{experience.title || t('preview.experience.roleFallback')}</h3>
              <span>{experience.company || t('preview.experience.companyFallback')}</span>
              <span className={styles.previewDates}>
                {[experience.startDate, experience.endDate].filter(Boolean).join(' – ') ||
                  t('preview.experience.datesFallback')}
              </span>
            </div>
            <ul>
              {experience.starEntries
                .map((entry) => generateStarBullet(entry, t))
                .filter(Boolean)
                .map((bullet, bulletIndex) => (
                  <li key={bulletIndex}>{bullet}</li>
                ))}
            </ul>
          </div>
        ))}
      </section>

      <section className={styles.previewSection}>
        <h2>{t('preview.sections.education')}</h2>
        {data.education.map((edu, index) => (
          <div key={`${edu.school}-${index}`} className={styles.previewItem}>
            <h3>{edu.school || t('preview.education.schoolFallback')}</h3>
            <p>{edu.degree || t('preview.education.degreeFallback')}</p>
            <span className={styles.previewDates}>{edu.year || t('preview.education.yearFallback')}</span>
          </div>
        ))}
      </section>

      <section className={styles.previewSection}>
        <h2>{t('preview.sections.skills')}</h2>
        <div className={styles.previewGrid}>
          <div>
            <h4>{t('preview.skills.technicalTitle')}</h4>
            <p>{data.skills.technical || t('preview.skills.technicalFallback')}</p>
          </div>
          <div>
            <h4>{t('preview.skills.softTitle')}</h4>
            <p>{data.skills.soft || t('preview.skills.softFallback')}</p>
          </div>
        </div>
      </section>

      {data.certifications.filter((cert) => cert.trim()).length > 0 && (
        <section className={styles.previewSection}>
          <h2>{t('preview.sections.certifications')}</h2>
          <ul>
            {data.certifications
              .filter((cert) => cert.trim())
              .map((certification, index) => (
                <li key={`${certification}-${index}`}>{certification}</li>
              ))}
          </ul>
        </section>
      )}

      <section className={styles.previewSection}>
        <h2>{t('preview.sections.fun')}</h2>
        <dl className={styles.previewList}>
          {haikuFilled && (
            <div>
              <dt>{t('preview.fun.haiku')}</dt>
              <dd>
                {data.fun.haiku.map((line, lineIndex) => (
                  <span key={lineIndex}>{line}</span>
                ))}
              </dd>
            </div>
          )}
          {data.fun.spiritAnimal && (
            <div>
              <dt>{t('preview.fun.spiritAnimal')}</dt>
              <dd>{data.fun.spiritAnimal}</dd>
            </div>
          )}
          {data.fun.superpower && (
            <div>
              <dt>{t('preview.fun.superpower')}</dt>
              <dd>{data.fun.superpower}</dd>
            </div>
          )}
          {data.fun.survivalSkill && (
            <div>
              <dt>{t('preview.fun.survivalSkill')}</dt>
              <dd>{data.fun.survivalSkill}</dd>
            </div>
          )}
          {data.fun.emojiDay && (
            <div>
              <dt>{t('preview.fun.emojiDay')}</dt>
              <dd>{data.fun.emojiDay}</dd>
            </div>
          )}
          {data.fun.themeSong && (
            <div>
              <dt>{t('preview.fun.themeSong')}</dt>
              <dd>{data.fun.themeSong}</dd>
            </div>
          )}
          {data.fun.workBff && (
            <div>
              <dt>{t('preview.fun.workBff')}</dt>
              <dd>{data.fun.workBff}</dd>
            </div>
          )}
          {data.fun.meetingTolerance && (
            <div>
              <dt>{t('preview.fun.meetingTolerance')}</dt>
              <dd>{data.fun.meetingTolerance}</dd>
            </div>
          )}
          {data.fun.snack && (
            <div>
              <dt>{t('preview.fun.snack')}</dt>
              <dd>{data.fun.snack}</dd>
            </div>
          )}
          {data.fun.resumeSmell && (
            <div>
              <dt>{t('preview.fun.resumeSmell')}</dt>
              <dd>{data.fun.resumeSmell}</dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  );
};

const ResumeBuilder = () => {
  const { t } = useTranslation('resume');
  const [formData, setFormData] = useState<FormData>(createInitialFormData);

  const summaryMaxLength = 450;

  const actionVerbOptions = useMemo(
    () =>
      ACTION_VERB_KEYS.map((key) => ({
        key,
        value: t(`actionVerbs.options.${key}`),
      })),
    [t],
  );

  const superpowerOptions = useMemo(
    () => SUPERPOWER_KEYS.map((key) => ({ key, value: t(`fun.superpowers.${key}`) })),
    [t],
  );

  const survivalSkillOptions = useMemo(
    () => SURVIVAL_SKILL_KEYS.map((key) => ({ key, value: t(`fun.survivalSkills.${key}`) })),
    [t],
  );

  const resumeScentOptions = useMemo(
    () => RESUME_SCENT_KEYS.map((key) => ({ key, value: t(`fun.resumeScents.${key}`) })),
    [t],
  );

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setFormData((previous) => ({
      ...previous,
      personalInfo: {
        ...previous.personalInfo,
        [field]: value,
      },
    }));
  };

  const updateSummary = (value: string) => {
    setFormData((previous) => ({
      ...previous,
      summary: value,
    }));
  };

  const updateExperience = <Field extends keyof WorkExperience>(
    index: number,
    field: Field,
    value: WorkExperience[Field],
  ) => {
    setFormData((previous) => {
      const experiences = [...previous.experiences];
      experiences[index] = {
        ...experiences[index],
        [field]: value,
      };
      return {
        ...previous,
        experiences,
      };
    });
  };

  const updateStarEntry = <Field extends keyof StarEntry>(
    experienceIndex: number,
    starIndex: number,
    field: Field,
    value: StarEntry[Field],
  ) => {
    setFormData((previous) => {
      const experiences = [...previous.experiences];
      const starEntries = [...experiences[experienceIndex].starEntries];
      starEntries[starIndex] = {
        ...starEntries[starIndex],
        [field]: value,
      };
      experiences[experienceIndex] = {
        ...experiences[experienceIndex],
        starEntries,
      };
      return {
        ...previous,
        experiences,
      };
    });
  };

  const insertVerbIntoAction = (experienceIndex: number, starIndex: number, verb: string) => {
    setFormData((previous) => {
      const experiences = [...previous.experiences];
      const starEntries = [...experiences[experienceIndex].starEntries];
      const currentAction = starEntries[starIndex].action;
      const actionValue =
        currentAction.trim().toLowerCase().startsWith(verb.toLowerCase())
          ? currentAction
          : `${verb} ${currentAction}`.trim();
      starEntries[starIndex] = {
        ...starEntries[starIndex],
        action: actionValue,
      };
      experiences[experienceIndex] = {
        ...experiences[experienceIndex],
        starEntries,
      };
      return {
        ...previous,
        experiences,
      };
    });
  };

  const addStarEntry = (experienceIndex: number) => {
    setFormData((previous) => {
      const experiences = [...previous.experiences];
      const starEntries = [...experiences[experienceIndex].starEntries, createEmptyStarEntry()];
      experiences[experienceIndex] = {
        ...experiences[experienceIndex],
        starEntries,
      };
      return {
        ...previous,
        experiences,
      };
    });
  };

  const removeStarEntry = (experienceIndex: number, starIndex: number) => {
    setFormData((previous) => {
      const experiences = [...previous.experiences];
      const starEntries = experiences[experienceIndex].starEntries.filter(
        (_, entryIndex) => entryIndex !== starIndex,
      );
      experiences[experienceIndex] = {
        ...experiences[experienceIndex],
        starEntries: starEntries.length > 0 ? starEntries : [createEmptyStarEntry()],
      };
      return {
        ...previous,
        experiences,
      };
    });
  };

  const addExperience = () => {
    setFormData((previous) => ({
      ...previous,
      experiences: [...previous.experiences, createEmptyExperience()],
    }));
  };

  const removeExperience = (index: number) => {
    setFormData((previous) => {
      const experiences = previous.experiences.filter((_, experienceIndex) => experienceIndex !== index);
      return {
        ...previous,
        experiences: experiences.length > 0 ? experiences : [createEmptyExperience()],
      };
    });
  };

  const updateEducation = <Field extends keyof Education>(
    index: number,
    field: Field,
    value: Education[Field],
  ) => {
    setFormData((previous) => {
      const education = [...previous.education];
      education[index] = {
        ...education[index],
        [field]: value,
      };
      return {
        ...previous,
        education,
      };
    });
  };

  const addEducation = () => {
    setFormData((previous) => ({
      ...previous,
      education: [...previous.education, createEmptyEducation()],
    }));
  };

  const removeEducation = (index: number) => {
    setFormData((previous) => {
      const education = previous.education.filter((_, educationIndex) => educationIndex !== index);
      return {
        ...previous,
        education: education.length > 0 ? education : [createEmptyEducation()],
      };
    });
  };

  const updateSkills = (field: keyof Skills, value: string) => {
    setFormData((previous) => ({
      ...previous,
      skills: {
        ...previous.skills,
        [field]: value,
      },
    }));
  };

  const updateCertification = (index: number, value: string) => {
    setFormData((previous) => {
      const certifications = [...previous.certifications];
      certifications[index] = value;
      return {
        ...previous,
        certifications,
      };
    });
  };

  const addCertification = () => {
    setFormData((previous) => ({
      ...previous,
      certifications: [...previous.certifications, ''],
    }));
  };

  const removeCertification = (index: number) => {
    setFormData((previous) => {
      const certifications = previous.certifications.filter((_, certIndex) => certIndex !== index);
      return {
        ...previous,
        certifications: certifications.length > 0 ? certifications : [''],
      };
    });
  };

  const updateFunField = <Field extends keyof FunFields>(
    field: Field,
    value: FunFields[Field],
  ) => {
    setFormData((previous) => ({
      ...previous,
      fun: {
        ...previous.fun,
        [field]: value,
      },
    }));
  };

  const updateHaikuLine = (lineIndex: number, value: string) => {
    setFormData((previous) => {
      const haiku = [...previous.fun.haiku] as FunFields['haiku'];
      haiku[lineIndex] = value;
      return {
        ...previous,
        fun: {
          ...previous.fun,
          haiku,
        },
      };
    });
  };

  const stats = useMemo(() => {
    const totalBullets = formData.experiences.reduce(
      (count, experience) =>
        count +
        experience.starEntries.filter(
          (entry) => entry.action.trim() && entry.result.trim(),
        ).length,
      0,
    );
    return {
      totalBullets,
      summaryRemaining: summaryMaxLength - formData.summary.length,
    };
  }, [formData.experiences, formData.summary, summaryMaxLength]);

  return (
    <div className={styles.resumeBuilderPage}>
      <div className={styles.layout}>
        <div className={styles.formColumn}>
          <header className={styles.pageHeader}>
            <h1>{t('title')}</h1>
            <p>{t('description')}</p>
            <div className={styles.stats}>
              <span>
                {t('stats.summaryRemaining')} <strong>{stats.summaryRemaining}</strong>
              </span>
              <span>
                {t('stats.starCount')} <strong>{stats.totalBullets}</strong>
              </span>
            </div>
          </header>

          <SectionCard
            title={t('sections.personalInfo.title')}
            description={t('sections.personalInfo.description')}
          >
            <div className={styles.gridTwo}>
              <TextInput
                id="name"
                label={t('sections.personalInfo.fields.name.label')}
                value={formData.personalInfo.name}
                onChange={(value) => updatePersonalInfo('name', value)}
                helperText={t('sections.personalInfo.fields.name.helper')}
              />
              <TextInput
                id="email"
                label={t('sections.personalInfo.fields.email.label')}
                type="email"
                value={formData.personalInfo.email}
                onChange={(value) => updatePersonalInfo('email', value)}
              />
            </div>
            <div className={styles.gridTwo}>
              <TextInput
                id="phone"
                label={t('sections.personalInfo.fields.phone.label')}
                type="tel"
                value={formData.personalInfo.phone}
                onChange={(value) => updatePersonalInfo('phone', value)}
              />
              <TextInput
                id="linkedin"
                label={t('sections.personalInfo.fields.linkedin.label')}
                value={formData.personalInfo.linkedin}
                onChange={(value) => updatePersonalInfo('linkedin', value)}
                placeholder={t('sections.personalInfo.fields.linkedin.placeholder')}
              />
            </div>
          </SectionCard>

          <SectionCard
            title={t('sections.summary.title')}
            description={t('sections.summary.description')}
            accent="secondary"
          >
            <CharacterCountTextarea
              id="summary"
              label={t('sections.summary.fields.summary.label')}
              value={formData.summary}
              onChange={updateSummary}
              maxLength={summaryMaxLength}
              helperText={t('sections.summary.fields.summary.helper')}
              placeholder={t('sections.summary.fields.summary.placeholder')}
            />
          </SectionCard>

          <SectionCard
            title={t('sections.experience.title')}
            description={t('sections.experience.description')}
          >
            <StarTooltip />
            {formData.experiences.map((experience, experienceIndex) => (
              <div key={`experience-${experienceIndex}`} className={styles.groupCard}>
                <div className={styles.sectionRow}>
                  <h3>{t('sections.experience.roleHeading', { index: experienceIndex + 1 })}</h3>
                  <Button
                    type="button"
                    size="small"
                    variant="text"
                    onClick={() => removeExperience(experienceIndex)}
                    disabled={formData.experiences.length === 1}
                  >
                    {t('sections.experience.actions.removeRole')}
                  </Button>
                </div>

                <div className={styles.gridTwo}>
                  <TextInput
                    id={`company-${experienceIndex}`}
                    label={t('sections.experience.fields.company.label')}
                    value={experience.company}
                    onChange={(value) => updateExperience(experienceIndex, 'company', value)}
                  />
                  <TextInput
                    id={`title-${experienceIndex}`}
                    label={t('sections.experience.fields.title.label')}
                    value={experience.title}
                    onChange={(value) => updateExperience(experienceIndex, 'title', value)}
                    helperText={t('sections.experience.fields.title.helper')}
                  />
                </div>
                <div className={styles.gridTwo}>
                  <TextInput
                    id={`start-${experienceIndex}`}
                    label={t('sections.experience.fields.startDate.label')}
                    value={experience.startDate}
                    onChange={(value) => updateExperience(experienceIndex, 'startDate', value)}
                    placeholder={t('sections.experience.fields.startDate.placeholder')}
                  />
                  <TextInput
                    id={`end-${experienceIndex}`}
                    label={t('sections.experience.fields.endDate.label')}
                    value={experience.endDate}
                    onChange={(value) => updateExperience(experienceIndex, 'endDate', value)}
                    placeholder={t('sections.experience.fields.endDate.placeholder')}
                  />
                </div>

                {experience.starEntries.map((entry, starIndex) => (
                  <div key={`star-${experienceIndex}-${starIndex}`} className={styles.starGroup}>
                    <div className={styles.sectionRow}>
                      <h4>{t('sections.experience.star.heading', { index: starIndex + 1 })}</h4>
                      <Button
                        type="button"
                        size="small"
                        variant="text"
                        onClick={() => removeStarEntry(experienceIndex, starIndex)}
                        disabled={experience.starEntries.length === 1}
                      >
                        {t('sections.experience.star.remove')}
                      </Button>
                    </div>
                    <TextInput
                      id={`situation-${experienceIndex}-${starIndex}`}
                      label={t('sections.experience.star.fields.situation.label')}
                      value={entry.situation}
                      onChange={(value) => updateStarEntry(experienceIndex, starIndex, 'situation', value)}
                      helperText={t('sections.experience.star.fields.situation.helper')}
                    />
                    <TextInput
                      id={`task-${experienceIndex}-${starIndex}`}
                      label={t('sections.experience.star.fields.task.label')}
                      value={entry.task}
                      onChange={(value) => updateStarEntry(experienceIndex, starIndex, 'task', value)}
                      helperText={t('sections.experience.star.fields.task.helper')}
                    />
                    <CharacterCountTextarea
                      id={`action-${experienceIndex}-${starIndex}`}
                      label={t('sections.experience.star.fields.action.label')}
                      value={entry.action}
                      onChange={(value) => updateStarEntry(experienceIndex, starIndex, 'action', value)}
                      maxLength={220}
                      helperText={t('sections.experience.star.fields.action.helper')}
                      placeholder={t('sections.experience.star.fields.action.placeholder')}
                    />
                    <ActionVerbSelector
                      options={actionVerbOptions}
                      onAdd={(verb) => insertVerbIntoAction(experienceIndex, starIndex, verb)}
                    />
                    <CharacterCountTextarea
                      id={`result-${experienceIndex}-${starIndex}`}
                      label={t('sections.experience.star.fields.result.label')}
                      value={entry.result}
                      onChange={(value) => updateStarEntry(experienceIndex, starIndex, 'result', value)}
                      maxLength={200}
                      helperText={t('sections.experience.star.fields.result.helper')}
                      placeholder={t('sections.experience.star.fields.result.placeholder')}
                    />
                  </div>
                ))}
                <Button type="button" size="small" onClick={() => addStarEntry(experienceIndex)}>
                  {t('sections.experience.actions.addStar')}
                </Button>
              </div>
            ))}
            <Button type="button" onClick={addExperience}>
              {t('sections.experience.actions.addRole')}
            </Button>
          </SectionCard>

          <SectionCard
            title={t('sections.education.title')}
            description={t('sections.education.description')}
          >
            {formData.education.map((education, educationIndex) => (
              <div key={`education-${educationIndex}`} className={styles.groupCard}>
                <div className={styles.sectionRow}>
                  <h3>{t('sections.education.programHeading', { index: educationIndex + 1 })}</h3>
                  <Button
                    type="button"
                    size="small"
                    variant="text"
                    onClick={() => removeEducation(educationIndex)}
                    disabled={formData.education.length === 1}
                  >
                    {t('sections.education.actions.remove')}
                  </Button>
                </div>
                <TextInput
                  id={`school-${educationIndex}`}
                  label={t('sections.education.fields.school.label')}
                  value={education.school}
                  onChange={(value) => updateEducation(educationIndex, 'school', value)}
                />
                <TextInput
                  id={`degree-${educationIndex}`}
                  label={t('sections.education.fields.degree.label')}
                  value={education.degree}
                  onChange={(value) => updateEducation(educationIndex, 'degree', value)}
                />
                <TextInput
                  id={`year-${educationIndex}`}
                  label={t('sections.education.fields.year.label')}
                  value={education.year}
                  onChange={(value) => updateEducation(educationIndex, 'year', value)}
                />
              </div>
            ))}
            <Button type="button" onClick={addEducation}>
              {t('sections.education.actions.add')}
            </Button>
          </SectionCard>

          <SectionCard
            title={t('sections.skills.title')}
            description={t('sections.skills.description')}
          >
            <div className={styles.gridTwo}>
              <CharacterCountTextarea
                id="technical-skills"
                label={t('sections.skills.fields.technical.label')}
                value={formData.skills.technical}
                onChange={(value) => updateSkills('technical', value)}
                maxLength={250}
                helperText={t('sections.skills.fields.technical.helper')}
                placeholder={t('sections.skills.fields.technical.placeholder')}
              />
              <CharacterCountTextarea
                id="soft-skills"
                label={t('sections.skills.fields.soft.label')}
                value={formData.skills.soft}
                onChange={(value) => updateSkills('soft', value)}
                maxLength={250}
                helperText={t('sections.skills.fields.soft.helper')}
                placeholder={t('sections.skills.fields.soft.placeholder')}
              />
            </div>
            <div className={styles.certifications}>
              <h3>{t('sections.skills.certifications.title')}</h3>
              {formData.certifications.map((certification, certificationIndex) => (
                <div key={`cert-${certificationIndex}`} className={styles.certRow}>
                  <input
                    type="text"
                    value={certification}
                    placeholder={t('sections.skills.certifications.placeholder')}
                    onChange={(event) => updateCertification(certificationIndex, event.target.value)}
                  />
                  <Button
                    type="button"
                    size="small"
                    variant="text"
                    onClick={() => removeCertification(certificationIndex)}
                    disabled={formData.certifications.length === 1}
                  >
                    {t('sections.skills.certifications.remove')}
                  </Button>
                </div>
              ))}
              <Button type="button" size="small" onClick={addCertification}>
                {t('sections.skills.certifications.add')}
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            title={t('sections.fun.title')}
            description={t('sections.fun.description')}
            accent="secondary"
          >
            <div className={styles.gridTwo}>
              <div className={styles.haiku}>
                <h3>{t('fun.haiku.title')}</h3>
                <p>{t('fun.haiku.helper')}</p>
                {formData.fun.haiku.map((line, lineIndex) => (
                  <input
                    key={`haiku-${lineIndex}`}
                    type="text"
                    value={line}
                    placeholder={t('fun.haiku.placeholder', { index: lineIndex + 1 })}
                    maxLength={60}
                    onChange={(event) => updateHaikuLine(lineIndex, event.target.value)}
                  />
                ))}
              </div>
              <div className={styles.spiritAnimal}>
                <TextInput
                  id="spirit-animal"
                  label={t('fun.spiritAnimal.label')}
                  value={formData.fun.spiritAnimal}
                  onChange={(value) => updateFunField('spiritAnimal', value)}
                  helperText={t('fun.spiritAnimal.helper')}
                />
                <div className={styles.selectField}>
                  <label htmlFor="superpower">{t('fun.superpowers.label')}</label>
                  <select
                    id="superpower"
                    value={formData.fun.superpower}
                    onChange={(event) => updateFunField('superpower', event.target.value)}
                  >
                    <option value="">{t('fun.superpowers.placeholder')}</option>
                    {superpowerOptions.map((option) => (
                      <option key={option.key} value={option.value}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.selectField}>
                  <label htmlFor="survival-skill">{t('fun.survivalSkills.label')}</label>
                  <select
                    id="survival-skill"
                    value={formData.fun.survivalSkill}
                    onChange={(event) => updateFunField('survivalSkill', event.target.value)}
                  >
                    <option value="">{t('fun.survivalSkills.placeholder')}</option>
                    {survivalSkillOptions.map((option) => (
                      <option key={option.key} value={option.value}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.gridTwo}>
              <div>
                <label htmlFor="emoji-day">{t('fun.emojis.label')}</label>
                <EmojiPicker
                  value={formData.fun.emojiDay}
                  onChange={(value) => updateFunField('emojiDay', value)}
                />
              </div>
              <div>
                <TextInput
                  id="theme-song"
                  label={t('fun.themeSong.label')}
                  value={formData.fun.themeSong}
                  onChange={(value) => updateFunField('themeSong', value)}
                />
              </div>
            </div>
            <div className={styles.gridTwo}>
              <TextInput
                id="work-bff"
                label={t('fun.workBff.label')}
                value={formData.fun.workBff}
                onChange={(value) => updateFunField('workBff', value)}
              />
              <div className={styles.meetingToleranceField}>
                <label>{t('fun.meetingTolerance.label')}</label>
                <MeetingToleranceSelector
                  value={formData.fun.meetingTolerance}
                  onChange={(value) => updateFunField('meetingTolerance', value)}
                />
              </div>
            </div>
            <div className={styles.gridTwo}>
              <TextInput
                id="snack"
                label={t('fun.snack.label')}
                value={formData.fun.snack}
                onChange={(value) => updateFunField('snack', value)}
              />
              <div className={styles.selectField}>
                <label htmlFor="resume-smell">{t('fun.resumeScent.label')}</label>
                <select
                  id="resume-smell"
                  value={formData.fun.resumeSmell}
                  onChange={(event) => updateFunField('resumeSmell', event.target.value)}
                >
                  <option value="">{t('fun.resumeScent.placeholder')}</option>
                  {resumeScentOptions.map((option) => (
                    <option key={option.key} value={option.value}>
                      {option.value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </SectionCard>

          <div className={styles.actions}>
            <Button type="button" onClick={() => window.print()}>
              {t('actions.downloadPdf')}
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={() => setFormData(createInitialFormData())}
            >
              {t('actions.reset')}
            </Button>
          </div>
        </div>

        <div className={styles.previewColumn}>
          <ResumePreview data={formData} t={t} />
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;


