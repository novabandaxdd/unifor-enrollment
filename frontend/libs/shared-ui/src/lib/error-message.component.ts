import { Component, Input } from '@angular/core';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'unifor-error-message',
  standalone: true,
  imports: [MessageModule],
  template: `
    @if (message) {
      <p-message severity="error" [text]="message" styleClass="w-full" />
    }
  `,
  styles: [
    `
      :host {
        display: block;
        margin: 0.5rem 0;
      }
    `,
  ],
})
export class ErrorMessageComponent {
  @Input() message: string | null = null;
}
