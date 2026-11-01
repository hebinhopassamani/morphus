type NavigationItem = {
  id: string;
  label: string;
  icon?: string;
  badge?: string;
  route?: string;
};

export const navigation: NavigationItem[] = [
  {
    id: 'welcome',
    label: 'Welcome',
    route: '/welcome',
    icon: 'rocket',
  },
  {
    id: 'folder-structure',
    label: 'Folder structure',
    route: '/folder-structure',
    icon: 'folder',
  },
];
