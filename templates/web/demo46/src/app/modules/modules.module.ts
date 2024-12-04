import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { ModulesRoutingModule } from "./modules-routing.module";



@NgModule({
    declarations: [

    ],
    imports: [
        CommonModule,
        ModulesRoutingModule,
        SharedModule
    ]
  })
  export class ModulesModule { }