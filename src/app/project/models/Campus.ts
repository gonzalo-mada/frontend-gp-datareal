export interface Campus {
    Cod_campus?: string;
    Descripcion_campus?: string;
    Estado_campus?: number;
}

export interface extras{
    Cod_campus?: string;
    nombreCampus?: string;
    pesoDocumento: number;
    comentarios: string;
  }
  
  export interface docMongoCampus{
    id?: string;
    nombre: string;
    tipo: string;
    fechaCreacion?: string;
    fechaModificacion?: string;
    dataBase64?: string;
    extras: extras
    origFile: File
  }