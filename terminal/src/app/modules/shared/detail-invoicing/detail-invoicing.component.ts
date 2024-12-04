import Swal from 'sweetalert2';
import { Observable, map, switchMap, take } from 'rxjs';
import { ChangeDetectorRef, Component } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { SequenceCategoryEnum } from '@sifca-monorepo/terminal-generator';
import { ProductKindEnum, TaxSignEnum } from '@sifca-monorepo/terminal-generator';

import { GenericInvoicingType } from '../invoicing.type';
import { InvoicingService } from '../services/invoicing.service';
import { UserService } from '../../../core/services/user.service';
import { SharedService } from '../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'sifca-monorepo-detail-invoicing',
  templateUrl: './detail-invoicing.component.html',
  styleUrls: ['./detail-invoicing.component.scss'],
})
export class InvoicingDetailsComponent {
  private modalRef: NgbModalRef;

  emails: string[] = [];
  TaxSignEnum = TaxSignEnum;
  ProductKindEnum = ProductKindEnum;
  SequenceCategoryEnum = SequenceCategoryEnum;
  type$: Observable<string> = this.invoicingService.type$;
  breadCrumbItems$ = this.invoicingService.breadCrumbItems$;
  title$: Observable<string> = this.invoicingService.title$;
  pageId$: Observable<string> = this.invoicingService.pageId$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  parentPage$: Observable<string> = this.invoicingService.parentPage$;
  item$: Observable<GenericInvoicingType> = this.invoicingService.item$;
  documentTitle$: Observable<string> = this.invoicingService.documentTitle$;
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private modalService: NgbModal,

    private translateService: TranslateService,
    private route: ActivatedRoute,
    private userService: UserService,
    private sharedService: SharedService,
    private invoicingService: InvoicingService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.userService.currentUser$
      .pipe(
        take(1),
        map((user) => {
          this.emails.push(user.email);
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe();
  }

  downloadDocument(item: GenericInvoicingType) {
    this.invoicingService.downloadDocument(item).subscribe();
  }

  openEmailSelectionModal(content: any) {
    this.modalRef = this.modalService.open(content, { size: 'lg', centered: true });
  }

  sendDocumentToEmail() {
    this.item$
      .pipe(
        take(1),
        switchMap((item) => this.invoicingService.sendDocumentToEmail(item, this.emails)),
      )
      .subscribe((response) => {
        this.modalRef.close();
        this.translateService.get('MENUITEMS.TS.EMAIL_SENT').subscribe((emailSent: string) => {
          Swal.fire({
            timer: 1500,
            icon: 'success',
            position: 'top-end',
            title: emailSent,
            showConfirmButton: false,
          });
        });
      });
  }

  getLabel(value: string): string {
    return value
      .slice(0, -1)
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase();
  }

  ngOnInit(): void {
    this.translateService.get(['invoices.createInvoice', 'invoices.updateInvoice', 'invoices.invoice']).subscribe(() => {
      this.updateRouteData();
    });
  }
  updateRouteData(): void {
    const routeData = this.route.snapshot.data;
    routeData['breadCrumbItems'][0].label = this.translateService.instant('MENUITEMS.TS.INVENTORY');

    if (routeData['breadCrumbItems'][1] === 'Issue note Details') {
      routeData['breadCrumbItems'][1].label = this.translateService.instant('MENUITEMS.TS.ISSUE_NOTE_DETAILS');
    } else if (routeData['breadCrumbItems'][1] === 'Order Details') {
      routeData['breadCrumbItems'][1].label = this.translateService.instant('MENUITEMS.TS.ORDER_DETAILS');
    } else if (routeData['breadCrumbItems'][1] === 'Quotation Details') {
      routeData['breadCrumbItems'][1].label = this.translateService.instant('MENUITEMS.TS.QUOTATION_DETAILS');
    }
  }
}
