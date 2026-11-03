import { Component } from '@angular/core';
import { SecContentComponent } from './content/auth-content.component';
import { SecTopBarComponent } from './topbar/auth-topbar.component';

@Component({
  imports: [SecContentComponent, SecTopBarComponent],
  selector: 'sec-layout',
  host: { class: 'flex min-h-full w-full flex-auto flex-col bg-[#F7F5FC] dark:bg-[#140A2E]' },
  templateUrl: './auth-layout.component.html',
})
export class MorphusAuthLayout {}

export { MorphusAuthLayout as SecurityLayout };
