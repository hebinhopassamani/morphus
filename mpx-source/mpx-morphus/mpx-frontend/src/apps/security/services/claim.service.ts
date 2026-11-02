import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Claim } from '@security/entities/claim';
import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClaimService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/claim`;

  getAll(): Observable<Claim[]> {
    return this.http.get<Claim[]>(this.apiUrl);
  }

  getById(id: string): Observable<Claim> {
    return this.http.get<Claim>(`${this.apiUrl}/${id}`);
  }

  create(entity: Partial<Claim>): Observable<Claim> {
    return this.http.post<Claim>(this.apiUrl, entity);
  }

  update(id: string, entity: Partial<Claim>): Observable<Claim> {
    return this.http.put<Claim>(`${this.apiUrl}/${id}`, entity);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

