import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink, Button],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <span class="error-code">403</span>
        <h1>Acesso Negado</h1>
        <p>Você não tem permissão para acessar esta página.</p>
        <p-button
          label="Voltar ao início"
          icon="pi pi-home"
          routerLink="/dashboard"
        />
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
    }
    .unauthorized-content {
      text-align: center;
    }
    .error-code {
      display: block;
      font-size: 5rem;
      font-weight: 700;
      color: #e53e3e;
      line-height: 1;
      margin-bottom: 0.5rem;
    }
    h1 {
      font-size: 1.8rem;
      color: #1e3a5f;
      margin-bottom: 0.5rem;
    }
    p {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }
  `],
})
export class UnauthorizedPage {}
