import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { CertificacionIntermedia } from 'src/app/project/models/programas/CertificacionIntermedia';
import { CertifIntermediaMainService } from 'src/app/project/services/programas/certificaciones-intermedias/main.service';
import { TableCertifIntermediaService } from 'src/app/project/services/programas/certificaciones-intermedias/table.service';

@Component({
  selector: 'app-table-certificaciones-intermedias',
  templateUrl: './table-certificaciones-intermedias.component.html',
  styles: [
  ]
})
export class TableCertificacionesIntermediasComponent implements OnInit, OnDestroy {
  searchValue: string | undefined;

  constructor( 
    public main: CertifIntermediaMainService,
    public table: TableCertifIntermediaService
  ){}

  ngOnInit(): void {
    this.getData(true);
  }
  ngOnDestroy(): void {
    this.table.resetSelectedRows();
  }

  async getData(showCountTableValues: boolean){
    await this.main.getCertificacionesIntermedias(showCountTableValues);
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    this.table.resetSelectedRows();
  }

  edit(data: CertificacionIntermedia){
    this.main.setModeCrud('edit',data);
  }
 
  show(data: CertificacionIntermedia){
    this.main.setModeCrud('show', data);
  }
 
  delete(data: CertificacionIntermedia){
    this.main.setModeCrud('delete', data);
  }
   
  clear(table: Table){
    this.table.resetSelectedRows();
    this.searchValue = ''
    table.reset();
    this.main.countTableValues();
  }

}
