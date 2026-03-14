import { Component, computed, OnInit, signal } from '@angular/core';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../types/category';
import { CommonModule, DatePipe } from '@angular/common';
import { FormInputComponent } from '../../../components/form/form-input/form-input.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { DataTableComponent, TableColumn } from '../../../components/data-table/data-table.component';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, DatePipe, FormInputComponent, ReactiveFormsModule, DataTableComponent],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class CategoriesPage implements OnInit {

  categories = signal<Category[]>([]);
  searchControl = new FormControl('');
  search = signal<string>('');

  columns : TableColumn<Category>[] = [
    { key: 'id', label: 'Id' },
    { key: 'name', label: 'Nome' },
    { key: 'type', label: 'Tipo' },
    { key: 'weight', label: 'Peso' },
    { key: 'description', label: 'Descrição' },
    { key: 'active', label: 'Ativo' },
    { key: 'createdAt', label: 'Criado em' },
  ];

  filterFields = ['name', 'type', 'weight', 'description', 'active', 'createdAt'] as (keyof Category)[];

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
}
