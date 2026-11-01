/** Pages of the "Together" section; labels live in the growth namespace under together.items.<key> */
export const TOGETHER_LINKS = [
  { to: '/cooperate', icon: 'pi pi-sparkles', key: 'cooperate' },
  { to: '/network', icon: 'pi pi-users', key: 'network' },
  { to: '/tandems', icon: 'pi pi-comments', key: 'tandems' },
  { to: '/timebank', icon: 'pi pi-clock', key: 'timebank' },
  { to: '/challenges', icon: 'pi pi-flag', key: 'challenges' },
  { to: '/integration', icon: 'pi pi-map', key: 'integration' },
  { to: '/ventures', icon: 'pi pi-briefcase', key: 'ventures' },
  { to: '/passport', icon: 'pi pi-id-card', key: 'passport' },
  { to: '/impact', icon: 'pi pi-chart-bar', key: 'impact' },
] as const;

const TOGETHER_PREFIXES = ['/together', '/connect/', '/checkin/', ...TOGETHER_LINKS.map((l) => l.to)];

export const isTogetherPath = (pathname: string) =>
  TOGETHER_PREFIXES.some((p) => pathname === p || pathname.startsWith(p.endsWith('/') ? p : `${p}/`));
