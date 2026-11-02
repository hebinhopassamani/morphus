import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SubModule } from '@security/entities/sub-module';
import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SubModuleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/submodule`;

  getAll(): Observable<SubModule[]> {
    return this.http.get<SubModule[]>(this.apiUrl);
  }

  getById(id: string): Observable<SubModule> {
    return this.http.get<SubModule>(`${this.apiUrl}/${id}`);
  }

  getByModuleId(moduleId: string): Observable<SubModule[]> {
    return this.http.get<SubModule[]>(`${this.apiUrl}/by-module/${moduleId}`);
  }

  create(entity: Partial<SubModule>): Observable<SubModule> {
    return this.http.post<SubModule>(this.apiUrl, entity);
  }

  update(id: string, entity: Partial<SubModule>): Observable<SubModule> {
    return this.http.put<SubModule>(`${this.apiUrl}/${id}`, entity);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

