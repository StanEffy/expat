import { useMemo, useState } from 'react';
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

const ACTION_VERBS = [
  'Led',
  'Developed',
  'Implemented',
  'Optimized',
  'Spearheaded',
  'Accelerated',
  'Transformed',
  'Orchestrated',
  'Delivered',
  'Championed',
  'Streamlined',
  'Pioneered',
  'Elevated',
  'Engineered',
  'Negotiated',
];

const SUPERPOWERS = [
  'Telepathic Communicator',
  'Deadline Vanisher',
  'Coffee-powered Machine',
  'Spreadsheet Sorcerer',
  'Stakeholder Whisperer',
];

const SURVIVAL_SKILLS = [
  'Microwave timing ninja',
  'Printer whisperer',
  'Conference call escape artist',
  'Snack stash curator',
  'Meeting agenda conjurer',
];

const RESUME_SCENTS = [
  'Freshly signed contract',
  'Monday morning espresso',
  'Polished boardroom oak',
  'Startup whiteboard marker',
  'Deadline adrenaline (limited edition)',
];

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

const StarTooltip: React.FC = () => (
  <div className={styles.starTooltip} role="note">
    <span className={styles.tooltipLabel}>Need a STAR refresher?</span>
    <ul>
      <li>
        <strong>S</strong>ituation – Set the scene with concise context.
      </li>
      <li>
        <strong>T</strong>ask – Clarify the mission or challenge.
      </li>
      <li>
        <strong>A</strong>ction – Lead with action verbs to describe your moves.
      </li>
      <li>
        <strong>R</strong>esult – Quantify the win or impact.
      </li>
    </ul>
    <p>Bonus: sprinkle humor responsibly—HR appreciates memorable professionalism.</p>
  </div>
);

const ActionVerbSelector: React.FC<{
  onAdd: (verb: string) => void;
}> = ({ onAdd }) => {
  const [selectedVerb, setSelectedVerb] = useState('');

  return (
    <div className={styles.actionVerbSelector}>
      <label htmlFor="action-verb-selector">Action Verb Suggestions</label>
      <div className={styles.actionVerbControls}>
        <select
          id="action-verb-selector"
          value={selectedVerb}
          onChange={(event) => setSelectedVerb(event.target.value)}
        >
          <option value="">Select a powerful verb</option>
          {ACTION_VERBS.map((verb) => (
            <option key={verb} value={verb}>
              {verb}
            </option>
          ))}
        </select>
        <Button
          type="button"
          size="small"
          onClick={() => {
            if (selectedVerb) {
              onAdd(selectedVerb);
            }
          }}
        >
          Insert verb
        </Button>
      </div>
      <p className={styles.helperText}>Start your action statement with one of these to stay bold.</p>
    </div>
  );
};

