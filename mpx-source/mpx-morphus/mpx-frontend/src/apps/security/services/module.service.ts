import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Module } from '@security/entities/Modules';
import { environment } from '@src/environments/environment';

export type ModuleResponse = Module;

@Injectable({
  providedIn: 'root',
})
export class ModuleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/module`;

  getModules(): Observable<Module[]> {
    return this.http.get<Module[]>(this.apiUrl);
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

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  verifyModules(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/verify`, {});
  }
}
