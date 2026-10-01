import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { lucideHouse, lucideInbox, lucideSettings } from '@ng-icons/lucide';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { MenuService, MenuItem } from '../services/menu.service';
import { ChangeDetectorRef } from '@angular/core';
import { Bill } from '../bill/bill';
import { Cart, CartLine } from '../cart/cart';
import { Customer, CustomerData } from '../customer/customer';
import { Sidebar } from '../sidebar/sidebar';
import { Menu } from '../menu/menu';
import { Order, Orders } from '../orders/orders';


@Component({
  selector: 'app-dashboard',

  imports: [
    CommonModule,
    FormsModule,
    HlmSidebarImports,
    HlmButtonImports,
    HlmTableImports,
    HlmAlertImports,
    Bill,
    Cart,
    Customer,
    Sidebar,
    Menu,
    Orders
],

  templateUrl: './dashboard.html',

  styleUrl: './dashboard.css',

  providers: [
    provideIcons({
      lucideHouse,
      lucideInbox,
      lucideSettings,
    }),
  ],
})
export class Dashboard implements OnInit {
  activeView = 'POS';

  menuItems: MenuItem[] = [];

  categories: string[] = [];

  loading = true;

  customerName = '';

  customerPhone = '';

  customerEmail = '';
  errorMessage = '';

  successMessage = '';

  orderType: 'dine-in' | 'parcel' = 'dine-in';

  cart: CartLine[] = [];

  orders: Order[] = [];

  submitted = false;

  constructor(
    private router: Router,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef,
  ) {}
  selectNav(id: string): void {
    this.activeView = id;
  }
  onCustomerChange(data: CustomerData): void {
    this.customerName = data.customerName;
    this.customerPhone = data.customerPhone;
    this.customerEmail = data.customerEmail;
    this.orderType = data.orderType;
  }
  ngOnInit(): void {
    this.menuService.getMenuItems().subscribe({
      next: (items) => {
        console.log('API DATA:', items);

        this.menuItems = items;

        this.categories = ['All', ...Array.from(new Set(items.map((item) => item.category)))];

        console.log('MENU ITEMS:', this.menuItems);

        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('MENU ERROR:', error);
        this.loading = false;
      },
    });
  }

  addToCart(item: MenuItem): void {
    const existingLine = this.cart.find((line) => line.item.id === item.id);

    if (existingLine) {
      this.cart = this.cart.map((line) =>
        line.item.id === item.id ? { ...line, quantity: line.quantity + 1 } : line,
      );
    } else {
      this.cart = [
        ...this.cart,
        {
          item: item,
          quantity: 1,
        },
      ];
    }
  }

  get cartTotal(): number {
    return this.cart.reduce(
      (sum, line) => sum + line.item.price * line.quantity,

      0,
    );
  }

  checkout(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    const validations = [
      {
        invalid: this.cart.length === 0,
        message: 'Please add at least one item to the cart.',
      },
      {
        invalid: !this.customerName.trim(),
        message: 'Please enter customer name.',
      },
      {
        invalid: !this.customerPhone.trim(),
        message: 'Please enter customer phone number.',
      },
      {
        invalid: !this.customerEmail.trim(),
        message: 'Please enter customer email.',
      },
    ];

    const error = validations.find((v) => v.invalid);

    if (error) {
      this.errorMessage = error.message;
      return;
    }

    const newOrder: Order = {
      id: Date.now(),

      customerName: this.customerName.trim(),

      customerPhone: this.customerPhone.trim(),

      customerEmail: this.customerEmail.trim(),

      orderType: this.orderType,

      items: this.cart.map((line) => ({
        item: line.item,
        quantity: line.quantity,
      })),

      total: this.cartTotal,

      date: new Date().toISOString(),
    };

    this.orders.push(newOrder);

    console.log('New Order:', newOrder);
    console.log('All Orders:', this.orders);

    this.successMessage =
      `Order placed successfully! Customer: ${newOrder.customerName}, ` +
      `Phone: ${newOrder.customerPhone}, ` +
      `Total: ${newOrder.total.toFixed(2)}`;

    this.cart = [];
    this.customerName = '';
    this.customerPhone = '';
    this.customerEmail = '';
    this.orderType = 'dine-in';
    this.submitted = false;
  }

  logout(): void {
    localStorage.clear();

    this.router.navigate(['/login']);
  }
}
