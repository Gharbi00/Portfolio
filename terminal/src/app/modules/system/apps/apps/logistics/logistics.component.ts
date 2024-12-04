import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { isEqual, keys, omit } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, Observable, of, Subject, switchMap, take, takeUntil, throwError } from 'rxjs';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { FormHelper } from '@diktup/frontend/helpers';
import { CompanyInput } from '@sifca-monorepo/terminal-generator';
import { LogisticsIntegrationType } from '@sifca-monorepo/terminal-generator';
import { TaxType, CompanyType, PluginType, CountryType } from '@sifca-monorepo/terminal-generator';

import { LogisticsService } from './logistics.service';
import { IntegrationAppsService } from '../../apps.service';
import { PosService } from '../../../../../core/services/pos.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-logistics',
  templateUrl: './logistics.component.html',
  styleUrls: ['./logistics.component.scss'],
})
export class LogisticsComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  initValues: any;
  initialValues: any;
  taxForm!: FormGroup;
  priceForm: FormGroup;
  company: CompanyType;
  selectedTax: TaxType;
  companyForm: FormGroup;
  logisticForm: FormGroup;
  isButtonDisabled = true;
  selectedCompany: CompanyType;
  isCompanyButtonDisabled = true;
  logistic: LogisticsIntegrationType;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  plugin$: Observable<PluginType> = this.integrationAppsService.plugin$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  companies$: Observable<CompanyType[]> = this.logisticsService.companies$;
  loadingCompanies$: Observable<boolean> = this.logisticsService.loadingCompanies$;
  countries$: Observable<CountryType[]> = this.posService?.infiniteCountries$;
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private location: Location,
    private modalService: NgbModal,
    private translate: TranslateService,
    private posService: PosService,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private logisticsService: LogisticsService,
    private changeDetectorRef: ChangeDetectorRef,
    private integrationAppsService: IntegrationAppsService,
  ) {}

  ngOnInit(): void {
    this.integrationAppsService.findPluginByURL(this.location.path()).subscribe();
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.logisticsService.searchString = searchValues.searchString;
          return this.logisticsService.searchLogisticCompaniesByTarget();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    this.logisticsService.logistic$.pipe(takeUntil(this.unsubscribeAll)).subscribe((logistic) => {
      this.logistic = logistic;
      this.logisticForm = this.formBuilder.group({
        prefix: [logistic.prefix || ''],
      });
      this.initialValues = this.logisticForm.value;
      this.logisticForm.valueChanges
        .pipe(takeUntil(this.unsubscribeAll))
        .subscribe((val) => (this.isButtonDisabled = isEqual(val, this.initialValues)));
      this.changeDetectorRef.markForCheck();
    });
    this.sharedService.navigating$ = false;
  }

  ngAfterViewInit() {
    this.posService.findCountriesPagination().subscribe();
  }

  openDeleteCompany(content: any, company: CompanyType) {
    this.selectedCompany = company;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  deleteLogisticCompany() {
    this.logisticsService
      .deleteLogisticCompany(this.selectedCompany.id)
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
        }
      });
  }
  loadMoreCountries() {
    this.posService.isLastCountries$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.posService.countriesPageIndex++;
        this.posService.findCountriesPagination().subscribe();
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

  openLogisticModal(content: any, company: CompanyType) {
    this.modalService.open(content, { size: 'lg', centered: true });
    this.selectedCompany = company;
    this.companyForm = this.formBuilder.group({
      name: [company?.name || '', Validators.required],
      description: [company?.description || ''],
      address: this.formBuilder.group({
        address: [company?.address?.address || ''],
        postCode: [company?.address?.postCode || ''],
        city: [company?.address?.city || ''],
        country: [company?.address?.country?.id || undefined],
      }),
      legal: this.formBuilder.group({
        vat: [company?.legal?.vat || '', Validators.required],
        register: [company?.legal?.register || '', Validators.required],
        licence: [company?.legal?.licence || ''],
      }),
      contact: this.formBuilder.group({
        website: [company?.contact?.website || ''],
        phone: this.formBuilder.group({
          number: [company?.contact?.phone?.number || ''],
          countryCode: ['216'],
        }),
        email: [company?.contact?.email || '', [Validators.email]],
      }),
    });
    this.initValues = this.companyForm.value;
    this.companyForm.valueChanges.subscribe((ivalues) => {
      this.isCompanyButtonDisabled = isEqual(ivalues, this.initValues);
    });
  }

  updateLogistics() {
    this.isButtonDisabled = true;
    this.logisticsService
      .updateLogisticsIntegration(this.logistic.id, this.logisticForm.value)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  saveLogisticCompany(): void {
    this.isCompanyButtonDisabled = true;
    let args: any;
    const legal = FormHelper.getDifference(this.initValues.legal, this.companyForm.value.legal);
    const contact = {
      ...FormHelper.getDifference(omit(this.initValues.contact, 'phone'), omit(this.companyForm.value.contact, 'phone')),
      ...(this.initValues?.contact?.phone?.number === this.companyForm.value?.contact?.phone?.number
        ? {}
        : { phone: { number: this.companyForm.value.contact.phone.number, countryCode: '216' } }),
    };
    const address = {
      ...FormHelper.getDifference(this.initValues.address, this.companyForm.value.address),
    };
    (args = {
      ...FormHelper.getDifference(omit(this.initValues, 'address', 'legal', 'contact'), omit(this.companyForm.value, 'address', 'legal', 'contact')),
      ...(keys(address).length ? { address } : {}),
      ...(keys(legal).length ? { legal } : {}),
      ...(keys(contact).length ? { contact } : {}),
    }),
      this.selectedCompany ? this.updateLogisticCompany(args) : this.addLogisticCompany(args);
  }

  updateLogisticCompany(company: CompanyInput): void {
    this.logisticsService
      .updateLogisticCompany(company, this.selectedCompany.id)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res: any) => {
        if (res) {
          this.position();
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  addLogisticCompany(company: CompanyInput): void {
    this.logisticsService
      .createLogisticCompany(company)
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
        }
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

  ngOnDestroy(): void {
    this.posService.countriesPageIndex = 0;
    this.posService.infiniteCountries$ = null;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
