import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { HistorialActividad } from 'src/app/project/models/programas/HistorialActividad';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { MessageServiceGP } from 'src/app/project/services/components/message-service.service';

interface Actividad {
  Cod_programa?: number,
  correo_usuario?: string,
  descripcion?: {
    descripcion: string,
    valor_antes: string,
    valor_despues: string
  },
  fecha?: string,
  fecha_hora?: string,
  nombre_usuario?: string,
  tipo_movimiento?: 'C' | 'U' | 'D',
  usuario?: string,
  arrayData?: any
}

@Component({
  selector: 'app-table-programas-historial-actividad',
  templateUrl: './table-programas-historial-actividad.component.html',
  styles: [
  ]
})
export class TableProgramasHistorialActividadComponent implements OnInit {

  constructor(private messageService: MessageServiceGP){}
  
  @Input() data: HistorialActividad[] = [];
  @Input() mode: ModeForm;

  dataKeyTable: string = ''
  searchValue: string | undefined;
  globalFiltros: any[] = [
    'descripcion.descripcion' , 
    'descripcion.valor_antes' , 
    'descripcion.valor_despues' ,
    'fecha' ,
    'usuario' ,
    'nombre_usuario' ,
    'correo_usuario'
  ];
  groupedData: any;
  selectedDate: string = '';
  dialog: boolean = false;
  actividad!: Actividad;
  fromMultiSelect: boolean = false;
  

  async ngOnInit() {
    this.dataKeyTable = 'Cod_Programa';
    this.groupedData = this.formatData(this.data);
    console.log("data",this.data);
    
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table){
    this.searchValue = '';
    this.selectedDate = '';
    table.reset();
    this.countTableValues(table);
  }

