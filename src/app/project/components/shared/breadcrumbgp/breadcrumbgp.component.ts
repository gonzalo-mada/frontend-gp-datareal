import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {  MenuItem } from 'primeng/api';
import { Item } from 'src/app/base/models/item';
import { PanelControlService } from 'src/app/base/services/panel_control.service';

@Component({
  selector: 'app-breadcrumbgp',
  templateUrl: './breadcrumbgp.component.html',
  styles: []
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
    } catch (error) {
      console.error('Error in ngOnInit:', error);
    }
  }

  async generateBreadcrumb(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const getMenusArray = this.panelControlService.getMenusArray();
        const urlSegments = this.router.url.split('/').filter(Boolean);
        
        let breadcrumbItems: MenuItem[] = [];
        let currentLevelItems = getMenusArray as any[];

        for (const segment of urlSegments) {
          
          const foundItem = currentLevelItems.find(item => item.metodo === segment);
          
          if (foundItem) {
            
            breadcrumbItems.push(foundItem);
            
            if (foundItem.items && foundItem.items.length > 0) {
              currentLevelItems = foundItem.items || [];
            }else{
              if (breadcrumbItems.length !== 2) {
                this.route.data.subscribe(data => {
                  if (Object.values(data).length !== 0) {
                    breadcrumbItems.push({ nombre: data['title'] });
                  }
                });
              }
            }
          }          
        }
        this.items = breadcrumbItems;
        resolve();
        
      } catch (error) {
        console.error('Error generating breadcrumb:', error);
        reject(error); 
      }
    });
  }

  goToMenu(event: any, item?: Item){
    this.panelControlService.navigate(this.router, event, item);
  }

  async goHome() {
    await this.panelControlService.homeNavigate(this.router);
  }

  
}
