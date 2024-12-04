import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Observable, Subject, catchError, of, takeUntil, throwError } from 'rxjs';
import { cloneDeep, find, orderBy, map, merge, isEqual, findIndex, pick, forEach, omit } from 'lodash';

import { ZoneTypesEnum, DeliveryZonesType, ZoneTypesCategoryEnum } from '@sifca-monorepo/terminal-generator';
import { REGEX } from '@diktup/frontend/config';
import { GetBrandColorsGQL } from '@sifca-monorepo/terminal-generator';

import { EcommerceService } from '../ecommerce.service';
import { SharedService } from '../../../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'edit-zones',
  templateUrl: './edit-zones.component.html',
  styleUrls: ['./edit-zones.component.scss'],
})
export class EditZonesComponent implements OnInit {
  @Input() pos: any;
  private unsubscribeAll: Subject<any> = new Subject<any>();

  center: any;
  colors: any;
  zoneToEdit: any;
  selectedColor: any;
  zoneForm: FormGroup;
  deliveryZones: DeliveryZonesType[];
  buttonDisabled = true;
  currentCurrency: string;
  zone: DeliveryZonesType;
  selectedCategory = ZoneTypesCategoryEnum?.TARIF;
  selectedDeliveryZone: DeliveryZonesType;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  deliveryZones$: Observable<DeliveryZonesType[]> = this.ecommerceService.deliveryZones$;
  initValues: any;

  get currentColor(): string {
    const color = find(this.colors, { key: this.zoneForm.value.color }) as any;
    return color ? color.value : '#7c7c7c';
  }

  getColor(value): string {
    const color = find(this.colors, { value });
    return color ? color.value : '';
  }

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private getBrandColors: GetBrandColorsGQL,
    private ecommerceService: EcommerceService,
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.getBrandColors.fetch().subscribe(({ data, errors }) => {
      if (data) {
        this.colors = data.getBrandColors;
        this.changeDetectorRef.markForCheck();
      }
      if (errors) {
        throwError(() => new Error(errors[0].message));
      }
    });
    this.ecommerceService.findDeliveryZonesByTarget().subscribe();
    this.ecommerceService.deliveryZones$.pipe(takeUntil(this.unsubscribeAll)).subscribe((deliveryZones) => {
      if (deliveryZones) {
        this.deliveryZones = orderBy(deliveryZones, 'order');
        this.selectedCategory = this.deliveryZones[0]?.category;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  ngOnInit() {
    this.currentCurrency = this.pos.currency;
    this.center =
      this.pos?.locations?.length > 0
        ? {
            lat: this.pos.locations[0].location.coordinates ? this.pos.locations[0].location.coordinates[1] : 0,
            lng: this.pos.locations[0].location.coordinates ? this.pos.locations[0].location.coordinates[0] : 0,
          }
        : { lat: 48.1976597, lng: 16.3507669 };
  }

  onChangeCategory(field: string) {
    const initialCategory = field === 'TARIF' ? ZoneTypesCategoryEnum?.ZONE : ZoneTypesCategoryEnum?.TARIF;
    this.translate.get('MENUITEMS.TS.ARE_YOU_SURE').subscribe((areYouSure: string) => {
      this.translate.get('MENUITEMS.TS.CATEGORIES_CHANGE').subscribe((categoriesChange: string) => {
        Swal.fire({
          title: areYouSure,
          text: categoriesChange + field,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: 'rgb(3, 142, 220)',
          cancelButtonColor: 'rgb(243, 78, 78)',
        }).then((result) => {
          if (result.isConfirmed) {
            let zones = cloneDeep(this.deliveryZones) as any;
            zones = [
              ...map(zones, (zone) => {
                return {
                  ...pick(zone, ['color', 'paths', 'extraFees', 'minPrice', 'id', 'type']),
                  ...(zone?.type === ZoneTypesEnum.POINT ? { radius: zone?.radius } : {}),
                  ...(this.selectedCategory === ZoneTypesCategoryEnum?.TARIF
                    ? { category: ZoneTypesCategoryEnum?.TARIF }
                    : { category: ZoneTypesCategoryEnum?.ZONE }),
                };
              }),
            ];
            forEach(zones, (zone) => {
              const input: any = {
                ...omit(zone, 'id'),
                ...(this.selectedCategory === ZoneTypesCategoryEnum?.TARIF
                  ? { category: ZoneTypesCategoryEnum?.TARIF }
                  : { category: ZoneTypesCategoryEnum?.ZONE }),
              };
              this.ecommerceService
                .updateDeliveryZone(zone?.id, input)
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
                    this.selectedCategory = field === 'TARIF' ? ZoneTypesCategoryEnum?.TARIF : ZoneTypesCategoryEnum?.ZONE;
                    this.modalService.dismissAll();
                    this.changeDetectorRef.markForCheck();
                  }
                });
            });
          } else if (result.isDismissed) {
            this.selectedCategory = initialCategory;
            this.changeDetectorRef.markForCheck();
          }
        });
      });
    });
  }

