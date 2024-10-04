import {  effect, Injectable, signal } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export type Mantenedor = undefined | 'programa' | 'form-ea' | 'campus' | 'facultad' | 'unidadAcad' | 'form-susp' | 'categorias-tp' | 'tp' | 'suspension' | 'reglamento' | 'jornada'
export type Mode = undefined | 'dialog' | 'page' 

interface Context {
    mantenedor: Mantenedor,
    mode: Mode
}

@Injectable({
    providedIn: 'root'
})

export class MenuButtonsTableService {

    _context : Context = {
        mantenedor: undefined,
        mode: undefined
    }

    context = signal<Context>(this._context);

    private contextUpdate = new BehaviorSubject<Context>(this._context);
    contextUpdate$ = this.contextUpdate.asObservable();

    private onClickButtonAgregar = new Subject<void>();
    onClickButtonAgregar$ = this.onClickButtonAgregar.asObservable();

    private onClickDeleteSelected = new Subject<void>();
    onClickDeleteSelected$ = this.onClickDeleteSelected.asObservable();

    constructor(){
        effect(()=>{
            this.onContextUpdate();
        })
    }

    onContextUpdate(){
        this._context = { ...this.context() };
        this.contextUpdate.next(this.context());
    }

    setContext(mantenedor: Mantenedor, mode: Mode){
        this.context.update((context) => ({
            ...context,
            mantenedor: mantenedor,
            mode: mode
        }))
    }

    emitClickButtonAgregar(){
        this.onClickButtonAgregar.next();
    }

    emitClickDeleteSelected(){
        this.onClickDeleteSelected.next();
    }
}