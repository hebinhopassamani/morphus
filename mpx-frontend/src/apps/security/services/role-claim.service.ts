import { Injectable } from '@angular/core';
import { MpxEntityService } from '@core/morphus';
import { Claim } from '@security/entities/claim';
import { RoleClaim } from '@security/entities/role-claim';

@Injectable({
  providedIn: 'root',
})
export class RoleClaimService extends MpxEntityService<RoleClaim, Claim> {
  constructor() {
    super('role-claim');
    this.addPk('roleId').addPk('claimId');
  }
}

