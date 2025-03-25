import { CollectionsMongo } from "../shared/Context";

export interface Asignatura {
    cod_asignatura?: string,
    cod_tema?: string,
    cod_plan_estudio?: number,
    nombre_plan_estudio_completo?: string,
    codigo_externo?: string,
    nombre_asignatura?: string,
    num_creditos?: number,
    horas_sincronas?: number,
    horas_asincronas?: number,
    horas_presenciales?: number,
    horas_indirectas?: number,
    total_horas?: number,
    semestre?: number,
    duracion?: number,
    max_duracion?: number,
    cod_modalidad?: number,
    cod_regimen?: number,
    cod_tipo_evaluacion?: number,
    tiene_articulacion?: number,
    tiene_mencion?: number,
    tiene_evaluacionintermedia?: number,
    tiene_prerequisitos?: number,
    tiene_secuencialidad?: number,
    tiene_paralelidad?: number,
    tiene_tema?: number,
    obligatoria_electiva?: number,
    tiene_colegiada?: number,
    cod_tipo_colegiada?: number,
    cod_programa?: number,
    nombre_asignatura_completa?: string
}

export type ModeDialogAsign =
    undefined |
    'docs_maestros_asignatura' |
    'modalidad' |
    'regimen' |
    'codigo_externo' |
    'nombre_asignatura' |
    'num_creditos' |
    'horas' |
    'semestre' |
    'duracion' |
    'max_duracion' |
    'cod_tipo_evaluacion' |
    'tiene_evaluacionintermedia' |
    'tiene_prerequisitos' |
    'tiene_articulacion' |
    'tiene_mencion' |
    'tiene_secuencialidad' |
    'obligatoria_electiva' |
    'cod_tipo_colegiada' |
    'tiene_tema'
;

export interface UpdateAsign {
    modeDialog: ModeDialogAsign,
    collection: CollectionsMongo,
    canEdit: boolean
}