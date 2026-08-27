import { Component } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'unifor-loading',
  standalone: true,
  imports: [ProgressSpinnerModule],
  template: `
    <div class="loading-wrapper">
      <p-progressSpinner
        styleClass="loading-spinner"
        strokeWidth="4"
        animationDuration=".8s"
      />
    </div>
  `,
  styles: [
    `
      .loading-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2rem;
      }
    `,
  ],
})
export class LoadingComponent {}
