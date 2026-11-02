import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'web-content',
  host: { class: 'flex flex-auto flex-col' },
  styleUrl: './content.component.css',
  templateUrl: './content.component.html',
})
export class WebContentComponent {}
