import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PanelControlService } from 'src/app/base/services/panel_control.service';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { Menu } from 'src/app/base/models/menu';
import { Item } from 'src/app/base/models/item';

@Component({
  selector: 'app-mantenedores',
  templateUrl: './mantenedores.component.html',
  styles: [
  ]
})
export class MantenedoresComponent {
  constructor(
    private panelControlService: PanelControlService,
    private router: Router,
    private commonUtils: CommonUtils,
  ){}

  menuActive!: Menu ;
  items: Item[] = [];
  inview: any[] = [];
  filter: string = '';

  ngOnInit() {
    this.menuActive = <Menu> this.panelControlService.getMenuActive();
    this.menuActive.items.forEach( item => {
      this.items.push(item)
    })
    // console.log("menusM",this.items);
    this.setItems(this.items);
  }

  filtering() {
    this.inview = this.commonUtils.filtering(this.items, this.filter, 'nombre');
  }

  setItems(items: Item[]){
    this.items = items.filter((e:Item) => e.metodo != '');
    this.inview = this.items.map((e:Item) => {
      var m: Item = {
        id: e.id,
        nombre: e.nombre,
        icono: e.icono,
        descripcion: e.descripcion,
        grupo: e.grupo,
        estado: e.estado,
        metodo: '/'+e.metodo,
      }
      return m
    });
  }

  goToMenu(item?: Item) {
    this.panelControlService.navigate(this.router, this.menuActive, item);
  }

}
