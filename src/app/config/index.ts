import { environment as environmentDev } from "../../enviroment/enviroment.develop";
import { environment as environmentProd } from "../../enviroment/enviroment";
import { isDevMode } from '@angular/core';

// Checar se esta rodando em dev se não usar environmentProd
export const config = isDevMode() ? environmentDev : environmentProd;