import { Component, Input } from '@angular/core';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styles: [
  ]
})
export class CardComponent {
  @Input() header: string = '';
  @Input() subheader: string = '';

  constructor(public menuButtonsTableService: MenuButtonsTableService){}
}
