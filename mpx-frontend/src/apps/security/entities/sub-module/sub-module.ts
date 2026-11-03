import { Corporation } from '../corporation';
import { Module } from '../module';
import { ISubModuleReflected } from './sub-module.reflected';

export interface SubModule extends ISubModuleReflected {
  module?: Module;
  corporation?: Corporation;
}
