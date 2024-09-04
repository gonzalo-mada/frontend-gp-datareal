import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class GPValidator {
    static notMinusOneCategory(): ValidatorFn {
        return (control: AbstractControl) : ValidationErrors | null => {
            console.log("control.value",control.value);
            if(control.value === -1){
                return {notMinusOneCategory : true}
            }else{
                return null;
            }
        };
    }
}