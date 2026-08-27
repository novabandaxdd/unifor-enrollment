import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  template: `
    <div class="unauthorized-wrapper">
      <div class="unauthorized-content">
        <i class="pi pi-lock unauthorized-icon"></i>
        <h1>Acesso Negado</h1>
        <p>Você não possui permissão para acessar esta página.</p>
        <p-button
          label="Voltar ao Início"
          icon="pi pi-home"
          routerLink="/dashboard"
        />
      </div>
    </div>
  `,
  styles: [
    `
      .unauthorized-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 60vh;
      }

      .unauthorized-content {
        text-align: center;
        max-width: 400px;
      }

      .unauthorized-icon {
        font-size: 4rem;
        color: #dc2626;
        margin-bottom: 1rem;
      }

      h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1f2937;
        margin: 0 0 0.5rem;
      }

      p {
        color: #6b7280;
        margin: 0 0 1.5rem;
      }
    `,
  ],
})
export class UnauthorizedPage {}
