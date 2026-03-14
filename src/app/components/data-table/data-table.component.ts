import {
    Component,
    computed,
    input,
    signal,
    TemplateRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pagination } from '../pagination/pagination';

export interface TableColumn<T> {
    key: keyof T;
    label: string;
}

type LayoutType = 'table' | 'cards' | 'cards-horizontal';

@Component({
    selector: 'm-data-table',
    standalone: true,
    imports: [CommonModule, FormsModule, Pagination],
    templateUrl: './data-table.component.html',
    styleUrl: './data-table.component.scss',
})
export class DataTableComponent<T extends Record<string, any>> {

    data = input.required<T[]>();
    columns = input<TableColumn<T>[]>([]);

    filterFields = input<(keyof T)[]>([]);
    placeholder = input<string>('Pesquisar...');

    layout = input<LayoutType>('table');

    // template para cards
    cardTemplate = input<TemplateRef<any> | null>(null);

    // query externa opcional
    query = input<string | null>(null);

    // se true, desabilita o filtro internos (útil quando os dados já vêm filtrados da API/DB)
    remoteFilter = input<boolean>(false);

    pageSize = input<number>(10);
    currentPage = signal(1);

    filterText = signal('');

    // format fields retirando acentos
    formatField(field: string) {
        return field.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    filteredData = computed(() => {
        const currentData = this.data();

        if (this.remoteFilter()) {
            return currentData;
        }

        const text = (this.query() ?? this.filterText()).toLowerCase().trim();
        const fields = this.filterFields();

        if (!text || fields.length === 0) {
            return currentData;
        }

        return currentData.filter((item) =>
            fields.some((field) => {
                const value = this.formatField(String(item[field]).toLowerCase());
                return value !== null &&
                    value !== undefined &&
                    value.includes(text);
            })
        );
    });

    paginatedData = computed(() => {
        const data = this.filteredData();
        const start = (this.currentPage() - 1) * this.pageSize();
        const end = start + this.pageSize();
        return data.slice(start, end);
    });

    constructor() {
        // Reset page when filtering
        computed(() => {
            this.query();
            this.filterText();
            this.currentPage.set(1);
        });
    }

    onSearchChange(value: string) {
        this.filterText.set(value);
    }
}