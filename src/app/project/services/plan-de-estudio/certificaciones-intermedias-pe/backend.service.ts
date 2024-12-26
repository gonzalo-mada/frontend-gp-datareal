import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ServiceUtils } from 'src/app/project/tools/utils/service.utils';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';

@Injectable({
    providedIn: 'root'
})

export class BackendCertifIntermediasPEService {

    constructor(
        private errorTemplateHandler: ErrorTemplateHandler,
        private invoker: InvokerService, 
        private serviceUtils: ServiceUtils
    ){}

    countTableRegisters(value: number, namesCrud: NamesCrud){
        this.serviceUtils.countTableValues(value,namesCrud);
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

    async getProgramasPostgradoConCertifIntermediaPorFacultad(params: any,loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('planesDeEstudio/getProgramasPostgradoConCertifIntermediaPorFacultad', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    message: `Hubo un error al obtener programas con certificación intermedia. Intente nuevamente.`,
                }
            );
        }
    }

    async getPlanesDeEstudiosPorPrograma(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('planesDeEstudio/getPlanesDeEstudiosPorPrograma', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    message: `Hubo un error al obtener planes de estudios por programa seleccionado. Intente nuevamente.`,
                }
            );
        }
    }
    
    async getAsignaturasPorPlanDeEstudio(params: any) {
        try {
            return await this.invoker.httpInvoke('planesDeEstudio/getAsignaturasPorPlanDeEstudio', params );
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    message: `Hubo un error al obtener asignaturas por plan de estudio seleccionado. Intente nuevamente.`,
                }
            );
        }
    }

    async getCertificacionIntermedia_Prog(params: any) {
        try {
            return await this.invoker.httpInvoke('certificacionIntermediaPE/getCertificacionIntermedia_Prog', params );
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    message: `Hubo un error al obtener certificaciones intermedias por programa seleccionado. Intente nuevamente.`,
                }
            );
        }
    }

    async getAsignaturasPorProgramaPregrado(params: any) {
        try {
            return await this.invoker.httpInvoke('articulaciones/getAsignaturasPorProgramaPregrado', params );
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    message: `Hubo un error al obtener asignaturas por programa seleccionado. Intente nuevamente.`,
                }
            );
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

    async getArticulaciones(namesCrud: NamesCrud) {
        try {
            return await this.invoker.httpInvoke('articulaciones/getArticulaciones_Asign_All')
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    summary: `Error al obtener ${namesCrud.articulo_plural}.`,
                    message: error?.message || error.detail.error.message.message
                }
            );
        }
    }
    
    async insertArticulacion(params: any, namesCrud: NamesCrud) {
        try {
            const response = await this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('articulaciones/insertArticulacion'),
                    params
                ),
                namesCrud
            );
            return response;
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    summary: `Error al agregar ${namesCrud.articulo_singular}.`,
                    message: error?.message || error.detail.error.message.message
                }
            );
        }
    }

    async updateArticulacion(params: any, namesCrud: NamesCrud) {
        try {
            const response = await this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke('articulaciones/updateArticulacion',params),
                namesCrud
            );
            return response;
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    summary: `Error al actualizar ${namesCrud.articulo_singular}.`,
                    message: error?.message || error.detail.error.message.message
                }
            );
        }
    }

    async deleteArticulacion(params: any, namesCrud: NamesCrud) {
        try {
            return await this.invoker.httpInvoke('articulaciones/deleteArticulacion',{articulacionesToDelete: params});
        } catch (error: any) {
            this.errorTemplateHandler.processError(
                error, 
                {
                    notifyMethod: 'alert',
                    summary: `Error al eliminar ${namesCrud.articulo_singular}.`,
                    message: error?.message || error.detail.error.message.message
                }
            );
        }
    }

}