import { Component, inject, OnInit } from '@angular/core';
import { MpxSecurity } from '@core/morphus';

@Component({
  selector: 'sec-signout',
  host: { class: 'flex w-full flex-auto flex-col items-center justify-center p-6 text-neutral-11' },
  templateUrl: './signout.component.html',
  standalone: true,
})
export class SignoutComponent implements OnInit {
  private readonly auth = inject(MpxSecurity);

  ngOnInit(): void {
    this.auth.logout();
  }
}
