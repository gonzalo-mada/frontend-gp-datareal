import { Component, OnInit } from '@angular/core';
import { MenuButtonsTableService } from '../../services/components/menu-buttons-table.service';

@Component({
  selector: 'app-programas',
  templateUrl: './programas.component.html',
  styles: [],
})
export class ProgramasComponent implements OnInit {

  constructor(private menuButtonsTableService: MenuButtonsTableService){}

  ngOnInit() {
    this.menuButtonsTableService.setContext('programa','page');
  }
  
}
