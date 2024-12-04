import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, ReplaySubject, Subject, of } from 'rxjs';
import { map, forEach, values, omit, cloneDeep, isEqual, reduce } from 'lodash';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, map as rxMap, switchMap, take, takeUntil } from 'rxjs/operators';
import { OnInit, Inject, Component, OnDestroy, PLATFORM_ID, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

import { InstallmentInput, PaymentMethodsEnum, UpdateOrderProductStatusForPosEnum } from '@sifca-monorepo/terminal-generator';
import {
  UserType,
  OrderStatus,
  PaymentType,
  OrderTypeEnum,
  InstallmentType,
  PaymentStatusEnum,
  MarketPlaceOrderDtoType,
  OrderShoppingCartProductType,
} from '@sifca-monorepo/terminal-generator';

import { IPagination } from '@diktup/frontend/models';
import { ConvertorHelper, FormHelper } from '@diktup/frontend/helpers';

import { OrdersService } from '../orders.service';
import { UserService } from '../../../../../core/services/user.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { REGEX } from '@diktup/frontend/config';
import { PosService } from '../../../../../core/services/pos.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-orders-list',
  styleUrls: [`./list.component.scss`],
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  private fileInputExcel = this.document.createElement('input');
  private filter: BehaviorSubject<any> = new BehaviorSubject(null);
  private amount: BehaviorSubject<number | null> = new BehaviorSubject(null);

  page = 0;
  param: string;
  resAmount = 0;
  tags: string[];
  isLoading = false;
  initialValues: any;
  filteredOrders = {};
  tagsEditMode = false;
  pageChanged: boolean;
  emailForm: FormGroup;
  filterForm: FormGroup;
  filteredTags: string[];
  pagination: IPagination;
  paginationRange: number[];
  isPayButtonDisabled = true;
  installmentForm: FormGroup;
  breadCrumbItems!: Array<{}>;
  isInstButtonDisabled = true;
  isEmailButtonDisabled = true;
  isFilterButtonDisabled = true;
  order: MarketPlaceOrderDtoType;
  orderStatus = values(OrderStatus);
  orders: MarketPlaceOrderDtoType[];
  orderTypes = values(OrderTypeEnum);
  payments = values(PaymentMethodsEnum);
  installmentsList: InstallmentInput[] = [];
  searchInputControl: FormControl = new FormControl();
  selectedOrder: MarketPlaceOrderDtoType | null = null;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  loadingOrders$: Observable<boolean> = this.ordersService.loadingOrders$;
  orders$: Observable<MarketPlaceOrderDtoType[]> = this.ordersService.orders$;
  paymentMethods$: Observable<PaymentType[]> = this.posService.paymentMethods$;
  toPay: number;
  loadingImport: boolean;

  get filter$(): Observable<any> {
    return this.filter.asObservable();
  }

  get installments() {
    return this.installmentForm.get('installments') as FormArray;
  }

  get amount$(): Observable<number> {
    return this.amount.asObservable();
  }

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private router: Router,
    private posService: PosService,
    private modalService: NgbModal,
    private translate: TranslateService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private ordersService: OrdersService,
    private activatedRoute: ActivatedRoute,
    private convertorHelper: ConvertorHelper,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.amount$.subscribe((amount: number) => {
      this.resAmount = amount;
    });
    this.ordersService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.ordersService.pageIndex || 0,
        size: this.ordersService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.ordersService.pageIndex || 0) * this.ordersService.pageLimit,
        endIndex: Math.min(((this.ordersService.pageIndex || 0) + 1) * this.ordersService.pageLimit - 1, pagination.length - 1),
      };
    });
    this.ordersService.orders$.pipe(takeUntil(this.unsubscribeAll)).subscribe((orders) => {
      this.orders = orders;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(rxMap((params) => params.get('id'))).subscribe((param) => {
      if (param) {
        this.param = param;
      }
    });
    this.filterForm = this.formBuilder.group({
      paymentMethod: [[]],
      orderType: [[]],
      orderStatus: [[]],
      paymentStatus: [[]],
      number: [],
      from: [],
      to: [],
      user: [[]],
    });
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.ordersService.searchString = searchValues.searchString;
          return this.ordersService.findTargetOrders();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });

    this.fileInputExcel.type = 'file';
    this.fileInputExcel.name = 'file';
    this.fileInputExcel.multiple = true;
    this.fileInputExcel.style.display = 'none';
    this.fileInputExcel.addEventListener('change', () => {
      if (this.fileInputExcel.files.length) {
        this.convertFile(this.fileInputExcel.files[0]).subscribe((base64) => {
          this.loadingImport = true;
          this.ordersService
            .importTargetOrdersByExcel(base64)
            .pipe(
              catchError(() => {
                this.loadingImport = false;
                this.modalService.dismissAll();
                this.modalError();
                this.changeDetectorRef.markForCheck();
                return of(null);
              }),
            )
            .subscribe((res) => {
              this.loadingImport = false;
              if (res) {
                this.modalService.dismissAll();
                this.position();
                this.changeDetectorRef.markForCheck();
              }
            });
        });
      }
    });
    this.sharedService.resetFilter$.pipe(takeUntil(this.unsubscribeAll)).subscribe((reset) => {
      if (reset) {
        this.reset();
      }
    });
  }

  reset() {
    this.filterForm.reset();
  }

  uploadExcel(): void {
    this.loadingImport = false;
    this.fileInputExcel.value = '';
    this.fileInputExcel.click();
  }

  convertFile(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    return result;
  }

  openImportModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
  }

  deleteInstall(i: number) {
    this.installments.removeAt(i);
    this.saveInstall();
  }

  saveInstallment() {
    this.isInstButtonDisabled = true;
    const input: any = [
      ...map(this.installmentForm.value?.installments, (ins) => {
        return {
          amount: ins?.amount.toString(),
          paymentMethod: ins?.paymentMethod,
          ...(ins?.deadline ? { deadline: ins?.deadline } : {}),
        };
      }),
    ];
    this.ordersService
      .updateMarketplaceOrderInstallments(input, this.selectedOrder.id)
      .pipe(
        catchError((error) => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res: any) => {
        if (res) {
          this.position();
          this.modalService.dismissAll();
          this.selectedOrder = res;
          this.isPayButtonDisabled = !this.selectedOrder.installments.map((ii) => ii.paymentStatus).includes(PaymentStatusEnum.OPEN);
        }
      });
  }

  saveInstall() {
    let totalInstallments = 0;
    forEach(this.installments.value, (inst) => {
      totalInstallments = totalInstallments + +inst.amount;
    });
    this.resAmount = +(this.toPay - totalInstallments).toFixed(3);
  }

  openEditInstallmentModal(content: any, order: MarketPlaceOrderDtoType) {
    let totalInstallments = 0;
    this.selectedOrder = order;
    this.toPay = +order?.shoppingCart?.price?.toPay?.afterReduction;
    forEach(order?.installments, (inst) => {
      totalInstallments = totalInstallments + +inst.amount;
    });
    this.resAmount = +(this.toPay - totalInstallments).toFixed(3);
    this.posService.findPaymentsPagination().subscribe();
    this.modalService.open(content, { centered: true, size: 'lg' });
    this.installmentForm = this.formBuilder.group({
      installments: this.formBuilder.array(
        order?.installments?.length
          ? map(order?.installments, (inst) => {
              return this.formBuilder.group({
                amount: [inst?.amount, [Validators.required, Validators.pattern(REGEX.ONLY_POSITIVE)]],
                paymentMethod: [inst?.paymentMethod?.id || undefined, Validators.required],
                paymentStatus: [PaymentStatusEnum.OPEN],
                deadline: [inst?.deadline || ''],
              });
            })
          : [
              this.formBuilder.group({
                amount: ['', [Validators.required, Validators.pattern(REGEX.ONLY_POSITIVE)]],
                paymentMethod: [undefined, Validators.required],
                paymentStatus: [PaymentStatusEnum.OPEN],
                deadline: [''],
              }),
            ],
      ),
    });
    const initialValues = this.installmentForm.value;
    this.installmentForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((ivalues) => {
      this.isInstButtonDisabled = isEqual(ivalues, initialValues);
    });
  }

  addInstallment() {
    const installForm = this.formBuilder.group({
      amount: ['', [Validators.required, Validators.pattern(REGEX.ONLY_POSITIVE)]],
      paymentMethod: [undefined, Validators.required],
      paymentStatus: [PaymentStatusEnum.OPEN],
      deadline: [''],
    });
    this.installments.push(installForm);
  }

  send() {
    this.isEmailButtonDisabled = true;
    this.ordersService
      .exportMarketPlaceOrdersWithFilterByMail(this.filteredOrders, this.emailForm.get('emails').value)
      .pipe(
        catchError((error) => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe(() => {
        this.modalService.dismissAll();
        this.position();
        this.changeDetectorRef.markForCheck();
      });
  }

  openEmailModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
    this.userService.user$.pipe(take(1)).subscribe((user: UserType) => {
      this.emailForm = this.formBuilder.group({
        emails: [[user?.email], Validators.required],
      });
      const initialValues = this.emailForm.value;
      this.emailForm.valueChanges.subscribe((ivalues) => {
        this.isEmailButtonDisabled = isEqual(ivalues, initialValues);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  exportDocument() {
    if (isPlatformBrowser(this.platformId)) {
      this.ordersService.exportMarketPlaceOrdersWithFilter(this.filteredOrders).subscribe((res) => {
        const blob = this.convertorHelper.b64toBlob(res.doc, 'xlsx');
        const a = this.document.createElement('a');
        this.document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = String('orders.xlsx');
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      });
    }
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

  saveFilter() {
    const input: any = {
      ...FormHelper.getNonEmptyValues(omit(this.filterForm.value, 'orderType', 'paymentMethod', 'orderStatus', 'paymentStatus', 'user')),
      ...(isEqual(
        (this.initialValues.orderType?.length ? cloneDeep(this.initialValues.orderType) : []).sort(),
        (this.filterForm.value?.orderType?.length ? cloneDeep(this.filterForm.value.orderType) : []).sort(),
      )
        ? {}
        : { orderType: this.filterForm.value.orderType }),

      ...(isEqual(
        (this.initialValues.paymentMethod?.length ? cloneDeep(this.initialValues.paymentMethod) : []).sort(),
        (this.filterForm.value?.paymentMethod?.length ? cloneDeep(this.filterForm.value.paymentMethod) : []).sort(),
      )
        ? {}
        : { paymentMethod: this.filterForm.value.paymentMethod }),

      ...(isEqual(
        (this.initialValues.orderStatus?.length ? cloneDeep(this.initialValues.orderStatus) : []).sort(),
        (this.filterForm.value?.orderStatus?.length ? cloneDeep(this.filterForm.value.orderStatus) : []).sort(),
      )
        ? {}
        : { orderStatus: this.filterForm.value.orderStatus }),

      ...(isEqual(
        (this.initialValues.paymentStatus?.length ? cloneDeep(this.initialValues.paymentStatus) : []).sort(),
        (this.filterForm.value?.paymentStatus?.length ? cloneDeep(this.filterForm.value.paymentStatus) : []).sort(),
      )
        ? {}
        : { paymentStatus: this.filterForm.value.paymentStatus }),

      ...(isEqual(
        (this.initialValues.user?.length ? cloneDeep(this.initialValues.user) : []).sort(),
        (this.filterForm.value?.user?.length ? cloneDeep(this.filterForm.value.user) : []).sort(),
      )
        ? {}
        : { user: this.filterForm.value.user }),
    };
    this.modalService.dismissAll();
    this.ordersService
      .findTargetOrders(input)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe(() => {
        this.filteredOrders = input;
      });
  }

  resetInstallDate(i: number) {
    this.installments.at(i).get('deadline').patchValue(undefined);
  }

  openFilterModal(content: any) {
    this.modalService.open(content, { centered: true });
    this.initialValues = this.filterForm.value;
    this.filterForm.valueChanges.subscribe((values) => {
      this.isFilterButtonDisabled = isEqual(this.initialValues, values);
    });
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.ordersService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.ordersService.findTargetOrders().subscribe();
    }
  }

  openOrderModal(content: any, order: MarketPlaceOrderDtoType) {
    this.selectedOrder = order;
    this.modalService.open(content, { centered: true });
  }

  downloadDocument(order: MarketPlaceOrderDtoType) {
    if (isPlatformBrowser(this.platformId)) {
      this.ordersService
        .getTargetOrderInvoice(order.id)
        .pipe(
          catchError(() => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            const blob = this.convertorHelper.b64toBlob(res?.content, 'application/pdf');
            const a = this.document.createElement('a');
            this.document.body.appendChild(a);
            const url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = String('order');
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  toggleDetails(orderId: string): void {
    if (this.selectedOrder && this.selectedOrder.id === orderId) {
      this.closeDetails();
      return;
    }
    this.ordersService.getOrderById(orderId).subscribe((order) => {
      this.selectedOrder = order;
      this.changeDetectorRef.markForCheck();
    });
  }

  closeDetails(): void {
    this.selectedOrder = null;
  }

  toggleTagsEditMode(): void {
    this.tagsEditMode = !this.tagsEditMode;
  }

  createOrder(): void {
    this.router.navigateByUrl('/sales/orders/add-order');
  }

  getDateString(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours();
    const minutes = date.getMinutes();
    const secconds = date.getSeconds();
    return `${year}${month}${day}${hour}${minutes}${secconds}`;
  }

  setReadyForPickup(orderId: string, barcodeId: string): void {
    this.ordersService.setProductReadyForPickup({ orderId, barcodeId }).subscribe((res: any) => {
      if (res) {
        this.selectedOrder = res;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  updateProductStatus(order: MarketPlaceOrderDtoType, product: OrderShoppingCartProductType, status: string): void {
    this.ordersService
      .updateProductStatus({
        orderId: order.id,
        barcodeId: product.barcode.id,
        status: UpdateOrderProductStatusForPosEnum[status],
      })
      .subscribe((res: any) => {
        if (res) {
          this.selectedOrder = res;
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  cancelProduct(orderId: string, barcodeId: string): void {
    this.ordersService
      .cancelProduct({ orderId, barcodeId })
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res: any) => {
        if (res) {
          this.selectedOrder = res;
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  openDeliveryModal(content: any, order: any) {
    this.selectedOrder = order;
    this.modalService.open(content, { centered: true });
  }

  openCancelList(content: any, order: any) {
    this.selectedOrder = order;
    this.modalService.open(content, { centered: true });
  }

  cancelProductList(): void {
    this.ordersService
      .cancelOrderByTarget(this.selectedOrder.id)
      .pipe(
        catchError((error) => {
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

  isCancelProducts(order: MarketPlaceOrderDtoType): boolean {
    if (order?.shoppingCart?.products?.length) {
      const productStatuses = map(order.shoppingCart.products, 'orderProductStatus');
      if (productStatuses.includes(OrderStatus.OPEN || OrderStatus.CONFIRMED)) {
        return false;
      }
    }
    return true;
  }

  isPaymentExist(order: MarketPlaceOrderDtoType): boolean {
    if (+order?.shoppingCart?.price?.gross?.afterReduction <= 0) {
      return false;
    }
    if (order?.installments?.length) {
      let exist = false;
      forEach(order.installments, (inst) => {
        if (inst.paymentStatus === PaymentStatusEnum.OPEN) {
          exist = true;
        }
      });
      return exist;
    }
    return false;
  }

  openPayInstallmentsModal(content: any, order: MarketPlaceOrderDtoType) {
    this.selectedOrder = order;
    this.modalService.open(content, { centered: true });
    this.isPayButtonDisabled = !this.selectedOrder.installments.map((i) => i.paymentStatus).includes(PaymentStatusEnum.OPEN);
  }

  payInstallment(i: number): void {
    this.isPayButtonDisabled = true;
    const installment: InstallmentType = this.selectedOrder.installments[i];
    this.ordersService
      .payInstallments({ orderId: this.selectedOrder.id, installmentId: installment._id })
      .pipe(
        catchError((error) => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res: any) => {
        if (res) {
          this.position();
          this.modalService.dismissAll();
          this.selectedOrder = res;
          this.isPayButtonDisabled = !this.selectedOrder.installments.map((ii) => ii.paymentStatus).includes(PaymentStatusEnum.OPEN);
        }
      });
  }

  payAll() {
    const indexes = reduce(
      this.selectedOrder.installments,
      (acc, curr, index) => {
        if (curr.paymentStatus === PaymentStatusEnum.OPEN) {
          acc.push(index);
        }
        return acc;
      },
      [],
    );
    forEach(indexes, (index: number) => {
      this.payInstallment(index);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.ordersService.pageIndex = 0;
    this.ordersService.searchString = '';
  }
}
