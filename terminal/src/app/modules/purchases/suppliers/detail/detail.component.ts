import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, QueryList, ViewChildren } from '@angular/core';
import { Observable, Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { SupplierService } from '../suppliers.service';
import { NgbdProductsSortableHeader } from './detail-sortable.directive';
import { BarcodeType, CompanyType, InternalProductType } from '@sifca-monorepo/terminal-generator';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IPagination } from '@diktup/frontend/models';
import { ValidationHelper } from '@diktup/frontend/helpers';
import { SharedService } from '../../../../shared/services/shared.service';
import { isPlatformBrowser } from '@angular/common';
import subYears from 'date-fns/subYears';
import startOfToday from 'date-fns/startOfToday';
import endOfToday from 'date-fns/endOfToday';
import { SupplliersDashboardType } from '@sifca-monorepo/terminal-generator';
import { map } from 'lodash';
import subMonths from 'date-fns/subMonths';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-suppliers-details',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class SupplierDetailsComponent {
  @ViewChildren(NgbdProductsSortableHeader) headers!: QueryList<NgbdProductsSortableHeader>;
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  isBrowser: boolean;
  analyticsChart!: any;
  filteredDate: Date;
  pageChanged: boolean;
  supplier: CompanyType;
  selectedFilter: string;
  pagination: IPagination;
  suppliers: CompanyType[];
  total: Observable<number>;
  dateNow: Date = new Date();
  breadCrumbItems!: Array<{}>;
  products: InternalProductType[];
  suppliersStats: SupplliersDashboardType;
  validateBarcode = this.validationHelper.validateBarcode;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  barcodes$: Observable<BarcodeType[]> = this.supplierService.barcodes$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  loadingStats$: Observable<boolean> = this.supplierService.loadingStats$;
  loadingBarcodes$: Observable<boolean> = this.supplierService.loadingBarcodes$;

  filter = {
    from: subYears(startOfToday(), 2),
    to: endOfToday(),
  };

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private translate: TranslateService,
    private supplierService: SupplierService,
    private validationHelper: ValidationHelper,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.supplierService.supplier$.pipe(takeUntil(this.unsubscribeAll)).subscribe((supplier: CompanyType) => {
      this.supplier = supplier;
      this.changeDetectorRef.markForCheck();
    });
    this.supplierService?.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.supplierService.pageIndex || 0,
        size: this.supplierService.filterLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.supplierService.pageIndex || 0) * this.supplierService.filterLimit,
        endIndex: Math.min(((this.supplierService.pageIndex || 0) + 1) * this.supplierService.filterLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });

    this.supplierService.suppliersStats$.pipe(takeUntil(this.unsubscribeAll)).subscribe((suppliersStats) => {
      this.suppliersStats = suppliersStats;
      this.setrevenuevalue(suppliersStats);
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.supplierService.getSuppliersStats(this.filter).subscribe();
    this.translate.get('MENUITEMS.TS.INVOICING').subscribe((invoicing: string) => {
      this.translate.get('MENUITEMS.TS.SUPPLIER_DETAILS').subscribe((supplierDetails: string) => {
        this.breadCrumbItems = [{ label: invoicing }, { label: supplierDetails, active: true }];
      });
    });

    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.supplierService.searchString = searchValues.searchString;
          return this.supplierService.searchBarcodesByTargetAndSupplier(this.supplier.id);
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  monthFilter(field: string) {
    this.filteredDate =
      field === 'All'
        ? subYears(this.dateNow, 2)
        : field === '6M'
        ? subMonths(this.dateNow, 6)
        : field === '1M'
        ? subMonths(this.dateNow, 1)
        : field === '1Y'
        ? subYears(this.dateNow, 1)
        : null;
    const filter = {
      from: this.filteredDate,
      to: endOfToday(),
    };
    this.selectedFilter = field;
    this.supplierService.getSuppliersStats(filter).subscribe();
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.supplierService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.supplierService.searchBarcodesByTargetAndSupplier(this.supplier.id).subscribe();
    }
  }

  setrevenuevalue(apiData) {
    const colorsArray = ['--vz-success', '--vz-primary', '--vz-danger', '--vz-warning'];
    let colors = this.getChartColorsArray(colorsArray);
    this.translate.get('MENUITEMS.TS.ORDERS').subscribe((orders: string) => {
      this.translate.get('MENUITEMS.TS.EARNINGS').subscribe((earnings: string) => {
        this.translate.get('MENUITEMS.TS.REFUNDS').subscribe((refunds: string) => {
          this.analyticsChart = {
            series: [
              {
                name: orders,
                type: 'area',
                data: apiData?.chart?.orders,
              },
              {
                name: earnings,
                type: 'bar',
                data: apiData?.chart?.earnings,
              },
              {
                name: refunds,
                type: 'line',
                data: apiData?.chart?.refunds,
              },
            ],
            chart: {
              height: 370,
              type: 'line',
              toolbar: {
                show: false,
              },
            },
            stroke: {
              curve: 'straight',
              dashArray: [0, 0, 8],
              width: [2, 0, 2.2],
            },
            fill: {
              opacity: [0.1, 0.9, 1],
            },
            markers: {
              size: [0, 0, 0],
              strokeWidth: 2,
              hover: {
                size: 4,
              },
            },
            xaxis: {
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              axisTicks: {
                show: false,
              },
              axisBorder: {
                show: false,
              },
            },
            grid: {
              show: true,
              xaxis: {
                lines: {
                  show: true,
                },
              },
              yaxis: {
                lines: {
                  show: false,
                },
              },
              padding: {
                top: 0,
                right: -2,
                bottom: 15,
                left: 10,
              },
            },
            legend: {
              show: true,
              horizontalAlign: 'center',
              offsetX: 0,
              offsetY: -5,
              markers: {
                width: 9,
                height: 9,
                radius: 6,
              },
              itemMargin: {
                horizontal: 10,
                vertical: 0,
              },
            },
            plotOptions: {
              bar: {
                columnWidth: '30%',
                barHeight: '70%',
              },
            },
            colors: colors,
          };
        });
      });
    });
  }

  private getChartColorsArray(colors: any) {
    return map(colors, (value: any) => {
      var newValue = value.replace(' ', '');
      if (newValue.indexOf(',') === -1) {
        var color = getComputedStyle(document.documentElement).getPropertyValue(newValue);
        if (color) {
          color = color.replace(' ', '');
          return color;
        } else return newValue;
      } else {
        var val = value.split(',');
        if (val.length == 2) {
          var rgbaColor = getComputedStyle(document.documentElement).getPropertyValue(val[0]);
          rgbaColor = 'rgba(' + rgbaColor + ',' + val[1] + ')';
          return rgbaColor;
        } else {
          return newValue;
        }
      }
    });
  }
}
