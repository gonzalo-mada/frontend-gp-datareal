interface DocFromUploader {
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