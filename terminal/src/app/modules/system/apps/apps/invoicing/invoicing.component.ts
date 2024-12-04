import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { isEqual, omit, values } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, Observable, Subject, takeUntil, throwError } from 'rxjs';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import { DiscountType, PluginType, TaxSignEnum, TaxType, TaxUseEnum } from '@sifca-monorepo/terminal-generator';

import { InvoicingService } from './invoicing.service';
import { IntegrationAppsService } from '../../apps.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-invoicing',
  templateUrl: './invoicing.component.html',
  styleUrls: ['./invoicing.component.scss'],
})
export class InvoicingComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  taxes: TaxType[];
  companyId: string;
  taxForm: FormGroup;
  initialValues: any;
  selectedTax: TaxType;
  isButtonDisabled = true;
  uses = values(TaxUseEnum);
  signs = values(TaxSignEnum);
  types = values(DiscountType);
  taxes$: Observable<TaxType[]> = this.invoicingService.taxes$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  plugin$: Observable<PluginType> = this.integrationAppsService.plugin$;
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private location: Location,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private storageHelper: StorageHelper,
    private sharedService: SharedService,
    private translate: TranslateService,
    private invoicingService: InvoicingService,
    private changeDetectorRef: ChangeDetectorRef,
    private integrationAppsService: IntegrationAppsService,
  ) {
    this.companyId = this.storageHelper.getData('company');
    this.integrationAppsService.findPluginByURL(this.location.path()).subscribe();
    this.sharedService.navigating$ = false;
  }

  ngOnInit(): void {}

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

  saveTax() {
    this.isButtonDisabled = true;
    const value = {
      ...FormHelper.getDifference(omit(this.initialValues.value, 'value'), omit(this.taxForm.get('value').value, 'value')),
      value: this.taxForm.get(['value', 'value']).value.toString(),
    };
    const args: any = {
      ...FormHelper.getDifference(omit(this.initialValues, 'value'), omit(this.taxForm.value, 'value')),
      ...(isEqual(this.initialValues.value, this.taxForm.get('value').value) ? {} : { value }),
    };
    if (!this.selectedTax) {
      this.invoicingService
        .createTax(args)
        .pipe(
          catchError((error) => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe(() => {
          this.position();
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        });
    } else {
      this.invoicingService
        .updateTax(this.selectedTax.id, args)
        .pipe(
          catchError((error) => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe(() => {
          this.position();
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        });
    }
  }

  openTaxModal(content: any, tax: TaxType) {
    this.selectedTax = tax;
    this.modalService.open(content, { size: 'md', centered: true });
    this.taxForm = this.formBuilder.group({
      label: [tax?.label || '', [Validators.required]],
      externalId: [tax?.externalId || '', [Validators.required]],
      value: this.formBuilder.group({
        sign: [tax?.value?.sign || undefined, [Validators.required]],
        value: [tax?.value?.value || ''],
        type: [tax?.value?.type || undefined, [Validators.required]],
      }),
      use: [tax?.use || '', [Validators.required]],
      product: [tax?.product || true],
      company: [this.companyId],
    });
    this.initialValues = this.taxForm.value;
    this.taxForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val): void => {
      this.isButtonDisabled = isEqual(val, this.initialValues);
    });
  }

  openDeleteTax(content: any, tax: TaxType) {
    this.selectedTax = tax;
    this.modalService.open(content, { size: 'md', centered: true });
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

  deleteTax() {
    this.invoicingService
      .deleteTax(this.selectedTax.id)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.modalService.dismissAll();
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
