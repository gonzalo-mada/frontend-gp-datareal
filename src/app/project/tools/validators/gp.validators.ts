import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class GPValidator {

    static notMinusOneCategory(): ValidatorFn {
        return (control: AbstractControl) : ValidationErrors | null => {
            console.log("control",control.value);
            if(control.value === -1){
                return {notMinusOneCategory : true}
            }else{
                return null;
            }
        };
    }

    static notValueNegativeYearsAcredit(): ValidatorFn {
        return (control: AbstractControl) : ValidationErrors | null => {
            if (control.value <= 0 && control.value !== null) {
                return { notValueNegativeYearsAcredit: true }
            }else{
                return null;
            }
        }
    }

    static notUpTo15YearsAcredit(): ValidatorFn {
        return (control: AbstractControl) : ValidationErrors | null => {
            if (control.value >= 15 && control.value !== null) {
                return { notUpTo15YearsAcredit: true }
            }else{
                return null;
            }
        }
    }

    static regexPattern(pattern: 'num_y_letras' | 'solo_num' | 'solo_letras' ): ValidatorFn {
        let regex : any ;
        switch (pattern) {
            case 'num_y_letras': regex = /^(?=.*[a-zA-ZñÑ]).+$/; break; // no acepta espacio en blanco y se necesita al menos una letra
            case 'solo_num':  regex = /^[0-9]+$/; break;
            case 'solo_letras': regex = /^[a-zA-ZñÑ]+$/; break;
        }
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value && !regex.test(control.value)) {
                switch (pattern) {
                    case 'num_y_letras': return { num_y_letras: true };
                    case 'solo_num': return { num_y_letras: true };
                    case 'solo_letras': return { num_y_letras: true };
                }
                
            } else {
                return null;
            }
        };
        
    }
}