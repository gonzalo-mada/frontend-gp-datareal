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
  
  export interface docMongo{
    id?: string;
    nombre: string;
    tipo: string;
    fechaCreacion?: string;
    fechaModificacion?: string;
    dataBase64?: string;
    extras: extras
    origFile: File
  }