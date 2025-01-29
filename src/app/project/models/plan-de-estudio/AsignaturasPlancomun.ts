export interface AsignaturasPlancomun {
    cod_plan_estudio?: number,
    cod_plan_estudio_plan_comun?: number,
    cod_programa_pe?: number,
    cod_facultad_pe?: number,
    cod_programa_pc?: number,
    cod_facultad_pc?: number,
    nombre_plan_estudio_completo?: string,
    nombre_plan_comun_completo?: string,
    asignaturas?: Asignatura[]
}

interface Asignatura {
    cod_asignatura?: string,
    codigo_externo?: string,
    nombre_asignatura?: string,
    cod_tema?: string,
    nombre_tema?: string,
}