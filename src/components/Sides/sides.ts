import { TOGETHER_LINKS } from '@/components/Growth/togetherLinks';

/**
 * The product has two sides that share accounts and the backend:
 * - Expat: the simple one, companies where students look for an internship or a job;
 * - Kipinä ("spark"): building a startup, finding co-founders and like-minded people.
 * Each side has its own home page and menu; "/" lets people pick one.
 */
export type Side = 'expat' | 'kipina';

export const SIDE_HOME: Record<Side, string> = {
  expat: '/expat',
  kipina: '/kipina',
};

export interface NavLink {
  to: string;
  icon: string;
  /** key in the common namespace */
  label: string;
  /** extra path prefixes that light this link up */
  match?: string[];
}

export interface NavGroup {
  id: string;
  icon: string;
  label: string;
  items: NavLink[];
}

export type NavEntry = NavLink | NavGroup;

export const isGroup = (entry: NavEntry): entry is NavGroup => 'items' in entry;

const togetherItem = (key: (typeof TOGETHER_LINKS)[number]['key']): NavLink => {
  const link = TOGETHER_LINKS.find((l) => l.key === key)!;
  return { to: link.to, icon: link.icon, label: `navigation.togetherItems.${key}` };
};

export const SIDE_NAV: Record<Side, NavEntry[]> = {
  // Kept short on purpose: the job side is companies, a CV and permit deadlines
  expat: [
    { to: '/companies', icon: 'pi pi-building', label: 'navigation.companies', match: ['/categories'] },
    { to: '/profile/resume-builder', icon: 'pi pi-file-edit', label: 'navigation.resume' },
    { to: '/deadlines', icon: 'pi pi-calendar-clock', label: 'navigation.deadlines' },
  ],
  kipina: [
    { to: '/cooperate', icon: 'pi pi-sparkles', label: 'navigation.teamUp' },
    {
      id: 'people',
      icon: 'pi pi-users',
      label: 'navigation.people',
      items: [
        togetherItem('network'),
        togetherItem('meetups'),
        togetherItem('tandems'),
        togetherItem('timebank'),
        togetherItem('challenges'),
      ],
    },
    {
      id: 'progress',
      icon: 'pi pi-chart-line',
      label: 'navigation.progress',
      items: [togetherItem('ventures'), togetherItem('passport'), togetherItem('integration'), togetherItem('impact')],
    },
    // Settling in and city life belong with the people side, not the job search
    {
      id: 'city_services',
      icon: 'pi pi-building-columns',
      label: 'navigation.city',
      items: [
        { to: '/onboarding', icon: 'pi pi-compass', label: 'navigation.onboarding' },
        { to: '/community', icon: 'pi pi-users', label: 'navigation.community' },
        { to: '/participatory-budget', icon: 'pi pi-wallet', label: 'navigation.participatoryBudget' },
        { to: '/service-requests', icon: 'pi pi-inbox', label: 'navigation.serviceRequests' },
        { to: '/polls', icon: 'pi pi-chart-bar', label: 'navigation.polls' },
        { to: '/municipal-dashboard', icon: 'pi pi-chart-line', label: 'navigation.municipalAnalytics' },
      ],
    },
  ],
};

const prefixes = (side: Side): string[] => {
  const out = [SIDE_HOME[side]];
  for (const entry of SIDE_NAV[side]) {
    const links = isGroup(entry) ? entry.items : [entry];
    for (const link of links) out.push(link.to, ...(link.match ?? []));
  }
  return out;
};

const SIDE_PREFIXES: Record<Side, string[]> = {
  expat: prefixes('expat'),
  // QR landings and public passports come from Kipinä features
  kipina: [...prefixes('kipina'), '/together', '/connect/', '/checkin/', '/p/'],
};

export const matchesPath = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(prefix.endsWith('/') ? prefix : `${prefix}/`);

export const isLinkActive = (pathname: string, link: NavLink) =>
  [link.to, ...(link.match ?? [])].some((p) => matchesPath(pathname, p));

/** The side a page belongs to, or null for shared pages (profile, about, login…). */
export const sideForPath = (pathname: string): Side | null => {
  for (const side of ['expat', 'kipina'] as Side[]) {
    if (SIDE_PREFIXES[side].some((p) => matchesPath(pathname, p))) return side;
  }
  return null;
};

const STORAGE_KEY = 'side';

export const rememberSide = (side: Side) => {
  try {
    localStorage.setItem(STORAGE_KEY, side);
  } catch {
    // storage may be blocked; the side then simply is not remembered
  }
};

export const rememberedSide = (): Side | null => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'expat' || value === 'kipina' ? value : null;
  } catch {
    return null;
  }
};
