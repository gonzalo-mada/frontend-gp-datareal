import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from '../pages/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'mantenedores/campus',
    loadChildren: () => import('../pages/campus/campus.module').then((m) => m.CampusModule)
  },
  {
    path: 'mantenedores/facultades',
    loadChildren: () => import('../pages/facultad/facultad.module').then((m) => m.FacultadModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { initialNavigation: 'disabled' })],
  exports: [RouterModule],
})
export class ProjectRoutingModule {}
