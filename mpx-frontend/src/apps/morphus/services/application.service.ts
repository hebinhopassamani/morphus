import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import {
  MorphusApplication,
  MorphusApplicationModuleRef,
  MorphusApplicationSubModuleRef,
  MorphusCategoryRef,
} from '@morphus/entities/application';

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

  getCategories(): Observable<MorphusCategoryRef[]> {
    return this.http.get<MorphusCategoryRef[]>(`${this.apiUrl}/categories`);
  }

  saveModule(
    applicationId: string,
    module: Partial<MorphusApplicationModuleRef>,
  ): Observable<MorphusApplicationModuleRef> {
    const payload = { ...module } as Record<string, unknown>;
    if (!payload['id']) {
      delete payload['id'];
    }
    return this.http.post<MorphusApplicationModuleRef>(
      `${this.apiUrl}/${applicationId}/modules`,
      payload,
    );
  }

  deleteModule(moduleId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/modules/${moduleId}`);
  }

  savePage(
    moduleId: string,
    page: Partial<MorphusApplicationSubModuleRef>,
  ): Observable<MorphusApplicationSubModuleRef> {
    const payload = { ...page } as Record<string, unknown>;
    if (!payload['id']) {
      delete payload['id'];
    }
    return this.http.post<MorphusApplicationSubModuleRef>(
      `${this.apiUrl}/modules/${moduleId}/pages`,
      payload,
    );
  }

  deletePage(pageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/pages/${pageId}`);
  }

  create(application: Partial<MorphusApplication>): Observable<MorphusApplication> {
    const payload = { ...application } as Record<string, unknown>;
    if (
      !payload['id'] ||
      String(payload['id']).trim() === '' ||
      String(payload['id']).startsWith('catalog-')
    ) {
      delete payload['id'];
    }
    return this.http.post<MorphusApplication>(this.apiUrl, payload);
  }

  update(application: MorphusApplication): Observable<MorphusApplication> {
    return this.http.put<MorphusApplication>(this.apiUrl, application);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
