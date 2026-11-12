export type NavItem = { href: string; label: string; desc?: string };

/** Primary navigation — deliberately short. */
export const NAV_PRIMARY: NavItem[] = [
  { href: '/work', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/journal', label: 'Journal' },
];

/** Everything else lives behind "More". */
export const NAV_MORE: NavItem[] = [
  { href: '/gallery', label: 'Gallery', desc: 'Photographs' },
  { href: '/creative', label: 'Creative', desc: 'Poetry, spoken word, piano' },
  { href: '/ventures', label: 'Ventures', desc: 'KR8 DIGITALS' },
  { href: '/timeline', label: 'Timeline', desc: 'The road so far' },
  { href: '/now', label: 'Now', desc: 'What I am doing' },
];

export const ALL_NAV: NavItem[] = [{ href: '/', label: 'Home' }, ...NAV_PRIMARY, ...NAV_MORE, { href: '/contact', label: 'Contact' }];