  formatData(data: any[]){
    const actividades = [
      {
        label: 'CREACIÓN',
        value: 1,
        items: this.removeDuplicates(data
          .filter(item => item.tipo_movimiento === 'C')
          .map(item => ({
            label: item.descripcion.descripcion,
            value: item.descripcion.descripcion
          })))
      },
      {
        label: 'ACTUALIZACIÓN',
        value: 2,
        items: this.removeDuplicates(data
          .filter(item => item.tipo_movimiento === 'U')
          .map(item => ({
            label: item.descripcion.descripcion,
            value: item.descripcion.descripcion
          })))
      },
      {
        label: 'ELIMINACIÓN',
        value: 3,
        items: this.removeDuplicates(data
          .filter(item => item.tipo_movimiento === 'D')
          .map(item => ({
            label: item.descripcion.descripcion,
            value: item.descripcion.descripcion
          })))
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

  removeDuplicates(items: any[]) {
    const uniqueItems = new Map();
    items.forEach(item => {
        uniqueItems.set(item.label, item);
    });
    return Array.from(uniqueItems.values());
}

  clearCalendar(table: Table){
    this.searchValue = ''
    table.reset();
    this.selectedDate = '';
  }

  customSort(event:any){
    switch (event.field) {
      case 'fecha':
        event.data?.sort((data1:any , data2:any) => {
          const value1 = data1.fecha_hora ? data1.fecha_hora : '';
          const value2 = data2.fecha_hora ? data2.fecha_hora : '';

          let newValue1 = this.convertirStringAFecha(value1);
          let newValue2 = this.convertirStringAFecha(value2);

          let result = 0;
          if (newValue1 > newValue2) {
            result = 1;
          } else if (newValue1 < newValue2) {
            result = -1;
          }
          return event.order * result;
        });
      break;

      case 'descripcion.descripcion':
        event.data?.sort((data1:any , data2:any) => {
          const value1 = data1.descripcion ? data1.descripcion.descripcion : '';
          const value2 = data2.descripcion ? data2.descripcion.descripcion : '';
          let result = 0;
          if (value1 > value2) {
            result = 1;
          } else if (value1 < value2) {
            result = -1;
          }
          return event.order * result;
        });
      break;
    
      default:
        event.data?.sort((data1:any , data2:any) => {
          let value1 = data1[event.field];
          let value2 = data2[event.field];
          let result = null;
          if (value1 == null && value2 != null) result = -1;
          else if (value1 != null && value2 == null) result = 1;
          else if (value1 == null && value2 == null) result = 0;
          else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2);
          else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

          return event.order * result;
        });
      break;
    }
  }

  convertirStringAFecha(fechaStr: string): Date {
    const [day, month, yearAndTime] = fechaStr.split("-");
    const [year, time] = yearAndTime.split(" ");
    const [hour, minute, seconds] = time.split(":");
  
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(seconds));
  }

  filterData(valueSelected: string[], from: 'actividad' | 'tipo_mov' | 'usuario'){
    console.log("valueSelected",valueSelected);
    if (valueSelected.length !== 0) {
      switch (from) {
        case 'actividad':
          this.data = this.data.filter((item) =>
            valueSelected.some((actividad: any) => item.descripcion.descripcion === actividad)
          );
        break;
      
        default:
          break;
      }
    }
    // this.countActividadesToast();

  }

  countTableValues(table: Table){
    this.messageService.clear();
    this.messageService.add({
      key: 'main',
      severity: 'info',
      detail: table._totalRecords !== 1
       ? `${table._totalRecords} actividades listadas.`
       : `${table._totalRecords} actividad listada.`
    });
  }

  show(data: Actividad){
    this.fromMultiSelect = false;
    this.actividad = {...data}
    if (this.actividad.descripcion?.descripcion.includes('DOCUMENTOS')) {
      const data = this.actividad.descripcion?.valor_despues.split('|').map(name => name.trim())
      this.actividad = { ...this.actividad,  arrayData: data}
      console.log("this.actividad!!!",this.actividad);

    }
    if (this.actividad.descripcion?.descripcion.includes('ACTUALIZACIÓN DE UNIDADES ACADÉMICAS')) {
      const data_antes = this.actividad.descripcion?.valor_antes.split('|').map(name => name.trim())
      const data_despues = this.actividad.descripcion?.valor_despues.split('|').map(name => name.trim())
      const dataArray = this.generateArray(data_antes,data_despues);
      this.actividad = { ...this.actividad,  arrayData: dataArray}
      this.fromMultiSelect = true;
    }
    if (this.actividad.descripcion?.descripcion.includes('ACTUALIZACIÓN DE GRADUACIÓN COLABORATIVA')) {
      const data_antes = this.actividad.descripcion?.valor_antes.split('|').map(name => name.trim())
      const data_despues = this.actividad.descripcion?.valor_despues.split('|').map(name => name.trim())
      const dataArray = this.generateArray(data_antes,data_despues);
      this.actividad = { ...this.actividad,  arrayData: dataArray}
      this.fromMultiSelect = true;
    }
    if (this.actividad.descripcion?.descripcion.includes('ACTUALIZACIÓN DE CERTIFICACIÓN INTERMEDIA')) {
      const data_antes = this.actividad.descripcion?.valor_antes.split('|').map(name => name.trim())
      const data_despues = this.actividad.descripcion?.valor_despues.split('|').map(name => name.trim())
      const dataArray = this.generateArray(data_antes,data_despues);
      this.actividad = { ...this.actividad,  arrayData: dataArray}
      this.fromMultiSelect = true;
    }
    if (this.actividad.descripcion?.descripcion.includes('ACTUALIZACIÓN DE INSTITUCIONES DE GRADUACIÓN COLABORATIVA')) {
      const data_antes = this.actividad.descripcion?.valor_antes.split('|').map(name => name.trim())
      const data_despues = this.actividad.descripcion?.valor_despues.split('|').map(name => name.trim())
      const dataArray = this.generateArray(data_antes,data_despues);
      this.actividad = { ...this.actividad,  arrayData: dataArray}
      this.fromMultiSelect = true;
    }
    this.dialog = true;
  }

  generateArray(arrayAntes: any[] , arrayDespues: any[]){
    const newArray = []
    let i = 0, j = 0;
    while (i < arrayAntes.length || j < arrayDespues.length) {
      const antes = arrayAntes[i] || '';
      const despues = arrayDespues[j] || '';
      newArray.push({ antes, despues });
      i++;
      j++;
    }
    return newArray;
  }

  needValorAntes(actividad: Actividad): boolean {
    const act = actividad.descripcion!.descripcion!
    if (
        actividad.descripcion?.valor_antes !== null && 
        !act.includes('DOCUMENTOS') &&
        !act.includes('ACTUALIZACIÓN DE UNIDADES ACADÉMICAS') &&
        !act.includes('ACTUALIZACIÓN DE CERTIFICACIÓN INTERMEDIA') &&
        !act.includes('ACTUALIZACIÓN DE INSTITUCIONES DE GRADUACIÓN COLABORATIVA') &&
        !act.includes('ACTUALIZACIÓN DE GRADUACIÓN COLABORATIVA') 
      ) {
      return true
    }else{
      return false
    } 
  }

  needValorDespues(actividad: Actividad): boolean {
    const act = actividad.descripcion!.descripcion!
    if (
        actividad.descripcion?.valor_despues !== null && 
        !act.includes('DOCUMENTOS') &&
        !act.includes('ACTUALIZACIÓN DE UNIDADES ACADÉMICAS') &&
        !act.includes('ACTUALIZACIÓN DE CERTIFICACIÓN INTERMEDIA') &&
        !act.includes('ACTUALIZACIÓN DE INSTITUCIONES DE GRADUACIÓN COLABORATIVA') &&
        !act.includes('ACTUALIZACIÓN DE GRADUACIÓN COLABORATIVA') 
      ) {
      return true
    }else{
      return false
    } 
  }

  needTable(actividad: Actividad): boolean {
    const act = actividad.descripcion!.descripcion!
    if (
      act.includes('DOCUMENTOS') || 
      act.includes('ACTUALIZACIÓN DE UNIDADES ACADÉMICAS') ||
      act.includes('ACTUALIZACIÓN DE CERTIFICACIÓN INTERMEDIA') ||
      act.includes('ACTUALIZACIÓN DE INSTITUCIONES DE GRADUACIÓN COLABORATIVA') ||
      act.includes('ACTUALIZACIÓN DE GRADUACIÓN COLABORATIVA') 
    ) {
      return true
    }else{
      return false
    } 
  }


}
