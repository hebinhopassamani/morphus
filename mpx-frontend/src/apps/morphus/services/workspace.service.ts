import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { Workspace } from '@morphus/entities/workspace';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/workspace`;

  getAll(): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(this.apiUrl);
  }

  getList(): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(this.apiUrl);
  }

  getById(id: string): Observable<Workspace> {
    return this.http.get<Workspace>(`${this.apiUrl}/${id}`);
  }

  getByKey(key: string): Observable<Workspace> {
    return this.http.get<Workspace>(`${this.apiUrl}/key/${key}`);
  }

  create(workspace: Partial<Workspace>): Observable<Workspace> {
    return this.http.post<Workspace>(this.apiUrl, workspace);
  }

  update(idOrWorkspace: string | Partial<Workspace>, workspace?: Partial<Workspace>): Observable<Workspace> {
    if (typeof idOrWorkspace === 'string') {
      return this.http.put<Workspace>(`${this.apiUrl}/${idOrWorkspace}`, workspace);
    }
    return this.http.put<Workspace>(this.apiUrl, idOrWorkspace);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
