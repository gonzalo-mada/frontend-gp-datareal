import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { ServiceUtils } from '../../tools/utils/service.utils';
import { NamesCrud } from '../../models/shared/NamesCrud';
import { HistorialActividad } from '../../models/shared/HistorialActividad';
import { Table } from 'primeng/table';
import { MessageServiceGP } from './message-service.service';

@Injectable({
    providedIn: 'root'
})

export class HistorialActividadService {

    namesCrud: NamesCrud = {
        singular: 'historial de actividad',
        plural: 'historiales de actividades',
        articulo_singular: 'el historial de actividad',
        articulo_plural: 'los historiales de actividades',
        genero: 'masculino'
    };

    historial: HistorialActividad[] = [];
    actividad: HistorialActividad = {}
	groupedData: any;

    constructor(
        private errorTemplateHandler: ErrorTemplateHandler,
        private invoker: InvokerService, 
        private serviceUtils: ServiceUtils,
        private messageService: MessageServiceGP
    ){}

    origen : string = '';
    origen_s : string | undefined = '';
    codigo : number | undefined  = 0;
    showDialog: boolean = false;
    showDialogVerActividad: boolean = false

    //VARS TABLE
    dataKeyTable: string = 'cod_log';
    searchValue: string | undefined;
    selectedDate: string = '';
    globalFiltros: any[] = [
        'descripcion_registro' , 
        'fecha' ,
        'rut_usuario' ,
        'nombre_usuario' ,
        'correo_usuario' ,
        'descripcion.titulo'
    ];
    fromMultiSelect: boolean = false;



    setOrigen(origen: string, origen_s?: string, codigo?: number){
        this.origen = origen;
        this.origen_s = origen_s;
        this.codigo = codigo;
        console.log("this.origen",this.origen);
        console.log("this.origen_s",this.origen_s);
        console.log("this.codigo",this.codigo);
        
    }

