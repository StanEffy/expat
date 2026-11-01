/**
 * "My deadlines": residence permit dates turned into one timeline.
 * Everything here runs in the browser; the dates never leave it.
 * Rules follow Migri as checked on RULES_CHECKED; each item links to its source.
 */

export const RULES_CHECKED = '2026-11-01';

export const SOURCES = {
  extended: 'https://migri.fi/en/extended-permit',
  extendedWork: 'https://migri.fi/en/extended-permit-on-the-basis-of-work',
  unemployment:
    'https://migri.fi/en/-/changes-to-work-based-residence-permits-protection-period-for-unemployment-and-new-notification-obligation-for-employers',
  permanent: 'https://migri.fi/en/permanent-residence-permit',
  citizenship: 'https://migri.fi/en/period-of-residence',
  becomeUnemployed: 'https://infofinland.fi/work-and-enterprise/if-you-become-unemployed',
  loseResidence: 'https://infofinland.fi/moving-to-finland/non-eu-citizens/can-i-lose-my-residence-permit',
  jobMarket: 'https://tyomarkkinatori.fi/en',
  shortageSectors:
    'https://tyomarkkinatori.fi/en/news/uusi-asetus-tuo-tyontekijan-oleskeluluvan-haltijoille-joustoa-tyonhakuun-ja-pyrkii-helpottamaan-tyovoiman-saantia',
} as const;

export type PermitBasis = 'work' | 'studies' | 'family' | 'other';
export type PermitKind = 'A' | 'B';

export interface DeadlineInput {
  basis: PermitBasis;
  kind: PermitKind;
  /** last day of the current permit, YYYY-MM-DD */
  expiry: string;
  /** day residence starts counting (arrival, or the first permit if it came later) */
  residenceStart: string;
  /** has the language certificate Migri asks for */
  hasLanguage: boolean;
  /** last working day when a work-based job ended early */
  jobEnded: string;
  /** specialist permit, or over two years on work-based permits: six months instead of three */
  longProtection: boolean;
  /** ids of ticked plan steps */
  done: string[];
}

export const EMPTY_INPUT: DeadlineInput = {
  basis: 'work',
  kind: 'A',
  expiry: '',
  residenceStart: '',
  hasLanguage: false,
  jobEnded: '',
  longProtection: false,
  done: [],
};

const STORAGE_KEY = 'deadlines.v1';

export const loadInput = (): DeadlineInput => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...EMPTY_INPUT, ...JSON.parse(raw) };
  } catch {
    // Blocked or broken storage: start empty
  }
  return EMPTY_INPUT;
};

export const saveInput = (input: DeadlineInput) => {
  try {
    // Nothing personal entered yet (or just erased): keep the browser clean
    if (!input.expiry && !input.residenceStart && !input.jobEnded && input.done.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
  } catch {
    // The page still works for this visit
  }
};

export const clearInput = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing stored
  }
};

/** Local midnight of a YYYY-MM-DD string, or null */
export const parseDay = (iso: string): Date | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const toIso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** Calendar months later; 31 Jan + 1 month is the last day of February */
export const addMonths = (date: Date, months: number) => {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
};

export const today = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export const daysBetween = (from: Date, to: Date) => Math.round((to.getTime() - from.getTime()) / 86_400_000);

export type DeadlineId =
  | 'extendOpens'
  | 'permitEnds'
  | 'jobSearchEnds'
  | 'permanentEarly'
  | 'permanent'
  | 'citizenship';

export interface TimelineItem {
  id: DeadlineId;
  date: Date;
  /** a hard limit rather than a milestone you may reach */
  hard: boolean;
  source: string;
}

export const buildTimeline = (input: DeadlineInput): TimelineItem[] => {
  const items: TimelineItem[] = [];
  const expiry = parseDay(input.expiry);
  const start = parseDay(input.residenceStart);
  const jobEnded = input.basis === 'work' ? parseDay(input.jobEnded) : null;

  if (expiry) {
    // Work-based extensions are assessed from two months before expiry, other permits from three
    const window = input.basis === 'work' ? 2 : 3;
    items.push({
      id: 'extendOpens',
      date: addMonths(expiry, -window),
      hard: false,
      source: input.basis === 'work' ? SOURCES.extendedWork : SOURCES.extended,
    });
    items.push({ id: 'permitEnds', date: expiry, hard: true, source: SOURCES.extended });
  }

  if (jobEnded) {
    items.push({
      id: 'jobSearchEnds',
      date: addMonths(jobEnded, input.longProtection ? 6 : 3),
      hard: true,
      source: SOURCES.unemployment,
    });
  }

  if (start && input.kind === 'A') {
    items.push({ id: 'permanentEarly', date: addMonths(start, 48), hard: false, source: SOURCES.permanent });
    items.push({ id: 'permanent', date: addMonths(start, 72), hard: false, source: SOURCES.permanent });
  }

  if (start) {
    items.push({
      id: 'citizenship',
      date: addMonths(start, input.hasLanguage ? 60 : 96),
      hard: false,
      source: SOURCES.citizenship,
    });
  }

  return items.sort((a, b) => a.date.getTime() - b.date.getTime());
};

/** The search period cannot outlast the permit itself */
export const jobSearchCutByPermit = (input: DeadlineInput) => {
  const expiry = parseDay(input.expiry);
  const jobEnded = parseDay(input.jobEnded);
  if (!expiry || !jobEnded || input.basis !== 'work') return false;
  return expiry < addMonths(jobEnded, input.longProtection ? 6 : 3);
};

/** Steps of the calm plan for the months after a job ends; texts live in i18n `plan.<id>` */
export const PLAN = [
  { phase: 'week1', steps: ['register', 'benefits', 'checkPermit', 'resume'] },
  { phase: 'month1', steps: ['askNetwork', 'shortage', 'companies'] },
  { phase: 'month2', steps: ['otherBasis', 'advice'] },
  { phase: 'month3', steps: ['newSector', 'applyInTime'] },
] as const;

const escapeIcs = (text: string) => text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

// RFC 5545 lines are at most 75 octets; longer ones continue on the next line after a space
const fold = (line: string) => {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = '';
  for (const char of line) {
    if (encoder.encode(current + char).length > (parts.length ? 74 : 75)) {
      parts.push(current);
      current = '';
    }
    current += char;
  }
  parts.push(current);
  return parts.join('\r\n ');
};

const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/**
 * Calendar file with one all-day event per upcoming date and reminders
 * three months, one month and one week ahead (only those still in the future).
 */
export const buildIcs = (events: { id: string; date: Date; title: string; text: string; url: string }[]) => {
  const now = today();
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Expat//My deadlines//EN', 'CALSCALE:GREGORIAN'];
  for (const e of events) {
    const left = daysBetween(now, e.date);
    if (left < 0) continue;
    const day = toIso(e.date).replace(/-/g, '');
    const next = toIso(new Date(e.date.getFullYear(), e.date.getMonth(), e.date.getDate() + 1)).replace(/-/g, '');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.id}-${day}@expat-deadlines`,
      `DTSTAMP:${stamp()}`,
      `DTSTART;VALUE=DATE:${day}`,
      `DTEND;VALUE=DATE:${next}`,
      `SUMMARY:${escapeIcs(e.title)}`,
      `DESCRIPTION:${escapeIcs(`${e.text}\n${e.url}`)}`,
      `URL:${e.url}`,
    );
    for (const before of [90, 30, 7]) {
      if (left <= before) continue;
      lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escapeIcs(e.title)}`, `TRIGGER:-P${before}D`, 'END:VALARM');
    }
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n');
};
