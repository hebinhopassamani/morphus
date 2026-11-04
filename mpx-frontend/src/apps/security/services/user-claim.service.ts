import { Injectable } from '@angular/core';
import { MorphusEntityService } from '@core/mpx-http';
import { Claim } from '@security/entities/claim';
import { UserClaim } from '@security/entities/user-claim';

@Injectable({
  providedIn: 'root',
})
export class UserClaimService extends MorphusEntityService<UserClaim, Claim> {
  constructor() {
    super('user-claim');
    this.addPk('userId').addPk('claimId');
  }
}