    async getHistorialBackend() {
        try {
            let params = { origen: this.origen }
            const response = await this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('logPostgrado/getHistorial'),
                    params
                ),
                this.namesCrud
            );
            return response;
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    summary: `Error al obtener historial de actividad. Intente nuevamente`,
                    message: error?.message || error.detail.error.message.message
                }
            );
        }
    }

    async getHistorialSingularBackend() {
        try {
            let params = { origen: this.origen, origen_s: this.origen_s, cod_registro: this.codigo }
            const response = await this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('logPostgrado/getHistorialSingular'),
                    params
                ),
                this.namesCrud
            );
            return response;
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    summary: `Error al obtener historial de actividad. Intente nuevamente`,
                    message: error?.message || error.detail.error.message.message
                }
            );
        }
    }

    async getHistorial(){
        if (this.origen && this.origen_s && this.codigo) {
            this.historial = await this.getHistorialSingularBackend();
            this.groupedData = this.formatData(this.historial);
            console.log(`historial de: ${this.origen_s} -->`,this.historial);
        }else{
            this.historial = await this.getHistorialBackend();
            this.groupedData = this.formatData(this.historial);
            console.log(`historial de: ${this.origen} -->`,this.historial);
        }

	}

    async refreshHistorialActividad(){
        await this.getHistorial();
    }

    formatData(data: HistorialActividad[]){
        const actividades: { label: string; value: number; items: any[]; }[] = [];
        const tipos_actividades: { label: string; value: string;}[] = [];

        data.forEach(element => {
            switch (element.tipo_movimiento) {
                case 'C':
                    const existeActiv_C = actividades.some(act => act.value === 1);
                    const existeTipo_C = tipos_actividades.some(act => act.value === 'C');
                    if (!existeActiv_C) {
                        actividades.push(
                            {
                                label: 'CREACIÓN',
                                value: 1,
                                items: this.removeDuplicates(data
                                    .filter(item => item.tipo_movimiento === 'C')
                                    .map(item => ({
                                        label: item.descripcion?.titulo,
                                        value: item.descripcion?.titulo
                                    }))
                                )
                            }
                        )
                    }
                    if (!existeTipo_C) {
                        tipos_actividades.push(
                            {
                                label: 'Creación',
                                value: 'C'
                            }
                        )
                    }
                break;
                case 'U':
                    const existeActiv_U = actividades.some(act => act.value === 2);
                    const existeTipo_U = tipos_actividades.some(act => act.value === 'U');
                    if (!existeActiv_U) {
                        actividades.push(
                            {
                                label: 'ACTUALIZACIÓN',
                                value: 2,
                                items: this.removeDuplicates(data
                                    .filter(item => item.tipo_movimiento === 'U')
                                    .map(item => ({
                                        label: item.descripcion?.titulo,
                                        value: item.descripcion?.titulo
                                    }))
                                )
                            }
                        )
                    }
                    if (!existeTipo_U) {
                        tipos_actividades.push(
                            {
                                label: 'Actualización',
                                value: 'U'
                            }
                        )
                    }
                break;
                case 'D':
                    const existeActiv_D = actividades.some(act => act.value === 3);
                    const existeTipo_D = tipos_actividades.some(act => act.value === 'D');
                    if (!existeActiv_D) {
                        actividades.push(
                            {
                                label: 'ELIMINACIÓN',
                                value: 3,
                                items: this.removeDuplicates(data
                                    .filter(item => item.tipo_movimiento === 'D')
                                    .map(item => ({
                                        label: item.descripcion?.titulo,
                                        value: item.descripcion?.titulo
                                    }))
                                )
                            }
                        )
                    }
                    if (!existeTipo_D) {
                        tipos_actividades.push(
                            {
                                label: 'Eliminación',
                                value: 'D'
                            }
                        )
                    }
                break;
                case 'C_D':
                    const existeActiv_CD = actividades.some(act => act.value === 4);
                    const existeTipo_CD = tipos_actividades.some(act => act.value === 'C_D');
                    if (!existeActiv_CD) {
                        actividades.push(
                            {
                                label: 'INSERCIÓN DOCUMENTOS',
                                value: 4,
                                items: this.removeDuplicates(data
                                    .filter(item => item.tipo_movimiento === 'C_D')
                                    .map(item => ({
                                        label: item.descripcion?.titulo,
                                        value: item.descripcion?.titulo
                                    }))
                                )
                            }
                        )
                    }
                    if (!existeTipo_CD) {
                        tipos_actividades.push(
                            {
                                label: 'Inserción documentos',
                                value: 'C_D'
                            }
                        )
                    }
                break;
                case 'U_D':
                    const existeActiv_UD = actividades.some(act => act.value === 5);
                    const existeTipo_UD = tipos_actividades.some(act => act.value === 'U_D');
                    if (!existeActiv_UD) {
                        actividades.push(
                            {
                                label: 'ACTUALIZACIÓN DOCUMENTOS',
                                value: 5,
                                items: this.removeDuplicates(data
                                    .filter(item => item.tipo_movimiento === 'U_D')
                                    .map(item => ({
                                        label: item.descripcion?.titulo,
                                        value: item.descripcion?.titulo
                                    }))
                                )
                            }
                        )
                    }
                    if (!existeTipo_UD) {
                        tipos_actividades.push(
                            {
                                label: 'Actualización documentos',
                                value: 'U_D'
                            }
                        )
                    }
                break;
                case 'D_D':
                    const existeActiv_DD = actividades.some(act => act.value === 6);
                    const existeTipo_DD = tipos_actividades.some(act => act.value === 'D_D');
                    if (!existeActiv_DD) {
                        actividades.push(
                            {
                                label: 'ELIMINACIÓN DOCUMENTOS',
                                value: 6,
                                items: this.removeDuplicates(data
                                    .filter(item => item.tipo_movimiento === 'D_D')
                                    .map(item => ({
                                        label: item.descripcion?.titulo,
                                        value: item.descripcion?.titulo
                                    }))
                                )
                            }
                        )
                    }
                    if (!existeTipo_DD) {
                        tipos_actividades.push(
                            {
                                label: 'Eliminación documentos',
                                value: 'D_D'
                            }
                        )
                    }
                break;
            }
        });

		const usuarios = Array.from(
			new Set(data.map(item => item.nombre_usuario))
		).map(nombre => ({ label: nombre, value: nombre}));

        const registros = Array.from(
			new Set(data.map(item => item.descripcion_registro))
		).map(nombre => ({ label: nombre, value: nombre}));

		return { actividades, tipos_actividades, usuarios, registros}
	}

    removeDuplicates(items: any[]) {
		const uniqueItems = new Map();
		items.forEach(item => {
			uniqueItems.set(item.label, item);
		});
		return Array.from(uniqueItems.values());
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
	
		  case 'descripcion.titulo':
			event.data?.sort((data1:any , data2:any) => {
			  const value1 = data1.descripcion ? data1.descripcion.titulo : '';
			  const value2 = data2.descripcion ? data2.descripcion.titulo : '';
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

    show(data: HistorialActividad){
        this.fromMultiSelect = false;
        this.actividad = {...data};
        if (this.actividad.descripcion?.necesita_tabla && this.actividad.descripcion!.titulo!.includes('DOCUMENTOS')) {
            const data = this.actividad.descripcion?.valor_docs.split('|').map((name: any) => name.trim())
            this.actividad = { ...this.actividad,  data_tabla: data}
        }
        if (this.actividad.descripcion?.necesita_tabla && !this.actividad.descripcion!.titulo!.includes('DOCUMENTOS')) {
            const data_antes = this.actividad.descripcion?.valor_antes || {};
            const data_despues = this.actividad.descripcion?.valor_despues || {};
            const dataArray = this.generateArrayByObj(data_antes,data_despues);
            this.actividad = { ...this.actividad,  data_tabla: dataArray}
            this.fromMultiSelect = true;
        }
        this.showDialogVerActividad = true ;
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

    generateArrayByObj(objAntes: Record<string, any>, objDespues: Record<string, any>) {
        const newArray: { antes: string; despues: string; }[] = [];
        const keys = new Set([...Object.keys(objAntes), ...Object.keys(objDespues)]);
    
        keys.forEach(key => {
            const antes = objAntes[key] !== undefined ? `${key}: ${objAntes[key]}` : '';
            const despues = objDespues[key] !== undefined ? `${key}: ${objDespues[key]}` : '';
            newArray.push({ antes, despues });
        });
    
        return newArray
    }

}