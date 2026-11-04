import { Injectable } from '@angular/core';
import { MorphusEntityService } from '@core/mpx-http';
import { Claim } from '@security/entities/claim';
import { RoleClaim } from '@security/entities/role-claim';

@Injectable({
  providedIn: 'root',
})
export class RoleClaimService extends MorphusEntityService<RoleClaim, Claim> {
  constructor() {
    super('role-claim');
    this.addPk('roleId').addPk('claimId');
  }
}

