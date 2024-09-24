import { TiemposAcreditacion } from './TiemposAcreditacion'
export type Si_No = 'SI' | 'NO'

export interface EstadosAcreditacion {
    Cod_acreditacion?: number,
    Acreditado?: Si_No,
    Certificado?: Si_No, //pregrado
    Nombre_ag_acredit?: string,
    Nombre_ag_certif?: string, //pregrado
    Evaluacion_interna?: Si_No,
    Fecha_informe?: string,
    tiempo?: TiemposAcreditacion
    
}

export interface DocFromUploader {
    nombre: string;
    tipo: string;
    archivo: string;
    extras: {
      comentarios: string,
      pesoDocumento: number
    }
}

export interface ActionUploadDoc{
    success: boolean;
    docsToUpload: DocFromUploader[];
    docsToDelete: DocFromUploader[];
}