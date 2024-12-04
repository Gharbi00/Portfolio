import { Component } from '@angular/core';
import { BaseNotFoundComponent } from '@sifca-monorepo/clients';

@Component({
  selector: 'app-error404',
  templateUrl: './error404.component.html',
  styleUrls: ['./error404.component.scss'],
})
export class Error404Component extends BaseNotFoundComponent {}
