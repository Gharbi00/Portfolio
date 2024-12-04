import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';

import { UserService } from '@sifca-monorepo/clients';
import { MarketPlaceOrderDtoType } from '@sifca-monorepo/terminal-generator';
import { SequenceCategoryEnum } from '@sifca-monorepo/terminal-generator';
import { SalesAnalyticsService } from '../../../../modules/dashboards/sales/sales.service';
import { Subject, catchError, of, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { isEqual } from 'lodash';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-recent-orders',
  templateUrl: './recent-orders.component.html',
  styleUrls: ['./recent-orders.component.scss'],
})
export class RecentOrdersComponent implements OnInit {
  @Input() RecentSelling: MarketPlaceOrderDtoType[];
  private unsubscribeAll: Subject<any> = new Subject<any>();

  emails: string[] = [];
  emailsForm: FormGroup;
  isEmailButtonDisabled = true;

  constructor(
    private translate: TranslateService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private changeDetectorRef: ChangeDetectorRef,
    private salesAnalyticsService: SalesAnalyticsService,
  ) {}

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe((res) => {
      this.emails.push(res?.email);
      this.changeDetectorRef.markForCheck();
    });
  }

  openEmailSelectionModal(content: any, orderId: string) {
    this.modalService.open(content, { centered: true });
    this.emailsForm = this.formBuilder.group({
      emails: [this.emails],
      subject: ['Please find below your invoices'],
      document: this.formBuilder.group({
        id: [orderId],
        name: [''],
        category: [SequenceCategoryEnum.SALE_ORDER],
      }),
    });
    const initValues = this.emailsForm.value;
    this.emailsForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isEmailButtonDisabled = isEqual(values, initValues);
    });
  }

  sendInvoicingPDF() {
    this.isEmailButtonDisabled = true;
    this.salesAnalyticsService
      .sendInvoicingPDFDocumentByEmail(this.emailsForm.value)
      .pipe(
        catchError(() => {
          this.modalError();
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.changeDetectorRef.markForCheck();
        } else {
          this.modalError();
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  position() {
    this.translate.get('MENUITEMS.TS.WORK_SAVED').subscribe((workSaved: string) => {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: workSaved,
        showConfirmButton: false,
        timer: 1500,
      });
    });
  }

  modalError() {
    this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((sthWentWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: sthWentWrong,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
      });
    });
  }
}
