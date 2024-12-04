/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, ViewChildren, QueryList, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FolderModel, RecentModel } from './file-manager.model';
import { folderData } from './data';
import { RecentService } from './file-manger.service';
import { NgbdRecentSortableHeader } from './file-manager-sortable.directive';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss'],
  providers: [RecentService, DecimalPipe],
})

/**
 * FileManager Component
 */
export class FileManagerComponent implements OnInit {
  folderData!: FolderModel[];
  submitted = false;
  folderForm!: FormGroup;
  folderDatas: any;
  recentForm!: FormGroup;
  recentDatas: any;
  simpleDonutChart: any;
  public isCollapsed = false;
  deleteId: any;
  isBrowser: boolean;
  // Table data
  recentData!: Observable<RecentModel[]>;
  total: Observable<number>;
  @ViewChildren(NgbdRecentSortableHeader) headers!: QueryList<NgbdRecentSortableHeader>;

  constructor(
    private modalService: NgbModal,
    public service: RecentService,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.recentData = service.recents$;
    this.total = service.total$;
  }

  ngOnInit(): void {
    this.document.body.classList.add('file-detail-show');

    /**
     * Form Validation
     */
    this.folderForm = this.formBuilder.group({
      title: ['', [Validators.required]],
    });

    /**
     * Recent Validation
     */
    this.recentForm = this.formBuilder.group({
      ids: [''],
      icon_name: ['', [Validators.required]],
    });

    // Data Get Function
    this._fetchData();

    this._simpleDonutChart('["--vz-info", "--vz-danger", "--vz-primary", "--vz-success"]');
  }

  // Chart Colors Set
  private getChartColorsArray(colors: any) {
    colors = JSON.parse(colors);
    return colors.map((value: any) => {
      const newValue = value.replace(' ', '');
      if (newValue.indexOf(',') === -1) {
        let color = getComputedStyle(this.document.documentElement).getPropertyValue(newValue);
        if (color) {
          color = color.replace(' ', '');
          return color;
        } else {
          return newValue;
        }
      } else {
        const val = value.split(',');
        if (val.length === 2) {
          let rgbaColor = getComputedStyle(this.document.documentElement).getPropertyValue(val[0]);
          rgbaColor = 'rgba(' + rgbaColor + ',' + val[1] + ')';
          return rgbaColor;
        } else {
          return newValue;
        }
      }
    });
  }

  // Chat Data Fetch
  private _fetchData() {
    // Folder Data Fetch
    this.folderData = folderData;
    this.folderDatas = Object.assign([], this.folderData);

    // Recent Data Fetch
    this.recentData.subscribe((x) => {
      this.recentDatas = Object.assign([], x);
    });
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
    return this.folderForm.controls;
  }

  /**
   * Save user
   */
  saveFolder() {
    if (this.folderForm.valid) {
      const title = this.folderForm.get('title')?.value;
      const id = 5;
      const files = '349';
      const gb = '4.10';
      this.folderDatas.push({
        id,
        title,
        files,
        gb,
      });
      this.modalService.dismissAll();
    }
    setTimeout(() => {
      this.folderForm.reset();
    }, 2000);
    this.submitted = true;
  }

  /**
   * Confirmation mail model
   */
  confirm(content: any, id: any) {
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }

  // Delete Data
  deleteData(id: any) {
    this.document.getElementById('f-' + id)?.remove();
  }

  // Delete Recent Data
  deleteRecentData(id: any) {
    this.document.getElementById('r-' + id)?.remove();
  }

  // Folder Filter
  folderSearch() {
    const type = (this.document.getElementById('file-type') as HTMLInputElement).value;
    if (type) {
      this.folderDatas = this.folderData.filter((data: any) => {
        return data.title === type;
      });
    } else {
      this.folderDatas = this.folderData;
    }
  }

  /**
   * Active Star
   */
  activeMenu(id: any) {
    this.document.querySelector('.star-' + id)?.classList.toggle('active');
  }

  /**
   * Open Recent modal
   * @param content modal content
   */
  openRecentModal(recentContent: any) {
    this.submitted = false;
    this.modalService.open(recentContent, { size: 'md', centered: true });
  }

