import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuItem } from '../services/menu.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  @Input() menuItems: MenuItem[] = [];
  @Input() categories: string[] = [];

  @Output() itemSelected = new EventEmitter<MenuItem>();

  selectedCategory = 'All';
  searchText = '';

  get filteredMenuItems(): MenuItem[] {
    return this.menuItems.filter((item) => {
      const categoryMatch =
        this.selectedCategory === 'All' || item.category === this.selectedCategory;

      const searchMatch = item.name.toLowerCase().includes(this.searchText.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }

  addToCart(item: MenuItem): void {
    this.itemSelected.emit(item);
  }
}
