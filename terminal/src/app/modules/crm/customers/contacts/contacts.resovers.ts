import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Resolve } from '@angular/router';

import { ContactsService } from './contacts.service';
import { CompanyContactPaginateType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class ContactsResolver implements Resolve<any> {
  constructor(private contactsService: ContactsService) {}

  resolve(): Observable<CompanyContactPaginateType> {
    return this.contactsService.getCompanyContactsByCompanyPaginated();
  }
}
