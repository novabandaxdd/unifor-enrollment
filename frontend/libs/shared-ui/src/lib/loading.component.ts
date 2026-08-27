import { Component } from '@angular/core';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'unifor-loading',
  standalone: true,
  imports: [ProgressSpinner],
  template: `
    <div class="loading-container">
      <p-progressSpinner
        strokeWidth="4"
        animationDuration=".8s"
        ariaLabel="Carregando..."
      />
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }
  `],
})
export class LoadingComponent {}
