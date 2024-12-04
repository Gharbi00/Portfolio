import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, catchError, of, takeUntil } from 'rxjs';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { QuestWithProgressType } from '@sifca-monorepo/terminal-generator';
import { AudienceReachType, AudienceType } from '@sifca-monorepo/terminal-generator';

import { AudiencesService } from '../../../audience/audience.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { SelectAudienceModalComponent } from '../../../../../shared/components/select-audience-modal/select-audience-modal.component';
import { CampaignsService } from '../campaigns.service';

@Component({
  selector: 'sifca-monorepo-audience',
  templateUrl: './audience.component.html',
  styleUrls: ['./audience.component.scss'],
})
export class AudienceComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  percentage = 0;
  audience: AudienceType;
  quest: QuestWithProgressType;
  audienceReach: AudienceReachType;
  isLoadingQuest$: Observable<boolean> = this.campaignService.isLoadingQuest$;

  constructor(
    private modalService: NgbModal,
    private sharedService: SharedService,
    private campaignService: CampaignsService,
    private audiencesService: AudiencesService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
  ) {
    this.campaignService.quest$.pipe(takeUntil(this.unsubscribeAll)).subscribe((quest) => {
      if (quest) {
        this.quest = quest;
        this.audienceReach = quest?.audience?.reach;
        this.percentage = Number(((quest?.audience?.reach?.reach / quest.audience?.reach?.total) * 100).toFixed(1));
        this.changeDetectorRef.markForCheck();
        this.audience = this.quest?.audience;
      }
    });
  }

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  ngOnInit() {}

  openDeleteModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  deleteAudience() {
    this.campaignService
      .removeAudienceFromQuest(this.quest?.id)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  openSelectAudienceModal() {
    this.audiencesService.pageIndex = 0;
    this.audiencesService.infiniteAudiences$ = [];
    const modalRef = this.modalService.open(SelectAudienceModalComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
    });
    modalRef.componentInstance.questType = this.quest?.questType;
    modalRef.componentInstance.advertiser = this.quest?.advertiser;
    modalRef.result.then((result) => {
      if (result.id) {
        const input: any = { audience: result.id };
        this.audience = result;
        this.changeDetectorRef.markForCheck();
        this.campaignService
          .updateQuest(this.quest?.id, input)
          .pipe(
            catchError(() => {
              this.modalError();
              this.changeDetectorRef.markForCheck();
              return of(null);
            }),
          )
          .subscribe((res) => {
            if (res) {
              this.position();
              this.changeDetectorRef.markForCheck();
            }
          });
      }
    });
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

  ngOnDestroy(): void {
    this.audiencesService.audience$ = null;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
