import { CollectionsMongo } from "../shared/Context";
import { EstadoMaestro } from "./EstadoMaestro";
import { EstadosAcreditacion } from "./EstadosAcreditacion";
import { Reglamento } from "./Reglamento";
import { Suspension } from "./Suspension";
export type ModeDialog = 
undefined | 
'título' | 
'grado académico' | 
'REXE' | 
'estado maestro' | 
'director' | 
'director alterno' | 
'programa' | 
'reglamento' | 
'estado acreditación' | 
'maestro' | 
'nombre' | 
'grupo_correo' | 
'créditos totales' | 
'horas totales' | 
'centro costo' | 
'código SIES' | 
'unidades académicas' | 
'tipo de programa' | 
'campus' | 
'graduación colaborativa' |
'certificación intermedia' ;

export interface Programa {
    Cod_Programa?: number,
    Centro_costo?: string,
    Nombre_programa?: string,
    Tipo_programa?: number,
    Titulo?: string,
    Director?: string,
    Director_alterno?: string,
    REXE?: string,
    Codigo_SIES?: string,
    Cod_Reglamento?: number,
    Cod_acreditacion?: number,
    Creditos_totales?: number,
    Horas_totales?: number,
    Grupo_correo?: string,
    Estado_maestro?: number,
    Campus?: number,
    Unidad_academica?: number,
    Grado_academico?: string,
    Graduacion_Conjunta?: number,
    Cod_TipoGraduacion?: number,
    Cod_EstadoMaestro?: number,
    ID_TipoSuspension?: number,
    EstadosAreditacion?: EstadosAcreditacion ,
    EstadoMaestro?: EstadoMaestro ,
    Suspension?: Suspension ,
    EstadosAcreditacion?: EstadosAcreditacion,
    Reglamento?: Reglamento,
    Descripcion_Reglamento?: string,
    Descripcion_TipoSuspension?: string,
    Descripcion_acreditacion?: string,
    Descripcion_EstadoMaestro?: string,
    nombre_Director?: string,
    nombreDirector_alterno?: string,
    Certificacion_intermedia?: number
}
export interface UpdatePrograma {
    modeDialog: ModeDialog,
    collection: CollectionsMongo
}

