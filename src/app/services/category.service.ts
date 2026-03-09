import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from '../config';
import { Category } from '../types/category';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private http = inject(HttpClient);

    getCategories(filter?: { active?: boolean, type?: string }): Observable<Category[]> {
        return this.http.get<Category[]>(`${config.api}/categories`, { params: filter })
    }

    createCategory(category: Partial<Category>): Observable<Category> {
        return this.http.post<Category>(`${config.api}/categories`, category);
    }

    updateCategory(id: string, category: Partial<Category>): Observable<Category> {
        return this.http.put<Category>(`${config.api}/categories/${id}`, category)
    }

    deleteCategory(id: string): Observable<Category> {
        return this.http.delete<Category>(`${config.api}/categories/${id}`)
    }
}
