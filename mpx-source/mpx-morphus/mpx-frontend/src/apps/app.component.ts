import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'mpx-root',
  host: {
    class: 'flex min-h-full w-full flex-auto flex-col',
  },
  styleUrl: './app.component.css',
  templateUrl: './app.component.html',
})
export class AppComponent {}
