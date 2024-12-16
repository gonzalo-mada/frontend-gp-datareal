export interface DocMongo {
    data?: {
        id?: string,
        nombre?: string,
        tipo?: string,
        fechaCreacion?: string,
        fechaModificacion?: string,
        extras?: Object
    }
    file?: any
}