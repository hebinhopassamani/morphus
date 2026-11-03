import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'sec-content',
  host: { class: 'flex min-h-full w-full flex-auto flex-col' },
  templateUrl: './auth-content.component.html',
})
export class SecContentComponent {}
