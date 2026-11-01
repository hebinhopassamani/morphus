import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { Workspace } from '@morphus/entities/workspace';

@Service()
export class WorkspaceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/workspace`;

  getById(id: string): Observable<Workspace> {
    return this.http.get<Workspace>(`${this.apiUrl}/${id}`);
  }

  getList(): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(this.apiUrl);
  }

  getByKey(key: string): Observable<Workspace> {
    return this.http.get<Workspace>(`${this.apiUrl}/key/${key}`);
  }

  create(workspace: Workspace): Observable<Workspace> {
    return this.http.post<Workspace>(this.apiUrl, workspace);
  }

  update(workspace: Workspace): Observable<Workspace> {
    return this.http.put<Workspace>(this.apiUrl, workspace);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
