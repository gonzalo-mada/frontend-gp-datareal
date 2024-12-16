//sirve para saber desde que modulo y que componente se esta solicitando cargar/descargar un documento 

import { ModeDialog } from "../programas/Programa";

export type Module = undefined | 'mantenedores' | 'programa' | 'servicio' | 'table' ;
export type ModeUploader = undefined | 'show' | 'edit' | 'create' | 'select' | 'delete' | 'init-component';
export type NameComponent = undefined | 
                'agregar-programa' | 
                'editar-programa' |
                'ver-programa' | 
                'ver/editar-programa' |
                'estado-acreditacion' | 
                'campus' | 
                'facultad' | 
                'unidadAcad' | 
                'form-susp' | 
                'categorias-tp' | 
                'tp' | 
                'suspension' | 
                'reglamentos' |
                'form-reglamentos' |
                'form-titulo' |
                'form-grado' |
                'form-rexe' |
                'form-ea' |
                'form-estadoMaestro' |
                'form-stepone' |
                'jornada' | 
                'modalidad' |
                'programa' |
                'tipo-graduacion' |
                'certificacion-intermedia';
export type CollectionsMongo = 
undefined | 
'REXE' | 
'campus' | 
'certificacion_intermedia' | 
'creditos_totales' | 
'director' | 
'directorAlterno' | 
'estado_maestro' | 
'estados_acreditacion' | 
'facultades' | 
'grado_academico' | 
'grupo_correo' | 
'horas_totales' | 
'maestro' | 
'nombre_programa' | 
'reglamentos' | 
'titulo' | 
'unidades_academicas' |
'centro_costo' |
'codigo_sies' |
'tipo_programa' |
'graduacion_colaborativa' ; 


export interface Context {
  mode: ModeUploader,
  module: Module,
  component: {
    name: NameComponent,
    collection?: CollectionsMongo 
  }
}