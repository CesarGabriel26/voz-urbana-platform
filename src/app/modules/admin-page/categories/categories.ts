import { Component, computed, OnInit, signal } from '@angular/core';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../types/category';
import { CommonModule, DatePipe } from '@angular/common';
import { FormInputComponent } from '../../../components/form/form-input/form-input.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, DatePipe, FormInputComponent, ReactiveFormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class CategoriesPage implements OnInit {

  categories = signal<Category[]>([]);
  searchControl = new FormControl('');
  search = signal<string>('');

  constructor(
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe((categories) => {
      this.categories.set(categories);
    });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.search.set(value ?? '');
      });
  }


  filteredCategories = computed(() => {
    const search = this.search()?.toLowerCase() || '';

    if (!search) return this.categories();

    return this.categories().filter(c =>
      (c.name?.toLowerCase() || '').includes(search) ||
      (c.description?.toLowerCase() || '').includes(search)
    );
  });
}
