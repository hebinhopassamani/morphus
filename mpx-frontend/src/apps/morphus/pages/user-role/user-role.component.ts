import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { IMorphusNxNComponent, MorphusNxNComponent } from '@core/mpx-base';
import { UserRoleService } from '@morphus/services/user-role.service';
import { IRoleReflected } from '@security/entities/role';
import { IUserRoleReflected } from '@security/entities/user-role';

@Component({
  selector: 'mpx-user-role',
  standalone: true,
  imports: [],
  styleUrl: './user-role.component.css',
  templateUrl: './user-role.component.html',
})
export class UserRoleComponent
  extends MorphusNxNComponent<IUserRoleReflected, IRoleReflected>
  implements IMorphusNxNComponent, OnInit, OnDestroy
{
  public readonly userRoleService = inject(UserRoleService);

  constructor() {
    super();
    this.addPk('userId').addPk('roleId').addPk('corporationId');
  }

  ngOnInit(): void {
    void this.loadItems();
  }

  ngOnDestroy(): void {
    this.destroySubscriptions();
  }

  async loadItems(): Promise<void> {
    const pkFromRoute = this.getPkFromRoute();
    const [toRelate, related] = await Promise.all([
      firstValueFrom(this.userRoleService.getEntitiesToRelate(pkFromRoute)),
      firstValueFrom(this.userRoleService.getRelatedEntities(pkFromRoute)),
    ]);

    this.setEntitiesToRelate(toRelate);
    this.setRelatedEntities(related);
  }
}
