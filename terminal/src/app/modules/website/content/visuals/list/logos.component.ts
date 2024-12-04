import { isEqual } from 'lodash-es';
import { Observable, Subject, catchError, takeUntil, throwError } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import { AmazonS3Helper } from '@diktup/frontend/helpers';
import { GenerateS3SignedUrlGQL, VisualsType } from '@sifca-monorepo/terminal-generator';
import { AWS_CREDENTIALS } from '../../../../../../environments/environment';

import { VisualsService } from '../visuals.service';
import Swal from 'sweetalert2';
import { SharedService } from '../../../../../shared/services/shared.service';
import { AltPicturesComponent } from '../../../../../shared/components/alt-pictures/alt-pictures.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'visuals-logos',
  templateUrl: './logos.component.html',
  styleUrls: ['./logos.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisualsLogosComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  initialValues: any;
  visuals: VisualsType;
  visualsForm: FormGroup;
  galleryFilter = 'logos';
  isButtonDisabled = true;
  loadingPictureLogo = false;
  loadingPictureWide = false;
  breadCrumbItems!: Array<{}>;
  loadingPictureSquare = false;
  loadingPictureFavicon = false;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  filterredImages: { img: string; title: string; auther: string; likes: string; comments: string; category: string }[] | undefined;

  get logo(): FormGroup {
    return this.visualsForm.get('logo') as FormGroup;
  }
  get wide(): FormGroup {
    return this.visualsForm.get('wide') as FormGroup;
  }
  get square(): FormGroup {
    return this.visualsForm.get('square') as FormGroup;
  }
  get favicon(): FormGroup {
    return this.visualsForm.get('favicon') as FormGroup;
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
    private translate: TranslateService,
    private sharedService: SharedService,
    private storageHelper: StorageHelper,
    private amazonS3Helper: AmazonS3Helper,
    private visualsService: VisualsService,
    private changeDetectorRef: ChangeDetectorRef,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.visualsService.visuals$.pipe(takeUntil(this.unsubscribeAll)).subscribe((visuals: VisualsType) => {
      this.visuals = visuals;
      this.visualsForm = this.formBuilder.group({
        logo: this.formBuilder.group({
          baseUrl: [this.visuals?.logo?.baseUrl || ''],
          path: [this.visuals?.logo?.path || ''],
          alt: [this.visuals?.logo?.alt || ''],
          width: [this.visuals?.logo?.width],
          height: [this.visuals?.logo?.height],
        }),
        wide: this.formBuilder.group({
          baseUrl: [this.visuals?.wide?.baseUrl || ''],
          path: [this.visuals?.wide?.path || ''],
          width: [this.visuals?.wide?.width],
          height: [this.visuals?.wide?.height],
          alt: [this.visuals?.wide?.alt || ''],
        }),
        square: this.formBuilder.group({
          baseUrl: [this.visuals?.square?.baseUrl || ''],
          path: [this.visuals?.square?.path || ''],
          width: [this.visuals?.square?.width],
          height: [this.visuals?.square?.height],
          alt: [this.visuals?.square?.alt || ''],
        }),
        favicon: this.formBuilder.group({
          size16: this.formBuilder.group({
            baseUrl: [visuals?.favicon?.size16?.baseUrl || ''],
            path: [visuals?.favicon?.size16?.path || ''],
          }),
          size32: this.formBuilder.group({
            baseUrl: [visuals?.favicon?.size32?.baseUrl || ''],
            path: [visuals?.favicon?.size32?.path || ''],
          }),
          size57: this.formBuilder.group({
            baseUrl: [visuals?.favicon?.size57?.baseUrl || ''],
            path: [visuals?.favicon?.size57?.path || ''],
          }),
          size60: this.formBuilder.group({
            baseUrl: [visuals?.favicon?.size60?.baseUrl || ''],
            path: [visuals?.favicon?.size60?.path || ''],
          }),
          size72: this.formBuilder.group({
            baseUrl: [visuals?.favicon?.size72?.baseUrl || ''],
            path: [visuals?.favicon?.size72?.path || ''],
          }),
          size76: this.formBuilder.group({
            baseUrl: [visuals?.favicon?.size76?.baseUrl || ''],
            path: [visuals?.favicon?.size76?.path || ''],
          }),
          size96: this.formBuilder.group({
            baseUrl: [visuals?.favicon?.size96?.baseUrl || ''],
            path: [visuals?.favicon?.size96?.path || ''],
          }),
          size114: this.formBuilder.group({
            baseUrl: [visuals?.favicon?.size114?.baseUrl || ''],
            path: [visuals?.favicon?.size114?.path || ''],
          }),
          size120: this.formBuilder.group({
            baseUrl: [visuals?.favicon?.size120?.baseUrl || ''],
            path: [visuals?.favicon?.size120?.path || ''],
          }),
          size144: this.formBuilder.group({
            baseUrl: [visuals?.favicon?.size144?.baseUrl || ''],
            path: [visuals?.favicon?.size144?.path || ''],
          }),
          size152: this.formBuilder.group({
            baseUrl: [visuals?.favicon?.size152?.baseUrl || ''],
            path: [visuals?.favicon?.size152?.path || ''],
          }),
          size180: this.formBuilder.group({
            baseUrl: [visuals?.favicon?.size180?.baseUrl || ''],
            path: [visuals?.favicon?.size180?.path || ''],
          }),
          size192: this.formBuilder.group({
            baseUrl: [visuals?.favicon?.size192?.baseUrl || ''],
            path: [visuals?.favicon?.size192?.path || ''],
          }),
        }),
      });
      this.initialValues = this.visualsForm.value;
      this.visualsForm.valueChanges.subscribe((values) => {
        this.isButtonDisabled = isEqual(this.initialValues, values);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.WEBSITE').subscribe((website: string) => {
      this.translate.get('MENUITEMS.TS.VISUALS').subscribe((visuals: string) => {
        this.breadCrumbItems = [{ label: website }, { label: visuals, active: true }];
      });
    });
  }

  openAltMoadal(image: string) {
    const modalRef = this.modalService.open(AltPicturesComponent, { backdrop: 'static' });
    modalRef.componentInstance.picture =
      image === 'square'
        ? this.visualsForm.get('square').value
        : image === 'logo'
        ? this.visualsForm.get('logo').value
        : this.visualsForm.get('wide').value;
    modalRef.result.then((result) => {
      if (result) {
        if (image === 'square') {
          this.visualsForm.get('square').patchValue(result.picture);
        }
        if (image === 'logo') {
          this.visualsForm.get('logo').patchValue(result.picture);
        }
        if (image === 'wide') {
          this.visualsForm.get('wide').patchValue(result.picture);
        }
        this.save();
      }
    });
  }

  removePictue(field: string) {
    this.visualsForm.get(field).patchValue({
      alt: '',
      baseUrl: '',
      path: '',
      width: null,
      height: null,
    });
    this.save();
  }

  onChangeTab(item: string) {
    if (item === 'logos') {
      this.galleryFilter = 'logos';
    } else {
      this.galleryFilter = 'favicons';
    }
  }

  getPictureForm(): FormGroup {
    return this.formBuilder.group({
      baseUrl: [''],
      path: [''],
    });
  }

  uploadFav(size: string): void {
    const fileInput = this.document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.name = 'fileUpload';
    fileInput.id = 'fileUpload';
    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      const posId = this.storageHelper.getData('posId');
      const timestamp = Date.now();
      const fileName = `${posId}_${timestamp}_${file.name}`;
      this.generateS3SignedUrlGQL
        .fetch({
          fileName,
          fileType: file.type,
        })
        .subscribe(async (res) => {
          const picture = await this.amazonS3Helper.uploadS3AwsWithSignature(
            res.data.generateS3SignedUrl.message,
            file,
            fileName,
            AWS_CREDENTIALS.storage,
            AWS_CREDENTIALS.region,
          );
          ((this.visualsForm.get('favicon') as FormGroup).get(size) as FormGroup).patchValue({
            path: picture.path,
            baseUrl: picture.baseUrl,
          });
          this.save();
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
  }

  upload(image: string): void {
    const fileInput = this.document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.name = 'fileUpload';
    fileInput.id = 'fileUpload';
    fileInput.onchange = async () => {
      this.loadingPictureSquare = image === 'square' ? true : false;
      this.loadingPictureWide = image === 'wide' ? true : false;
      this.loadingPictureLogo = image === 'logo' ? true : false;
      const file = fileInput.files[0];
      const posId = this.storageHelper.getData('posId');
      const timestamp = Date.now();
      const fileName = `${posId}_${timestamp}_${file.name}`;
      this.generateS3SignedUrlGQL
        .fetch({
          fileName,
          fileType: file.type,
        })
        .subscribe(async (res) => {
          const picture = await this.amazonS3Helper.uploadS3AwsWithSignature(
            res.data.generateS3SignedUrl.message,
            file,
            fileName,
            AWS_CREDENTIALS.storage,
            AWS_CREDENTIALS.region,
          );
          if (image === 'square') {
            (this.visualsForm.get('square') as FormGroup).patchValue({
              path: picture.path,
              baseUrl: picture.baseUrl,
            });
          }
          if (image === 'logo') {
            this.visualsForm.patchValue({
              logo: {
                path: picture.path,
                baseUrl: picture.baseUrl,
              },
            });
          }
          if (image === 'wide') {
            this.visualsForm.patchValue({
              wide: {
                path: picture.path,
                baseUrl: picture.baseUrl,
              },
            });
          }
          this.save();
          this.loadingPictureSquare = false;
          this.loadingPictureWide = false;
          this.loadingPictureLogo = false;
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
  }

  save(): void {
    this.isButtonDisabled = true;
    const values = FormHelper.getNonEmptyAndChangedValues(this.visualsForm.value, this.initialValues);
    if (this.visuals) {
      this.visualsService
        .updateVisuals(this.visuals.id, values)
        .pipe(
          catchError((error) => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      this.visualsService
        .createVisuals(values)
        .pipe(
          catchError((error) => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.isButtonDisabled = true;
            this.position();
          }
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
    this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((sthWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: sthWrong,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
      });
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
