import { Component } from '@angular/core';
import { EventEmitter, Input, Output } from '@angular/core';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { NgIcon, provideIcons } from '@ng-icons/core';
@Component({
  imports: [ HlmAlertImports, NgIcon,],
  selector: 'app-bill',
  styleUrl: './bill.css',
  templateUrl: './bill.html',
})
export class Bill {
  @Input() cartTotal = 0;

  @Input() cartLength = 0;

  @Input() errorMessage = '';

  @Input() successMessage = '';

  @Output() checkoutClicked = new EventEmitter<void>();

  checkout(): void {
    this.checkoutClicked.emit();
  }
}
