export interface HistorialActividad {
    Cod_Programa: number,
    correo_usuario: string,
    descripcion: {
        descripcion: string,
        valor_antes: string,
        valor_despues: string,
    },
    fecha: string,
    nombre_usuario: string,
    tipo_movimiento: string,
    usuario: string
}