const MeetingToleranceSelector: React.FC<{
  value: FunFields['meetingTolerance'];
  onChange: (value: FunFields['meetingTolerance']) => void;
}> = ({ value, onChange }) => {
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
          <span aria-label={`Meeting tolerance ${emoji}`} role="img">
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
  const emojis = ['😊', '🚀', '☕', '💡', '🎯', '🧠', '📝', '🎧', '🌈', '🔥', '✨'];
  return (
    <div className={styles.emojiPicker}>
      <input
        type="text"
        value={value}
        placeholder="Pick or type emojis"
        onChange={(event) => onChange(event.target.value)}
      />
      <div className={styles.emojiGrid}>
        {emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(value ? `${value}${emoji}` : emoji)}
            aria-label={`Add ${emoji}`}
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

const generateStarBullet = (entry: StarEntry) => {
  const trimmedSituation = entry.situation.trim();
  const trimmedTask = entry.task.trim();
  const trimmedAction = entry.action.trim();
  const trimmedResult = entry.result.trim();

  const parts: string[] = [];

  if (trimmedSituation) {
    parts.push(`Context: ${trimmedSituation}`);
  }
  if (trimmedTask) {
    parts.push(`Mission: ${trimmedTask}`);
  }
  if (trimmedAction) {
    parts.push(`Action: ${trimmedAction}`);
  }
  if (trimmedResult) {
    parts.push(`Result: ${trimmedResult}`);
  }

  return parts.join(' • ');
};

const ResumePreview: React.FC<{ data: FormData }> = ({ data }) => {
  const haikuFilled = data.fun.haiku.some((line) => line.trim());
  return (
    <div className={styles.preview}>
      <header className={styles.previewHeader}>
        <h1>{data.personalInfo.name || 'Your Name, Action Verb Extraordinaire'}</h1>
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
          <h2>Professional Summary</h2>
          <p>{data.summary}</p>
        </section>
      )}

      <section className={styles.previewSection}>
        <h2>Work Experience</h2>
        {data.experiences.map((experience, index) => (
          <div key={`${experience.company}-${index}`} className={styles.previewItem}>
            <div className={styles.previewItemHeader}>
              <h3>{experience.title || 'Role Title'}</h3>
              <span>{experience.company || 'Company Name'}</span>
              <span className={styles.previewDates}>
                {[experience.startDate, experience.endDate].filter(Boolean).join(' – ') ||
                  'Dates TBD'}
              </span>
            </div>
            <ul>
              {experience.starEntries
                .map(generateStarBullet)
                .filter(Boolean)
                .map((bullet, bulletIndex) => (
                  <li key={bulletIndex}>{bullet}</li>
                ))}
            </ul>
          </div>
        ))}
      </section>

      <section className={styles.previewSection}>
        <h2>Education</h2>
        {data.education.map((edu, index) => (
          <div key={`${edu.school}-${index}`} className={styles.previewItem}>
            <h3>{edu.school || 'Institution'}</h3>
            <p>{edu.degree || 'Degree & Discipline'}</p>
            <span className={styles.previewDates}>{edu.year || 'Year'}</span>
          </div>
        ))}
      </section>

      <section className={styles.previewSection}>
        <h2>Skills</h2>
        <div className={styles.previewGrid}>
          <div>
            <h4>Technical</h4>
            <p>{data.skills.technical || 'API integration, TypeScript wizardry, dashboard conjuring'}</p>
          </div>
          <div>
            <h4>Soft</h4>
            <p>{data.skills.soft || 'Team synergy sculptor, conflict diffuser, agenda architect'}</p>
          </div>
        </div>
      </section>

      {data.certifications.filter((cert) => cert.trim()).length > 0 && (
        <section className={styles.previewSection}>
          <h2>Certifications</h2>
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
        <h2>Professional Personality (Tastefully Humorous)</h2>
        <dl className={styles.previewList}>
          {haikuFilled && (
            <div>
              <dt>Career Haiku</dt>
              <dd>
                {data.fun.haiku.map((line, lineIndex) => (
                  <span key={lineIndex}>{line}</span>
                ))}
              </dd>
            </div>
          )}
          {data.fun.spiritAnimal && (
            <div>
              <dt>Spirit Animal at Work</dt>
              <dd>{data.fun.spiritAnimal}</dd>
            </div>
          )}
          {data.fun.superpower && (
            <div>
              <dt>Work Style Superpower</dt>
              <dd>{data.fun.superpower}</dd>
            </div>
          )}
          {data.fun.survivalSkill && (
            <div>
              <dt>Office Survival Skill</dt>
              <dd>{data.fun.survivalSkill}</dd>
            </div>
          )}
          {data.fun.emojiDay && (
            <div>
              <dt>Ideal Workday (Emoji Edition)</dt>
              <dd>{data.fun.emojiDay}</dd>
            </div>
          )}
          {data.fun.themeSong && (
            <div>
              <dt>Productivity Anthem</dt>
              <dd>{data.fun.themeSong}</dd>
            </div>
          )}
          {data.fun.workBff && (
            <div>
              <dt>Fictional Work BFF</dt>
              <dd>{data.fun.workBff}</dd>
            </div>
          )}
          {data.fun.meetingTolerance && (
            <div>
              <dt>Meeting Tolerance</dt>
              <dd>{data.fun.meetingTolerance}</dd>
            </div>
          )}
          {data.fun.snack && (
            <div>
              <dt>Go-to Crunch Time Snack</dt>
              <dd>{data.fun.snack}</dd>
            </div>
          )}
          {data.fun.resumeSmell && (
            <div>
              <dt>Signature Resume Scent</dt>
              <dd>{data.fun.resumeSmell}</dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  );
};

const ResumeBuilder = () => {
  const [formData, setFormData] = useState<FormData>(createInitialFormData);

  const summaryMaxLength = 450;

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
            <h1>STAR-Powered Resume Builder</h1>
            <p>
              Craft an accomplishment-rich resume that stays professional, fits on a single page, and
              still lets your personality shine. Real-time preview included, compliments HR-approved.
            </p>
            <div className={styles.stats}>
              <span>
                Summary characters remaining: <strong>{stats.summaryRemaining}</strong>
              </span>
              <span>
                STAR accomplishments prepped: <strong>{stats.totalBullets}</strong>
              </span>
            </div>
          </header>

          <SectionCard title="Personal Info" description="Start with the essentials so recruiters can call immediately.">
            <div className={styles.gridTwo}>
              <TextInput
                id="name"
                label="Full Name"
                value={formData.personalInfo.name}
                onChange={(value) => updatePersonalInfo('name', value)}
                helperText="Name it and claim it. This anchors your STAR stories."
              />
              <TextInput
                id="email"
                label="Email"
                type="email"
                value={formData.personalInfo.email}
                onChange={(value) => updatePersonalInfo('email', value)}
              />
            </div>
            <div className={styles.gridTwo}>
              <TextInput
                id="phone"
                label="Phone"
                type="tel"
                value={formData.personalInfo.phone}
                onChange={(value) => updatePersonalInfo('phone', value)}
              />
              <TextInput
                id="linkedin"
                label="LinkedIn"
                value={formData.personalInfo.linkedin}
                onChange={(value) => updatePersonalInfo('linkedin', value)}
                placeholder="https://linkedin.com/in/high-impact-pro"
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Professional Summary"
            description="Give the quick pitch—who you are, what you deliver, and how you make teams better."
            accent="secondary"
          >
            <CharacterCountTextarea
              id="summary"
              label="Summary"
              value={formData.summary}
              onChange={updateSummary}
              maxLength={summaryMaxLength}
              helperText="Lead with action verbs and quantify your impact. Example: 'Implemented onboarding system that cut ramp-up time by 30%.'"
              placeholder="Implemented..."
            />
          </SectionCard>

          <SectionCard
            title="Work Experience"
            description="Use STAR stories to keep every bullet focused and impactful."
          >
            <StarTooltip />
            {formData.experiences.map((experience, experienceIndex) => (
              <div key={`experience-${experienceIndex}`} className={styles.groupCard}>
                <div className={styles.sectionRow}>
                  <h3>Role #{experienceIndex + 1}</h3>
                  <Button
                    type="button"
                    size="small"
                    variant="text"
                    onClick={() => removeExperience(experienceIndex)}
                    disabled={formData.experiences.length === 1}
                  >
                    Remove role
                  </Button>
                </div>

                <div className={styles.gridTwo}>
                  <TextInput
                    id={`company-${experienceIndex}`}
                    label="Company"
                    value={experience.company}
                    onChange={(value) => updateExperience(experienceIndex, 'company', value)}
                  />
                  <TextInput
                    id={`title-${experienceIndex}`}
                    label="Title"
                    value={experience.title}
                    onChange={(value) => updateExperience(experienceIndex, 'title', value)}
                    helperText="Actionable titles help: 'Senior Product Manager' beats 'Business Person'."
                  />
                </div>
                <div className={styles.gridTwo}>
                  <TextInput
                    id={`start-${experienceIndex}`}
                    label="Start Date"
                    value={experience.startDate}
                    onChange={(value) => updateExperience(experienceIndex, 'startDate', value)}
                    placeholder="Jan 2022"
                  />
                  <TextInput
                    id={`end-${experienceIndex}`}
                    label="End Date"
                    value={experience.endDate}
                    onChange={(value) => updateExperience(experienceIndex, 'endDate', value)}
                    placeholder="Present"
                  />
                </div>

                {experience.starEntries.map((entry, starIndex) => (
                  <div key={`star-${experienceIndex}-${starIndex}`} className={styles.starGroup}>
                    <div className={styles.sectionRow}>
                      <h4>STAR Accomplishment #{starIndex + 1}</h4>
                      <Button
                        type="button"
                        size="small"
                        variant="text"
                        onClick={() => removeStarEntry(experienceIndex, starIndex)}
                        disabled={experience.starEntries.length === 1}
                      >
                        Remove STAR
                      </Button>
                    </div>
                    <TextInput
                      id={`situation-${experienceIndex}-${starIndex}`}
                      label="Situation"
                      value={entry.situation}
                      onChange={(value) => updateStarEntry(experienceIndex, starIndex, 'situation', value)}
                      helperText="Set the stage in one sentence."
                    />
                    <TextInput
                      id={`task-${experienceIndex}-${starIndex}`}
                      label="Task"
                      value={entry.task}
                      onChange={(value) => updateStarEntry(experienceIndex, starIndex, 'task', value)}
                      helperText="Keep it clear: what needed to happen?"
                    />
                    <CharacterCountTextarea
                      id={`action-${experienceIndex}-${starIndex}`}
                      label="Action"
                      value={entry.action}
                      onChange={(value) => updateStarEntry(experienceIndex, starIndex, 'action', value)}
                      maxLength={220}
                      helperText="Begin with an action verb and show how you moved the mission forward."
                      placeholder="Led cross-functional..."
                    />
                    <ActionVerbSelector
                      onAdd={(verb) => insertVerbIntoAction(experienceIndex, starIndex, verb)}
                    />
                    <CharacterCountTextarea
                      id={`result-${experienceIndex}-${starIndex}`}
                      label="Result"
                      value={entry.result}
                      onChange={(value) => updateStarEntry(experienceIndex, starIndex, 'result', value)}
                      maxLength={200}
                      helperText="Quantify it if possible. Employers love impressive numbers."
                      placeholder="Increased customer retention by 28%."
                    />
                  </div>
                ))}
                <Button type="button" size="small" onClick={() => addStarEntry(experienceIndex)}>
                  Add another STAR story
                </Button>
              </div>
            ))}
            <Button type="button" onClick={addExperience}>
              Add another role
            </Button>
          </SectionCard>

          <SectionCard
            title="Education"
            description="Only the highlight reel: degrees, certifications, standout programs."
          >
            {formData.education.map((education, educationIndex) => (
              <div key={`education-${educationIndex}`} className={styles.groupCard}>
                <div className={styles.sectionRow}>
                  <h3>Program #{educationIndex + 1}</h3>
                  <Button
                    type="button"
                    size="small"
                    variant="text"
                    onClick={() => removeEducation(educationIndex)}
                    disabled={formData.education.length === 1}
                  >
                    Remove program
                  </Button>
                </div>
                <TextInput
                  id={`school-${educationIndex}`}
                  label="School"
                  value={education.school}
                  onChange={(value) => updateEducation(educationIndex, 'school', value)}
                />
                <TextInput
                  id={`degree-${educationIndex}`}
                  label="Degree"
                  value={education.degree}
                  onChange={(value) => updateEducation(educationIndex, 'degree', value)}
                />
                <TextInput
                  id={`year-${educationIndex}`}
                  label="Graduation Year"
                  value={education.year}
                  onChange={(value) => updateEducation(educationIndex, 'year', value)}
                />
              </div>
            ))}
            <Button type="button" onClick={addEducation}>
              Add another education entry
            </Button>
          </SectionCard>

          <SectionCard
            title="Skills & Certifications"
            description="Group skills smartly and keep certifications relevant."
          >
            <div className={styles.gridTwo}>
              <CharacterCountTextarea
                id="technical-skills"
                label="Technical Skills"
                value={formData.skills.technical}
                onChange={(value) => updateSkills('technical', value)}
                maxLength={250}
                helperText="Separate with commas to keep it scannable."
                placeholder="TypeScript, React, GraphQL..."
              />
              <CharacterCountTextarea
                id="soft-skills"
                label="Soft Skills"
                value={formData.skills.soft}
                onChange={(value) => updateSkills('soft', value)}
                maxLength={250}
                helperText="Think leadership, communication, collaboration."
                placeholder="Mentorship, conflict resolution..."
              />
            </div>
            <div className={styles.certifications}>
              <h3>Certifications</h3>
              {formData.certifications.map((certification, certificationIndex) => (
                <div key={`cert-${certificationIndex}`} className={styles.certRow}>
                  <input
                    type="text"
                    value={certification}
                    placeholder="e.g. PMP, AWS Solutions Architect"
                    onChange={(event) => updateCertification(certificationIndex, event.target.value)}
                  />
                  <Button
                    type="button"
                    size="small"
                    variant="text"
                    onClick={() => removeCertification(certificationIndex)}
                    disabled={formData.certifications.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" size="small" onClick={addCertification}>
                Add certification
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            title="Tasteful Humor Zone"
            description="Show culture fit without scaring anyone. Keep it clever, keep it classy."
            accent="secondary"
          >
            <div className={styles.gridTwo}>
              <div className={styles.haiku}>
                <h3>Career Haiku</h3>
                <p>5-7-5 structure encouraged. The syllable police are mostly friendly.</p>
                {formData.fun.haiku.map((line, lineIndex) => (
                  <input
                    key={`haiku-${lineIndex}`}
                    type="text"
                    value={line}
                    placeholder={`Line ${lineIndex + 1}`}
                    maxLength={60}
                    onChange={(event) => updateHaikuLine(lineIndex, event.target.value)}
                  />
                ))}
              </div>
              <div className={styles.spiritAnimal}>
                <TextInput
                  id="spirit-animal"
                  label="Workplace Spirit Animal"
                  value={formData.fun.spiritAnimal}
                  onChange={(value) => updateFunField('spiritAnimal', value)}
                  helperText="e.g. 'Strategic Owl: sees the roadmap and brings snacks.'"
                />
                <div className={styles.selectField}>
                  <label htmlFor="superpower">Work Style Superpower</label>
                  <select
                    id="superpower"
                    value={formData.fun.superpower}
                    onChange={(event) => updateFunField('superpower', event.target.value)}
                  >
                    <option value="">Choose your mighty trait</option>
                    {SUPERPOWERS.map((power) => (
                      <option key={power} value={power}>
                        {power}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.selectField}>
                  <label htmlFor="survival-skill">Office Survival Skill</label>
                  <select
                    id="survival-skill"
                    value={formData.fun.survivalSkill}
                    onChange={(event) => updateFunField('survivalSkill', event.target.value)}
                  >
                    <option value="">Select your secret talent</option>
                    {SURVIVAL_SKILLS.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.gridTwo}>
              <div>
                <label htmlFor="emoji-day">Describe your ideal workday in emojis</label>
                <EmojiPicker
                  value={formData.fun.emojiDay}
                  onChange={(value) => updateFunField('emojiDay', value)}
                />
              </div>
              <div>
                <TextInput
                  id="theme-song"
                  label="Productivity Theme Song 🎵"
                  value={formData.fun.themeSong}
                  onChange={(value) => updateFunField('themeSong', value)}
                />
              </div>
            </div>
            <div className={styles.gridTwo}>
              <TextInput
                id="work-bff"
                label="Fictional Work BFF"
                value={formData.fun.workBff}
                onChange={(value) => updateFunField('workBff', value)}
              />
              <div className={styles.meetingToleranceField}>
                <label>Meeting Tolerance</label>
                <MeetingToleranceSelector
                  value={formData.fun.meetingTolerance}
                  onChange={(value) => updateFunField('meetingTolerance', value)}
                />
              </div>
            </div>
            <div className={styles.gridTwo}>
              <TextInput
                id="snack"
                label="Go-to Crunch Time Snack"
                value={formData.fun.snack}
                onChange={(value) => updateFunField('snack', value)}
              />
              <div className={styles.selectField}>
                <label htmlFor="resume-smell">If this resume had a scent...</label>
                <select
                  id="resume-smell"
                  value={formData.fun.resumeSmell}
                  onChange={(event) => updateFunField('resumeSmell', event.target.value)}
                >
                  <option value="">Select a signature aroma</option>
                  {RESUME_SCENTS.map((scent) => (
                    <option key={scent} value={scent}>
                      {scent}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </SectionCard>

          <div className={styles.actions}>
            <Button type="button" onClick={() => window.print()}>
              Download as PDF
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={() => setFormData(createInitialFormData())}
            >
              Reset builder
            </Button>
          </div>
        </div>

        <div className={styles.previewColumn}>
          <ResumePreview data={formData} />
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;


