import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MorphusContextService } from '@morphus/services/morphus-context.service';

@Component({
  imports: [RouterOutlet],
  selector: 'mpx-content',
  styleUrl: './content.component.css',
  templateUrl: './content.component.html',
})
export class MpxContentComponent {
  protected readonly context = inject(MorphusContextService);
}
