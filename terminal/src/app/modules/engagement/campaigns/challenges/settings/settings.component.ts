import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subject, catchError, of, takeUntil } from 'rxjs';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { isArray, isDate, isEqual, isObject, keys, transform, values } from 'lodash';

import { AmazonS3Helper, StorageHelper } from '@diktup/frontend/helpers';
import { ChallengeStatusEnum, ChallengeType, DeleteFileFromAwsGQL, GenerateS3SignedUrlGQL, QuestCategoryEnum } from '@sifca-monorepo/terminal-generator';

import { ChallengesService } from '../challenges.service';
import { AWS_CREDENTIALS } from '../../../../../../environments/environment';

@Component({
  selector: 'sifca-monorepo-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  initialValues: any;
  challengeId: string;
  isButtonDisabled = true;
  challengeForm: FormGroup;
  challenge: ChallengeType;
  oldStatus: ChallengeStatusEnum;
  selectedStatus: ChallengeStatusEnum;
  status = values(ChallengeStatusEnum);
  categories = values(QuestCategoryEnum);
  currentStatus = [ChallengeStatusEnum.DRAFT];

  get pictures(): FormArray {
    return (this.challengeForm?.get('media') as FormGroup)?.get('pictures') as FormArray;
  }

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private storageHelper: StorageHelper,
    private amazonS3Helper: AmazonS3Helper,
    private challengeService: ChallengesService,
    private changeDetectorRef: ChangeDetectorRef,
    private deleteFileFromAwsGQL: DeleteFileFromAwsGQL,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
  ) {}

  ngOnInit() {
    this.challengeService.challenge$.pipe(takeUntil(this.unsubscribeAll)).subscribe((challenge) => {
      this.challenge = challenge;
      this.challengeId = challenge?.id;
      this.challengeForm = this.formBuilder.group({
        title: [challenge?.title || ''],
        audience: [challenge?.audience?.id || ''],
        description: [challenge?.description || ''],
        media: this.formBuilder.group({
          pictures: this.formBuilder.array([
            this.formBuilder.group({
              baseUrl: [challenge?.media?.pictures?.length ? challenge?.media?.pictures[0]?.baseUrl : ''],
              path: [challenge?.media?.pictures?.length ? challenge?.media?.pictures[0]?.path : ''],
            }),
          ]),
        }),
        status: [challenge?.status || ChallengeStatusEnum.DRAFT],
        startDate: [challenge?.startDate || ''],
        endDate: [challenge?.endDate || ''],
      });
      this.oldStatus = this.challenge.status;
      switch (this.challengeForm.get('status').value) {
        case ChallengeStatusEnum.DRAFT:
          this.currentStatus = [ChallengeStatusEnum.ONGOING];
          break;
        case ChallengeStatusEnum.ONGOING:
          this.currentStatus = [ChallengeStatusEnum.DRAFT, ChallengeStatusEnum.FINISHED];
          break;
        case ChallengeStatusEnum.DRAFT:
          this.currentStatus = [ChallengeStatusEnum.ONGOING, ChallengeStatusEnum.FINISHED];
          break;
        case ChallengeStatusEnum.FINISHED:
          this.currentStatus = [ChallengeStatusEnum.DRAFT];
          break;
        default:
          break;
      }
      this.initialValues = this.challengeForm.value;
      this.challengeForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
        this.isButtonDisabled = isEqual(this.initialValues, values);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  async save() {
    let input: any;
    input = {
      ...this.getChangedValues(this.challengeForm.value, this.initialValues),
    };
    this.isButtonDisabled = true;
    this.updateChallenge(input);
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

  resetDate(field: string) {
    this.challengeForm.get(field).reset();
  }

  getStatusDisplay(status?: ChallengeStatusEnum): void {
    this.selectedStatus = status;
    switch (this.challengeForm.get('status').value) {
      case ChallengeStatusEnum.DRAFT:
        this.currentStatus = [ChallengeStatusEnum.ONGOING];
        break;
      case ChallengeStatusEnum.ONGOING:
        this.currentStatus = [ChallengeStatusEnum.DRAFT, ChallengeStatusEnum.FINISHED];
        break;
      case ChallengeStatusEnum.DRAFT:
        this.currentStatus = [ChallengeStatusEnum.ONGOING, ChallengeStatusEnum.FINISHED];
        break;
      case ChallengeStatusEnum.FINISHED:
        this.currentStatus = [ChallengeStatusEnum.DRAFT];
        break;
      default:
        break;
    }
    if (this.oldStatus === ChallengeStatusEnum.ONGOING || this.oldStatus === ChallengeStatusEnum.FINISHED) {
      this.updateChallenge({ status });
    }
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
        const input: any = {
          pictures: [
            {
              path: picture.path,
              baseUrl: picture.baseUrl,
            },
          ],
        };
        this.pictures.at(0).patchValue({
          path: picture.path,
          baseUrl: picture.baseUrl,
        });
        this.updateChallenge({ media: input });
        this.changeDetectorRef.markForCheck();
      });
    };
    fileInput.click();
  }

  updateChallenge(input: any) {
    this.challengeService
      .updateChallenge(this.challenge?.id, input)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError('Something went wrong!');
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res: any) => {
        if (res) {
          this.modalService.dismissAll();
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  removePicture() {
    const fileName = this.pictures.at(0).value.path;
    this.deleteFileFromAwsGQL.fetch({ fileName }).subscribe(({ data }) => {
      if (data.deleteFileFromAws) {
        this.pictures.at(0).patchValue({
          path: null,
          baseUrl: null,
          width: 0,
          height: 0,
        });
        this.updateChallenge({media: { pictures: [{ baseUrl: '', path: '' }] } });
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  modalError(text: string) {
    Swal.fire({
      title: 'Oops...',
      text,
      icon: 'error',
      showCancelButton: false,
      confirmButtonColor: 'rgb(3, 142, 220)',
      cancelButtonColor: 'rgb(243, 78, 78)',
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
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
