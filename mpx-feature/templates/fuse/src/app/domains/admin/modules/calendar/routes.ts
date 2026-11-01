import { Routes } from '@angular/router';
import CalendarLayout from '@/app/domains/admin/modules/calendar/layout';

const routes: Routes = [
  // Calendar
  {
    path: '',
    component: CalendarLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/calendar/calendar'),
      },
    ],
  },
];

export default routes;
