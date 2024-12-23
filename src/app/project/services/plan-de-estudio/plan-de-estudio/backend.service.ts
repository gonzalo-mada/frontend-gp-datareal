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

    async getPlanesDeEstudios(namesCrud: NamesCrud) {
        try {
            return await this.invoker.httpInvoke('planesDeEstudio/getPlanesDeEstudios');
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    summary: `Error al obtener ${namesCrud.articulo_singular}. Intente nuevamente`,
                    message: error?.message || error.detail.error.message.message
                }
            );
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
                summary: `Error al agregar ${namesCrud.articulo_singular}.`,
                message: error?.message || error.detail.error.message.message
            });
        }
    }

    async deletePlanDeEstudio(params: any, namesCrud: NamesCrud) {
        try {
            return this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('planesDeEstudio/deletePlanDeEstudio'),
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