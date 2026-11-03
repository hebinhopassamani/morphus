import { Component } from '@angular/core';
import { WebContentComponent } from './content/open-content.component';
import { WebTopBarComponent } from './topbar/open-topbar.component';

@Component({
  imports: [WebContentComponent, WebTopBarComponent],
  selector: 'web-layout',
  host: { class: 'flex min-h-full w-full flex-auto flex-col bg-white dark:bg-neutral-2' },
  templateUrl: './open-layout.component.html',
})
export class MorphusOpenLayout {}

export { MorphusOpenLayout as WebSiteLayout };
