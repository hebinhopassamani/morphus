import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import {
  ApplicationDomainPreviewRequest,
  ApplicationDomainPreviewResponse,
  MpxApplication,
  MpxApplicationModuleRef,
  MpxApplicationSettingRef,
  MpxApplicationSubModuleRef,
  MpxCategoryRef,
  MpxCorporationDomainRef,
  UpdateApplicationBasicSettingsRequest,
} from '@morphus/entities/application';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/application`;

  getById(id: string): Observable<MpxApplication> {
    return this.http.get<MpxApplication>(`${this.apiUrl}/${id}`);
  }

  getList(): Observable<MpxApplication[]> {
    return this.http.get<MpxApplication[]>(this.apiUrl);
  }

  getByWorkspace(workspaceId: string): Observable<MpxApplication[]> {
    return this.http.get<MpxApplication[]>(`${this.apiUrl}/workspace/${workspaceId}`);
  }

  getByKey(key: string): Observable<MpxApplication> {
    return this.http.get<MpxApplication>(`${this.apiUrl}/key/${key}`);
  }

  getCategories(): Observable<MpxCategoryRef[]> {
    return this.http.get<MpxCategoryRef[]>(`${this.apiUrl}/categories`);
  }

  previewDomain(
    request: ApplicationDomainPreviewRequest,
  ): Observable<ApplicationDomainPreviewResponse> {
    return this.http.post<ApplicationDomainPreviewResponse>(
      `${this.apiUrl}/preview-domain`,
      request,
    );
  }

  getCorporationDomains(): Observable<MpxCorporationDomainRef[]> {
    return this.http.get<MpxCorporationDomainRef[]>(`${this.apiUrl}/corporation-domains`);
  }

  saveCorporationDomain(
    domain: Partial<MpxCorporationDomainRef>,
  ): Observable<MpxCorporationDomainRef> {
    const payload = { ...domain } as Record<string, unknown>;
    if (!payload['id']) {
      delete payload['id'];
    }
    return this.http.post<MpxCorporationDomainRef>(
      `${this.apiUrl}/corporation-domains`,
      payload,
    );
  }

  getApplicationSettings(applicationId: string): Observable<MpxApplicationSettingRef[]> {
    return this.http.get<MpxApplicationSettingRef[]>(
      `${this.apiUrl}/${applicationId}/settings`,
    );
  }

  saveApplicationSetting(
    applicationId: string,
    setting: Partial<MpxApplicationSettingRef>,
  ): Observable<MpxApplicationSettingRef> {
    const payload = { ...setting } as Record<string, unknown>;
    if (!payload['id']) {
      delete payload['id'];
    }
    return this.http.post<MpxApplicationSettingRef>(
      `${this.apiUrl}/${applicationId}/settings`,
      payload,
    );
  }

  deleteApplicationSetting(settingId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/settings/${settingId}`);
  }

  updateBasicSettings(
    applicationId: string,
    request: UpdateApplicationBasicSettingsRequest,
  ): Observable<MpxApplication> {
    return this.http.put<MpxApplication>(
      `${this.apiUrl}/${applicationId}/basic-settings`,
      request,
    );
  }

  saveModule(
    applicationId: string,
    module: Partial<MpxApplicationModuleRef>,
  ): Observable<MpxApplicationModuleRef> {
    const payload = { ...module } as Record<string, unknown>;
    if (!payload['id']) {
      delete payload['id'];
    }
    return this.http.post<MpxApplicationModuleRef>(
      `${this.apiUrl}/${applicationId}/modules`,
      payload,
    );
  }

  deleteModule(moduleId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/modules/${moduleId}`);
  }

  savePage(
    moduleId: string,
    page: Partial<MpxApplicationSubModuleRef>,
  ): Observable<MpxApplicationSubModuleRef> {
    const payload = { ...page } as Record<string, unknown>;
    if (!payload['id']) {
      delete payload['id'];
    }
    return this.http.post<MpxApplicationSubModuleRef>(
      `${this.apiUrl}/modules/${moduleId}/pages`,
      payload,
    );
  }

  deletePage(pageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/pages/${pageId}`);
  }

  create(application: Partial<MpxApplication>): Observable<MpxApplication> {
    const payload = { ...application } as Record<string, unknown>;
    if (
      !payload['id'] ||
      String(payload['id']).trim() === '' ||
      String(payload['id']).startsWith('catalog-')
    ) {
      delete payload['id'];
    }
    return this.http.post<MpxApplication>(this.apiUrl, payload);
  }

  update(application: MpxApplication): Observable<MpxApplication> {
    return this.http.put<MpxApplication>(this.apiUrl, application);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
