import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { CartLine } from '../cart/cart';

export interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderType: 'dine-in' | 'parcel';
  items: CartLine[];
  total: number;
  date: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    HlmTableImports,
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {
  @Input() orders: Order[] = [];
}