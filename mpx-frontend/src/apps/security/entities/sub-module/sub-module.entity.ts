import { Corporation } from '../corporation';
import { Module } from '../module';
import { SubModuleReflected } from './sub-module.reflected';

export interface SubModule extends SubModuleReflected {
  module?: Module;
  corporation?: Corporation;
}
