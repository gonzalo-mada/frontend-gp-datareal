export interface Mencion {
    Cod_mencion?: number;
    Nombre_mencion?: string;
    Descripcion_mencion?: string;
    Rexe_mencion?: string;
    Fecha_creacion?: Date;
    Vigencia?: boolean;
    BadgeClass?: string,
    isSelected?: boolean
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