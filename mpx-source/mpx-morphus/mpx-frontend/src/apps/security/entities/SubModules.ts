import { Corporation } from '@security/entities/Corporations';
import { Module } from '@security/entities/Modules';

export interface SubModule {
  id: string;
  name: string;
  key: string;
  system: boolean;
  moduleId: string;
  corporationId: string;
  description?: string;

  module?: Module;
  corporation?: Corporation;
}