  /**
   * Form data get
   */
  get form1() {
    return this.recentForm.controls;
  }

  /**
   * Save user
   */
  saveRecent() {
    if (this.recentForm.valid) {
      if (this.recentForm.get('ids')?.value) {
        this.recentDatas = this.recentDatas.map((data: { id: any }) =>
          data.id === this.recentForm.get('ids')?.value ? { ...data, ...this.recentForm.value } : data,
        );
      } else {
        const id = 5;
        const icon = 'ri-file-text-fill';
        const iconColor = 'secondary';
        const iconName = this.recentForm.get('icon_name')?.value;
        const item = '01';
        const size = '0.3 KB';
        const type = 'Media';
        const date = '19 Apr, 2022';
        this.recentDatas.push({
          id,
          icon,
          icon_color: iconColor,
          icon_name: iconName,
          item,
          size,
          type,
          date,
        });
        this.modalService.dismissAll();
      }
    }
    this.modalService.dismissAll();
    setTimeout(() => {
      this.recentForm.reset();
    }, 2000);
    this.submitted = true;
  }

  /**
   * Open modal
   * @param content modal content
   */
  editModal(recentContent: any, id: any) {
    this.submitted = false;
    this.modalService.open(recentContent, { size: 'md', centered: true });
    const listData = this.recentDatas.filter((data: { id: any }) => data.id === id);
    this.recentForm.controls.icon_name.setValue(listData[0].icon_name);
    this.recentForm.controls.ids.setValue(listData[0].id);
  }

  // OverView Chart
  /**
   * Simple Donut Chart
   */
  private _simpleDonutChart(colors: any) {
    colors = this.getChartColorsArray(colors);
    this.translate.get('MENUITEMS.TS.DOCUMENTS').subscribe((ducuments: string) => {
      this.translate.get('MENUITEMS.TS.MEDIA').subscribe((media: string) => {
        this.translate.get('MENUITEMS.TS.OTHERS').subscribe((others: string) => {
          this.translate.get('MENUITEMS.TS.FREE_SPACE').subscribe((freeSpace: string) => {
            this.simpleDonutChart = {
              series: [27.01, 20.87, 33.54, 37.58],
              chart: {
                height: 330,
                type: 'donut',
              },
              legend: {
                position: 'bottom',
              },
              labels: [ducuments, media, others, freeSpace],
              dataLabels: {
                dropShadow: {
                  enabled: false,
                },
              },
              colors,
            };
          });
        });
      });
    });
  }

  /**
   * Open modal
   * @param content modal content
   */
  editdata(id: any) {
    (this.document.getElementById('file-overview') as HTMLElement).style.display = 'block';
    (this.document.getElementById('folder-overview') as HTMLElement).style.display = 'none';
    const data = this.recentDatas.filter((datain: { id: any }) => datain.id === id);
    (this.document.querySelector('#file-overview .file-icon i') as HTMLImageElement).className = data[0].icon + ' ' + 'text-' + data[0].icon_color;
    const fileName: any = this.document.querySelectorAll('#file-overview .file-name');
    fileName.forEach((name: any) => {
      name.innerHTML = data[0].icon_name;
    });
    const fileSize: any = this.document.querySelectorAll('#file-overview .file-size');
    fileSize.forEach((name: any) => {
      name.innerHTML = data[0].size;
    });
    const createDate: any = this.document.querySelectorAll('#file-overview .create-date');
    createDate.forEach((name: any) => {
      name.innerHTML = data[0].date;
    });
    (this.document.querySelector('#file-overview .file-type') as HTMLImageElement).innerHTML = data[0].type;
  }

  // Overview Model Close
  closeModel() {
    this.document.body.classList.remove('file-detail-show');
  }

  /**
   * Product Filtering
   */
  changeProducts(e: any, name: any) {

    (this.document.getElementById('folder-list') as HTMLElement).style.display = 'none';
    this.recentData.subscribe((x) => {
      this.recentDatas = x.filter((product: any) => {
        return product.type === name;
      });
    });
  }
}
