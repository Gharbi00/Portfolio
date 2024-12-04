import { Component, Inject, QueryList, ViewChildren } from '@angular/core';
import { DOCUMENT, DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

// Sweet Alert
import Swal from 'sweetalert2';

// Csv File Export
import { ngxCsv } from 'ngx-csv/ngx-csv';

// Date Format
import { DatePipe } from '@angular/common';

import { OrdersModel } from './rental-orders.model';
import { Orders } from './data';
import { OrdersService } from './rental-orders.service';
import { NgbdOrdersSortableHeader, SortEvent } from './orders-sortable.directive';

// Rest Api Service
import { restApiService } from '../../../../../core/services/rest-api.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-orders',
  templateUrl: './rental-orders.component.html',
  styleUrls: ['./rental-orders.component.scss'],
  providers: [OrdersService, DecimalPipe],
})

/**
 * Orders Component
 */
export class RentalOrdersComponent {
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  ordersForm!: FormGroup;
  submitted = false;
  CustomersData!: OrdersModel[];
  masterSelected!: boolean;
  checkedList: any;

  // Api Data
  content?: any;
  econtent?: any;
  orderes?: any;

  // Table data
  ordersList!: Observable<OrdersModel[]>;
  total: Observable<number>;
  @ViewChildren(NgbdOrdersSortableHeader) headers!: QueryList<NgbdOrdersSortableHeader>;

  constructor(
    private modalService: NgbModal,
    public service: OrdersService,
    private formBuilder: FormBuilder,
    private ApiService: restApiService,
    private datePipe: DatePipe,
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.ordersList = service.countries$;
    this.total = service.total$;
  }

  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.translate.get('MENUITEMS.TS.INVOICING').subscribe((invoicing: string) => {
      this.translate.get('MENUITEMS.TS.ORDERS').subscribe((orders: string) => {
        this.breadCrumbItems = [{ label: invoicing }, { label: orders, active: true }];
      });
    });

    /**
     * Form Validation
     */
    this.ordersForm = this.formBuilder.group({
      orderId: '#VZ2101',
      ids: [''],
      customer: ['', [Validators.required]],
      product: ['', [Validators.required]],
      orderDate: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      payment: ['', [Validators.required]],
      status: ['', [Validators.required]],
    });

