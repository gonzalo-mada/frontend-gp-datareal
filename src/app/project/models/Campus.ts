export interface Campus {
    Cod_campus?: string;
    Descripcion_campus?: string;
    Estado_campus?: boolean;
}

export interface extras{
    Cod_campus?: string;
    nombreCampus?: string;
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