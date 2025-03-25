export interface Mencion {
    cod_facultad?: number,
    cod_programa?: number,
    cod_plan_estudio?: number,
    cod_mencion_pe?: number,
    cod_mencion?: number,
    mencion_rexe?: string,
    fecha_creacion?: string,
    vigencia?: boolean,
    nombre_mencion?: string,
    descripcion_mencion?: string,
    asignaturas?: Asignatura[],
    nombre_mencion_completo?: string,
    nombre_plan_estudio_completo?: string,
    nombre_programa_completo?: string,
}

interface Asignatura {
    cod_asignatura?: string,
    codigo_externo?: string,
    nombre_asignatura?: string,
    cod_tema?: string,
    nombre_tema?: string,
    checkDisabled?: boolean,
}