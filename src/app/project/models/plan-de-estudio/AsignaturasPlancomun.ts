export interface AsignaturasPlancomun {
    Cod_Programa_Postgrado_Selected?: number,
    Cod_plan_estudio?: number,
    Cod_CertificacionIntermedia?: number,
    Asignaturas?: Asignatura[]
}

interface Asignatura {
    Cod_AsignaturaPreGradoArtic?: number,
    Descripcion_asignatura?: string,
    Descripcion_tema?: string,
    Cod_Asignatura?: string,
    Cod_Tema?: string,
}