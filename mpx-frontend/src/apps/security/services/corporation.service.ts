import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Corporation } from '@security/entities/corporation';
import { CorporationUser } from '@security/entities/corporation-user';
import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CorporationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/corporation`;
  private readonly corpUserUrl = `${environment.apiUrl}/corporationuser`;

  getAll(): Observable<Corporation[]> {
    return this.http.get<Corporation[]>(this.apiUrl);
  }

  getById(id: string): Observable<Corporation> {
    return this.http.get<Corporation>(`${this.apiUrl}/${id}`);
  }

  create(entity: Partial<Corporation>): Observable<Corporation> {
    return this.http.post<Corporation>(this.apiUrl, entity);
  }

  update(id: string, entity: Partial<Corporation>): Observable<Corporation> {
    return this.http.put<Corporation>(`${this.apiUrl}/${id}`, entity);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getUsersByCorporation(corporationId: string): Observable<CorporationUser[]> {
    return this.http.get<CorporationUser[]>(`${this.corpUserUrl}/by-corporation/${corporationId}`);
  }

  addUserToCorporation(entity: Partial<CorporationUser>): Observable<CorporationUser> {
    return this.http.post<CorporationUser>(this.corpUserUrl, entity);
  }

  removeUserFromCorporation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.corpUserUrl}/${id}`);
  }
}

