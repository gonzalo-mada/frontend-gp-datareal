export interface UnidadAcademica {
    Cod_unidad_academica?: number;
    Descripcion_ua?: string;
    Cod_facultad?: number;
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
    docs: DocFromUploader[];
}
 
export interface NamesCrud{
    singular?: string;
    plural?: string;
    articulo_singular?: string;
    articulo_plural?: string;
    genero?: string;
}