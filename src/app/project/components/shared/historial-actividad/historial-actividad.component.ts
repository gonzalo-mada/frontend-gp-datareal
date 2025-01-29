import { Component } from '@angular/core';
import { Table } from 'primeng/table';
import { HistorialActividadService } from 'src/app/project/services/components/historial-actividad.service';

@Component({
  selector: 'app-historial-actividad',
  templateUrl: './historial-actividad.component.html',
  styles: [
  ]
})
export class HistorialActividadComponent {

	constructor(public main: HistorialActividadService){}

	async ngOnInit() {
		await this.main.getHistorial();
	}

	onGlobalFilter(table: Table, event: Event) {
		table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
	}

	clear(table: Table){
		this.main.searchValue = '';
		this.main.selectedDate = '';
		table.reset();
		this.main.countTableValues(table);
	}

	clearCalendar(table: Table){
		this.main.searchValue = '';
		table.reset();
		this.main.selectedDate = '';
	}

}
