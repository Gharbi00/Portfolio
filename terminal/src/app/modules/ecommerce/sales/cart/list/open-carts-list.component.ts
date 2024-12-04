import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OnInit, Component, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { debounceTime, distinctUntilChanged, map as rxMap, switchMap, takeUntil } from 'rxjs/operators';

import { MarketPlaceOrderDtoType, ShoppingCartsForTargetType } from '@sifca-monorepo/terminal-generator';

import { IPagination } from '@diktup/frontend/models';
import { OpenCartsService } from '../open-carts.service';
import { ValidationHelper } from '@diktup/frontend/helpers';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { sumBy } from 'lodash';
import { SharedService } from '../../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'open-carts-list',
  styleUrls: ['./open-carts-list.component.scss'],
  templateUrl: './open-carts-list.component.html',
})
export class OpenCartsListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  private filter: BehaviorSubject<any | null> = new BehaviorSubject(null);
  breadCrumbItems!: Array<{}>;

  page = 0;
  param: string;
  tags: string[];
  isLoading = false;
  pageChanged: boolean;
  tagsEditMode = false;
  filteredTags: string[];
  pagination: IPagination;
  paginationRange: number[];
  order: MarketPlaceOrderDtoType;
  cart: ShoppingCartsForTargetType;
  orders: MarketPlaceOrderDtoType[];
  carts: ShoppingCartsForTargetType[];
  orders$: Observable<MarketPlaceOrderDtoType[]>;
  selectedOrder: MarketPlaceOrderDtoType | null = null;
  selectedCart: ShoppingCartsForTargetType | null = null;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  loadingCarts$: Observable<boolean> = this.openCartsService.loadingCarts$;
  shoppingCarts$: Observable<ShoppingCartsForTargetType[]> = this.openCartsService.shoppingCarts$;
  validateBarcode = this.validationHelper.validateBarcode;

  searchForm: FormGroup = this.formBuilder.group({
    searchString: [''],
  });
  get filter$(): Observable<any> {
    return this.filter.asObservable();
  }

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private validationHelper: ValidationHelper,
    private openCartsService: OpenCartsService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
  ) {
    this.openCartsService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.openCartsService.pageIndex || 0,
        size: this.openCartsService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.openCartsService.pageIndex || 0) * this.openCartsService.pageLimit,
        endIndex: Math.min(((this.openCartsService.pageIndex || 0) + 1) * this.openCartsService.pageLimit - 1, pagination.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.isLoading = true;
          this.changeDetectorRef.markForCheck();
          this.openCartsService.searchString = searchValues.searchString;
          return this.openCartsService.findTargetShoppingCarts();
        }),
      )
      .subscribe(() => {
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.ECOMMERCE').subscribe((ecommerce: string) => {
      this.translate.get('MENUITEMS.TS.OPEN_CARTS').subscribe((openCarts: string) => {
        this.breadCrumbItems = [{ label: ecommerce }, { label: openCarts, active: true }];
      });
    });
    this.activatedRoute.paramMap.pipe(rxMap((params) => params.get('id'))).subscribe((param) => {
      if (param) {
        this.param = param;
      }
    });
  }

  productQuantity(cart: ShoppingCartsForTargetType) {
    return sumBy(cart.products, 'MENUITEMS.TS.QUANTITY');
  }

  openCartModal(content: any, cart: ShoppingCartsForTargetType) {
    this.selectedCart = cart;
    this.modalService.open(content, { centered: true });
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.openCartsService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.openCartsService.findTargetShoppingCarts().subscribe();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.openCartsService.searchString = '';
  }
}
