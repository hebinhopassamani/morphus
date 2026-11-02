import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { Menu } from '@security/entities/menu';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/menu`;

  getById(id: string): Observable<Menu> {
    return this.http.get<Menu>(`${this.apiUrl}/${id}`);
  }

  getList(): Observable<Menu[]> {
    return this.http.get<Menu[]>(this.apiUrl);
  }

  getByApplicationId(applicationId: string): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.apiUrl}/application/${applicationId}`);
  }

  getByApplicationKey(applicationKey: string): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.apiUrl}/application-key/${applicationKey}`);
  }

  create(menu: Menu): Observable<Menu> {
    return this.http.post<Menu>(this.apiUrl, menu);
  }

  update(menu: Menu): Observable<Menu> {
    return this.http.put<Menu>(this.apiUrl, menu);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
