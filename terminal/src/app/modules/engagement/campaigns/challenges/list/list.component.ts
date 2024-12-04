import Swal from 'sweetalert2';
import { isArray, isDate, isEqual, isObject, keys, omit, transform, values } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap, take, takeUntil } from 'rxjs';
import { ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';
import { TranslateService } from '@ngx-translate/core';
import { ChallengeStatusEnum, ChallengeType, DeleteFileFromAwsGQL, GenerateS3SignedUrlGQL } from '@sifca-monorepo/terminal-generator';
import { AmazonS3Helper, StorageHelper } from '@diktup/frontend/helpers';

import { ChallengesService } from '../challenges.service';
import { AudiencesService } from '../../../audience/audience.service';
import { AWS_CREDENTIALS } from '../../../../../../environments/environment';
import { SharedService } from '../../../../../shared/services/shared.service';

@Component({
  selector: 'challenges-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChallengeListComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  initValues: any;
  pageChanged: any;
  initialValues: any;
  selectedType: string;
  filterForm: FormGroup;
  isButtonDisabled = true;
  pagination: IPagination;
  challengeForm: FormGroup;
  breadCrumbItems!: Array<any>;
  isFilterButtonDisabled = true;
  status = values(ChallengeStatusEnum);
  selectedChallenge: ChallengeType;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  challenges$: Observable<ChallengeType[]> = this.challengesService.challenges$;
  loadingChallenges$: Observable<boolean> = this.challengesService.loadingChallenges$;

  get pictures(): FormArray {
    return this.challengeForm?.get(['media', 'pictures']) as FormArray;
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
    private audiencesService: AudiencesService,
    private changeDetectorRef: ChangeDetectorRef,
    private challengesService: ChallengesService,
    private deleteFileFromAwsGQL: DeleteFileFromAwsGQL,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
  ) {
    this.challengesService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.challengesService.pageIndex || 0,
        size: this.challengesService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.challengesService.pageIndex || 0) * this.challengesService.pageLimit,
        endIndex: Math.min(((this.challengesService.pageIndex || 0) + 1) * this.challengesService.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.challengesService.challengeSearchString = searchValues.searchString;
          return this.challengesService.getChallengesByTargetWithDonationProgressPaginated();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.ENGAGEMENT').subscribe((engagement: string) => {
      this.translate.get('MENUITEMS.TS.CAMPAIGNS').subscribe((myWallet: string) => {
        this.breadCrumbItems = [{ label: engagement }, { label: myWallet, active: true }];
      });
    });
    this.filterForm = this.formBuilder.group({
      status: [],
      startDate: this.formBuilder.group({
        from: [''],
        to: [''],
      }),
      endDate: this.formBuilder.group({
        from: [''],
        to: [''],
      }),
    });
    this.initValues = this.filterForm.value;
    this.filterForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isFilterButtonDisabled = isEqual(this.initValues, values);
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

  resetDate(field1, field2) {
    this.filterForm.get([field1, field2]).patchValue('');
  }

  filter() {
    this.isFilterButtonDisabled = true;
    const input = {
      ...this.getChangedValues(this.filterForm.value, this.initValues),
    };
    this.challengesService
      .getChallengesByTargetWithDonationProgressPaginated(input)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe(() => {
        this.modalService.dismissAll();
        this.changeDetectorRef.markForCheck();
      });
  }

  openFilterModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  openDeleteModal(content: any, challenge: ChallengeType) {
    this.selectedChallenge = challenge;
    this.modalService.open(content, { centered: true });
  }

  deleteChallenge() {
    this.challengesService
      .deleteChallenge(this.selectedChallenge.id)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe(() => {
        this.pagination.length--;
        this.pagination.endIndex--;
        this.position();
        this.modalService.dismissAll();
      });
  }

  openChallengeModal(targetModal: any, challenge: ChallengeType) {
    this.selectedChallenge = challenge;
    this.selectedType = isArray(challenge?.activities) ? 'activities' : 'donation';
    this.challengesService.infinitBarcodes$.pipe(take(1)).subscribe((barcodes) => {
      if (!barcodes?.length) {
        this.challengesService.barcodePageIndex = 0;
        this.challengesService.getBarcodesWithVarietyAndStructureWithFilter().subscribe();
      }
    });
    this.audiencesService.infiniteAudiences$.pipe(take(1)).subscribe((audiences) => {
      if (!audiences?.length) {
        this.audiencesService.pageIndex = 0;
        this.audiencesService.getAudiencesByTargetPaginated().subscribe();
      }
    });
    this.modalService.open(targetModal, {
      centered: true,
      backdrop: 'static',
    });
    this.challengeForm = this.formBuilder.group({
      title: [challenge?.title || ''],
      description: [challenge?.description || ''],
      media: this.formBuilder.group({
        pictures: this.formBuilder.array([
          this.formBuilder.group({
            baseUrl: [challenge?.media?.pictures?.length ? challenge?.media?.pictures[0]?.baseUrl : ''],
            path: [challenge?.media?.pictures?.length ? challenge?.media?.pictures[0]?.path : ''],
          }),
        ]),
      }),
      leaderboard: this.formBuilder.group({
        blur: [challenge?.leaderboard?.blur || false],
      }),
    });
    this.initialValues = this.challengeForm.value;
    this.challengeForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isButtonDisabled = isEqual(this.initialValues, values);
    });
  }

  public getChangedValues(formValue: any, controlValue: any): any {
    return transform(
      formValue,
      (result: any, value: any, key: string) => {
        if (isObject(value) && !isArray(value) && !isDate(value)) {
          const changes = this.getChangedValues(value, controlValue[key]);
          if (keys(changes).length > 0) {
            result[key] = changes;
          }
          return;
        }
        if ((value !== '0.000' || isArray(value) || isDate(value)) && !isEqual((controlValue || {})[key], value)) {
          result[key] = value;
          return;
        }
      },
      {},
    );
  }

  save() {
    let field = this.selectedChallenge ? 'updateChallenge' : 'createChallenge';
    let input: any;
    this.isButtonDisabled = true;
    input = {
      ...(this.selectedType === 'activities' ? { activities: [], donation: null } : {}),
      ...(field === 'createChallenge' && this.initialValues.leaderboard.blur !== this.challengeForm.value.leaderboard.blur
        ? { leaderboard: { blur: this.challengeForm.value.leaderboard.blur } }
        : { leaderboard: { blur: false } }),
      ...this.getChangedValues(omit(this.challengeForm.value, 'activities', 'leaderboard'), omit(this.initialValues, 'activities', 'leaderboard')),
    };
    const args = this.selectedChallenge ? [this.selectedChallenge.id, input] : [input];
    this.updateOrCreateChallenge(args, field);
  }

  removePicture() {
    const fileName = this.pictures.at(0).value.path;
    this.deleteFileFromAwsGQL.fetch({ fileName }).subscribe(({ data }) => {
      if (data.deleteFileFromAws) {
        this.pictures.at(0).patchValue({
          path: '',
          baseUrl: '',
        });
        if (this.selectedChallenge) {
          this.updateOrCreateChallenge([this.selectedChallenge.id, { media: { pictures: [{ baseUrl: '', path: '' }] } }], 'updateChallenge');
        }
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  upload(): void {
    const fileInput = document.createElement('input');
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
          this.pictures.at(0).patchValue({
            path: picture.path,
            baseUrl: picture.baseUrl,
          });
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
  }

  updateOrCreateChallenge(args: any, field: string) {
    this.challengesService[field](...args)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          if (field === 'createChallenge') {
            this.pagination.length++;
            this.pagination.endIndex++;
          }
          this.modalService.dismissAll();
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.challengesService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.challengesService.getChallengesByTargetWithDonationProgressPaginated().subscribe();
    }
  }

  modalError() {
    this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((sthWentWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: sthWentWrong,
        icon: 'error',
        showCancelButton: false,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
      });
    });
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

  ngOnDestroy() {
    this.challengesService.challengeSearchString = '';
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
