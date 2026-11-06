import {
  MorphusApplicationModuleRef,
  MorphusApplicationSubModuleRef,
} from '@morphus/entities/application';

export type AppBuilderLayoutKey =
  | 'sidebar-default'
  | 'topbar-modern'
  | 'minimal-clean'
  | 'canvas-full'
  | 'custom-html';

export interface AppBuilderNavItem {
  id: string;
  moduleLabel: string;
  label: string;
  icon: string;
  url: string;
}

export interface AppBuilderMatchedPage {
  module: MorphusApplicationModuleRef;
  subModule: MorphusApplicationSubModuleRef;
  params: Record<string, string>;
}
