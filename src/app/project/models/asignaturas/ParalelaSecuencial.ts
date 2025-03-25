export interface ParalelaSecuencial {
    cod_facultad?: number,
    cod_programa?: number,
    cod_plan_estudio?: number,
    cod_asignatura?: string,
    cod_paralela_secuencial?: number,
    nombre_asignatura?: string,
    nombre_asignatura_completa?: string,
    paralelidad?: number,
    secuencialidad?: number,
    semestre?: number,
    secuenciales?: _ParalelaSecuencial[],
    paralelas?: _ParalelaSecuencial[],
    temas?: Temas[],
    nombre_plan_estudio_completo?: string,
    nombre_programa_completo?: string
}



interface Temas {
    asignatura: Asignatura,
    paralelas: ParalelasSecuenciales[],
    secuenciales: ParalelasSecuenciales[]
}

interface Asignatura {
    cod_asignatura?: string,
    codigo_externo?: string,
    nombre_asignatura?: string,
    cod_tema?: string,
    nombre_tema?: string,
    nombre_asignatura_completa?: string
}

interface ParalelasSecuenciales {
    cod_asignatura?: string,
    codigo_externo?: string,
    nombre_asignatura?: string,
    cod_tema?: string,
    nombre_tema?: string,
    nombre_asignatura_completa?: string
}

interface _ParalelaSecuencial {
    asignatura: {
        cod_asignatura?: string,
        cod_tema?: string,
    },
    sec_par: {
        cod_asignatura?: string,
        codigo_externo?: string,
        nombre_asignatura?: string,
        cod_tema?: string,
        nombre_tema?: string,
        nombre_asignatura_completa?: string
    }
}