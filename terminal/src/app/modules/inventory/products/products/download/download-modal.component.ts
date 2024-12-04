import { MatDialogRef } from '@angular/material/dialog';
import { ConvertorHelper } from '@diktup/frontend/helpers';
import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';

import { ProductsService } from '../products.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'ecommerce-monorepo-download',
  templateUrl: './download-modal.component.html',
  styleUrls: ['./download-modal.component.scss'],
})
export class DownloadModalComponent implements OnInit {
  private fileInput = this.document.createElement('input');

  base64data: string;
  constructor(
    private productsService: ProductsService,
    private convertorHelper: ConvertorHelper,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private matDialogRef: MatDialogRef<DownloadModalComponent>,
  ) {
    this.fileInput.type = 'file';
    this.fileInput.name = 'file';
    this.fileInput.multiple = true;
    this.fileInput.style.display = 'none';
    this.fileInput.addEventListener('change', () => {
      if (this.fileInput.files.length) {
        this.productsService.uploadFiles(this.fileInput.files).then(() => {
          this.matDialogRef.close();
        });
      }
    });
  }

  ngOnInit() {}

  cancel() {
    this.matDialogRef.close();
  }

  downloadExcel() {
    if (isPlatformBrowser(this.platformId)) {
      this.productsService.getFullCatalogueByExcel().subscribe((res) => {
        if (res) {
          this.changeDetectorRef.markForCheck();
        }
        this.base64data = res.content;
        const blob = this.convertorHelper.b64toBlob(this.base64data, 'application/vnd.openxmlformats-officethis.document.spreadsheetml.sheet');
        const a = this.document.createElement('a');
        this.document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = String('propsal.xlsx');
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      });
    }
  }
  downloadTemplate() {
    if (isPlatformBrowser(this.platformId)) {
      this.productsService.getCatalogueTemplateByExcel().subscribe((res) => {
        if (res) {
          this.changeDetectorRef.markForCheck();
        }
        this.base64data = res.content;
        const blob = this.convertorHelper.b64toBlob(this.base64data, 'application/vnd.openxmlformats-officethis.document.spreadsheetml.sheet');
        const a = this.document.createElement('a');
        this.document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = String('propsal.xlsx');
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      });
    }
  }
}
