import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { SubModule } from '@security/entities/sub-module';
import { DeleteDependenciesSummary } from '@security/services/module.service';
import { environment } from '@src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SubModuleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/sub-module`;

  getAll(): Observable<SubModule[]> {
    return this.http.get<SubModule[]>(this.apiUrl).pipe(catchError(() => of([])));
  }

  getById(id: string): Observable<SubModule> {
    return this.http.get<SubModule>(`${this.apiUrl}/${id}`);
  }

  getByModuleId(moduleId: string): Observable<SubModule[]> {
    return this.http
      .get<SubModule[]>(`${environment.apiUrl}/module/${moduleId}/sub-modules`)
      .pipe(catchError(() => this.http.get<SubModule[]>(`${this.apiUrl}/module/${moduleId}`)));
  }

  getDependencies(subModuleId: string): Observable<DeleteDependenciesSummary> {
    return this.http.get<DeleteDependenciesSummary>(`${this.apiUrl}/${subModuleId}/dependencies`);
  }

  create(entity: Partial<SubModule>): Observable<SubModule> {
    return this.http.post<SubModule>(this.apiUrl, entity);
  }

  update(id: string, entity: Partial<SubModule>): Observable<SubModule> {
    return this.http.put<SubModule>(`${this.apiUrl}/${id}`, entity);
  }

  delete(id: string, force = false): Observable<void> {
    const query = force ? '?force=true' : '';
    return this.http.delete<void>(`${this.apiUrl}/${id}${query}`);
  }
}