  onChangeZone(field: string) {
    if (field === ZoneTypesEnum.POLYGON) {
      this.zoneForm.get('radius').reset();
      this.changeDetectorRef.markForCheck();
    }
  }

  openDeliveryZoneModal(content: any, deliveryZone: DeliveryZonesType) {
    this.selectedDeliveryZone = deliveryZone;
    this.zoneForm = this.formBuilder.group({
      category: [this.selectedCategory, Validators.required],
      categoryType: [deliveryZone?.category || this.selectedCategory, Validators.required],
      color: [deliveryZone?.color || undefined, Validators.required],
      type: [deliveryZone?.type || ZoneTypesEnum?.POINT, Validators.required],
      paths: [deliveryZone?.paths || [this.center], Validators.required],
      radius: [deliveryZone?.radius || 2000, Validators.pattern(REGEX.ONLY_POSITIVE)],
      minPrice: [deliveryZone?.minPrice || 0, [Validators.required, Validators.pattern(REGEX.ONLY_POSITIVE)]],
      extraFees: [deliveryZone?.extraFees || 0, [Validators.required, Validators.pattern(REGEX.ONLY_POSITIVE)]],
    });
    this.zoneForm
      .get('type')
      .valueChanges.pipe(takeUntil(this.unsubscribeAll))
      .subscribe((newType: string): void => {
        this.zoneForm.get('paths').setValue(newType === ZoneTypesEnum?.POINT ? [this.center] : []);
      });
    this.initValues = this.zoneForm.value;
    this.zoneForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((newData: any) => {
      this.buttonDisabled = isEqual(this.initValues, newData);
    });
    this.modalService.open(content, { size: 'lg', centered: true });
  }

  selectColor() {
    this.selectedColor = find(this.colors, { key: this.zoneForm.value.color });
  }

  save() {
    const zoneForm = cloneDeep(this.zoneForm.value);
    let zones = cloneDeep(this.deliveryZones) as any;
    let zone;
    const index = findIndex(this.deliveryZones, (zone) => zone?.id === this.selectedDeliveryZone?.id);
    if (index > -1) {
      zones.splice(index, 1);
    }
    zone = {
      id: this.deliveryZones[index]?.id,
      color: zoneForm?.color,
      ...(zoneForm?.type === ZoneTypesEnum.POINT ? { radius: zoneForm?.radius } : {}),
      category: this.selectedCategory,
      type: zoneForm?.type,
      paths: map(zoneForm.paths, (path: any, index: number) => {
        return merge(path, { order: index + 1 });
      }),
      extraFees: zoneForm.extraFees.toString(),
      minPrice: zoneForm.minPrice.toString(),
    };
    if (this.selectedDeliveryZone) {
      this.ecommerceService
        .updateDeliveryZone(zone?.id, omit(zone, 'id') as any)
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
            this.modalService.dismissAll();
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      this.ecommerceService
        .createDeliveryZone(omit(zone, 'id') as any)
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
            this.modalService.dismissAll();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  resetZone() {
    if (this.zoneForm.get('type').value === ZoneTypesEnum?.POINT) {
      this.zoneForm.get('paths').patchValue(this.initValues?.paths || [this.center]);
      this.zoneForm.get('radius').patchValue(this.initValues?.radius || 2000);
    } else {
      this.zoneForm.get('paths').patchValue([]);
    }
  }

  addPointToPolygone(event: any): void {
    if (this.zoneForm.value.type === ZoneTypesEnum?.POLYGON) {
      const paths: Array<any> = cloneDeep(this.zoneForm.value.paths);
      paths.push(event.coords);
      this.zoneForm.get('paths').setValue(paths);
    }
  }

  polygonePointDragged(event: any, index: number): void {
    const paths: Array<any> = cloneDeep(this.zoneForm.value.paths);
    paths[index] = event.coords;
    this.zoneForm.get('paths').setValue(paths);
  }

  dropped(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.deliveryZones, event.previousIndex, event.currentIndex);
    this.ecommerceService
      .reorderDeliveryZones(this.deliveryZones[event.currentIndex].id, event.currentIndex + 1)
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
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  deleteZone(zone: any): void {
    this.ecommerceService
      .deleteDeliveryZone(zone.id)
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
