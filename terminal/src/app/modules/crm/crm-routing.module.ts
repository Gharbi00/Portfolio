import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// import { ContactsComponent } from './customers/contacts/contacts.component';
// import { CompaniesComponent } from './customers/companies/companies.component';
// import { PipelineComponent } from './pipeline/pipeline.component';
// import { LeadsComponent } from './customers/leads/leads.component';
// import { CompaniesResolver } from './customers/companies/companies.resovers';
// import { ContactsResolver } from './customers/contacts/contacts.resovers';
// import { LeadsResolver } from './customers/leads/leads.resovers';
// import { PipelineResolver } from './pipeline/pipeline.resovers';
// import { ArchivedComponent } from './pipeline/archived/archived.component';
// import { ArchivedResolver } from './pipeline/archived/archived.resovers';

const routes: Routes = [
  // {
  //   path: '',
  //   component: ContactsComponent,
  // },
  // {
  //   path: 'customers/contacts',
  //   component: ContactsComponent,
  //   resolve: {
  //     contacts: ContactsResolver,
  //   },
  // },
  // {
  //   path: 'customers/companies',
  //   component: CompaniesComponent,
  //   resolve: {
  //     companies: CompaniesResolver,
  //   },
  // },
  // {
  //   path: 'customers/leads',
  //   component: LeadsComponent,
  //   resolve: {
  //     leads: LeadsResolver,
  //   },
  // },
  // {
  //   path: 'pipeline',
  //   component: PipelineComponent,
  //   resolve: {
  //     contacts: PipelineResolver,
  //   },
  // },
  // {
  //   path: 'pipeline/archived/:id',
  //   component: ArchivedComponent,
  //   resolve: {
  //     archived: ArchivedResolver,
  //   },
  // },
  // {
  //   path: 'tickets',
  //   loadChildren: () => import('./tickets/tickets.module').then((m) => m.TicketsModule),
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CRMRoutingModule {}
