export interface TipoPrograma{
    Cod_tipoPrograma?: number,
    Descripcion_tp?: string,
    Categoria?:{
        Cod_CategoriaTP: number,
        Descripcion_categoria: string,
        BadgeClass: string
    }
}

export interface DocFromUploader {
    nombre: string;
    tipo: string;
    archivo: string;
    extras: {
      Descripcion_tp: string,
      comentarios: string,
      pesoDocumento: number
    }
}

export interface ActionUploadDoc{
    success: boolean;
    docs: DocFromUploader[];
}

export interface NamesCrud{
    singular?: string;
    plural?: string;
    articulo_singular?: string;
    articulo_plural?: string;
    genero?: string;
}