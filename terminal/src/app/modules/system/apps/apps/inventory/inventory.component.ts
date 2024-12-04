import Swal from 'sweetalert2';
import { every, isEqual } from 'lodash';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, catchError, of, takeUntil, throwError } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { InventoryIntegrationType, PluginType } from '@sifca-monorepo/terminal-generator';
import { WebsiteIntegrationMulticurrencyCurrencyType } from '@sifca-monorepo/terminal-generator';

import { InventoryService } from './inventory.service';
import { IntegrationAppsService } from '../../apps.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { WebsiteIntegrationMultilanguageLanguageType } from '@diktup/models';
import { TranslateService } from '@ngx-translate/core';
import { FormHelper } from '@diktup/frontend/helpers';

@Component({
  selector: 'inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  importForm: FormGroup;
  isButtonDisabled = true;
  isActionButtonDisabled = true;
  inventory: InventoryIntegrationType;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  plugin$: Observable<PluginType> = this.integrationAppsService.plugin$;
  initValues: any;

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
    private sharedService: SharedService,
    private translate: TranslateService,
    private inventoryService: InventoryService,
    private changeDetectorRef: ChangeDetectorRef,
    private integrationAppsService: IntegrationAppsService,
  ) {
    this.integrationAppsService.findPluginByURL(this.location.path()).subscribe();
  }

  ngOnInit(): void {
    this.inventoryService.inventoryIntegration$.pipe(takeUntil(this.unsubscribeAll)).subscribe((inventory) => {
      this.inventory = inventory;
      this.importForm = this.formBuilder.group({
        import: this.formBuilder.group({
          attributesvalues: [inventory?.import?.attributesvalues],
          attributes: [inventory?.import?.attributes],
          brands: [inventory?.import?.brands],
          categories: [inventory?.import?.categories],
          products: [inventory?.import?.products],
          articles: [inventory?.import?.articles],
        }),
      });
      this.initValues = this.importForm.value;
      this.importForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((newData: any) => {
        this.isButtonDisabled = isEqual(this.initValues?.import, newData?.import);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  onChangeImport(enable: boolean) {
    this.updateInventory({ import: { enable } });
  }

  saveImport() {
    this.updateInventory({ import: FormHelper.getDifference(this.initValues.import, this.importForm.get('import').value) });
  }

  updateInventory(input: any) {
    this.isButtonDisabled = true;
    this.inventoryService
      .updateInventoryIntegration(this.inventory?.id, input)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => of(null));
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.modalService.dismissAll();
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  onCheckStatus(currencies: WebsiteIntegrationMulticurrencyCurrencyType[], languages: WebsiteIntegrationMultilanguageLanguageType[]) {
    if (currencies?.length) {
      return every(currencies, (currency) => currency?.default === false);
    } else {
      return every(languages, (language) => language?.default === false);
    }
  }

  onChangeStatus(checked: boolean, field: string) {
    const input: any = {
      ...(field === 'multicurrency'
        ? {
            multicurrency: {
              active: checked,
            },
          }
        : {
            multilanguage: {
              active: checked,
            },
          }),
    };
    this.updateInventory(input);
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
