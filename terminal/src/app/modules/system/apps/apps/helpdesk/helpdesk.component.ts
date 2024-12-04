import Swal from 'sweetalert2';
import { isEqual, values } from 'lodash';
import { Location } from '@angular/common';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { catchError, Observable, of, Subject, take, takeUntil } from 'rxjs';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { PluginType, CountryType, DocumentReferenceModelEnum, WebsiteIntegrationMulticurrencyCurrencyType } from '@sifca-monorepo/terminal-generator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { CurrencyType, HelpdeskIntegrationType } from '@sifca-monorepo/terminal-generator';

import { HelpdeskService } from './helpdesk.service';
import { IntegrationAppsService } from '../../apps.service';
import { PosService } from '../../../../../core/services/pos.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'helpdesk',
  templateUrl: './helpdesk.component.html',
  styleUrls: ['./helpdesk.component.scss'],
})
export class HelpdeskComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  initialValues: any;
  helpDeskForm: FormGroup;
  isButtonDisabled = true;
  countries: CountryType[];
  isOrderButtonDisabled = true;
  isInvoiceButtonDisabled = true;
  isSettingsButtonDisabled = false;
  isInventoryButtonDisabled = true;
  helpDesk: HelpdeskIntegrationType;
  isDeliveryNoteButtonDisabled = true;
  DocumentReferences = values(DocumentReferenceModelEnum);
  selectedCurrency: WebsiteIntegrationMulticurrencyCurrencyType;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  plugin$: Observable<PluginType> = this.integrationAppsService.plugin$;
  currencies$: Observable<CurrencyType[]> = this.posService?.infiniteCurrencies$;

  get currencies(): FormArray {
    return this.helpDeskForm.get(['multicurrency', 'currencies']) as FormArray;
  }
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private location: Location,
    private modalService: NgbModal,
    private posService: PosService,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private translate: TranslateService,
    private helpdeskService: HelpdeskService,
    private changeDetectorRef: ChangeDetectorRef,
    private integrationAppsService: IntegrationAppsService,
  ) {
    this.integrationAppsService.findPluginByURL(this.location.path()).subscribe();
    this.sharedService.navigating$ = false;
  }

  ngOnInit(): void {
    this.helpdeskService.helpDesk$.pipe(takeUntil(this.unsubscribeAll)).subscribe((helpDesk) => {
      this.helpDesk = helpDesk;
      this.helpDeskForm = this.formBuilder.group({
        prefix: [helpDesk?.prefix || ''],
      });
      this.initialValues = this.helpDeskForm.value;
      this.helpDeskForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((ivalues) => {
        this.isButtonDisabled = isEqual(ivalues, this.initialValues);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  ngAfterViewInit() {
    this.posService.findCurrenciesPagination().subscribe((res) => {
      if (res) {
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  loadMoreCurrencies() {
    this.posService.isLastCurrencies$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.posService.currenciesPageIndex++;
        this.posService.findCurrenciesPagination().subscribe();
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

  updateHelpdesk() {
    this.isSettingsButtonDisabled = true;
    const arg: any = {
      prefix: this.helpDeskForm.get('prefix').value,
    };
    this.updateHelpdeskIntegration(arg);
  }

  updateHelpdeskIntegration(input: any) {
    this.helpdeskService
      .updateHelpdeskIntegration(this.helpDesk.id, input)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  openIntegrationModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
