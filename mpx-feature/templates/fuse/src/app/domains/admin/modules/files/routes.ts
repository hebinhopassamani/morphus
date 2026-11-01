import { Routes } from '@angular/router';

const routes: Routes = [
  // Files
  {
    // Root and folders share one route so browsing keeps the page state
    matcher: (segments) =>
      segments.length > 1
        ? null
        : {
            consumed: segments,
            posParams: segments.length ? { folderId: segments[0] } : undefined,
          },
    loadComponent: () => import('./features/files/files'),
  },
];

export default routes;
