export interface TipoPrograma{
    Cod_tipoPrograma?: number,
    Descripcion_tp?: string,
    Categoria?:{
        Cod_CategoriaTP: number,
        Descripcion_categoria: string,
    }
}


