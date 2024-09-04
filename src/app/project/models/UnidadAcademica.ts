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
        Descripcion_ua: string,
        comentarios: string,
        pesoDocumento: number
    }
}
 
export interface ActionUploadDoc{
    success:boolean;
    docsToUpload: DocFromUploader[];
    docsToDelete: DocFromUploader[];
}
 
export interface NamesCrud{
    singular?: string;
    plural?: string;
    articulo_singular?: string;
    articulo_plural?: string;
    genero?: string;
}