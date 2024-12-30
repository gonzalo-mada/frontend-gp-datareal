import { CollectionsMongo } from "../shared/Context";

export interface PlanDeEstudio {
    cod_plan_estudio?: number,

    cod_programa?: number,
    cod_regimen?: number,
    cod_jornada?: number,
    cod_modalidad?: number,
    cod_estado?: number,
    cupo_minimo?: number,
    rexe?: string,

    tiene_certificacion?: number,
    tiene_articulacion?: number,
    tiene_plan_comun?: number,

    tiene_rango_aprob_g?: number,
    cod_reglamento?: number,
    tiene_mencion?: number,

    nombre_programa?: string,
    rexe_programa?: string,
    nombre_programa_completo?: string,
    nombre_plan_estudio_completo?: string
}

export type ModeDialogPE =
    undefined |
    'estado' |
    'maestro' |
    'modalidad' |
    'jornada' |
    'regimen' |
    'reglamento' |
    'rexe' |
    'cupo_minimo' |
    'articulacion' |
    'certificacion' |
    'rangos' |
    'menciones' |
    'asignaturas'
;

export interface UpdatePlanEstudio {
    modeDialog: ModeDialogPE,
    collection: CollectionsMongo
}

