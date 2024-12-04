import Swal from 'sweetalert2';
import { isBoolean, isEqual, omit } from 'lodash';
import { Clipboard } from '@angular/cdk/clipboard';
import { Observable, Subject, catchError, takeUntil, throwError } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { CountryType, FbCatalogSyncType, PluginType } from '@sifca-monorepo/terminal-generator';

import { IntegrationAppsService } from '../../../apps.service';
import { PosService } from '../../../../../../core/services/pos.service';
import { FormHelper } from '@diktup/frontend/helpers';
import { SharedService } from '../../../../../../shared/services/shared.service';
import { PointOfSaleType } from '@sifca-monorepo/terminal-generator';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'meta-catalog',
  templateUrl: './catalog.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetaCatalogComponent implements OnInit, AfterViewInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  initialValues: any;
  countries: CountryType[];
  attributesForm: FormGroup;
  fbCatalogueForm: FormGroup;
  fbCatalogueInitValues: any;
  fbCatalogue: FbCatalogSyncType;
  isShippingButtonDisabled = true;
  plugin$: Observable<PluginType> = this.integrationAppsService.plugin$;
  impUrl: string;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private clipboard: Clipboard,
    private posService: PosService,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private changeDetectorRef: ChangeDetectorRef,
    private integrationAppsService: IntegrationAppsService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.integrationAppsService.fbCatalogue$.pipe(takeUntil(this.unsubscribeAll)).subscribe((fbCatalogue: FbCatalogSyncType) => {
      this.fbCatalogue = fbCatalogue;
      this.fbCatalogueForm = this.formBuilder.group({
        id: [this.fbCatalogue.id],
        sell: [isBoolean(this.fbCatalogue.sell) ? this.fbCatalogue.sell : false],
        fbCategory: [isBoolean(this.fbCatalogue.fbCategory) ? this.fbCatalogue.fbCategory : false],
        googleCategory: [isBoolean(this.fbCatalogue.googleCategory) ? this.fbCatalogue.googleCategory : false],
        sale: [isBoolean(this.fbCatalogue.sale) ? this.fbCatalogue.sale : false],
        shipping: this.formBuilder.group({
          active: [this.fbCatalogue?.shipping?.active === true ? true : false],
          country: [this.fbCatalogue?.shipping?.country?.id || '', Validators.required],
          service: [this.fbCatalogue?.shipping?.service || ''],
          price: [this.fbCatalogue?.shipping?.price || ''],
        }),
      });
      this.fbCatalogueInitValues = this.fbCatalogueForm.value;
      this.fbCatalogueForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((ivalues) => {
        this.isShippingButtonDisabled = isEqual(ivalues, this.fbCatalogueInitValues);
      });
      this.attributesForm = this.formBuilder.group({
        id: [this.fbCatalogue.id],
        attributes: this.formBuilder.group({
          active: [isBoolean(this.fbCatalogue.attributes.active) ? this.fbCatalogue.attributes.active : false],
          color: [isBoolean(this.fbCatalogue.attributes.color) ? this.fbCatalogue.attributes.color : false],
          gender: [isBoolean(this.fbCatalogue.attributes.gender) ? this.fbCatalogue.attributes.gender : false],
          size: [isBoolean(this.fbCatalogue.attributes.size) ? this.fbCatalogue.attributes.size : false],
          ageGroup: [isBoolean(this.fbCatalogue.attributes.ageGroup) ? this.fbCatalogue.attributes.ageGroup : false],
          material: [isBoolean(this.fbCatalogue.attributes.material) ? this.fbCatalogue.attributes.material : false],
          pattern: [isBoolean(this.fbCatalogue.attributes.pattern) ? this.fbCatalogue.attributes.pattern : false],
        }),
      });
      this.initialValues = this.attributesForm.value.attributes;
      this.posService.pos$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pos: PointOfSaleType) => {
        this.impUrl = `${pos.website}/meta-catalog.xml`;
        this.changeDetectorRef.markForCheck();
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  ngAfterViewInit() {
    this.findCountriesPagination();
  }

  onChange(event: any, field: string) {
    this.fbCatalogueForm.get(field).patchValue(event);
    const form: any = {
      id: this.fbCatalogue.id,
      ...(this.fbCatalogueForm.get('sell').value === this.fbCatalogueInitValues?.sell ? {} : { sell: this.fbCatalogueForm.get('sell').value }),

      ...(this.fbCatalogueForm.get('fbCategory').value === this.fbCatalogueInitValues?.fbCategory
        ? {}
        : { fbCategory: this.fbCatalogueForm.get('fbCategory').value }),

      ...(this.fbCatalogueForm.get('googleCategory').value === this.fbCatalogueInitValues?.googleCategory
        ? {}
        : { googleCategory: this.fbCatalogueForm.get('googleCategory').value }),

      ...(this.fbCatalogueForm.get('sale').value === this.fbCatalogueInitValues?.sale ? {} : { sale: this.fbCatalogueForm.get('sale').value }),
      // ...omit(this.fbCatalogueForm.value, 'shipping'),
    };
    this.updateFBCatalogSync(form);
  }

  save() {
    this.isShippingButtonDisabled = true;
    const formValue = {
      id: this.fbCatalogue.id,
      shipping: {
        ...FormHelper.getNonEmptyAndChangedValues(
          omit(this.fbCatalogueForm.get('shipping').value, 'active'),
          omit(this.fbCatalogueInitValues.shipping, 'active'),
        ),
        ...(this.fbCatalogueForm.get(['shipping', 'active']).value === this.fbCatalogueInitValues.shipping.active
          ? {}
          : { active: this.fbCatalogueForm.get(['shipping', 'active']).value }),
      },
    };
    this.updateFBCatalogSync(formValue);
  }

  updateFBCatalogSync(input: any) {
    this.integrationAppsService
      .updateFBCatalogSync(input)
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
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  onShipChange(event: any) {
    this.fbCatalogueForm.get(['shipping', 'active']).patchValue(event);
  }

  onAttributeChange(event: any, field: string) {
    this.attributesForm.get('attributes').get(field).patchValue(event);
    const formValue = {
      id: this.fbCatalogue.id,
      attributes: {
        ...(this.attributesForm.get(['attributes', 'active']).value === this.initialValues?.active
          ? {}
          : { active: this.attributesForm.get(['attributes', 'active']).value }),
        ...(this.attributesForm.get(['attributes', 'color']).value === this.initialValues?.color
          ? {}
          : { color: this.attributesForm.get(['attributes', 'color']).value }),

        ...(this.attributesForm.get(['attributes', 'gender']).value === this.initialValues?.gender
          ? {}
          : { gender: this.attributesForm.get(['attributes', 'gender']).value }),

        ...(this.attributesForm.get(['attributes', 'size']).value === this.initialValues?.size
          ? {}
          : { size: this.attributesForm.get(['attributes', 'size']).value }),

        ...(this.attributesForm.get(['attributes', 'ageGroup']).value === this.initialValues?.ageGroup
          ? {}
          : { ageGroup: this.attributesForm.get(['attributes', 'ageGroup']).value }),

        ...(this.attributesForm.get(['attributes', 'material']).value === this.initialValues?.material
          ? {}
          : { material: this.attributesForm.get(['attributes', 'material']).value }),

        ...(this.attributesForm.get(['attributes', 'pattern']).value === this.initialValues?.pattern
          ? {}
          : { pattern: this.attributesForm.get(['attributes', 'pattern']).value }),
      },
    };
    this.updateFBCatalogSync(formValue);
  }

  findCountriesPagination() {
    this.posService.findCountriesPagination().subscribe((res) => {
      this.countries = res;
      this.changeDetectorRef.markForCheck();
    });
  }

  copyImpUrl() {
    this.clipboard.copy(this.impUrl);
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

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
