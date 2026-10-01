import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmSwitch } from '@spartan-ng/helm/switch';
import { HlmLabel } from '@spartan-ng/helm/label';
import { NgIcon } from '@ng-icons/core';

export interface CustomerData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderType: 'dine-in' | 'parcel';
}

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, FormsModule, HlmAlertImports, HlmSwitch, HlmLabel, NgIcon],
  templateUrl: './customer.html',
  styleUrl: './customer.css',
})
export class Customer {
  @Input() customerName = '';
  @Input() customerPhone = '';
  @Input() customerEmail = '';
  @Input() orderType: 'dine-in' | 'parcel' = 'dine-in';

  @Input() submitted = false;
  @Input() errorMessage = '';

  @Output() customerChange = new EventEmitter<CustomerData>();

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }
  isValidPhone(phone: string): boolean {
    return /^01[3-9]\d{8}$/.test(phone.trim());
  }
  onCustomerChange(): void {
    this.customerChange.emit({
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      customerEmail: this.customerEmail,
      orderType: this.orderType,
    });
  }

  onOrderTypeChange(value: boolean): void {
    this.orderType = value ? 'parcel' : 'dine-in';

    this.onCustomerChange();
  }
}
