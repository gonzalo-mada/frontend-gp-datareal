import { effect, Injectable, signal } from '@angular/core';

export interface ConfigMode {
    isPostgrado: boolean
}

@Injectable({
  providedIn: 'root'
})
export class ConfigModeService{

    _config: ConfigMode = {
        isPostgrado: true
    }

    config = signal<ConfigMode>(this._config);

    constructor(){
        effect(() => {
            this.onConfigUpdate();
        })
    }

    onConfigUpdate(){
        this._config = { ...this.config() };
    }

    getMode(){
        return this.config().isPostgrado; 
    }
    
}