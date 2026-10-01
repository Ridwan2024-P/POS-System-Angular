import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from '../services/menu.service';

export interface CartLine {
  item: MenuItem;
  quantity: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  @Input() cart: CartLine[] = [];

  @Output() cartChange = new EventEmitter<CartLine[]>();

  increaseQty(line: CartLine): void {
    this.cart = this.cart.map((item) =>
      item.item.id === line.item.id ? { ...item, quantity: item.quantity + 1 } : item,
    );

    this.cartChange.emit(this.cart);
  }

  decreaseQty(line: CartLine): void {
    if (line.quantity > 1) {
      this.cart = this.cart.map((item) =>
        item.item.id === line.item.id ? { ...item, quantity: item.quantity - 1 } : item,
      );
    } else {
      this.cart = this.cart.filter((item) => item.item.id !== line.item.id);
    }

    this.cartChange.emit(this.cart);
  }
}
