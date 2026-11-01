import { Directive, signal } from '@angular/core';
import { MorphusComponent } from './morphus.component';

@Directive()
export abstract class MorphusNxNComponent<T> extends MorphusComponent<T> {
  public readonly sourceList = signal<T[]>([]);
  public readonly targetList = signal<T[]>([]);
}
