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

    async getAsignaturasSimplificatedPorPlanDeEstudio(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('asignaturas/getAsignaturasSimplificatedPorPlanDeEstudio', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener asignaturas del plan de estudio. Intente nuevamente.',
            });
        }
    }

    async getAsignaturasSecuencialesConTemaPorPlanDeEstudio(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('asignaturas/getAsignaturasSecuencialesConTemaPorPlanDeEstudio', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener asignaturas secuenciales del plan de estudio. Intente nuevamente.',
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
}