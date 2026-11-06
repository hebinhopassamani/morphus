import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Module } from '@security/entities/module';
import { SubModule } from '@security/entities/sub-module';
import { environment } from '@src/environments/environment';

export type ModuleResponse = Module;

export interface DeleteDependenciesSummary {
  subModules: string[];
  roles: string[];
  claims: string[];
  hasDependencies: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ModuleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/module`;

  getModules(): Observable<Module[]> {
    return this.http.get<Module[]>(this.apiUrl);
  }

  getAll(): Observable<Module[]> {
    return this.http.get<Module[]>(this.apiUrl);
  }

  getByApplication(applicationId: string): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.apiUrl}/application/${applicationId}`);
  }

  getSubModules(moduleId: string): Observable<SubModule[]> {
    return this.http.get<SubModule[]>(`${this.apiUrl}/${moduleId}/sub-modules`);
  }

  getDependencies(moduleId: string): Observable<DeleteDependenciesSummary> {
    return this.http.get<DeleteDependenciesSummary>(`${this.apiUrl}/${moduleId}/dependencies`);
  }

  getById(id: string): Observable<Module> {
    return this.http.get<Module>(`${this.apiUrl}/${id}`);
  }

  create(entity: Partial<Module>): Observable<Module> {
    return this.http.post<Module>(this.apiUrl, entity);
  }

  update(id: string, entity: Partial<Module>): Observable<Module> {
    return this.http.put<Module>(`${this.apiUrl}/${id}`, entity);
  }

  delete(id: string, force = false): Observable<void> {
    const query = force ? '?force=true' : '';
    return this.http.delete<void>(`${this.apiUrl}/${id}${query}`);
  }

  verifyModules(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/verify`, {});
  }
}
