export interface Articulacion {
    Cod_Articulacion?: number,
    Cod_Programa_Postgrado_Selected?: number,
    Cod_Facultad_Selected?: number,
    Cod_plan_estudio?: number,
    Cod_programa_pregrado?: number,
    Descripcion_programa_pregrado?: string,
    Asignaturas?: Asignatura[]
    nombre_plan_estudio_completo?: string,
    nombre_programa_completo?: string,
}

interface Asignatura {
    Cod_AsignaturaPreGradoArtic?: number,
    Descripcion_asignatura?: string,
    Descripcion_tema?: string,
    Cod_Asignatura?: string,
    Cod_Tema?: string,
}