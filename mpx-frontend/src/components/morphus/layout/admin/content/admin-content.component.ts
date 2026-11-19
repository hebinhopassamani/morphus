import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MpxContextService } from '@morphus/services/morphus-context.service';

@Component({
  imports: [RouterOutlet],
  selector: 'mpx-admin-content',
  templateUrl: './admin-content.component.html',
  styleUrl: './admin-content.component.css',
})
export class MpxAdminContentComponent {
  protected readonly context = inject(MpxContextService);
}
