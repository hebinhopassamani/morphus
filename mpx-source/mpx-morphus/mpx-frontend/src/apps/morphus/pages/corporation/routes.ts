import { Routes } from '@angular/router';
import { CorporationEditComponent } from './corporation-edit/corporation-edit.component';
import { CorporationListComponent } from './corporation-list/corporation-list.component';

const routes: Routes = [
  {
    path: '',
    component: CorporationListComponent,
  },
  {
    path: 'new',
    component: CorporationEditComponent,
  },
  {
    path: ':id',
    component: CorporationEditComponent,
  },
];

export default routes;
