import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { lucideHouse, lucideInbox, lucideSettings } from '@ng-icons/lucide';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { lucideAlertTriangle } from '@ng-icons/lucide';
import { MenuService, MenuItem } from '../services/menu.service';
import { ChangeDetectorRef } from '@angular/core';

import { HlmSwitch } from '@spartan-ng/helm/switch';
import { HlmLabel } from '@spartan-ng/helm/label';
import { Bill } from '../bill/bill';
import { Cart } from '../cart/cart';


interface NavItem {
  id: string;
  label: string;
  adminOnly: boolean;
}

interface CartLine {
  item: MenuItem;
  quantity: number;
}

interface Order {
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
  selector: 'app-dashboard',

  imports: [
    CommonModule,
    FormsModule,
    HlmSidebarImports,
    HlmButtonImports,
    HlmTableImports,
    HlmAlertImports,
    NgIcon,
    HlmLabel, HlmSwitch,
    Bill,
    Cart
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
  allNavItems: NavItem[] = [
    {
      id: 'POS',
      label: 'POS',
      adminOnly: false,
    },

    {
      id: 'orders',
      label: 'Orders',
      adminOnly: true,
    },
  ];

  visibleNavItems: NavItem[] = [];

  activeView = 'POS';

  menuItems: MenuItem[] = [];

  categories: string[] = [];

  selectedCategory = 'All';

  searchText = '';

  loading = true;

  customerName = '';

  customerPhone = '';

  customerEmail = '';
  errorMessage = '';

  successMessage = '';

  orderType: 'dine-in' | 'parcel' = 'dine-in';

  cart: CartLine[] = [];

  orders: Order[] = [];

  sidebarOpen = false;

  submitted = false;

  constructor(
    private router: Router,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef,
  ) {
    if (typeof window !== 'undefined') {
      const admin = window.localStorage.getItem('admin');

      const employee = window.localStorage.getItem('employee');

      if (admin) {
        this.visibleNavItems = this.allNavItems;
      } else if (employee) {
        this.visibleNavItems = this.allNavItems.filter((item) => item.id !== 'orders');
      } else {
        this.visibleNavItems = this.allNavItems.filter((item) => !item.adminOnly);
      }
    }
  }
  ngOnInit(): void {
    this.menuService.getMenuItems().subscribe({
      next: (items) => {
        console.log('API DATA:', items);

        this.menuItems = items;

        this.categories = ['All', ...Array.from(new Set(items.map((item) => item.category)))];

        console.log('MENU ITEMS:', this.menuItems);
        console.log('FILTERED:', this.filteredMenuItems);

        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('MENU ERROR:', error);
        this.loading = false;
      },
    });
  }

  selectNav(id: string): void {
    this.activeView = id;

    this.sidebarOpen = false;
  }

  get filteredMenuItems(): MenuItem[] {
    return this.menuItems.filter((item) => {
      const categoryMatch =
        this.selectedCategory === 'All' || item.category === this.selectedCategory;

      const searchMatch = item.name.toLowerCase().includes(this.searchText.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }

  addToCart(item: MenuItem): void {
    const existingLine = this.cart.find((line) => line.item.id === item.id);

    if (existingLine) {
      existingLine.quantity++;
    } else {
      this.cart.push({
        item: item,

        quantity: 1,
      });
    }
  }

  increaseQty(line: CartLine): void {
    line.quantity++;
  }

  decreaseQty(line: CartLine): void {
    if (line.quantity > 1) {
      line.quantity--;
    } else {
      this.cart = this.cart.filter((item) => item !== line);
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

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
