import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserRole } from '@security/entities/user-role';
import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserRoleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/userrole`;

  getAll(): Observable<UserRole[]> {
    return this.http.get<UserRole[]>(this.apiUrl);
  }

  getByUserId(userId: string): Observable<UserRole[]> {
    return this.http.get<UserRole[]>(`${this.apiUrl}/by-user/${userId}`);
  }

  create(entity: Partial<UserRole>): Observable<UserRole> {
    return this.http.post<UserRole>(this.apiUrl, entity);
  }

  createMany(entities: Partial<UserRole>[]): Observable<UserRole[]> {
    return this.http.post<UserRole[]>(`${this.apiUrl}/create-many`, entities);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteMany(ids: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/delete-many`, ids);
  }
}

