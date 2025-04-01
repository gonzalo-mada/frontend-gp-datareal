import { Component } from '@angular/core';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Table } from 'primeng/table';
import { Asignatura } from 'src/app/project/models/asignaturas/Asignatura';
import { AsignaturasMainService } from 'src/app/project/services/asignaturas/asignaturas/main.service';
import { TableAsignaturasService } from 'src/app/project/services/asignaturas/asignaturas/table.service';

@Component({
  selector: 'app-table-asignaturas',
  templateUrl: './table-asignaturas.component.html',
  styles: []
})
export class TableAsignaturasComponent {

	searchValue: string | undefined;
	colFrozen: boolean = false;
	data_cod_asignatura: string = '';
	mode_asign_op: string = '';
	constructor(
		public main: AsignaturasMainService,
		public table: TableAsignaturasService
	){}
	
	onGlobalFilter(table: Table, event: Event) {
		table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
		this.table.resetSelectedRows();
	}

	edit(data: Asignatura){
		this.main.setModeCrud('edit',data);
	}

	show(data: Asignatura){
		this.main.setModeCrud('show',data);
	}

	delete(data: Asignatura){
		this.main.setModeCrud('delete',data);
	}

	clear(table: Table){
		this.table.resetSelectedRows();
		this.searchValue = ''
		table.reset();
		this.main.countTableValues();
	}

	customSortAccreditation(event:any) {
		
		switch (event.field) {

			case 'case_menciones':
				event.data?.sort((data1:any , data2:any) => {
					const value1 = data1.tiene_mencion ? data1.tiene_mencion : '';
					const value2 = data2.tiene_mencion ? data2.tiene_mencion : '';
					let result = 0;
					if (value1 > value2) {
					result = 1;
					} else if (value1 < value2) {
					result = -1;
					}
					return event.order * result;
				})
			break;

			case 'case_evaluacion_intermedia':
				event.data?.sort((data1:any , data2:any) => {
					const value1 = data1.tiene_evaluacionintermedia ? data1.tiene_evaluacionintermedia : '';
					const value2 = data2.tiene_evaluacionintermedia ? data2.tiene_evaluacionintermedia : '';
					let result = 0;
					if (value1 > value2) {
					result = 1;
					} else if (value1 < value2) {
					result = -1;
					}
					return event.order * result;
				})
			break;

			case 'case_pre_requisitos':
				event.data?.sort((data1:any , data2:any) => {
					const value1 = data1.tiene_prerequisitos ? data1.tiene_prerequisitos : '';
					const value2 = data2.tiene_prerequisitos ? data2.tiene_prerequisitos : '';
					let result = 0;
					if (value1 > value2) {
					result = 1;
					} else if (value1 < value2) {
					result = -1;
					}
					return event.order * result;
				})
			break;

			case 'case_articulaciones':
				event.data?.sort((data1:any , data2:any) => {
					const value1 = data1.tiene_articulacion ? data1.tiene_articulacion : '';
					const value2 = data2.tiene_articulacion ? data2.tiene_articulacion : '';
					let result = 0;
					if (value1 > value2) {
					result = 1;
					} else if (value1 < value2) {
					result = -1;
					}
					return event.order * result;
				})
			break

			case 'modalidad.descripcion_modalidad':
				event.data?.sort((data1:any , data2:any) => {
					const value1 = data1.modalidad ? data1.modalidad.descripcion_modalidad : '';
					const value2 = data2.modalidad ? data2.modalidad.descripcion_modalidad : '';
					let result = 0;
					if (value1 > value2) {
					result = 1;
					} else if (value1 < value2) {
					result = -1;
					}
					return event.order * result;
				})
			break

			case 'case_secuencial':
				event.data?.sort((data1:any , data2:any) => {
					const value1 = data1.tiene_secuencialidad ? data1.tiene_secuencialidad : '';
					const value2 = data2.tiene_secuencialidad ? data2.tiene_secuencialidad : '';
					let result = 0;
					if (value1 > value2) {
					result = 1;
					} else if (value1 < value2) {
					result = -1;
					}
					return event.order * result;
				})
			break

			case 'case_paralela':
				event.data?.sort((data1:any , data2:any) => {
					const value1 = data1.tiene_paralelidad ? data1.tiene_paralelidad : '';
					const value2 = data2.tiene_paralelidad ? data2.tiene_paralelidad : '';
					let result = 0;
					if (value1 > value2) {
					result = 1;
					} else if (value1 < value2) {
					result = -1;
					}
					return event.order * result;
				})
			break

			case 'case_tipo_colegiada':
				event.data?.sort((data1:any , data2:any) => {
					const value1 = data1.tipo_colegiada !== 0 ? data1.tipo_colegiada.descripcion_tipo_colegiada : 'NO APLICA';
					const value2 = data2.tipo_colegiada !== 0 ? data2.tipo_colegiada.descripcion_tipo_colegiada : 'NO APLICA';
					let result = 0;
					if (value1 > value2) {
					result = 1;
					} else if (value1 < value2) {
					result = -1;
					}
					return event.order * result;
				})
			break

			case 'regimen.descripcion_regimen':
				event.data?.sort((data1:any , data2:any) => {
					const value1 = data1.regimen ? data1.regimen.descripcion_regimen : '';
					const value2 = data2.regimen ? data2.regimen.descripcion_regimen : '';
					let result = 0;
					if (value1 > value2) {
					result = 1;
					} else if (value1 < value2) {
					result = -1;
					}
					return event.order * result;
				})
			break
		
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
				})
		  	break;
		}
	
	
	}

	async set_op_asign(event: any, op_asign: OverlayPanel, data: Asignatura, mode: 'pre_req' | 'secuenciales' | 'articulaciones' | 'temas' | 'paralelas'){
		this.data_cod_asignatura = data.cod_asignatura!;
		this.mode_asign_op = mode;
		if (!op_asign.overlayVisible) {
			let response = await this.main.getAsignaturasToOverlay(this.mode_asign_op , this.data_cod_asignatura)
			if (response) {
				op_asign.toggle(event);
			}
		}else{
			op_asign.toggle(event);
		}
	}

	async getAsignaturasToOverlay(){
		await this.main.getAsignaturasToOverlay(this.mode_asign_op , this.data_cod_asignatura)
	}

	async set_menciones(event: any, op_menciones: OverlayPanel, data: Asignatura){
		this.data_cod_asignatura = data.cod_asignatura!;
		op_menciones.toggle(event);
	}

	async set_temas(event: any, op_temas: OverlayPanel, data: Asignatura){
		this.data_cod_asignatura = data.cod_asignatura!;
		op_temas.toggle(event);
	}

	async getMencionesPorAsignatura(){
		await this.main.getMencionesPorAsignatura(this.data_cod_asignatura)
	}

	async getTemasPorAsignatura(){
		await this.main.getTemasPorAsignatura(this.data_cod_asignatura)
	}

}
