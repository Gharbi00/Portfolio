import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, catchError, of, takeUntil } from 'rxjs';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { AudienceReachType, AudienceType, ChallengeType } from '@sifca-monorepo/terminal-generator';

import { AudiencesService } from '../../../audience/audience.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { SelectAudienceModalComponent } from '../../../../../shared/components/select-audience-modal/select-audience-modal.component';
import { ChallengesService } from '../challenges.service';

@Component({
  selector: 'sifca-monorepo-audience',
  templateUrl: './audience.component.html',
  styleUrls: ['./audience.component.scss'],
})
export class AudienceComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  percentage = 0;
  audience: AudienceType;
  challenge: ChallengeType;
  audienceReach: AudienceReachType;
  loadingChallenge$: Observable<boolean> = this.challengesService.loadingChallenge$;

  constructor(
    private modalService: NgbModal,
    private sharedService: SharedService,
    private challengesService: ChallengesService,
    private audiencesService: AudiencesService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
  ) {
    this.challengesService.challenge$.pipe(takeUntil(this.unsubscribeAll)).subscribe((challenge) => {
      if (challenge) {
        this.challenge = challenge;
        this.audienceReach = challenge?.audience?.reach;
        this.percentage = Number(((challenge?.audience?.reach?.reach / challenge?.audience?.reach?.total) * 100).toFixed(1));
        this.changeDetectorRef.markForCheck();
        this.audience = this.challenge?.audience;
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
    this.challengesService
      .removeAudienceFromChallenge(this.challenge?.id)
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
    modalRef.result.then((result) => {
      if (result.id) {
        const input: any = { audience: result.id };
        this.audience = result;
        this.changeDetectorRef.markForCheck();
        this.challengesService
          .updateChallenge(this.challenge?.id, input)
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
