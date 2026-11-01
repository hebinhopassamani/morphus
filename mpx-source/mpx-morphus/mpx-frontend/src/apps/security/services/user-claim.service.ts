import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserClaim } from '@security/entities/UserClaims';
import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserClaimService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/userclaim`;

  getAll(): Observable<UserClaim[]> {
    return this.http.get<UserClaim[]>(this.apiUrl);
  }

  getByUserId(userId: string): Observable<UserClaim[]> {
    return this.http.get<UserClaim[]>(`${this.apiUrl}/by-user/${userId}`);
  }

  create(entity: Partial<UserClaim>): Observable<UserClaim> {
    return this.http.post<UserClaim>(this.apiUrl, entity);
  }

  createMany(entities: Partial<UserClaim>[]): Observable<UserClaim[]> {
    return this.http.post<UserClaim[]>(`${this.apiUrl}/create-many`, entities);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteMany(ids: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/delete-many`, ids);
  }
}

