export interface HistorialActividad {
    cod_log?: number,
    cod_registro?: number,
    descripcion_registro?: string,
    descripcion?: {
        titulo?: string,
        valor_antes?: any,
        valor_despues?: any,
        valor_unico?: any,
        valor_docs?: any,
        necesita_tabla?: boolean
    },
    fecha?: string,
    fecha_hora?: string,
    tipo_movimiento?: 'C' | 'U' | 'D' | 'C_D' | 'U_D' | 'D_D', // C_D: INSERCION DOCS - U_D: UPDATE DOCS - D_D: DELETE DOCS
    rut_usuario?: string,
    nombre_usuario?: string,
    correo_usuario?: string,
    eliminado?: number,
    origen?: string
    data_tabla?: any[]
}