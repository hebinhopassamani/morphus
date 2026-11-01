import { Component } from '@angular/core';
import { SecContentComponent } from '@security/layout/content/content.component';
import { SecTopBarComponent } from '@security/layout/topbar/topbar.component';

@Component({
  imports: [SecContentComponent, SecTopBarComponent],
  selector: 'sec-layout',
  host: { class: 'flex min-h-full w-full flex-auto flex-col bg-neutral-2 dark:bg-neutral-1' },
  templateUrl: './layout.component.html',
})
export class SecurityLayout {}
