export interface Mencion {
    cod_plan_estudio?: number,
    cod_mencion_pe?: number,
    cod_mencion?: number,
    mencion_rexe?: string,
    fecha_creacion?: string,
    vigencia?: boolean,
    nombre_mencion?: string,
    descripcion_mencion?: string,
    asignaturas?: Asignatura[]
}

interface Asignatura {
    cod_asignatura?: string,
    codigo_externo?: string,
    nombre_asignatura?: string,
    cod_tema?: string,
    nombre_tema?: string,
    checkDisabled?: boolean,
}