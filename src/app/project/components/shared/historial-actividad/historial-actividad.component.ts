import { Component } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { HistorialActividadService } from 'src/app/project/services/components/historial-actividad.service';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';

@Component({
  selector: 'app-historial-actividad',
  templateUrl: './historial-actividad.component.html',
  styles: [
  ]
})
export class HistorialActividadComponent {
	private subscription: Subscription = new Subscription();
	constructor(
		public main: HistorialActividadService,
		private menuButtonsTableService: MenuButtonsTableService,
	){}

	async ngOnInit() {
		this.subscription.add(this.menuButtonsTableService.actionClickButton$.subscribe( async action => {
			switch (action) {
			  case 'historial': await this.main.getHistorial(); break;
			} 
		}));
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
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
