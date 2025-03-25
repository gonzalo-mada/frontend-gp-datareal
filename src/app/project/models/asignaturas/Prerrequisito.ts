export interface Prerrequisito {
    cod_facultad?: number,
    cod_programa?: number,
    cod_plan_estudio?: number,
    cod_asignatura?: string,
    nombre_asignatura?: string,
    nombre_asignatura_completa?: string,
    prerrequisitos?: _Prerrequisito[],
    temas?: Temas[],
    nombre_plan_estudio_completo?: string,
    nombre_programa_completo?: string
}



interface Temas {
    asignatura: Asignatura,
    prerrequisitos: Prerrequisitos[]
}

interface Asignatura {
    cod_asignatura?: string,
    codigo_externo?: string,
    nombre_asignatura?: string,
    cod_tema?: string,
    nombre_tema?: string,
    nombre_asignatura_completa?: string
}

interface Prerrequisitos {
    cod_asignatura?: string,
    codigo_externo?: string,
    nombre_asignatura?: string,
    cod_tema?: string,
    nombre_tema?: string,
    nombre_asignatura_completa?: string
}

interface _Prerrequisito {
    asignatura: {
        cod_asignatura?: string,
        cod_tema?: string,
    },
    prerrequisito: {
        cod_asignatura?: string,
        codigo_externo?: string,
        nombre_asignatura?: string,
        cod_tema?: string,
        nombre_tema?: string,
        nombre_asignatura_completa?: string
    }
}