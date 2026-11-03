import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'web-content',
  host: { class: 'flex min-h-full w-full flex-auto flex-col' },
  templateUrl: './open-content.component.html',
})
export class WebContentComponent {}
