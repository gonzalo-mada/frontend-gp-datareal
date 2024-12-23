export interface UnidadAcademica {
    Cod_unidad_academica?: number,
    Descripcion_ua?: string,
    Facultad?:{
        Cod_facultad: number,
        Descripcion_facu: string,
        BadgeClass: string
    }
    
}
 
export interface DocFromUploader{
    nombre: string;
    tipo: string;
    archivo: string;
    extras: {
        comentarios: string,
        pesoDocumento: number
    }
}
 
export interface ActionUploadDoc{
    success:boolean;
    docsToUpload: DocFromUploader[];
    docsToDelete: DocFromUploader[];
}
 