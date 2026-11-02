import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '@security/entities/user';
import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/user`;

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  create(entity: Partial<User> & { password?: string }): Observable<User> {
    return this.http.post<User>(this.apiUrl, entity);
  }

  update(id: string, entity: Partial<User> & { password?: string }): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, entity);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

