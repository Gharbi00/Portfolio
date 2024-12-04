import Swal from 'sweetalert2';
import { NgbModal, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, switchMap, take, takeUntil, throwError } from 'rxjs';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { InternalProductType, ProductClassEnum } from '@sifca-monorepo/terminal-generator';

import { IPagination } from '@diktup/frontend/models';
import { ProductGroupService } from '../product-group.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'reviews',
  styleUrls: ['./list.component.scss'],
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductGroupListComponent implements OnInit, AfterViewInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  pageChanged: boolean;
  pagination: IPagination;
  isButtonDisabled: boolean;
  breadCrumbItems!: Array<{}>;
  selectedNav = 'Top Products';
  selectedProduct: InternalProductType;
  productSearchInput$: Subject<string> = new Subject<string>();
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  navs = ['Top Products', 'New Arrivals', 'Best Sellers', 'Featured Products'];
  products$: Observable<InternalProductType[]> = this.productGroupService.products$;
  productGroup$: Observable<InternalProductType[]> = this.productGroupService.productGroup$;
  loadingProductGroup$: Observable<boolean> = this.productGroupService.loadingProductGroup$;

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private modalService: NgbModal,
    private translate: TranslateService,
    private sharedService: SharedService,
    private changeDetectorRef: ChangeDetectorRef,
    private productGroupService: ProductGroupService,
  ) {
    this.productGroupService.groupPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.productGroupService.groupPage || 0,
        size: this.productGroupService.groupLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.productGroupService.groupPage || 0) * this.productGroupService.groupLimit,
        endIndex: Math.min(((this.productGroupService.groupPage || 0) + 1) * this.productGroupService.groupLimit - 1, pagination.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.ECOMMERCE').subscribe((ecommerce: string) => {
      this.translate.get('MENUITEMS.TS.PRODUCTS').subscribe((products: string) => {
        this.breadCrumbItems = [{ label: ecommerce }, { label: products, active: true }];
      });
    });
    this.productSearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString) => {
          this.productGroupService.pageIndex = 0;
          return this.productGroupService.searchInternalProductByTarget(searchString);
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  ngAfterViewInit(): void {
    this.productGroupService.searchInternalProductByTarget('').subscribe();
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.productGroupService.groupPage = page - 1;
    if (this.pageChanged) {
      this.productGroupService.getInternalProductsByClass().subscribe();
    }
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

  openDeleteModal(content: any, product: InternalProductType) {
    this.selectedProduct = product;
    this.modalService.open(content, { centered: true });
  }

  deleteProduct() {
    this.productGroupService
      .deleteProductFromGroup({
        id: this.selectedProduct.id,
        classification: this.selectedProduct.classification.filter(
          (c) =>
            (this.selectedNav === 'Top Products' && c !== ProductClassEnum.TOP_PRODUCTS) ||
            (this.selectedNav === 'New Arrivals' && c !== ProductClassEnum.NEW_ARRIVALS) ||
            (this.selectedNav === 'Best Sellers' && c !== ProductClassEnum.BEST_SELLERS) ||
            (this.selectedNav === 'Featured Products' && c !== ProductClassEnum.FEATURED_PRODUCTS),
        ),
      })
      .pipe(
        catchError((error) => {
          this.modalError();
          this.selectedProduct = null;
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.translate.get('MENUITEMS.TS.PRODUCT_DELETED').subscribe((productDelted: string) => {
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: productDelted,
            showConfirmButton: false,
            timer: 1500,
          });
        });
        this.pagination.length--;
        this.pagination.endIndex--;
        this.selectedProduct = null;
        this.modalService.dismissAll();
        this.changeDetectorRef.markForCheck();
      });
  }

  loadMoreProducts() {
    this.productGroupService.isLastProduct$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.productGroupService.pageIndex++;
        this.productGroupService.searchInternalProductByTarget().subscribe();
      }
    });
  }

  addProductToGroup() {
    if (!this.selectedProduct) {
      return;
    }
    this.isButtonDisabled = true;
    this.productGroupService
      .addProductToGroup({
        id: this.selectedProduct.id,
        classification:
          this.selectedNav === 'Top Products'
            ? [...(this.selectedProduct.classification || []), ProductClassEnum.TOP_PRODUCTS]
            : this.selectedNav === 'New Arrivals'
            ? [...(this.selectedProduct.classification || []), ProductClassEnum.NEW_ARRIVALS]
            : this.selectedNav === 'Best Sellers'
            ? [...(this.selectedProduct.classification || []), ProductClassEnum.BEST_SELLERS]
            : [...(this.selectedProduct.classification || []), ProductClassEnum.FEATURED_PRODUCTS],
      })
      .pipe(
        catchError((error) => {
          this.modalError();
          this.selectedProduct = null;
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.selectedProduct = null;
        this.pagination.length++;
        this.pagination.endIndex++;
        this.modalService.dismissAll();
        this.changeDetectorRef.markForCheck();
      });
  }

  openProductModal(content: any) {
    this.selectedProduct = null;
    this.isButtonDisabled = false;
    this.modalService.open(content, { centered: true });
  }

  onNavChange(changeEvent: NgbNavChangeEvent) {
    this.selectedNav = changeEvent.nextId;
    this.productGroupService
      .getInternalProductsByClass([
        this.selectedNav === 'Top Products'
          ? ProductClassEnum.TOP_PRODUCTS
          : this.selectedNav === 'New Arrivals'
          ? ProductClassEnum.NEW_ARRIVALS
          : this.selectedNav === 'Best Sellers'
          ? ProductClassEnum.BEST_SELLERS
          : ProductClassEnum.FEATURED_PRODUCTS,
      ])
      .subscribe();
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.productGroupService.pageIndex = 0;
    this.productGroupService.pageIndex = 0;
  }
}
