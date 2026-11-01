import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'auth-layout',
  imports: [RouterOutlet],
  host: {
    class: 'bg-neutral-2 dark:bg-neutral-1',
  },
  template: `<router-outlet />`,
})
export default class AuthLayout {}
