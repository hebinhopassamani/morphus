import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'sec-content',
  host: { class: 'flex w-full flex-auto flex-col' },
  styleUrl: './content.component.css',
  templateUrl: './content.component.html',
})
export class SecContentComponent {}
