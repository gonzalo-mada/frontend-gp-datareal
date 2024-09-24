export interface Facultad {
  Cod_facultad?: string;
  Descripcion_facu?: string;
  Estado_facu?: boolean;
}

export interface extras{
  Cod_facultad?: string;
  nombreFacultad?: string;
  pesoDocumento: number;
  comentarios: string;
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