import { Component, Input } from '@angular/core';
import { MessagesModule } from 'primeng/messages';

@Component({
  selector: 'unifor-error-message',
  standalone: true,
  imports: [MessagesModule],
  template: `
    @if (message) {
      <p-messages
        [value]="[{ severity: 'error', summary: 'Erro', detail: message }]"
        [closable]="true"
      />
    }
  `,
})
export class ErrorMessageComponent {
  @Input() message: string | null = null;
}
