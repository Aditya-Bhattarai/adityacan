// THE SHOOTING DAY. Every page is one scene, at its own hour, with its own sky.
// The menu, the footer's "Every scene" list and the phone menu are all built from this file.

/** The six links in the top menu, in order. `icon` picks the small drawing beside each one. */
export const NAV_LINKS = [
  { key: 'film', label: 'Films', href: '/film', icon: 'film' },
  { key: 'strategy', label: 'For creators', href: '/strategy-content', icon: 'creators' },
  { key: 'mountains', label: 'Near Mountains.', href: '/trekking-guide', icon: 'mountains' },
  { key: 'teaching', label: 'Classes', href: '/teaching', icon: 'classes' },
  { key: 'work', label: 'Everything', href: '/work', icon: 'everything' },
  { key: 'about', label: 'Me', href: '/about', icon: 'me' },
];

/** The "Every scene" list in the footer. Every page of the site must be in here. */
export const SCENE_INDEX = [
  { key: 'home', number: '1', label: 'Home', href: '/' },
  { key: 'strategy', number: '2', label: 'For creators', href: '/strategy-content' },
  { key: 'film', number: '3', label: 'Films', href: '/film' },
  { key: 'teaching', number: '4', label: 'Classes', href: '/teaching' },
  { key: 'mountains', number: '5', label: 'Near Mountains.', href: '/trekking-guide' },
  { key: 'clients', number: '6', label: 'Clients', href: '/clients' },
  { key: 'contact', number: '7', label: 'Contact', href: '/contact' },
  { key: 'about', number: '8', label: 'Me', href: '/about' },
  { key: 'workwithme', number: '8B', label: 'Work with me', href: '/about#work' },
  { key: 'screenplay', number: '9', label: 'Screenplay', href: '/writing/sapana' },
  { key: 'museum', number: '10', label: 'The museum', href: '/museum' },
  { key: 'work', number: '11', label: 'Everything', href: '/work' },
  { key: 'writing', number: '12', label: 'Writing', href: '/writing' },
];

/** The small row at the bottom of the phone menu. */
export const MENU_MORE = [
  { label: 'The museum', href: '/museum' },
  { label: 'Screenplay', href: '/writing/sapana' },
  { label: 'Every piece', href: '/work' },
];
