import {  effect, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

type selectedRows = any[];


@Injectable({
    providedIn: 'root'
})

export class TableCrudService {

    _selectedRows : selectedRows = [];

    selectedRows = signal<selectedRows>(this._selectedRows);

    private selectedRowsSubject = new Subject<any[]>();
    selectedRows$ = this.selectedRowsSubject.asObservable();
    
    private onClickRefreshTable = new Subject<void>();
    onClickRefreshTable$ = this.onClickRefreshTable.asObservable();

    private resetSelectedRowsSubject = new Subject<void>();
    resetSelectedRowsSubject$ = this.resetSelectedRowsSubject.asObservable();

    constructor(){
        effect(() => {
            this.onSelectedRowsUpdate();
        })
    }

    onSelectedRowsUpdate(){
      this._selectedRows = { ...this.selectedRows() }; 
      this.selectedRowsSubject.next(this.selectedRows()); 
    }

    emitClickRefreshTable(){
        this.onClickRefreshTable.next();
    }

    setSelectedRows(selectedRows: any[]){
        this.selectedRows.set(selectedRows);
    }

    resetSelectedRows(){
        this.selectedRows.set([]);
        this.resetSelectedRowsSubject.next();
    }

    getSelectedRows(){
        return this.selectedRows()
    }

}