    /**
     * fetches data
     */
    setTimeout(() => {
      this.ordersList.subscribe((x) => {
        this.content = this.orderes;
        this.orderes = Object.assign([], x);
      });
      this.document.getElementById('elmLoader')?.classList.add('d-none');
    }, 1200);
  }

  /**
   * change navigation
   */
  onNavChange(changeEvent: NgbNavChangeEvent) {
    if (changeEvent.nextId === 1) {
      this.service.status = '';
    }
    if (changeEvent.nextId === 2) {
      this.service.status = 'Delivered';
    }
    if (changeEvent.nextId === 3) {
      this.service.status = 'Pickups';
    }
    if (changeEvent.nextId === 4) {
      this.service.status = 'Returns';
    }
    if (changeEvent.nextId === 5) {
      this.service.status = 'Cancelled';
    }
  }

  /**
   * Delete Model Open
   */
  deleteId: any;
  confirm(content: any, id: any) {
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }

  /**
   * Multiple Delete
   */
  checkedValGet: any[] = [];
  deleteMultiple(content: any) {
    var checkboxes: any = this.document.getElementsByName('checkAll');
    var result;
    var checkedVal: any[] = [];
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        result = checkboxes[i].value;
        checkedVal.push(result);
      }
    }
    if (checkedVal.length > 0) {
      this.modalService.open(content, { centered: true });
    } else {
      this.translate.get('MENUITEMS.TS.PLEASE_SELECT_CHECKBOX').subscribe((selectCheckbox: string) => {
        Swal.fire({ text: selectCheckbox, confirmButtonColor: '#239eba' });
      });
    }
    this.checkedValGet = checkedVal;
  }

  // Delete Data
  deleteData(id: any) {
    if (id) {
      this.ApiService.deleteOrder(id).subscribe({
        next: (data) => {},
        error: (err) => {
          this.content = JSON.parse(err.error).message;
        },
      });
      this.document.getElementById('o_' + id)?.remove();
    } else {
      this.checkedValGet.forEach((item: any) => {
        this.document.getElementById('o_' + item)?.remove();
      });
    }
  }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.submitted = false;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  /**
   * Form data get
   */
  get form() {
    return this.ordersForm.controls;
  }

  /**
   * Open Edit modal
   * @param content modal content
   */
  editDataGet(id: any, content: any) {
    this.submitted = false;
    this.modalService.open(content, { size: 'md', centered: true });
    var modelTitle = this.document.querySelector('.modal-title') as HTMLAreaElement;
    modelTitle.innerHTML = 'Edit Order';
    var updateBtn = this.document.getElementById('add-btn') as HTMLAreaElement;
    updateBtn.innerHTML = 'Update';

    this.ApiService.getSingleOrderData(id).subscribe({
      next: (data) => {
        const users = JSON.parse(data);
        this.econtent = users.data;

        this.ordersForm.controls['customer'].setValue(this.econtent.customer);
        this.ordersForm.controls['product'].setValue(this.econtent.product);
        this.ordersForm.controls['orderDate'].setValue(this.econtent.orderDate);
        this.ordersForm.controls['amount'].setValue(this.econtent.amount);
        this.ordersForm.controls['payment'].setValue(this.econtent.payment);
        this.ordersForm.controls['status'].setValue(this.econtent.status);
        this.ordersForm.controls['ids'].setValue(this.econtent._id);
      },
      error: (err) => {
        this.content = JSON.parse(err.error).message;
      },
    });
  }

  /**
   * Save user
   */
  saveUser() {
    if (this.ordersForm.valid) {
      if (this.ordersForm.get('ids')?.value) {
        this.ApiService.patchOrderData(this.ordersForm.value).subscribe((data: any) => {
          this.orderes = this.content.map((order: { _id: any }) => (order._id === data.data.ids ? { ...order, ...data.data } : order));
          this.modalService.dismissAll();
        });
      } else {
        this.ApiService.postOrderData(this.ordersForm.value).subscribe((data: any) => {
          this.translate.get('MENUITEMS.TS.ORDER_INSERTED').subscribe((orderInserted: string) => {
            this.orderes.push(data.data);
            this.modalService.dismissAll();
            let timerInterval: any;

            Swal.fire({
              title: orderInserted,
              icon: 'success',
              timer: 2000,
              timerProgressBar: true,
              willClose: () => {
                clearInterval(timerInterval);
              },
            }).then((result) => {
              /* Read more about handling dismissals below */
              if (result.dismiss === Swal.DismissReason.timer) {
              }
            });
          });
        });
      }
    }
    setTimeout(() => {
      this.ordersForm.reset();
    }, 2000);
    this.submitted = true;
  }

  // The master checkbox will check/ uncheck all items
  checkUncheckAll(ev: any) {
    this.orderes.forEach((x: { state: any }) => (x.state = ev.target.checked));
  }

  // Get List of Checked Items
  getCheckedItemList() {
    this.checkedList = [];
    for (var i = 0; i < this.CustomersData.length; i++) {
      if (this.CustomersData[i].isSelected) this.checkedList.push(this.CustomersData[i]);
    }
    this.checkedList = JSON.stringify(this.checkedList);
  }

  // Csv File Export
  csvFileExport() {
    var orders = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: true,
      title: 'Order Data',
      useBom: true,
      noDownload: false,
      headers: ['id', 'order Id', 'customer', 'product', 'orderDate', 'amount', 'payment', 'status'],
    };
    new ngxCsv(this.content, 'orders', orders);
  }
}
