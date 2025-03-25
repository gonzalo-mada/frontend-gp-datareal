//sirve para saber desde que modulo y que componente se esta solicitando cargar/descargar un documento 

import { ModeDialog } from "../programas/Programa";

export type Module = undefined | 'mantenedores' | 'programa' | 'plandeestudio' | 'asignatura' | 'servicio' | 'table' ;
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
                'certificacion-intermedia' |
                'agregar-plandeestudio' |
                'ver/editar-plandeestudio' |
                'agregar-asignatura' |
                'ver/editar-asignatura' |
                'menciones'
                ;
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
'graduacion_colaborativa' |
'plan_estudio' |
'estado_pe' | 
'modalidad_pe' |
'jornada_pe' | 
'regimen_pe' |
'rexe_pe' |
'cupo_minimo_pe' | 
'plan_estudio' |
'articulaciones' |
'certificacion_intermedia_pe' |
'rangos' |
'menciones' | 
'menciones_pe' |
'asign-pc' |
'asignaturas_pe' |
'nombre_asignatura' |
'codigo_externo_asign' |
'semestre_asign' |
'num_creditos_asign' |
'duracion_asign' |
'obligatoria_electiva_asign' |
'max_duracion_asign' |
'modalidad_asign' |
'regimen_asign' |
'tipo_evaluacion_asign' |
'evaluacion_intermedia_asign' |
'horas_asign' |
'articulacion_asign' |
'mencion_asign' |
'pre_requisitos_asign' |
'secuencialidad_asign' |
'tipo_colegiada_asign' |
'tema_asign' |
'asignaturas'
; 


export interface Context {
  mode: ModeUploader,
  module: Module,
  component: {
    name: NameComponent,
    collection?: CollectionsMongo 
  }
}