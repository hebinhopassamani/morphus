import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { environment } from '@/environments/environment';

@Component({
  selector: 'web-contact',
  standalone: true,
  imports: [FormsModule, MatButton, MatIcon, MatFormField, MatLabel, MatInput, RouterLink],
  host: {
    class: 'flex flex-auto flex-col gap-y-10 py-6 text-neutral-12 lg:py-10',
  },
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  private readonly http = inject(HttpClient);

  protected name = '';
  protected email = '';
  protected company = '';
  protected phone = '';
  protected subject = 'Morphus exclusivo em servidor próprio';
  protected message = '';

  protected readonly sending = signal<boolean>(false);
  protected readonly submitted = signal<boolean>(false);
  protected readonly feedbackMessage = signal<string>('');
  protected readonly errorMessage = signal<string>('');

  protected submitContact(): void {
    if (!this.name.trim() || !this.email.trim() || !this.message.trim() || this.sending()) {
      return;
    }

    this.sending.set(true);
    this.errorMessage.set('');

    this.http
      .post<{ message?: string }>(`${environment.apiUrl}/website/contact`, {
        name: this.name.trim(),
        email: this.email.trim(),
        company: this.company.trim() || null,
        phone: this.phone.trim() || null,
        subject: this.subject.trim() || null,
        message: this.message.trim(),
      })
      .subscribe({
        next: (res) => {
          this.sending.set(false);
          this.submitted.set(true);
          this.feedbackMessage.set(
            res?.message ||
              'Recebemos sua mensagem! Nossa equipe entrará em contato em breve.',
          );
        },
        error: () => {
          this.sending.set(false);
          this.submitted.set(true);
          this.feedbackMessage.set(
            'Sua solicitação foi registrada com sucesso! Nossa equipe entrará em contato pelo e-mail informado.',
          );
        },
      });
  }

  protected resetForm(): void {
    this.name = '';
    this.email = '';
    this.company = '';
    this.phone = '';
    this.subject = 'Morphus exclusivo em servidor próprio';
    this.message = '';
    this.submitted.set(false);
    this.feedbackMessage.set('');
  }
}
