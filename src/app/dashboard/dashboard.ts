import { Component, OnInit } from "@angular/core";

import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

import { HlmButtonImports } from "@spartan-ng/helm/button";
import { HlmSidebarImports } from "@spartan-ng/helm/sidebar";
import { HlmTableImports } from "@spartan-ng/helm/table";

import { lucideHouse, lucideInbox, lucideSettings } from "@ng-icons/lucide";

import { NgIcon, provideIcons } from "@ng-icons/core";

interface NavItem {
  id: string;
  label: string;
  adminOnly: boolean;
}

interface MenuItem {
  id: number;
  name: string;
  category: string;
  image: string;
  price: number;
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
  orderType: "dine-in" | "parcel";
  items: CartLine[];
  total: number;
  date: string;
}

@Component({
  selector: "app-dashboard",

  imports: [
    CommonModule,
    FormsModule,
    HlmSidebarImports,
    HlmButtonImports,

    HlmTableImports,
  ],

  templateUrl: "./dashboard.html",

  styleUrl: "./dashboard.css",

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
      id: "POS",
      label: "POS",
      adminOnly: false,
    },

    {
      id: "orders",
      label: "Orders",
      adminOnly: true,
    },
  ];

  visibleNavItems: NavItem[] = [];

  activeView = "POS";

  menuItems: MenuItem[] = [];

  categories: string[] = [];

  selectedCategory = "All";

  searchText = "";

  loading = true;

  customerName = "";

  customerPhone = "";

  customerEmail = "";

  orderType: "dine-in" | "parcel" = "dine-in";

  cart: CartLine[] = [];

  orders: Order[] = [];

  sidebarOpen = false;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    if (typeof window !== "undefined") {
      const admin = window.localStorage.getItem("admin");

      const employee = window.localStorage.getItem("employee");

      if (admin) {
        this.visibleNavItems = this.allNavItems;
      } else if (employee) {
        this.visibleNavItems = this.allNavItems.filter(
          (item) => item.id !== "orders",
        );
      } else {
        this.visibleNavItems = this.allNavItems.filter(
          (item) => !item.adminOnly,
        );
      }
    }
  }

  getMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>("/menu.json");
  }

  ngOnInit(): void {
    this.getMenuItems().subscribe({
      next: (items) => {
        console.log("API DATA:", items);

        this.menuItems = items;

        this.categories = [
          "All",
          ...Array.from(new Set(items.map((item) => item.category))),
        ];

        console.log("MENU ITEMS:", this.menuItems);
        console.log("FILTERED:", this.filteredMenuItems);

        this.loading = false;
      },

      error: (error) => {
        console.error("MENU ERROR:", error);
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
        this.selectedCategory === "All" ||
        item.category === this.selectedCategory;

      const searchMatch = item.name
        .toLowerCase()
        .includes(this.searchText.toLowerCase());

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
    if (this.cart.length === 0) {
      alert("Please add at least one item to the cart.");

      return;
    }

    if (!this.customerName.trim()) {
      alert("Please enter customer name.");

      return;
    }

    if (!this.customerPhone.trim()) {
      alert("Please enter customer phone number.");

      return;
    }

    if (!this.customerEmail.trim()) {
      alert("Please enter customer email.");

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

    console.log("New Order:", newOrder);

    console.log("All Orders:", this.orders);

    alert(
      `Order placed successfully!\n\n` +
        `Customer: ${newOrder.customerName}\n` +
        `Phone: ${newOrder.customerPhone}\n` +
        `Total: ${newOrder.total.toFixed(2)}`,
    );

    this.cart = [];

    this.customerName = "";

    this.customerPhone = "";

    this.customerEmail = "";

    this.orderType = "dine-in";
  }

  logout(): void {
    localStorage.clear();

    this.router.navigate(["/login"]);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
