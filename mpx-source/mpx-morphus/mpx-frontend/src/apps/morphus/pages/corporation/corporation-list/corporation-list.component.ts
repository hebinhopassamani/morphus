import { Component, OnDestroy, OnInit } from '@angular/core';
import { IMorphusListComponent, MorphusFilter, MorphusListComponent } from '@core/mpx-base';
import { Corporation } from '@security/entities/Corporations';

@Component({
  selector: 'mpx-corporation-list',
  standalone: true,
  imports: [],
  styleUrl: './corporation-list.component.css',
  templateUrl: './corporation-list.component.html',
})
export class CorporationListComponent
  extends MorphusListComponent<Corporation>
  implements IMorphusListComponent, OnInit, OnDestroy
{
  ngOnInit(): void {
    this.primaryKeys = ['id'];
    void this.loadList();
  }

  ngOnDestroy(): void {
    this.destroySubscriptions();
  }

  async loadList(_filter?: MorphusFilter): Promise<void> {
    this.setList([]);
  }

  newEntity(): void {
    void this.router.navigate(['new'], { relativeTo: this.activatedRoute });
  }

  openFilter(): void {}

  async onFilter(): Promise<void> {}

  async onFilterClear(): Promise<void> {}

  onFilterClose(): void {}
}
