export type NavigationItem = {
  id: string;
  label: string;
  icon: string;
  route: string;
};

export const NAVIGATION: NavigationItem[] = [
  {
    id: 'tickets',
    label: 'Tickets',
    route: '/tickets',
    icon: 'inbox',
  },
  {
    id: 'customers',
    label: 'Customers',
    route: '/customers',
    icon: 'users',
  },
  {
    id: 'reports',
    label: 'Reports',
    route: '/reports',
    icon: 'chart-column',
  },
  {
    id: 'help-center',
    label: 'Help center',
    route: '/help-center',
    icon: 'book-open',
  },
  {
    id: 'settings',
    label: 'Settings',
    route: '/settings',
    icon: 'settings',
  },
];
