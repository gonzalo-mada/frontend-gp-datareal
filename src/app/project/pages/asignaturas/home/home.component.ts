import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AsignaturasMainService } from 'src/app/project/services/asignaturas/asignaturas/main.service';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [
  ]
})
export class HomeComponent implements OnInit, OnDestroy {

	private subscription: Subscription = new Subscription();

	constructor(
		private menuButtonsTableService: MenuButtonsTableService,
		public main: AsignaturasMainService
	){}

	ngOnInit(): void {
		this.subscription.add(this.menuButtonsTableService.actionClickButton$.subscribe( action => { 
			action==='agregar' 
			? this.main.setModeCrud('create') 
			: this.main.setModeCrud('delete-selected')
		}));
	}
	
	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

}
