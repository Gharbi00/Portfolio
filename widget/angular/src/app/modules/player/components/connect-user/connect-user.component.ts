import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable, Subject, catchError, of, switchMap, takeUntil } from 'rxjs';

import { PictureType, QuestWithRepeatDateType, WidgetVisualsType } from '@sifca-monorepo/widget-generator';

import { PlayerService } from '../../player.service';
import { BASE_URL } from '../../../../../environments/environment';
import { ModalService } from '../../../../shared/services/modal.service';
import { find, isEqual } from 'lodash';

@Component({
  selector: 'app-connect-user',
  templateUrl: './connect-user.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
      @import '${BASE_URL}/assets/css/styles.min.css';
      @import '${BASE_URL}/assets/css/vendor/simplebar.css';
      @import '${BASE_URL}/assets/css/vendor/bootstrap.min.css';

      :root {
        --dynamic-color: #7750f8;
        --dynamic-color2: #615dfa;
        --dynamic-color3: #45437f;
      }

      :host {
        display: contents;
      }

      .text-input {
        width: 100%;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 700;
        height: 54px;
        padding: 0 18px;
        background-color: #fff;
        border: 1px solid #dedeea;
        color: #3e3f5e;
        transition: border-color 0.2s ease-in-out;
      }

      text-input:focus {
        border-color: red !important;
      }

      .dark-mode .checkbox-wrap input[type='checkbox']:checked + .checkbox-box {
        background-color: #fff !important;
        border-color: #fff !important;
      }
      .dark-mode.checkbox-wrap input[type='radio']:checked + .checkbox-box.round {
        border: 6px solid #fff !important;
      }

      @media (max-width: 600px) {
        .point-reward-box {
          display: -ms-flexbox;
          display: flex !important;
          flex-direction: column !important;
        }
      }

      .level-24 .badge-item img {
        position: relative !important;
      }

      .profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      .profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      .chat.profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      :host::ng-deep.quests.owl-item img {
        display: block;
        width: auto !important;
      }

      .challenge.profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      .text-sticker {
        min-width: 100px !important;
        box-shadow: 3px 5px 20px 0 rgb(0 0 0/12%);
        margin-top: 3px;
      }

      .rounded-circle {
        width: 20px;
      }

      .special-margin-bottom {
        @media (min-width: 600px) {
          margin-bottom: 72px;
        }

        @media (max-width: 600px) {
          margin-bottom: 70px;
        }
      }

      .text-sticker .text-sticker-icon-red {
        margin-right: 4px;
        fill: #d90000;
      }
      .empty-fill {
        fill: #000000;
      }

      .dark-mode .widget-box {
        background-color: #1d2333 !important;
      }

      .widget-box {
        background-color: #fff;
      }

      .dark-mode {
        .empty-fill {
          fill: #ffffff;
        }
        .text-sticker {
          background-color: #293249 !important;
          box-shadow: 3px 5px 20px 0 rgba(0, 0, 0, 0.12) !important;
        }
        .text-sticker .highlighted {
          color: #fff;
        }
        .text-sticker .text-sticker-icon {
          margin-right: 4px !important;
          fill: #fff !important;
        }
        .simple-accordion .simple-accordion-header .simple-accordion-icon .icon-minus-small,
        .simple-accordion .simple-accordion-header .simple-accordion-icon .icon-plus-small {
          fill: #fff;
        }
        .stats-box .stats-box-diff .stats-box-diff-icon.positive .icon-plus-small {
          fill: #fff;
        }
        .banner-promo img {
          width: 100% !important;
          height: 100% !important;
          border-radius: 12px;
        }
        .point-reward-box {
          background-color: #1d2333 !important;
        }
        .product-preview.small .product-preview-info .text-sticker {
          right: -8px;
        }
        .product-preview .product-preview-info .text-sticker {
          position: absolute !important;
          top: -14px !important;
          right: 14px;
        }
        .album-preview .text-sticker {
          position: absolute !important;
          top: 18px !important;
          right: 18px !important;
          z-index: 3 !important;
          pointer-events: none;
        }
        .badge-item-stat .text-sticker {
          position: absolute !important;
          top: 10px !important;
          right: -6px;
        }
        .quest-item .text-sticker {
          color: white;
        }
        a,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        p,
        .quest-item .quest-item-title,
        .quest-item-meta-title {
          color: white !important;
        }
      }
      .rtl {
        .checkbox-wrap .checkbox-box {
          right: 0 !important;
          left: auto !important;
        }
      }
      .dark-mode .label-x {
        color: #fff;
      }

      .dark-mode .interactive-input input {
        background-color: #1d2333 !important;
        border: 1px solid #3f485f !important;
        color: #fff !important;
        transition: border-color 0.2s ease-in-out;
      }
      .text-truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      ::placeholder {
        font-size: 14px !important;
      }
    `,
  ],
})
export class ConnectUserComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  darkMode;
  rtl: boolean;
  countDown: any;
  headerImagePath;
  baseUrl = BASE_URL;
  showAlert: boolean;
  isValidCode = false;
  isWrongCode = false;
  selectedOption = 'sms';
  badgesIcon: PictureType;
  validationForm: FormGroup;
  isSendButtonDisabled = true;
  codeInputControl = new FormControl('');
  authenticated$: Observable<boolean> = this.playerService.authenticated$;
  loadingQuests$: Observable<boolean> = this.playerService.loadingQuests$;
  quests$: Observable<QuestWithRepeatDateType[]> = this.playerService.quests$;

  constructor(
    private element: ElementRef,
    private cd: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private modalService: ModalService,
    private playerService: PlayerService,
  ) {
    this.playerService.widgetVisuals$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widgetVisuals) => {
      if (widgetVisuals) {
        this.badgesIcon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_BADGES_ICON').picture;
      }
    })
    this.validationForm = this.formBuilder.group({
      login: ['', Validators.email],
      number: [''],
    });
    const initialValues = this.validationForm.value;
    this.validationForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isSendButtonDisabled = isEqual(values, initialValues);
      this.showAlert = false;
      this.cd.markForCheck();
    });
  }

  ngOnInit(): void {
    this.playerService.findPredefinedQuestsByTargetWithRepeatDate().subscribe();
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
      this.cd.detectChanges();
    });
    this.modalService.rtl$.subscribe((direction) => {
      this.rtl = direction;
      this.cd.detectChanges();
    });
    this.modalService.headerImagePath$.subscribe((path) => {
      this.headerImagePath = path;
      this.cd.detectChanges();
    });
  }

  linkAccount() {
    this.playerService
      .validateLinkOrCodeForTarget(this.codeInputControl.value)
      .pipe(
        switchMap(() => {
          const timestampInSeconds = Math.floor(Date.now() / 1000).toString();
          return this.playerService.linkUserAccount(timestampInSeconds);
        }),
        catchError(() => {
          this.isWrongCode = true;
          this.cd.markForCheck();
          return of(null);
        }),
        switchMap((res) => {
          return this.playerService.getCurrentUserLinkedCorporateAccountByTarget(res[0]?.partner?.pos?.id);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.playerService.userToken$ = res?.token;
          this.modalService.togglePopUp('home', this.element);
          this.cd.markForCheck();
        }
      });
  }

  sendCode() {
    const args = {
      ...(this.selectedOption === 'sms'
        ? { phone: { number: this.validationForm.get('number').value } }
        : { login: this.validationForm.get('login').value }),
    };
    this.playerService
      .isLoginForTargetExist(args as any)
      .pipe(
        switchMap((res) => {
          const input = {
            ...(this.selectedOption === 'sms'
              ? { phone: { number: this.validationForm.get('number').value } }
              : { email: this.validationForm.get('login').value }),
          };
          if (res?.exist) {
            return this.playerService.sendValidationCodeOrLink(input);
          } else {
            this.showAlert = true;
            this.isValidCode = true;
            return of(null);
          }
        }),
      )
      .subscribe((result) => {
        if (result) {
          this.isValidCode = true;
          this.isSendButtonDisabled = true;
          this.cd.markForCheck();
        }
      });
  }

  onChangeOption() {
    this.validationForm.patchValue({
      login: '',
      number: '',
    });
    this.cd.checkNoChanges();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
