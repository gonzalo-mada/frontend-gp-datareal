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
  },
  {
    path: 'mantenedores/tiposProgramas',
    loadChildren: () => import('../pages/tipos-programas/tipos-programas.module').then((m) => m.TiposProgramasModule)
  },
  {
    path: 'mantenedores/categoria',
    loadChildren: () => import('../pages/categorias-tp/categorias-tp.module').then((m) => m.CategoriasTpModule)
  },
  {
    path: 'mantenedores/unidades',
    loadChildren: () => import('../pages/unidades-academicas/unidades-academicas.module').then((m) => m.UnidadesAcademicasModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { initialNavigation: 'disabled' })],
  exports: [RouterModule],
})
export class ProjectRoutingModule {}
