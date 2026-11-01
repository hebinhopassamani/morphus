import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'calendar-layout',
  imports: [RouterOutlet],
  // Viewport minus the admin header, plus the card padding from lg
  host: {
    class: 'flex h-[calc(100dvh-3.5rem-1px)] lg:h-[calc(100dvh-4.5rem-1px)]',
  },
  template: `<router-outlet />`,
})
export default class CalendarLayout {}
