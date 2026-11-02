import { Component } from '@angular/core';
import { WebContentComponent } from '@website/layout/content/content.component';
import { WebTopBarComponent } from '@website/layout/topbar/topbar.component';

@Component({
  imports: [WebContentComponent, WebTopBarComponent],
  selector: 'web-layout',
  host: { class: 'flex min-h-full w-full flex-auto flex-col bg-white dark:bg-neutral-2' },
  templateUrl: './layout.component.html',
})
export class WebSiteLayout {}
