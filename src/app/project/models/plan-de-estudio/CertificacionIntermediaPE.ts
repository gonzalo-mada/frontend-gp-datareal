export interface CertificacionIntermediaPE {
    cod_facultad?: number,
    cod_plan_estudio?: number,
    cod_programa?: number,
    cod_certif_intermedia?: number,
    descripcion_certif_intermedia?: string,
    nombre_plan_estudio_completo?: string,
    nombre_programa_completo?: string,
    asignaturas?: Asignatura[]
}

interface Asignatura {
    cod_asignatura?: string,
    codigo_externo?: string,
    nombre_asignatura?: string,
    cod_tema?: string,
    nombre_tema?: string,
}