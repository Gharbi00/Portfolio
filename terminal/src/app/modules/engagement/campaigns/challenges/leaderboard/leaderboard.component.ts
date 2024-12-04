import { map } from 'lodash';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CorporateUserType, LeaderboardChallengeType } from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';

import { SharedService } from '../../../../../shared/services/shared.service';
import { ChallengesService } from '../challenges.service';

@Component({
  selector: 'leaderboard',
  templateUrl: './leaderboard.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  pageChanged: any;
  challengeId: string;
  customerForm: FormGroup;
  pagination: IPagination;
  loadingLeaderboard$: Observable<boolean> = this.challengeService.loadingLeaderboard$;
  leaderboard$: Observable<LeaderboardChallengeType[]> = this.challengeService.leaderboard$;

  get pictures(): FormArray {
    return this.customerForm.get('pictures') as FormArray;
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
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private challengeService: ChallengesService,
  ) {
    this.challengeService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.challengeService.pageIndex || 0,
        size: this.challengeService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.challengeService.pageIndex || 0) * this.challengeService.pageLimit,
        endIndex: Math.min(((this.challengeService.pageIndex || 0) + 1) * this.challengeService.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.challengeId = this.activatedRoute.snapshot.paramMap.get('id');
    this.challengeService.getChallengeLeaderboard(this.challengeId).subscribe();
  }

  openCustomerModal(content: any, customer: CorporateUserType) {
    this.modalService.open(content, { centered: true });
    this.customerForm = this.formBuilder.group({
      title: [customer?.title || ''],
      about: [customer?.about || ''],
      pictures: this.formBuilder.array(
        customer?.pictures?.length
          ? map(customer?.pictures, (picture) => {
              return this.formBuilder.group({
                baseUrl: picture?.baseUrl,
                path: picture?.path,
              });
            })
          : [],
      ),
      phone: this.formBuilder.group({
        countryCode: [customer?.phone?.countryCode || ''],
        number: [customer?.phone?.number || ''],
      }),
      dateOfBirth: [customer?.dateOfBirth || null],
      lastName: [customer?.lastName || ''],
      firstName: [customer?.firstName || ''],
      email: [customer?.email || ''],
      residentialAddress: this.formBuilder.group({
        address: [customer?.residentialAddress?.[0]?.address || ''],
      }),
    });
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.challengeService.leaderboardPageIndex = page - 1;
    if (this.pageChanged) {
      this.challengeService.getChallengeLeaderboard(this.challengeId).subscribe();
    }
  }

  ngOnDestroy() {
    this.challengeService.leaderboardPageIndex = 0;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
