import { MorphusApplication } from '@morphus/entities/application';
import { Workspace } from '@morphus/entities/workspace';
import { Corporation } from '@security/entities/corporation';
import { Module } from '@security/entities/module';
import { Role } from '@security/entities/role';
import { SubModule } from '@security/entities/sub-module';
import { UserStatus } from '@security/entities/user-status';

export const DefaultCorporation: Corporation = {
  id: undefined as unknown as string,
  key: '',
  name: 'Selecione uma empresa',
  email: undefined as unknown as string,
};

export const DefaultWorkspace: Workspace = {
  id: undefined as unknown as string,
  key: '',
  name: 'Selecione um workspace',
};

export const DefaultApplication: MorphusApplication = {
  id: undefined as unknown as string,
  key: '',
  name: 'Selecione uma aplicação',
};

export const DefaultModule: Module = {
  id: undefined as unknown as string,
  key: '',
  name: 'Selecione um módulo',
  corporationId: undefined as unknown as string,
};

export const DefaultSubModule: SubModule = {
  id: undefined as unknown as string,
  key: '',
  name: 'Selecione um submódulo',
  moduleId: undefined as unknown as string,
  corporationId: undefined as unknown as string,
};

export const DefaultRole: Role = {
  id: undefined as unknown as string,
  key: '',
  name: 'Selecione um perfil',
};

export const DefaultUserStatus: UserStatus = {
  id: undefined as unknown as string,
  key: '',
  name: 'Selecione um status',
  corporationId: undefined as unknown as string,
};
