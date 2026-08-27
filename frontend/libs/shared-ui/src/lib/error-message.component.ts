import { Component, Input } from '@angular/core';
import { Message } from 'primeng/message';

@Component({
  selector: 'unifor-error-message',
  standalone: true,
  imports: [Message],
  template: `
    @if (message) {
      <p-message severity="error" [text]="message" />
    }
  `,
})
export class ErrorMessageComponent {
  @Input() message: string | null = null;
}
