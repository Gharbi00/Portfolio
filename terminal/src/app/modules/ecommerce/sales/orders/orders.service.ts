import { Injectable } from '@angular/core';
import { findIndex, forEach, slice } from 'lodash';
import { map, switchMap, take } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

import {
  MarketPlaceOrderDtoType,
  CalculateTargetShoppingCartInput,
  CalculateTargetShoppingCartGQL,
  CancelOrderByTargetGQL,
  GetOrderSettingsByTargetGQL,
  GetTargetOrderInvoiceGQL,
  ImportTargetOrdersByExcelGQL,
  PayMarketplaceOrderInstallmentsGQL,
  UpdateMarketplaceOrderInstallmentsGQL,
  SearchInternalProductGQL,
  SearchCorporateUsersByTargetGQL,
  FindTargetOrdersGQL,
  UpdateProductStatusGQL,
  CancelProductByTargetGQL,
  SetProductReadyForPickupGQL,
  CreateTargetOrderWithCartGQL,
  ExportMarketPlaceOrdersWithFilterGQL,
  ExportMarketPlaceOrdersWithFilterByMailGQL,
  MarketPlaceOrderStatusByPosInput,
  UserType,
  UserStatus,
  InstallmentUpdateInput,
  MarketPlaceOrderWithCartInput,
  OrderSettingsFullType,
  TargetShoppingCartType,
  DocumentResultType,
  MailResponseDto,
  InternalProductType,
  InstallmentPaymentInput,
  MarketPlaceOrderProductInput,
  InvoicePdfType,
  SuccessResponseDtoType,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';

import { BRAND_LOGO_URL, BRAND_NAME, BRAND_URL } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private users: BehaviorSubject<UserType[]> = new BehaviorSubject(null);
  private isLastUsers: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingUsers: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private isLastProduct: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingOrders: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private order: BehaviorSubject<MarketPlaceOrderDtoType> = new BehaviorSubject(null);
  private products: BehaviorSubject<InternalProductType[]> = new BehaviorSubject(null);
  private orders: BehaviorSubject<MarketPlaceOrderDtoType[]> = new BehaviorSubject(null);
  private orderSettings: BehaviorSubject<OrderSettingsFullType> = new BehaviorSubject(null);

  pageIndex = 0;
  pageLimit = 10;
  searchString = '';
  userPageIndex = 0;
  userPageLimit = 10;
  userSearchString = '';

  get order$(): Observable<MarketPlaceOrderDtoType> {
    return this.order.asObservable();
  }
  get loadingUsers$(): Observable<boolean> {
    return this.loadingUsers.asObservable();
  }
  get orders$(): Observable<MarketPlaceOrderDtoType[]> {
    return this.orders.asObservable();
  }

  get products$(): Observable<InternalProductType[]> {
    return this.products.asObservable();
  }

  get isLastProduct$(): Observable<boolean> {
    return this.isLastProduct.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get users$(): Observable<UserType[]> {
    return this.users.asObservable();
  }

  set users$(value: any) {
    this.users.next(value);
  }

  get isLastUsers$(): Observable<boolean> {
    return this.isLastUsers.asObservable();
  }

  get loadingOrders$(): Observable<boolean> {
    return this.loadingOrders.asObservable();
  }

  get orderSettings$(): Observable<OrderSettingsFullType> {
    return this.orderSettings.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private cancelOrderByTargetGQL: CancelOrderByTargetGQL,
    private findTargetOrdersGQL: FindTargetOrdersGQL,
    private updateProductStatusGQL: UpdateProductStatusGQL,
    private cancelProductByTargetGQL: CancelProductByTargetGQL,
    private getTargetOrderInvoiceGQL: GetTargetOrderInvoiceGQL,
    private searchInternalProductGQL: SearchInternalProductGQL,
    private getOrderSettingsByTargetGQL: GetOrderSettingsByTargetGQL,
    private setProductReadyForPickupGQL: SetProductReadyForPickupGQL,
    private createTargetOrderWithCartGQL: CreateTargetOrderWithCartGQL,
    private importTargetOrdersByExcelGQL: ImportTargetOrdersByExcelGQL,
    private calculateTargetShoppingCartGQL: CalculateTargetShoppingCartGQL,
    private searchCorporateUsersByTargetGQL: SearchCorporateUsersByTargetGQL,
    private payMarketplaceOrderInstallmentsGQL: PayMarketplaceOrderInstallmentsGQL,
    private exportMarketPlaceOrdersWithFilterGQL: ExportMarketPlaceOrdersWithFilterGQL,
    private updateMarketplaceOrderInstallmentsGQL: UpdateMarketplaceOrderInstallmentsGQL,
    private exportMarketPlaceOrdersWithFilterByMailGQL: ExportMarketPlaceOrdersWithFilterByMailGQL,
  ) {}

  getOrderSettings(): Observable<OrderSettingsFullType> {
    return this.getOrderSettingsByTargetGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        map((response: any) => {
          if (response.data) {
            this.orderSettings.next(response.data.getOrderSettingsByTarget);
            return response.data.getOrderSettingsByTarget;
          }
        }),
      );
  }

  importTargetOrdersByExcel(base64: string): Observable<SuccessResponseDtoType> {
    return this.importTargetOrdersByExcelGQL
      .mutate({
        base64,
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        map(({ data }: any) => {
          return data.importTargetOrdersByExcel;
        }),
      );
  }

  calculateTargetShoppingCart(input: CalculateTargetShoppingCartInput): Observable<TargetShoppingCartType> {
    return this.calculateTargetShoppingCartGQL.fetch({ input }).pipe(
      map(({ data }: any) => {
        if (data) {
          return data.calculateTargetShoppingCart;
        }
      }),
    );
  }

  searchUsers(): Observable<UserType[]> {
    this.loadingUsers.next(true);
    return this.searchCorporateUsersByTargetGQL
      .fetch({
        searchString: this.userSearchString,
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { page: this.userPageIndex, limit: this.userPageLimit },
        status: [UserStatus.AWAY, UserStatus.BUSY, UserStatus.OFFLINE, UserStatus.ONLINE],
      })
      .pipe(
        map((response: any) => {
          if (response.data) {
            this.loadingUsers.next(false);
            this.isLastUsers.next(response.data.searchCorporateUsersByTarget.isLast);
            this.users.next(
              this.userPageIndex === 0
                ? response.data.searchCorporateUsersByTarget.objects
                : [...this.users.value, ...response.data.searchCorporateUsersByTarget.objects],
            );
            return response.data.searchCorporateUsersByTarget.objects;
          }
        }),
      );
  }

  searchInternalProduct(searchString: string, page: number): Observable<InternalProductType[]> {
    return this.searchInternalProductGQL.fetch({ searchString, pagination: { page, limit: 10 } }).pipe(
      map((response: any) => {
        if (response.data) {
          this.products.next(
            page === 0 ? response.data.searchInternalProduct.objects : [...this.products.value, ...response.data.searchInternalProduct.objects],
          );
          this.isLastProduct.next(response.data.searchInternalProduct.isLast);
          return response.data.searchInternalProduct.objects;
        }
      }),
    );
  }

  findTargetOrders(filter = {}): Observable<MarketPlaceOrderDtoType[]> {
    this.loadingOrders.next(true);
    return this.findTargetOrdersGQL
      .fetch({
        input: { ...filter, target: { pos: this.storageHelper.getData('posId') } },
        pagination: { page: this.pageIndex, limit: this.pageLimit },
        searchString: this.searchString,
      })
      .pipe(
        map((response: any) => {
          this.loadingOrders.next(false);
          this.orders.next(response.data.findTargetOrders.objects);
          this.pagination.next({ page: this.pageIndex, size: this.pageLimit, length: response.data.findTargetOrders.count });
          return response.data.findTargetOrders.objects;
        }),
      );
  }

  getTargetOrderInvoice(orderId: string): Observable<InvoicePdfType> {
    return this.getTargetOrderInvoiceGQL.fetch({ orderId }).pipe(
      map((response: any) => {
        if (response.data) {
          return response.data.getTargetOrderInvoice;
        }
      }),
    );
  }

  getOrderById(id: string): Observable<MarketPlaceOrderDtoType> {
    return this.orders.pipe(
      take(1),
      map((orders) => {
        const order = orders.find((item) => item.id === id) || null;
        this.order.next(order);
        return order;
      }),
      switchMap((order) => {
        if (!order) {
          return throwError(() => new Error('Could not found order with id of ' + id + '!'));
        }
        return of(order);
      }),
    );
  }

  exportMarketPlaceOrdersWithFilterByMail(filter = {}, emails: string): Observable<MailResponseDto> {
    return this.exportMarketPlaceOrdersWithFilterByMailGQL
      .fetch({
        input: { ...filter, target: { pos: this.storageHelper.getData('posId') } },
        emails,
        subject: 'Votre export des commandes',
        brand: {
          name: BRAND_NAME,
          website: BRAND_URL,
          logo: BRAND_LOGO_URL,
        },
      })
      .pipe(map((response: any) => response.data.exportMarketPlaceOrdersWithFilterByMail));
  }

  exportMarketPlaceOrdersWithFilter(filter = {}): Observable<DocumentResultType> {
    return this.exportMarketPlaceOrdersWithFilterGQL
      .fetch({ input: { ...filter, target: { pos: this.storageHelper.getData('posId') } } })
      .pipe(map((response: any) => response.data.exportMarketPlaceOrdersWithFilter));
  }

  createTargetOrderWithCart(input: MarketPlaceOrderWithCartInput): Observable<MarketPlaceOrderDtoType> {
    return this.createTargetOrderWithCartGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      map((response: any) => {
        if (response.data) {
          this.order.next(response.data.createTargetOrderWithCart);
          return response.data.createTargetOrderWithCart;
        }
      }),
    );
  }

  updateProductStatus(input: MarketPlaceOrderStatusByPosInput): Observable<MarketPlaceOrderDtoType> {
    return this.updateProductStatusGQL.mutate({ subject: 'Order Updates', target: { pos: this.storageHelper.getData('posId') }, input }).pipe(
      map((response: any) => {
        if (response.data) {
          const orders = this.orders.value;
          const index = orders?.findIndex((a) => a.id === input.orderId);
          orders[index] = response.data.updateProductStatus;
          this.orders.next(orders);
          this.order.next(response.data.updateProductStatus);
          return response.data.updateProductStatus;
        }
      }),
    );
  }

  setProductReadyForPickup(input: MarketPlaceOrderProductInput): Observable<MarketPlaceOrderDtoType> {
    return this.setProductReadyForPickupGQL.mutate({ input }).pipe(
      map((response: any) => {
        if (response.data) {
          const orders = this.orders.value;
          const index = orders?.findIndex((a) => a.id === input.orderId);
          orders[index] = response.data.setProductReadyForPickup;
          this.orders.next(orders);
          this.order.next(response.data.setProductReadyForPickup);
          return response.data.setProductReadyForPickup;
        }
      }),
    );
  }

  cancelProduct(input: MarketPlaceOrderProductInput): Observable<MarketPlaceOrderDtoType> {
    return this.cancelProductByTargetGQL.mutate({ subject: 'Order Updates', target: { pos: this.storageHelper.getData('posId') }, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          const index = findIndex(this.orders.value, { id: input.orderId });
          this.orders.next([...slice(this.orders.value, 0, index), data.cancelProductByTarget, ...slice(this.orders.value, index + 1)]);
          this.order.next(data.cancelProductByTarget);
          return data.cancelProductByTarget;
        }
      }),
    );
  }

  cancelOrderByTarget(id: string): Observable<MarketPlaceOrderDtoType> {
    return this.cancelOrderByTargetGQL.mutate({ subject: 'Order Updates', target: { pos: this.storageHelper.getData('posId') }, id }).pipe(
      map(({ data }: any) => {
        if (data) {
          const index = findIndex(this.orders.value, { id });
          this.orders.next([...slice(this.orders.value, 0, index), data.cancelOrderByTarget, ...slice(this.orders.value, index + 1)]);
          this.order.next(data.cancelOrderByTarget);
          return data.cancelOrderByTarget;
        }
      }),
    );
  }

  cancelList(id: string): Observable<MarketPlaceOrderDtoType> {
    return this.orders.pipe(
      take(1),
      map((orders) => {
        const order = orders.find((item) => item.id === id) || null;
        this.order.next(order);
        return order;
      }),
      switchMap((order: any) => {
        if (!order) {
          return throwError(() => new Error('Could not found order with id of ' + id + '!'));
        }
        forEach(order.shoppingCart.products, (product) => {
          this.cancelProductByTargetGQL
            .mutate({
              subject: 'Order Updates',
              target: { pos: this.storageHelper.getData('posId') },
              input: { orderId: order.id, barcodeId: product.barcode.id },
            })
            .subscribe((res: any) => {
              if (res.data) {
                order = res.data.cancelProductByTarget;
                const index = findIndex(this.orders.value, { id: order.id });
                this.orders.next([...slice(this.orders.value, 0, index), res.data.cancelProductByTarget, ...slice(this.orders.value, index + 1)]);
              }
            });
        });
        return of(order);
      }),
    );
  }

  payInstallments(input: InstallmentPaymentInput): Observable<MarketPlaceOrderDtoType> {
    return this.payMarketplaceOrderInstallmentsGQL.mutate({ input }).pipe(
      map((response: any) => {
        if (response.data) {
          this.order.next(response.data.payMarketplaceOrderInstallments);
          const index = findIndex(this.orders.value, { id: input.orderId });
          const orders = this.orders.value;
          orders[index] = this.order.value;
          this.orders.next(orders);
          return response.data.payMarketplaceOrderInstallments;
        }
      }),
    );
  }

  updateMarketplaceOrderInstallments(input: InstallmentUpdateInput, orderId: string): Observable<MarketPlaceOrderDtoType> {
    return this.updateMarketplaceOrderInstallmentsGQL.mutate({ input, orderId }).pipe(
      map((response: any) => {
        if (response.data) {
          this.order.next(response.data.updateMarketplaceOrderInstallments);
          const index = findIndex(this.orders.value, { id: orderId });
          const orders = this.orders.value;
          orders[index] = this.order.value;
          this.orders.next(orders);
          return response.data.updateMarketplaceOrderInstallments;
        }
      }),
    );
  }
}
