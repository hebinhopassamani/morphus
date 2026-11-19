import { Injectable } from '@angular/core';
import { MpxEntityService } from '@core/morphus';
import { Claim } from '@security/entities/claim';
import { UserClaim } from '@security/entities/user-claim';

@Injectable({
  providedIn: 'root',
})
export class UserClaimService extends MpxEntityService<UserClaim, Claim> {
  constructor() {
    super('user-claim');
    this.addPk('userId').addPk('claimId');
  }
}

