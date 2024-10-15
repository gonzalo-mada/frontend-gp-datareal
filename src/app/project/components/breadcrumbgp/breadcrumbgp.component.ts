import { Component, OnDestroy, OnInit } from '@angular/core';
import {  ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { PanelControlService } from 'src/app/base/services/panel_control.service';

@Component({
  selector: 'app-breadcrumbgp',
  templateUrl: './breadcrumbgp.component.html',
  styles: [
  ]
})
export class BreadcrumbgpComponent implements OnInit {
  constructor(
    private router: Router,
    private panelControlService: PanelControlService,
    private route: ActivatedRoute
  ){}

  home: MenuItem = {
    icon: 'pi pi-home',
    command: async () => {
       this.goHome();
    },
  };
  items: MenuItem[] = [];

  async ngOnInit() {
    try {
      await this.generateBreadcrumb();
      
      
      // Aquí puedes hacer algo después de que se haya generado el breadcrumb
    } catch (error) {
      console.error('Error in ngOnInit:', error);
    }
  }

  async generateBreadcrumb(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const menuActive = this.panelControlService.getMenuActive();
        
        if (!menuActive) {
          console.warn('Menu active is null or undefined');
          resolve(); 
          return;
        }
  
        const url = this.router.url.split('/').filter(Boolean);
        
        if (menuActive.items && menuActive.items.length > 0) {
          let breadcrumbItems: MenuItem[] = [];
          menuActive.items.forEach(item => {
            if (url.includes(item.metodo)) {
              
              breadcrumbItems.push({
                label: menuActive.nombre,
                route: '/'+menuActive.metodo
              });
              breadcrumbItems.push({
                label: item.nombre,
              });
            }else{
              if (url.length === 1) {
                this.route.data.subscribe(data =>{
                  breadcrumbItems = [{
                    label: data['title'],
                  }];
                })
              }
            }
          });
          this.items = breadcrumbItems;
        } else {
          this.route.data.subscribe(data => {

            if (Object.values(data).length !== 0) {
              this.items = [
                { label: menuActive.nombre, route: '/'+menuActive.metodo },
                { label: data['title'] }
              ];
            } else {
              this.items = [
                { label: menuActive.nombre }
              ];
            }
            resolve(); 
          });
        }
      } catch (error) {
        console.error('Error generating breadcrumb:', error);
        reject(error); 
      }
    });
  }

  async goHome() {
    await this.panelControlService.homeNavigate(this.router);
  }

  
}
