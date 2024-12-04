import Swal from 'sweetalert2';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';

import { PlayerService } from '../../player.service';
import { BASE_URL } from '../../../../../environments/environment';
import { ModalService } from '../../../../shared/services/modal.service';
import { HighlightService } from '../../../../shared/services/highlight.service';
import { LoyaltySettingsType, PictureType, PointOfSaleType, ReputationWithoutTargetType, WidgetIntegrationType, WidgetVisualsType } from '@sifca-monorepo/widget-generator';
import { TranslateService } from '@ngx-translate/core';
import { QuestsService } from '../quests/quests.service';
import { find } from 'lodash';

@Component({
  selector: 'app-earn',
  templateUrl: './earn.component.html',
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

      @media (min-width: 400px) {
        .ml-x {
          margin-left: 5px;
        }
      }

      .content-grid {
        max-width: 1184px;
        padding: 0 0 0 !important;
        width: 100%;
      }

      .achievement-box {
        flex-direction: column;
        padding: 28px 18px;
      }

      .achievement-box {
        flex-direction: column;
        padding: 28px 18px;
      }

      .level-24 .achievement-box {
        flex-direction: column;
        padding: 28px 18px;
      }

      .level-24 .badge-item img {
        position: relative !important;
      }

      .achievement-box {
        flex-direction: column;
        padding: 28px 18px;
      }

      .profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      .edit-profile.content-grid .section,
      .edit-profile.content-grid .section-header {
        margin-top: 0px;
      }

      :host::ng-deep.quests.owl-item img {
        display: block;
        width: auto !important;
      }

      .achievement-box {
        flex-direction: column;
        padding: 28px 18px;
      }

      .challenge.profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      .earn-card-images {
        width: 90px;
      }

      .section-banner .section-banner-icon {
        width: 92px;
        height: 86px !important;
      }

      .special-margin-bottom {
        @media (min-width: 600px) {
          margin-bottom: 72px;
        }

        @media (max-width: 600px) {
          margin-bottom: 70px;
        }
      }
      .dark-mode {
        .text-sticker {
          min-width: 100px !important;
          box-shadow: 3px 5px 20px 0 rgb(0 0 0/12%);
          margin-top: 3px;
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
        .button {
          background-color: #293249 !important;
          color: #fff !important;
          border: 1px solid #293249 !important;
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
          color: white;
        }
      }
      .rtl {
        .achievement-box .achievement-box-info-wrap .achievement-box-image {
          margin-left: 16px;
          margin-right: 0 !important;
        }
        .section-banner .section-banner-icon {
          left: 0 !important;
        }
        .section-banner-text,
        .section-banner-title {
          transform: scaleX(-1) !important;
        }
        .section-banner {
          transform: scaleX(-1) !important;
        }
      }
      .text-sticker {
        min-width: 100px !important;
        box-shadow: 3px 5px 20px 0 rgb(0 0 0/12%);
        margin-top: 3px;
      }
      .experience-design {
        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        align-content: center;
      }

      .special-margin-top {
        @media (max-width: 768px) {
          margin-top: 56px;
        }
        @media (min-width: 769px) {
          margin-top: 240px;
        }
      }

      .special-margin-bottom {
        @media (min-width: 600px) {
          margin-bottom: 41px;
        }

        @media (max-width: 600px) {
          margin-bottom: 70px;
        }
      }
      .text-truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
  ],
})
export class EarnComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  darkMode;
  rtl: boolean;
  headerImagePath;
  isHidden: boolean;
  lastIndex: number;
  baseUrl = BASE_URL;
  pos: PointOfSaleType;
  banner1Icon: PictureType;
  earnHeaderIcon: PictureType;
  loyaltySettings: LoyaltySettingsType;
  vibrating$: Observable<boolean> = this.highlightService.vibrating$;
  authenticated$: Observable<boolean> = this.playerService.authenticated$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.playerService.loyaltySettings$;
  widgetSettings$: Observable<WidgetIntegrationType> = this.playerService.widgetSettings$;
  currentLevel$: Observable<ReputationWithoutTargetType> = this.playerService.currentLevel$;
  banner2Icon: PictureType;
  earn1Picture: PictureType;
  earn3Picture: PictureType;
  earn2Picture: PictureType;

  constructor(
    private element: ElementRef,
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
    private translate: TranslateService,
    private playerService: PlayerService,
    private questsService: QuestsService,
    private highlightService: HighlightService,
  ) {
    this.playerService.currentLevel$.subscribe((currentLevel) => {
    console.log("🚀 ~ EarnComponent ~ this.playerService.currentLevel$.subscribe ~ currentLevel:", currentLevel)
    })
    this.playerService.widgetVisuals$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widgetVisuals) => {
      if (widgetVisuals) {
        this.earnHeaderIcon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_EARN_ICON_HEADER').picture;
        this.banner1Icon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_BANNER_01').picture;
        this.banner2Icon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_BANNER_02').picture;
        this.earn1Picture = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_EARN_1').picture;
        this.earn2Picture = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_EARN_2').picture;
        this.earn3Picture = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_EARN_3').picture;
        this.cd.markForCheck();
      }
    })
    this.playerService.pos$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pos) => {
      this.pos = pos;
    });
    this.playerService.loyaltySettings$.pipe(takeUntil(this.unsubscribeAll)).subscribe((loyaltySettings) => {
      this.loyaltySettings = loyaltySettings;
      console.log('remunerations', loyaltySettings?.onsiteConverter?.web?.remunerations)
      this.lastIndex = loyaltySettings?.onsiteConverter?.web?.remunerations?.length - 1;
    });
  }

  ngOnInit(): void {
    this.modalService.isHidden$.subscribe((hidden) => (this.isHidden = hidden));
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
      this.cd.detectChanges();
    });

    this.modalService.headerImagePath$.subscribe((path) => {
      this.headerImagePath = path;
      this.cd.detectChanges();
    });
    this.modalService.rtl$.subscribe((direction) => {
      this.rtl = direction;
      this.cd.detectChanges();
    });
  }

  toggleModal(modalName: string): void {
    this.modalService.togglePopUp(modalName, this.element);
    this.questsService.getQuestsByTargetAndUserAudiencePaginated().subscribe();
  }

  closeModal() {
    this.modalService.isHidden$ = true;
    this.toggleModal('home');
  }

  toggleVibration() {
    this.highlightService.vibrating$.pipe(take(1)).subscribe((vibrating) => {
      this.highlightService.vibrating$ = !vibrating;
      if (!vibrating) {
        this.closeModal();
        this.translate.get('LOGIN_HIGHLIGHT').subscribe((text: string) => {
          Swal.fire({
            position: 'top-end',
            icon: 'info',
            text,
            showConfirmButton: false,
            customClass: {
              container: 'fw-swal-container',
            },
            timer: 3000,
            ...(this.darkMode ? { background: '#1d2333', color: '#fff' } : {}),
          });
        });
      }
      this.cd.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
