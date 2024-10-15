import {  effect, Injectable, signal } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { NameComponent } from '../../models/shared/Context';

export type Mode = undefined | 'dialog' | 'page' 

export interface ContextMenuButtons {
    mantenedor: NameComponent,
    mode: Mode
}

@Injectable({
    providedIn: 'root'
})

export class MenuButtonsTableService {

    _context : ContextMenuButtons = {
        mantenedor: undefined,
        mode: undefined
    }

    context = signal<ContextMenuButtons>(this._context);

    private contextUpdate = new BehaviorSubject<ContextMenuButtons>(this._context);
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

    setContext(mantenedor: NameComponent, mode: Mode){
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