import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { ServiceUtils } from 'src/app/project/tools/utils/service.utils';

@Injectable({
    providedIn: 'root'
})

export class BackendPlanesDeEstudiosService {
    constructor(
        private errorTemplateHandler: ErrorTemplateHandler,
        private invoker: InvokerService, 
        private serviceUtils: ServiceUtils
    ){}

    countTableRegisters(value: number, namesCrud: NamesCrud){
        this.serviceUtils.countTableValues(value,namesCrud);
    }

    async getProgramasPorFacultad(params: any) {
        try {
            return await this.invoker.httpInvoke('programas/getProgramasPorFacultad', params);
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener programas por facultad seleccionada. Intente nuevamente.'
            });
        }
    }

    async getEstadosPlanEstudio(loading = true) {
        try {
            return await this.invoker.httpInvoke({ service: 'planesDeEstudio/getEstadosPlanEstudio', loading: loading });
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener estados. Intente nuevamente.',
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

    async getJornadas(loading = true) {
        try {
            return await this.invoker.httpInvoke({ service: 'jornadas/getJornadas', loading: loading });
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener jornadas. Intente nuevamente.',
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

    async getReglamentos(loading = true) {
        try {
            return await this.invoker.httpInvoke({ service: 'reglamentos/getReglamentos', loading: loading });
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener reglamentos. Intente nuevamente.',
            });
        }
    }

    async getArticulacionesPorPlanDeEstudio(params: any,  loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('articulaciones/getArticulacionesPorPlanDeEstudio', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                   message: 'Hubo un error al obtener articulaciones. Intente nuevamente.'
                }
            );
        }
    }

    async getCertifIntermediasPorPlanDeEstudio(params: any,  loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('certificacionIntermediaPE/getCertifIntermediasPorPlanDeEstudio', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                   message: 'Hubo un error al obtener certificaciones intermedias. Intente nuevamente.'
                }
            );
        }
    }

    async getAsignaturasPorPlanDeEstudio(params: any,  loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('asignaturas/getAsignaturasPorPlanDeEstudio', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                   message: 'Hubo un error al obtener asignaturas. Intente nuevamente.'
                }
            );
        }
    }

    async getRangosPorPlanDeEstudio(params: any,  loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('planesDeEstudio/getRangosPorPlanDeEstudio', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                   message: 'Hubo un error al obtener grados de aprobación. Intente nuevamente.'
                }
            );
        }
    }

    async getMencionesPorPlanDeEstudio(params: any,  loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('planesDeEstudio/getMencionesPorPlanDeEstudio', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                   message: 'Hubo un error al obtener menciones. Intente nuevamente.'
                }
            );
        }
    }

    async getProgramaPostgrado(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('planesDeEstudio/getProgramaPostgrado', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener programa de postgrado. Intente nuevamente.',
            });
        }
    }

    async getProgramasPostgrado(loading = true) {
        try {
            return await this.invoker.httpInvoke({service: 'planesDeEstudio/getProgramasPostgrado', loading: loading});
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    message: `Hubo un error al obtener programas. Intente nuevamente.`,
                }
            );
        }
    }

    async getPlanesDeEstudiosMergedPorPrograma(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('planesDeEstudio/getPlanesDeEstudiosMergedPorPrograma', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener planes de estudios por programa seleccionado. Intente nuevamente.',
            });
        }
    }

    async getArchiveDoc(id: any, from: string, needBinaryString: boolean) {
        try {
            if (needBinaryString) {
                return await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('planesDeEstudio/getArchiveDoc',false),
                    { id , needBinaryString, from }
                )
            }else{
                return await this.invoker.httpInvokeReport(
                    this.serviceUtils.generateServiceMongo('planesDeEstudio/getArchiveDoc',false), 
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

    async getDocsMongo(cod_plan_estudio: number, from: string, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('planesDeEstudio/getDocsMongo', false),
                { cod_plan_estudio: cod_plan_estudio, from: from }
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                summary: 'Error al obtener documentos',
                message: error.detail.error.message.message
            });
        }
    }

    async getPlanDeEstudio(params: any, loading = true, namesCrud: NamesCrud) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('planesDeEstudio/getPlanDeEstudio', loading),
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

    async insertPlanDeEstudio(params: any, namesCrud: NamesCrud) {
        try {
            return this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('planesDeEstudio/insertPlanDeEstudio'),
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

    async updatePlanDeEstudio(params: any, namesCrud: NamesCrud) {
        try {
            return this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('planesDeEstudio/updatePlanDeEstudio'),
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

    async deletePlanDeEstudio(params: any, namesCrud: NamesCrud) {
        try {
            return this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('planesDeEstudio/deletePlanDeEstudio'),
                    {planesToDelete: params}
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
}