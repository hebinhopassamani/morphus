import { inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class AppBuilderSanitizerService {
  private readonly sanitizer = inject(DomSanitizer);

  sanitizeHtmlString(rawHtml: string): string {
    if (!rawHtml || typeof DOMParser === 'undefined') {
      return rawHtml || '';
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');

    const forbiddenTags = [
      'script',
      'iframe',
      'object',
      'embed',
      'applet',
      'meta',
      'base',
      'link',
    ];
    for (const tag of forbiddenTags) {
      doc.body.querySelectorAll(tag).forEach((el) => el.remove());
    }

    const allElements = doc.body.querySelectorAll('*');
    allElements.forEach((el) => {
      for (const attr of Array.from(el.attributes)) {
        const nameLower = attr.name.toLowerCase();
        const valLower = (attr.value || '').trim().toLowerCase();

        if (nameLower.startsWith('on')) {
          el.removeAttribute(attr.name);
          continue;
        }

        if (
          (nameLower === 'href' ||
            nameLower === 'src' ||
            nameLower === 'xlink:href' ||
            nameLower === 'action' ||
            nameLower === 'formaction') &&
          (valLower.startsWith('javascript:') ||
            valLower.startsWith('vbscript:') ||
            valLower.startsWith('data:text/html'))
        ) {
          el.removeAttribute(attr.name);
        }
      }
    });

    return doc.body.innerHTML;
  }

  toTrustedHtml(rawHtml: string): SafeHtml {
    const clean = this.sanitizeHtmlString(rawHtml);
    return this.sanitizer.bypassSecurityTrustHtml(clean);
  }
}
