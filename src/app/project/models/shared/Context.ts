//sirve para saber desde que modulo y que componente se esta solicitando cargar/descargar un documento 

export type Module = undefined | 'mantenedores' | 'programa' ;
export type ModeUploader = undefined | 'show' | 'edit' | 'create' | 'select' | 'delete' | 'init-component';
export type NameComponent = undefined | 
                'agregar-programa' | 
                'editar-programa' |
                'ver-programa' | 
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
                'programa'

export type LabelComponent = undefined | 'Título' | 'Grado académico' | 'REXE' | 'Estado maestro' | 'Director' | 'Director alterno' | 'Maestro'            

export interface Context {
  mode: ModeUploader,
  module: Module,
  component: {
    name: NameComponent,
    label?: LabelComponent
  }
}