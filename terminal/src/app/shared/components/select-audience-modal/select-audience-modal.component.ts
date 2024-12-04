import { Observable, Subject, catchError, of, take, takeUntil } from 'rxjs';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { AudienceCriteriaType, AudienceType, QuestTypeType, TargetType } from '@sifca-monorepo/terminal-generator';

import { IPagination } from '@diktup/frontend/models';
import { AudiencesService } from '../../../modules/engagement/audience/audience.service';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'select-audience-modal',
  templateUrl: './select-audience-modal.component.html',
  styleUrls: ['./select-audience-modal.component.scss'],
})
export class SelectAudienceModalComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  advertiser: TargetType;
  pagination: IPagination;
  questType: QuestTypeType;
  selectedAudience: AudienceCriteriaType;
  audiences$: Observable<AudienceType[]> = this.audiencesService.infiniteAudiences$;
  loadingAudiences$: Observable<boolean> = this.audiencesService.loadingAudiences$;

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    public activeModal: NgbActiveModal,
    public sharedService: SharedService,
    private audiencesService: AudiencesService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (!this.questType) {
      this.audiencesService.getAudiencesByTargetPaginated(false, this.advertiser).subscribe();
    } else {
      this.audiencesService.getAudiencesByTargetPaginated(false, { questType: this.questType?.id }).subscribe();
    }
    this.audiencesService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = pagination;
      this.changeDetectorRef.markForCheck();
    });
  }

  loadMoreAudiences() {
    this.audiencesService.isLast$.pipe(take(1)).subscribe((isLast) => {
      if (!isLast) {
        this.audiencesService.pageIndex += 1;
        this.audiencesService
          .getAudiencesByTargetPaginated(true)
          .pipe(
            catchError(() => {
              return of(null);
            }),
          )
          .subscribe();
      }
    });
  }

  save() {
    this.activeModal.close(this.selectedAudience);
  }

  selectAudience(audience: AudienceCriteriaType) {
    this.selectedAudience = audience;
  }

  ngOnDestroy() {
    this.audiencesService.pageIndex = 0;
    this.audiencesService.infiniteAudiences$ = null;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
