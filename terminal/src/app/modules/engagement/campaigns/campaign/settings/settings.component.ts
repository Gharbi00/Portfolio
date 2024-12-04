import Swal from 'sweetalert2';
import { isEqual, omit, values } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subject, catchError, firstValueFrom, of, takeUntil } from 'rxjs';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

import { DeleteFileFromAwsGQL, GenerateS3SignedUrlGQL, QuestWithProgressType } from '@sifca-monorepo/terminal-generator';
import { AmazonS3Helper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import { QuestCategoryEnum, QuestStatusEnum } from '@sifca-monorepo/terminal-generator';

import { CampaignsService } from '../campaigns.service';
import { PosService } from '../../../../../core/services/pos.service';
import { AWS_CREDENTIALS } from '../../../../../../environments/environment';

@Component({
  selector: 'sifca-monorepo-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  questId: string;
  initialValues: any;
  questForm: FormGroup;
  isButtonDisabled = true;
  oldStatus: QuestStatusEnum;
  quest: QuestWithProgressType;
  selectedStatus: QuestStatusEnum;
  status = values(QuestStatusEnum);
  categories = values(QuestCategoryEnum);
  currentStatus = [QuestStatusEnum.DRAFT];
  posId: string;

  get pictures(): FormArray {
    return (this.questForm?.get('media') as FormGroup)?.get('pictures') as FormArray;
  }

  constructor(
    private posService: PosService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private storageHelper: StorageHelper,
    private amazonS3Helper: AmazonS3Helper,
    private campaignService: CampaignsService,
    private changeDetectorRef: ChangeDetectorRef,
    private deleteFileFromAwsGQL: DeleteFileFromAwsGQL,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
  ) {}

  ngOnInit() {
    this.posService.pos$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pos) => {
      this.posId = pos?.id;
    });
    this.campaignService.quest$.pipe(takeUntil(this.unsubscribeAll)).subscribe((quest) => {
      this.quest = quest;
      this.questId = quest?.id;
      this.questForm = this.formBuilder.group({
        title: [quest?.title || ''],
        audience: [quest?.audience?.id || ''],
        description: [quest?.description || ''],
        media: this.formBuilder.group({
          pictures: this.formBuilder.array([
            this.formBuilder.group({
              baseUrl: [quest?.media?.pictures?.length ? quest?.media?.pictures[0]?.baseUrl : ''],
              path: [quest?.media?.pictures?.length ? quest?.media?.pictures[0]?.path : ''],
            }),
          ]),
        }),
        status: [quest?.status || QuestStatusEnum.DRAFT],
        category: [quest?.category || QuestCategoryEnum.FAMILY],
        dueDate: [quest?.dueDate || ''],
        startDate: [quest?.startDate || ''],
        sponsored: [quest?.sponsored === false ? false : true],
      });
      this.oldStatus = this.quest.status;
      const isPlatform = this.quest?.target?.pos?.id === this.storageHelper.getData('posId');
      switch (this.questForm.get('status').value) {
        case QuestStatusEnum.DRAFT:
          this.currentStatus = isPlatform ? [QuestStatusEnum.ONGOING, QuestStatusEnum.IN_REVIEW] : [QuestStatusEnum.IN_REVIEW];
          break;
        case QuestStatusEnum.IN_REVIEW:
          this.currentStatus = isPlatform ? [QuestStatusEnum.ONGOING, QuestStatusEnum.ON_HOLD, QuestStatusEnum.FINISHED] : [QuestStatusEnum.ON_HOLD, QuestStatusEnum.FINISHED];
          break;
        case QuestStatusEnum.ONGOING:
          this.currentStatus = [QuestStatusEnum.ON_HOLD, QuestStatusEnum.FINISHED, QuestStatusEnum.IN_REVIEW];
          break;
        case QuestStatusEnum.ON_HOLD:
          this.currentStatus = isPlatform
            ? [QuestStatusEnum.ONGOING, QuestStatusEnum.FINISHED, QuestStatusEnum.IN_REVIEW]
            : [QuestStatusEnum.FINISHED, QuestStatusEnum.IN_REVIEW];
          break;
        case QuestStatusEnum.FINISHED:
          this.currentStatus = [QuestStatusEnum.ON_HOLD];
          break;
        default:
          break;
      }
      this.initialValues = this.questForm.value;
      this.questForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
        this.isButtonDisabled = isEqual(this.initialValues, values);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  async save() {
    let input: any;
    if (this.questForm.get('status').value === QuestStatusEnum.ONGOING || this.questForm.get('status').value === QuestStatusEnum.FINISHED) {
      if (this.quest) {
        if (!this.quest?.remuneration?.length) {
          this.translate.get('MENUITEMS.TS.NO_REMUNERATION').subscribe((text) => {
            this.modalError(text);
            return;
          });
        }
        if (!this.quest?.budget?.maxAnswers || this.quest?.budget?.maxAnswers === 0) {
          this.translate.get('MENUITEMS.TS.NO_QUEST_BUDGET').subscribe((text) => {
            this.modalError(text);
          });
          return;
        }
        if (!this.questForm.value?.title) {
          this.translate.get('MENUITEMS.TS.NO_QUEST_TITLE').subscribe((text) => {
            this.modalError(text);
          });
          return;
        }
        if (!this.questForm.value?.description) {
          this.translate.get('MENUITEMS.TS.NO_QUEST_DESCRIPTION').subscribe((text) => {
            this.modalError(text);
          });
          return;
        }
        if (!this.questForm.value?.startDate) {
          this.translate.get('MENUITEMS.TS.NO_QUEST_START_DATE').subscribe((text) => {
            this.modalError(text);
          });
          return;
        }
        if (!this.questForm.value?.dueDate) {
          this.translate.get('MENUITEMS.TS.NO_QUEST_DUE_DATE').subscribe((text) => {
            this.modalError(text);
          });
          return;
        } else {
          this.currentStatus = [QuestStatusEnum.ON_HOLD, QuestStatusEnum.FINISHED];
          try {
            const res = await firstValueFrom(this.campaignService.getQuestActivitiesByQuestPaginated(this.quest?.id));
            if (res?.length > 0) {
              this.currentStatus = [QuestStatusEnum.ON_HOLD, QuestStatusEnum.FINISHED];
            } else {
              this.translate.get('MENUITEMS.TS.NO_QUEST_ACTIVITY').subscribe((text) => {
                this.modalError(text);
                this.questForm.get('status').patchValue(this.oldStatus);
              });
              switch (this.oldStatus) {
                case QuestStatusEnum.DRAFT:
                  this.currentStatus = [QuestStatusEnum.ONGOING];
                  break;
                case QuestStatusEnum.IN_REVIEW:
                  this.currentStatus = [QuestStatusEnum.DRAFT];
                  break;
                case QuestStatusEnum.ONGOING:
                  this.currentStatus = [QuestStatusEnum.ON_HOLD, QuestStatusEnum.FINISHED];
                  break;
                case QuestStatusEnum.ON_HOLD:
                  this.currentStatus = [QuestStatusEnum.ONGOING, QuestStatusEnum.FINISHED];
                  break;
                case QuestStatusEnum.FINISHED:
                  this.currentStatus = [QuestStatusEnum.ON_HOLD];
                  break;
                default:
                  break;
              }
              return;
            }
          } catch (error) {
            this.translate.get('MENUITEMS.TS.FAILED_TO_FIND_QUEST_ACTIVITIES').subscribe((text) => {
              this.modalError(text);
            });
            return;
          }
        }
      }
    }
    input = {
      ...FormHelper.getDifference(
        omit(this.initialValues, 'media', 'sponsored', 'leaderboard'),
        omit(this.questForm.value, 'media', 'sponsored', 'leaderboard'),
      ),
      ...(this.initialValues.sponsored === this.questForm.value?.sponsored ? {} : { sponsored: this.questForm.value?.sponsored }),
      ...(this.initialValues.leaderboard === this.questForm.value?.leaderboard ? {} : { leaderboard: this.questForm.value?.leaderboard }),
      ...(isEqual(this.initialValues.media, this.questForm.value?.media) ? {} : { media: this.questForm.value?.media }),
    };
    if (this.quest) {
      this.isButtonDisabled = true;
      this.campaignService
        .updateQuest(this.quest?.id, input)
        .pipe(
          catchError(() => {
            this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((text) => {
              this.modalError(text);
              this.changeDetectorRef.markForCheck();
            });
            return of(null);
          }),
        )
        .subscribe((res: any) => {
          if (res) {
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      this.campaignService
        .createQuest(input)
        .pipe(
          catchError(() => {
            this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((text) => {
              this.modalError(text);
              this.changeDetectorRef.markForCheck();
            });
            return of(null);
          }),
        )
        .subscribe((res: any) => {
          if (res) {
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  resetDate(field: string) {
    this.questForm.get(field).reset();
  }

  getStatusDisplay(status?: QuestStatusEnum): void {
    this.selectedStatus = status;
    switch (this.questForm.get('status').value) {
      case QuestStatusEnum.DRAFT:
        this.currentStatus = [QuestStatusEnum.ONGOING];
        break;
      case QuestStatusEnum.ONGOING:
        this.currentStatus = [QuestStatusEnum.ON_HOLD, QuestStatusEnum.FINISHED];
        break;
      case QuestStatusEnum.ON_HOLD:
        this.currentStatus = [QuestStatusEnum.ONGOING, QuestStatusEnum.FINISHED];
        break;
      case QuestStatusEnum.FINISHED:
        this.currentStatus = [QuestStatusEnum.ON_HOLD];
        break;
      default:
        break;
    }
    if (this.oldStatus === QuestStatusEnum.ONGOING || this.oldStatus === QuestStatusEnum.FINISHED) {
      this.updateQuest({ status });
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
          if (this.quest) {
            this.updateQuest({ media: input });
          }
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
  }

  updateQuest(input: any) {
    this.campaignService
      .updateQuest(this.quest?.id, input)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((text) => {
            this.modalError(text);
            this.changeDetectorRef.markForCheck();
          });
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
        const input: any = {
          pictures: null,
        };
        this.pictures.at(0).patchValue({
          path: null,
          baseUrl: null,
          width: 0,
          height: 0,
        });
        if (this.quest) {
          this.updateQuest({ media: input });
        }
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
