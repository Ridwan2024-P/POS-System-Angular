import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';

interface NavItem {
  id: string;
  label: string;
  adminOnly: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, HlmButtonImports, HlmSidebarImports],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Output() navSelected = new EventEmitter<string>();

  activeView = 'POS';

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

  constructor(private router: Router) {
    const role = localStorage.getItem('role');

    this.visibleNavItems = this.allNavItems.filter((item) => {
      if (item.adminOnly) {
        return role === 'admin';
      }

      return true;
    });
  }

  selectNav(id: string): void {
    this.activeView = id;
    this.navSelected.emit(id);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
