import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { MorphusApplication } from '@morphus/entities/application';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/application`;

  getById(id: string): Observable<MorphusApplication> {
    return this.http.get<MorphusApplication>(`${this.apiUrl}/${id}`);
  }

  getList(): Observable<MorphusApplication[]> {
    return this.http.get<MorphusApplication[]>(this.apiUrl);
  }

  getByWorkspace(workspaceId: string): Observable<MorphusApplication[]> {
    return this.http.get<MorphusApplication[]>(`${this.apiUrl}/workspace/${workspaceId}`);
  }

  getByKey(key: string): Observable<MorphusApplication> {
    return this.http.get<MorphusApplication>(`${this.apiUrl}/key/${key}`);
  }

  create(application: MorphusApplication): Observable<MorphusApplication> {
    return this.http.post<MorphusApplication>(this.apiUrl, application);
  }

  update(application: MorphusApplication): Observable<MorphusApplication> {
    return this.http.put<MorphusApplication>(this.apiUrl, application);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
