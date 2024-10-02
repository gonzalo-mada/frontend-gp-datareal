//sirve para saber desde que modulo y que componente se esta solicitando descargar un documento de mongo

export type Module = undefined | 'mantenedores' | 'programa' ;
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
                'form-grado' 

export type LabelComponent = undefined | 'Título' | 'Grado académico' | 'REXE' | 'Estado maestro' | 'Director' | 'Director alterno'            

export interface Context {
  module: Module,
  component: {
    name: NameComponent,
    label?: LabelComponent
  }
}