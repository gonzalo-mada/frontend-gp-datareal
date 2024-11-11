import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ProgramasService } from 'src/app/project/services/programas/programas.service';


@Component({
  selector: 'app-table-programas-historial-actividad',
  templateUrl: './table-programas-historial-actividad.component.html',
  styles: [
  ]
})
export class TableProgramasHistorialActividadComponent implements OnInit, OnChanges {

  @ViewChild("dt") dataTableComponent!: Table;

  constructor(private programasService: ProgramasService, private messageService: MessageService){}
  @Input() data: any[] = [];
  @Input() mode: string = '';

  dataKeyTable: string = ''
  searchValue: string | undefined;
  originalData: any[] = [];
  globalFiltros: any[] = [
    'descripcion.descripcion' , 
    'descripcion.valor_antes' , 
    'descripcion.valor_despues' ,
    'fecha' ,
    'usuario' ,
    'nombre_usuario' ,
    'correo_usuario'
  ];
  showFilters: boolean = false;
  groupedData: any;
  selectedDate: string = '';

  async ngOnInit() {
    this.dataKeyTable = 'Cod_Programa';
    this.groupedData = this.formatData(this.data);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.originalData = [...this.data];
    }
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table){
    this.searchValue = ''
    this.data = [...this.originalData];
    table.reset();
  }

  

  formatData(data: any[]){
    const actividades = [
      {
        label: 'CREACIÓN',
        value: 1,
        items: data
          .filter(item => item.tipo_movimiento === 'C')
          .map(item => ({
            label: item.descripcion.descripcion,
            value: item.descripcion.descripcion
          }))
      },
      {
        label: 'ACTUALIZACIÓN',
        value: 2,
        items: data
          .filter(item => item.tipo_movimiento === 'U')
          .map(item => ({
            label: item.descripcion.descripcion,
            value: item.descripcion.descripcion
          }))
      }
    ];

    const tipos_actividades = [
      { label: 'Creación de programa', value: 'C' },
      { label: 'Actualización en el programa', value: 'U' },
      { label: 'Eliminación en el programa', value: 'D' }
    ];

    const usuarios = Array.from(
      new Set(data.map(item => item.nombre_usuario))
    ).map(nombre => ({ label: nombre , value: nombre }));

    return {
      actividades,
      tipos_actividades,
      usuarios
    };
  }

  filter(){

    if (this.selectedDate) {
      this.dataTableComponent.filter(this.selectedDate, 'fecha', 'equals');
    }else{
      this.messageService.add({
        key: this.programasService.keyPopups,
        severity: 'warn',
        detail: 'No ha seleccionado fecha'
      });
    }
    
  }

  clearCalendar(table: Table){
    this.searchValue = ''
    this.data = [...this.originalData];
    table.reset();
    this.selectedDate = '';
  }

}
