import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RoleClaim } from '@security/entities/RoleClaims';
import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RoleClaimService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/roleclaim`;

  getAll(): Observable<RoleClaim[]> {
    return this.http.get<RoleClaim[]>(this.apiUrl);
  }

  getByRoleId(roleId: string): Observable<RoleClaim[]> {
    return this.http.get<RoleClaim[]>(`${this.apiUrl}/by-role/${roleId}`);
  }

  create(entity: Partial<RoleClaim>): Observable<RoleClaim> {
    return this.http.post<RoleClaim>(this.apiUrl, entity);
  }

  createMany(entities: Partial<RoleClaim>[]): Observable<RoleClaim[]> {
    return this.http.post<RoleClaim[]>(`${this.apiUrl}/create-many`, entities);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteMany(ids: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/delete-many`, ids);
  }
}

