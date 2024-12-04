import Swal from 'sweetalert2';
import { isEqual } from 'lodash';
import { Clipboard } from '@angular/cdk/clipboard';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Observable, ReplaySubject, Subject, catchError, combineLatest, of, take, takeUntil } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, PLATFORM_ID, ViewEncapsulation } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';
import { ConvertorHelper, ValidationHelper } from '@diktup/frontend/helpers';
import { CardTypeEnum, CorporateUserCardType, LoyaltySettingsWalletCardType, UserType, VisualsType } from '@sifca-monorepo/terminal-generator';

import { CardsService } from '../cards.service';
import { UserService } from '../../../../../core/services/user.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { VisualsService } from '../../../../website/content/visuals/visuals.service';
import { LoyaltyService } from '../../../../system/apps/apps/loyalty/loyalty.service';

@Component({
  selector: 'sifca-cards-list',
  styleUrls: [`./list.component.scss`],
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardsListComponent {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  private fileInputExcel = this.document.createElement('input');

  page = 0;
  emailForm: any;
  pageChanged: boolean;
  loadingImport: boolean;
  pagination: IPagination;
  breadCrumbItems!: Array<{}>;
  isEmailButtonDisabled: boolean;
  selectedCard: CorporateUserCardType;
  loyaltyCard: LoyaltySettingsWalletCardType;
  validateBarcode = this.validationHelper.validateBarcode;
  visuals$: Observable<VisualsType> = this.visualsService.visuals$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  loadingCards$: Observable<boolean> = this.cardsService.loadingCards$;
  cards$: Observable<CorporateUserCardType[]> = this.cardsService.cards$;

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private clipboard: Clipboard,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private cardsService: CardsService,
    private userService: UserService,
    private sharedService: SharedService,
    private visualsService: VisualsService,
    private loyaltyService: LoyaltyService,
    private convertorHelper: ConvertorHelper,
    private validationHelper: ValidationHelper,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private translate: TranslateService,
  ) {
    this.cardsService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.cardsService.pageIndex || 0,
        size: this.cardsService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.cardsService.pageIndex || 0) * this.cardsService.pageLimit,
        endIndex: Math.min(((this.cardsService.pageIndex || 0) + 1) * this.cardsService.pageLimit - 1, pagination.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.loyaltyService.loyaltySettings$.pipe(takeUntil(this.unsubscribeAll)).subscribe((settings) => {
      this.loyaltyCard = settings?.loyaltyCard;
    });
    this.fileInputExcel.type = 'file';
    this.fileInputExcel.name = 'file';
    this.fileInputExcel.multiple = true;
    this.fileInputExcel.style.display = 'none';
    this.fileInputExcel.addEventListener('change', () => {
      if (this.fileInputExcel.files.length) {
        this.convertFile(this.fileInputExcel.files[0]).subscribe((base64) => {
          this.loadingImport = true;
          this.cardsService
            .importTargetUserCardsByExcel(base64)
            .pipe(
              catchError(() => {
                this.loadingImport = false;
                this.modalService.dismissAll();
                this.modalError();
                this.changeDetectorRef.markForCheck();
                return of(null);
              }),
            )
            .subscribe((res) => {
              this.loadingImport = false;
              if (res) {
                this.modalService.dismissAll();
                this.position();
                this.changeDetectorRef.markForCheck();
              }
            });
        });
      }
    });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.ENGAGEMENT').subscribe((engagement: string) => {
      this.translate.get('MENUITEMS.TS.CARDS').subscribe((cards: string) => {
        this.breadCrumbItems = [{ label: engagement }, { label: cards, active: true }];
      });
    });
  }

  ngAfterViewInit() {
    combineLatest([this.loyaltyService.findLoyaltySettingsByTarget(), this.visualsService.getVisuals()]).subscribe();
  }

  onChangeCardType(type: string) {
    this.emailForm.patchValue({ cardType: type });
  }

  openEmailModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
    this.userService.user$.pipe(take(1)).subscribe((user: UserType) => {
      this.emailForm = this.formBuilder.group({
        emails: [[user?.email], Validators.required],
        cardType: [CardTypeEnum.PHYSICAL],
      });
      const initialValues = this.emailForm.value;
      this.emailForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((ivalues) => {
        this.isEmailButtonDisabled = isEqual(ivalues, initialValues);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  uploadExcel(): void {
    this.loadingImport = false;
    this.fileInputExcel.value = '';
    this.fileInputExcel.click();
  }

  convertFile(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    return result;
  }

  openImportModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
  }

  send() {
    this.isEmailButtonDisabled = true;
    this.cardsService
      .sendTargetUserCardsBymail(this.emailForm.get('cardType').value, this.emailForm.get('emails').value)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.modalService.dismissAll();
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  isExpired(validUntil: Date): boolean {
    const currentDate: Date = new Date();
    return currentDate > new Date(validUntil);
  }

  openCardModal(content: any, card: CorporateUserCardType) {
    this.selectedCard = card;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  downloadDocument() {
    if (isPlatformBrowser(this.platformId)) {
      this.cardsService.getTargetUserCardsByExcel().subscribe((res) => {
        const blob = this.convertorHelper.b64toBlob(res, 'xlsx');
        const a = this.document.createElement('a');
        this.document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = String('customers.xlsx');
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      });
    }
  }

  expireCard() {
    this.cardsService
      .expireCorporateUserCard(this.selectedCard.id)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe(() => {
        this.position();
        this.modalService.dismissAll();
      });
  }

  openExpireModal(content: any, card: CorporateUserCardType) {
    this.selectedCard = card;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.cardsService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.cardsService.getCorporateUserCardsByTargetWithReputationsPaginated().subscribe();
    }
  }

  modalError() {
    this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((sthWentWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: sthWentWrong,
        icon: 'warning',
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

  copyText(textToCopy: string) {
    this.clipboard.copy(textToCopy);
  }

  ngOnDestroy(): void {
    this.visualsService.visuals$ = null;
    this.cardsService.pageIndex = 0;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
