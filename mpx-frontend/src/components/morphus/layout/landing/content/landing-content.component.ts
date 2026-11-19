import { Component, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'mpx-landing-content',
  host: { class: 'flex min-h-full w-full flex-auto flex-col' },
  templateUrl: './landing-content.component.html',
  styleUrl: './landing-content.component.css',
})
export class MpxLandingContentComponent {
  public readonly fullWidth = input<boolean>(false);
}
