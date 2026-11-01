import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './apps/app.config';
import { AppComponent } from './apps/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
