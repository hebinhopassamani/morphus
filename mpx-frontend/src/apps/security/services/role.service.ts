import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Role } from '@security/entities/role';
import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/role`;

  getAll(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  getById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  create(entity: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, entity);
  }

  update(id: string, entity: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, entity);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
