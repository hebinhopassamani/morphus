import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import {
  BuiDialog,
  BuiDialogBackdrop,
  BuiDialogBody,
  BuiDialogClose,
  BuiDialogContent,
  BuiDialogDescription,
  BuiDialogFooter,
  BuiDialogHeader,
  BuiDialogPortal,
  BuiDialogTitle,
} from '@builder-kit/dialog';
import { MorphusMessageService } from '@core/mpx-message';

@Component({
  selector: 'mpx-message',
  exportAs: 'mpxMessage',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatIconButton,
    MatCheckbox,
    MatDivider,
    MatIcon,
    MatFormField,
    MatInput,
    MatTooltip,
    BuiDialog,
    BuiDialogBackdrop,
    BuiDialogBody,
    BuiDialogClose,
    BuiDialogContent,
    BuiDialogDescription,
    BuiDialogFooter,
    BuiDialogHeader,
    BuiDialogPortal,
    BuiDialogTitle,
  ],
  styleUrl: './message.component.css',
  templateUrl: './message.component.html',
})
export class MpxMessageComponent {
  protected readonly messageService = inject(MorphusMessageService);

  protected doubleCheckChecked = false;
  protected doubleCheckInput = '';
  private lastMessageId?: string;

  protected syncIfNewMessage(): boolean {
    const currentId = this.messageService.message().id;
    if (currentId !== this.lastMessageId) {
      this.lastMessageId = currentId;
      this.doubleCheckChecked = false;
      this.doubleCheckInput = '';
    }
    return true;
  }

  protected isConfirmDisabled(): boolean {
    this.syncIfNewMessage();

    if (this.messageService.loading()) {
      return true;
    }

    const msg = this.messageService.message();

    if (msg.doubleCheck && !this.doubleCheckChecked) {
      return true;
    }

    if (
      msg.doubleCheckText &&
      this.doubleCheckInput.trim() !== msg.doubleCheckText.trim()
    ) {
      return true;
    }

    return false;
  }

  protected formatTechnicalError(error: unknown): string {
    if (!error) {
      return '';
    }
    if (error instanceof Error) {
      return `${error.name}: ${error.message}\n${error.stack ?? ''}`.trim();
    }
    if (typeof error === 'string') {
      return error;
    }
    try {
      return JSON.stringify(error, null, 2);
    } catch {
      return String(error);
    }
  }

  protected cancelClick(): void {
    const msg = this.messageService.message();
    this.doubleCheckChecked = false;
    this.doubleCheckInput = '';
    msg.onCancel?.();
    this.messageService.close();
  }

  protected async confirmClick(): Promise<void> {
    if (this.isConfirmDisabled()) {
      return;
    }

    const msg = this.messageService.message();
    try {
      this.messageService.loading.set(true);
      await msg.onConfirm?.();
      this.doubleCheckChecked = false;
      this.doubleCheckInput = '';
      this.messageService.close();
    } finally {
      this.messageService.loading.set(false);
    }
  }
}
