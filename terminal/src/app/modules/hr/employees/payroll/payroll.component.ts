import { Component, Inject, QueryList, ViewChildren } from '@angular/core';
import { DOCUMENT, DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

// Sweet Alert
import Swal from 'sweetalert2';

// Date Format
import { DatePipe } from '@angular/common';

// Csv File Export
import { ngxCsv } from 'ngx-csv/ngx-csv';

import { customerModel } from './payroll.model';
import { Customers } from './data';
import { CustomersService } from './payroll.service';
import { NgbdAdvancedSortableHeader, SortEvent } from './payroll-sortable.directive';

// Rest Api Service
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-customers',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss'],
  providers: [CustomersService, DecimalPipe],
})

/**
 * Customers Component
 */
export class PayrollComponent {
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  submitted = false;
  customerForm!: FormGroup;
  CustomersData!: customerModel[];
  masterSelected!: boolean;
  checkedList: any;

  content?: any;
  customers?: any;

  // Table data
  customerList!: Observable<customerModel[]>;
  total: Observable<number>;
  @ViewChildren(NgbdAdvancedSortableHeader) headers!: QueryList<NgbdAdvancedSortableHeader>;

  constructor(
    private modalService: NgbModal,
    public service: CustomersService,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.customerList = service.customers$;
    this.total = service.total$;
  }

  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.translate.get('MENUITEMS.TS.HR').subscribe((hr: string) => {
      this.translate.get('MENUITEMS.TS.CUSTOMERS').subscribe((employees: string) => {
        this.breadCrumbItems = [{ label: hr }, { label: employees, active: true }];
      });
    });

    /**
     * Form Validation
     */
    this.customerForm = this.formBuilder.group({
      ids: [''],
      customer: ['', [Validators.required]],
      email: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      date: ['', [Validators.required]],
      status: ['', [Validators.required]],
    });

    /**
     * fetches data
     */
    setTimeout(() => {
      this.customerList.subscribe((x) => {
        this.content = this.customers;
        this.customers = Object.assign([], x);
      });
      this.document.getElementById('elmLoader')?.classList.add('d-none');
    }, 1200);
  }

  /**
   * Sort table data
   * @param param0 sort the column
   *
   */
  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.service.sortColumn = column;
    this.service.sortDirection = direction;
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
    return this.customerForm.controls;
  }

  /**
   * Save user
   */
  saveUser() {
    if (this.customerForm.valid) {
      // if (this.customerForm.get('ids')?.value) {
      //   this.ApiService.patchCustomerData(this.customerForm.value).subscribe((data: any) => {
      //     this.customers = this.content.map((order: { _id: any }) => (order._id === data.data.ids ? { ...order, ...data.data } : order));
      //     this.modalService.dismissAll();
      //   });
      // } else {
      //   this.translate.get('MENUITEMS.TS.CUSTOMER_INSTERTED').subscribe((customerInserted: string) => {
      //     this.ApiService.postCustomerData(this.customerForm.value).subscribe((data: any) => {
      //       this.customers.push(data.data);
      //       this.modalService.dismissAll();
      //       let timerInterval: any;

      //       Swal.fire({
      //         title: customerInserted,
      //         icon: 'success',
      //         timer: 2000,
      //         timerProgressBar: true,
      //         willClose: () => {
      //           clearInterval(timerInterval);
      //         },
      //       }).then((result) => {
      //         /* Read more about handling dismissals below */
      //         if (result.dismiss === Swal.DismissReason.timer) {
      //         }
      //       });
      //     });
      //   });
      // }
    }
    setTimeout(() => {
      this.customerForm.reset();
    }, 2000);
    this.submitted = true;
  }

  // The master checkbox will check/ uncheck all items
  checkUncheckAll(ev: any) {
    this.customers.forEach((x: { state: any }) => (x.state = ev.target.checked));
  }

  /**
   * Open Edit modal
   * @param content modal content
   */
  econtent?: any;
  editDataGet(id: any, content: any) {
    this.submitted = false;
    this.modalService.open(content, { size: 'md', centered: true });

    var modelTitle = this.document.querySelector('.modal-title') as HTMLAreaElement;
    modelTitle.innerHTML = 'Edit Customer';
    var updateBtn = this.document.getElementById('add-btn') as HTMLAreaElement;
    updateBtn.innerHTML = 'Update';

    // this.ApiService.getSingleCustomerData(id).subscribe({
    //   next: (data) => {
    //     const users = JSON.parse(data);
    //     this.econtent = users.data;
    //     this.customerForm.controls['customer'].setValue(this.econtent.customer);
    //     this.customerForm.controls['email'].setValue(this.econtent.email);
    //     this.customerForm.controls['phone'].setValue(this.econtent.phone);
    //     this.customerForm.controls['date'].setValue(this.econtent.date);
    //     this.customerForm.controls['status'].setValue(this.econtent.status);
    //     this.customerForm.controls['ids'].setValue(this.econtent._id);
    //   },
    //   error: (err) => {
    //     this.content = JSON.parse(err.error).message;
    //   },
    // });
  }

  /**
   * Confirmation mail model
   */
  deleteId: any;
  confirm(content: any, id: any) {
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }

  // Delete Data
  deleteData(id: any) {
    // if (id) {
    //   this.ApiService.deleteCustomer(id).subscribe({
    //     next: (data) => {},
    //     error: (err) => {
    //       this.content = JSON.parse(err.error).message;
    //     },
    //   });
    //   this.document.getElementById('c_' + id)?.remove();
    // } else {
    //   this.checkedValGet.forEach((item: any) => {
    //     this.document.getElementById('c_' + item)?.remove();
    //   });
    // }
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
      this.translate.get('MENUITEMS.TS.PLEASE_SELECT_CHECKBOX').subscribe((pleaseSelectCheckbox: string) => {
        Swal.fire({ text: pleaseSelectCheckbox, confirmButtonColor: '#239eba' });
      });
    }
    this.checkedValGet = checkedVal;
  }

  // Filtering
  SearchData() {
    var status = this.document.getElementById('idStatus') as HTMLInputElement;
    var date = this.document.getElementById('isDate') as HTMLInputElement;
    var dateVal = date.value ? this.datePipe.transform(new Date(date.value), 'yyyy-MM-dd') : '';
    if ((status.value != 'all' && status.value != '') || dateVal != '') {
      this.customers = this.content.filter((customer: any) => {
        return this.datePipe.transform(new Date(customer.date), 'yyyy-MM-dd') == dateVal || customer.status === status.value;
      });
    } else {
      this.customers = this.content;
    }
  }

  // Csv File Export
  csvFileExport() {
    var customer = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: true,
      title: 'Customer Data',
      useBom: true,
      noDownload: false,
      headers: ['id', 'customer Id', 'customer', 'email', 'phone', 'date', 'status'],
    };
    new ngxCsv(this.content, 'customers', customer);
  }
}
