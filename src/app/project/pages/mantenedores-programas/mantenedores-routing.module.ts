import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MantenedoresComponent } from './mantenedores.component';

const routes: Routes = [
  {
    path: '',
    component: MantenedoresComponent,
  },
  {
    path: 'campus',
    loadChildren: () => import('./campus/campus.module').then((m) => m.CampusModule),
    title: 'Campus'
  },
  {
    path: 'categoria',
    loadChildren: () => import('./categorias-tp/categorias-tp.module').then((m) => m.CategoriasTpModule),
    title: 'Categorías de tipos de programas'
  },
  {
    path: 'estadosAcreditacion',
    loadChildren: () => import('./estados-acreditacion/estados-acreditacion.module').then((m) => m.EstadosAcreditacionModule),
    title: 'Estados de acreditación'
  },
  {
    path: 'facultades',
    loadChildren: () => import('./facultad/facultad.module').then((m) => m.FacultadModule),
    title: 'Facultades'
  },
  {
    path: 'tiposProgramas',
    loadChildren: () => import('./tipos-programas/tipos-programas.module').then((m) => m.TiposProgramasModule),
    title: 'Tipos de programas'
  },
  {
    path: 'unidades',
    loadChildren: () => import('./unidades-academicas/unidades-academicas.module').then((m) => m.UnidadesAcademicasModule),
    title: 'Unidades académicas'
  },
  {
    path: 'tipos',
    loadChildren: () => import('./suspension/suspension.module').then((m) => m.SuspensionModule),
    title: 'Tipos de suspensiones'
  },
  {
    path: 'reglamentos',
    loadChildren: () => import('./reglamentos/reglamentos.module').then((m) => m.ReglamentosModule),
    title: 'Reglamentos'
  },
  {
    path: 'graduaciones',
    loadChildren: () => import('./tipos-graduaciones/tipos-graduaciones.module').then((m) => m.GraduacionesModule),
    title: 'Graduaciones'
  },
  {
    path: 'certiIntermedias',
    loadChildren: () => import('./certificacion-intermedia/certificacion-intermedia.module').then((m) => m.CertificacionIntermediaModule),
    title: 'Certificaciones intermedias'
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MantenedoresRoutingModule { }
