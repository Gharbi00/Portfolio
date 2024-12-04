import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DepartmentsComponent } from './company/departments/departments.component';
import { DepartmentsResolver } from './company/departments/departments.resolvers';
import { LocationsComponent } from './company/locations/locations.component';
import { LocationsResolver } from './company/locations/locations.resovers';
import { ContractsComponent } from './employees/contracts/contracts.component';
import { EmployeesComponent } from './employees/employees/employees.component';
import { PayrollComponent } from './employees/payroll/payroll.component';
import { VehiculeContractsComponent } from './fleet/contracts/contracts.component';
import { AddVehiculeComponent } from './fleet/vehicules/add-vehicule/add-vehicule.component';
import { VehiculeDetailComponent } from './fleet/vehicules/vehicule-detail/vehicule-detail.component';
import { VehiculesComponent } from './fleet/vehicules/vehicules/vehicules.component';
import { HRSettingsComponent } from './settings/hr-settings.component';

const routes: Routes = [
  {
    path: 'career',
    loadChildren: () => import('./career/career.module').then((m) => m.CareerModule),
  },
  {
    path: 'employees',
    component: EmployeesComponent,
  },
  {
    path: 'employees/contracts',
    component: ContractsComponent,
  },
  {
    path: 'employees/payroll',
    component: PayrollComponent,
  },
  {
    path: 'company/locations',
    component: LocationsComponent,
    resolve: {
      locations: LocationsResolver,
    },
  },
  {
    path: 'company/departments',
    component: DepartmentsComponent,
    resolve: {
      departments: DepartmentsResolver,
    },
  },
  {
    path: 'fleet/vehicules',
    component: VehiculesComponent,
  },
  {
    path: 'fleet/vehicules/create',
    component: AddVehiculeComponent,
  },
  {
    path: 'fleet/vehicules/details',
    component: VehiculeDetailComponent,
  },
  {
    path: 'fleet/contracts',
    component: VehiculeContractsComponent,
  },
  {
    path: 'settings',
    component: HRSettingsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HRRoutingModule {}
