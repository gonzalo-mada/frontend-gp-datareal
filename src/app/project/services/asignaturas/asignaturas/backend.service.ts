import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { ServiceUtils } from 'src/app/project/tools/utils/service.utils';

@Injectable({
    providedIn: 'root'
})

export class BackendAsignaturasService {
    constructor(
        private errorTemplateHandler: ErrorTemplateHandler,
        private invoker: InvokerService, 
        private serviceUtils: ServiceUtils
    ){}

    countTableRegisters(value: number, namesCrud: NamesCrud){
        this.serviceUtils.countTableValues(value,namesCrud);
    }

    async getTiposEvaluacion(loading = true) {
        try {
            return await this.invoker.httpInvoke({ service: 'asignaturas/getTiposEvaluacion', loading: loading });
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener tipos de evaluación. Intente nuevamente.',
            });
        }
    }

    async getTiposColegiadas(loading = true) {
        try {
            return await this.invoker.httpInvoke({ service: 'asignaturas/getTiposColegiadas', loading: loading });
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener tipos de coleagiadas. Intente nuevamente.',
            });
        }
    }

    async getModalidades(loading = true) {
        try {
            return await this.invoker.httpInvoke({ service: 'modalidades/getModalidades', loading: loading });
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener modalidades. Intente nuevamente.',
            });
        }
    }

    async getRegimenes(loading = true) {
        try {
            return await this.invoker.httpInvoke({ service: 'regimen/getRegimenes', loading: loading });
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener regímenes. Intente nuevamente.',
            });
        }
    }

    async getProgramasPorFacultad(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('programas/getProgramasPorFacultad', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener programas por facultad seleccionada. Intente nuevamente.'
            });
        }
    }

    async getPlanesDeEstudiosPorPrograma(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('planesDeEstudio/getPlanesDeEstudiosPorPrograma', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener planes de estudios por programa seleccionado. Intente nuevamente.',
            });
        }
    }

    async getAsignaturasMergedPorPlanDeEstudio(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('asignaturas/getAsignaturasMergedPorPlanDeEstudio', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener asignaturas por plan de estudio seleccionado. Intente nuevamente.',
            });
        }
    }

    async getPreRequisitosPorAsignatura(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('prerrequisitos/getPreRequisitosPorAsignatura', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener prerrequisitos de la asignatura. Intente nuevamente.',
            });
        }
    }

    async getAsignsSecuencialesParalelasPorAsignatura(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('paralela_secuencial/getAsignsSecuencialesParalelasPorAsignatura', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener asign. secuenciales de la asignatura. Intente nuevamente.',
            });
        }
    }

    async getArticulacionesPorAsignatura(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('articulaciones/getArticulacionesPorAsignatura', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener articulaciones de la asignatura. Intente nuevamente.',
            });
        }
    }

    async getMencionesPorAsignatura(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('menciones/getMencionesPorAsignatura', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener menciones de la asignatura. Intente nuevamente.',
            });
        }
    }
    
    async getTemasPorAsignatura(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('temas/getTemasPorAsignatura', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener temas de la asignatura. Intente nuevamente.',
            });
        }
    }

    async getTemasPorPrograma(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('temas/getTemasPorPrograma', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener temas del programa. Intente nuevamente.',
            });
        }
    }
    async getMencionesPorPlanDeEstudio(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('menciones/getMencionesPorPlanDeEstudio', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener menciones del plan de estudio. Intente nuevamente.',
            });
        }
    }

    async getAsignaturasSecuencialesSemestrePorPlanDeEstudio(params: any,  loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('asignaturas/getAsignaturasSecuencialesSemestrePorPlanDeEstudio', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                   message: 'Hubo un error al obtener asignaturas secuenciales. Intente nuevamente.'
                }
            );
        }
    }

    async getAsignaturasConTemaAgrupado(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('asignaturas/getAsignaturasConTemaAgrupado', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener asignaturas del plan de estudio. Intente nuevamente.',
            });
        }
    }

    async getUltimaAsignaturaSecuencialConTemaPorPlanDeEstudio(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('asignaturas/getUltimaAsignaturaSecuencialConTemaPorPlanDeEstudio', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener asignaturas secuenciales del plan de estudio. Intente nuevamente.',
            });
        }
    }

    async getAsignatura(params: any, loading = true, namesCrud: NamesCrud) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('asignaturas/getAsignatura', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                summary: `Error al obtener ${namesCrud.articulo_singular}.`,
                message: error?.message || error.detail.error.message.message
            });
        }
    }

    async insertAsignatura(params: any, namesCrud: NamesCrud) {
        try {
            return this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('asignaturas/insertAsignatura'),
                    params
                ),
                namesCrud
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                summary: `Error al agregar ${namesCrud.articulo_singular}.`,
                message: error?.message || error.detail.error.message.message
            });
        }
    }

    async updateAsignatura(params: any, namesCrud: NamesCrud) {
        try {
            return this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('asignaturas/updateAsignatura'),
                    params
                ),
                namesCrud
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                summary: `Error al actualizar ${namesCrud.articulo_singular}.`,
                message: error?.message || error.detail.error.message.message
            });
        }
    }

    async deleteAsignatura(params: any, namesCrud: NamesCrud) {
        try {
            return this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('asignaturas/deleteAsignatura'),
                    {asignaturasToDelete: params}
                ),
                namesCrud
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                summary: `Error al eliminar ${namesCrud.articulo_singular}.`,
                message: error?.message || error.detail.error.message.message
            });
        }
    }

    async getArchiveDoc(id: any, from: string, needBinaryString: boolean) {
        try {
            if (needBinaryString) {
                return await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('asignaturas/getArchiveDoc',false),
                    { id , needBinaryString, from }
                )
            }else{
                return await this.invoker.httpInvokeReport(
                    this.serviceUtils.generateServiceMongo('asignaturas/getArchiveDoc',false), 
                    'pdf', 
                    { id , needBinaryString, from }
                )
            }
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    summary: `Error al descargar documento.`,
                    message: error?.message || error.detail.error.message.message
                }
            );
        }
    }

    async getDocsMongo(cod_asignatura: string, from: string, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('asignaturas/getDocsMongo', false),
                { cod_asignatura: cod_asignatura, from: from }
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                summary: 'Error al obtener documentos',
                message: error.detail.error.message.message
            });
        }
    }
}