export interface Articulacion {
    cod_facultad?: number,
    cod_programa?: number,
    cod_plan_estudio?: number,
    cod_articulacion?: number,
    asignatura_postgrado?: AsignaturaPostgrado,
    descripcion_programa_postgrado?: string,
    rexe_programa_postgrado?: string,
    rexe_plan_estudio?: string,
    asignaturas_pregrado?: AsignaturaPregrado[]
    nombre_plan_estudio_completo?: string,
    nombre_programa_completo?: string,
}

interface AsignaturaPregrado {
    cod_asignaturaPreGradoArtic?: number,
    cod_asignatura?: string,
    nombre_asignatura?: string,
    cod_tema?: string,
    nombre_tema?: string,
    codigo_externo?: string,
    cod_programa_pregrado?: number,
    descripcion_programa_pregrado?: string,
    cod_facultad_pregrado?: number,
}

interface AsignaturaPostgrado {
    cod_asignatura?: number,
    codigo_externo?: string,
    nombre_asignatura?: string,
    cod_tema?: string,
    nombre_tema?: string,
    nombre_asignatura_completa?: string,
}