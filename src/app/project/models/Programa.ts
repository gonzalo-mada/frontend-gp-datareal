import { EstadoMaestro } from "./EstadoMaestro";
import { EstadosAcreditacion } from "./EstadosAcreditacion";
import { Reglamento } from "./Reglamento";
import { Suspension } from "./Suspension";

export interface Programa {
    Cod_Programa?: number,
    Centro_costo?: string,
    Nombre_programa?: string,
    Tipo_programa?: number,
    Titulo?: string,
    Director?: string,
    Nombre_Director?: string,
    Director_alterno?: string,
    Nombre_Director_alterno?: string,
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
    Cod_EstadoMaestro?: number,
    EstadosAreditacion?: EstadosAcreditacion ,
    EstadoMaestro?: EstadoMaestro ,
    Suspension?: Suspension ,
    EstadosAcreditacion?: EstadosAcreditacion,
    Reglamento?: Reglamento
}

