export interface Reglamento {
    Cod_reglamento?: number;
    Descripcion_regla?: string;
    anio?: string;
    vigencia?: boolean,
    BadgeClass?: string
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