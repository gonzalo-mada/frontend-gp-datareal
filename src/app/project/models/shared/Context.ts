//sirve para saber desde que modulo y que componente se esta solicitando descargar un documento de mongo

export type Module = undefined | 'mantenedores' | 'programa' ;
export type ModeUploader = undefined | 'show' | 'edit' | 'create' | 'select';
export type NameComponent = undefined | 
                'agregar-programa' | 
                'estado-acreditacion' | 
                'campus' | 
                'facultad' | 
                'unidadAcad' | 
                'form-susp' | 
                'categorias-tp' | 
                'tp' | 
                'suspension' | 
                'reglamentos' |
                'form-titulo' |
                'form-grado' |
                'form-rexe' |
                'form-estadoMaestro' |
                'form-stepone'

export type LabelComponent = undefined | 'Título' | 'Grado académico' | 'REXE' | 'Estado maestro' | 'Director' | 'Director alterno'            

export interface Context {
  mode: ModeUploader,
  module: Module,
  component: {
    name: NameComponent,
    label?: LabelComponent
  }
}