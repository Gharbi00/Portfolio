import { Observable, Subject, take, takeUntil } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { LoyaltySettingsType, OutboundEditorEnum, PictureType, WidgetVisualsType } from '@sifca-monorepo/widget-generator';

import { PlayerService } from '../../player.service';
import { BASE_URL } from '../../../../../environments/environment';
import { ModalService } from '../../../../shared/services/modal.service';
import { find } from 'lodash';

@Component({
  selector: 'app-redeem',
  templateUrl: './redeem.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
      @import '${BASE_URL}/assets/css/quill/quill.snow.css';
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

      .dark-mode .widget-box {
        background-color: #1d2333 !important;
      }

      .widget-box {
        background-color: #fff;
      }

      .empty-fill {
        fill: #000000;
      }
      .dark-mode .empty-fill {
        fill: #ffffff;
      }

      .special-height {
        @media (max-width: 768px) {
          height: 1136px;
        }
        @media (min-width: 769px) {
          height: 900px;
        }
      }

      .ql-container.ql-snow {
        border: 0px !important;
      }

      .form-switch.active {
        background-color: #23d2e2;
      }
      .achievement-box {
        flex-direction: column;
        padding: 28px 18px;
      }

      .reward.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .content-grid {
        max-width: 1184px;
        padding: 0 0 0 !important;
        width: 100%;
      }
      .widget-box {
        width: 100%;
      }

      @media screen and (min-width: 1200px) {
        .widget-box .widget-box-content {
          margin-top: 15px;
        }
      }
      @media (min-width: 1200px) {
        .special-widget-box {
          padding: 15px 25px;
        }
      }

      .badge-item-stat-image {
        max-width: 80px;
      }
      @media (max-width: 1200px) {
        .special-widget-box {
          padding: 32px 28px;
        }
      }

      /* level-24 styles */
      ::ng-deep.level-24 .widget-box {
        padding: 0px 0px;
        border-radius: 12px;
        background-color: #fff;
        box-shadow: 0 0 40px 0 #5e5c9a0f;
        position: relative;
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

      .challenge.profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      .text-sticker {
        min-width: 100px !important;
        box-shadow: 3px 5px 20px 0 rgb(0 0 0/12%);
        margin-top: 3px;
      }

      .section-banner .section-banner-icon {
        width: 92px;
        height: 86px !important;
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
      .coin-transaction {
        width: 20px;
        height: 20px;
        margin-bottom: -12%;
      }
      .dark-mode {
        .stat-block .stat-block-decoration {
          background: linear-gradient(-145deg, #fff, var(--dynamic-color)) !important;
        }
        .stat-block .stat-block-decoration .stat-block-decoration-icon {
          fill: #fff;
        }
        .stat-block .stat-block-info .stat-block-title {
          color: #9aa4bf !important;
        }

        .banner-promo img {
          width: 100% !important;
          height: 100% !important;
          border-radius: 12px;
        }

        .widget-box {
          background-color: #1d2333 !important;
        }
        .widget-box .widget-box-title .highlighted {
          color: #fff;
        }
        .widget-box .widget-box-text.light {
          color: #9aa4bf;
        }
        .widget-box .widget-box-status .content-actions {
          margin-top: 28px !important;
          border-top: 1px solid #2f3749;
        }

        .popup-box .popup-box-body .popup-box-content .widget-box {
          box-shadow: none;
        }
        .popup-box .widget-box .form .form-row {
          padding: 0;
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

      .user-avatar .user-avatar-overlay-content {
        width: 100%;
        height: 100%;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-pack: center;
        justify-content: center;
        -ms-flex-align: center;
        align-items: center;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 12;
      }

      .user-avatar .user-avatar-overlay-content .user-avatar-overlay-content-text {
        color: #fff;
        font-weight: 700;
        pointer-events: none;
        position: relative;
        top: 1px;
      }
      .text-truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
  ],
})
export class RedeemComponent implements OnInit, AfterViewInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  @ViewChild('safeHtml', { static: false }) safeHtml: ElementRef;

  darkMode;
  headerImagePath;
  content: string;
  baseUrl = BASE_URL;
  safeEmail: SafeHtml;
  overviewIcon: PictureType;
  editor: OutboundEditorEnum;
  loyaltySettings: LoyaltySettingsType;
  authenticated$: Observable<boolean> = this.playerService.authenticated$;
  loadingLoyalty$: Observable<boolean> = this.playerService.loadingLoyalty$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.playerService.loyaltySettings$;

  constructor(
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private modalService: ModalService,
    private playerService: PlayerService,
  ) {}

  ngOnInit(): void {
    this.playerService.loadingLoyalty$ = true;
    this.playerService.widgetVisuals$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widgetVisuals) => {
      if (widgetVisuals) {
        this.overviewIcon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_OVERVIEW_ICON').picture;
        this.cd.markForCheck();
      }
    })
    this.playerService.loyaltySettings$.pipe(take(1)).subscribe((loyaltySettings) => {
      this.loyaltySettings = loyaltySettings;
      this.editor = loyaltySettings?.redeem?.editor;
      if (loyaltySettings?.redeem?.content) {
        this.content = loyaltySettings?.redeem?.content;
        this.safeEmail = this.sanitizer?.bypassSecurityTrustHtml(this.content);
      }
      if (this.loyaltySettings?.aggregator?.target?.pos?.id) {
        this.playerService.findLoyaltySettingsByTarget(this.loyaltySettings?.aggregator?.target?.pos?.id).subscribe((res) => {
          if (res?.redeem?.content) {
            this.editor = res?.redeem?.editor;
            this.content = res?.redeem?.content;
            this.safeEmail = this.sanitizer?.bypassSecurityTrustHtml(this.content);
            setTimeout(() => {
              this.appendContent();
            }, 1000);
            this.cd.markForCheck();
          }
        });
      } else {
        this.playerService.loadingLoyalty$ = false;
      }
    });
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
      this.cd.detectChanges();
    });

    this.modalService.headerImagePath$.subscribe((path) => {
      this.headerImagePath = path;
      this.cd.detectChanges();
    });
  }

  ngAfterViewInit() {
    this.appendContent();
  }

  appendContent() {
    if (this.safeHtml && this.editor === OutboundEditorEnum.HTML) {
      const parser = new DOMParser();
      const dom = parser.parseFromString(this.content, 'text/html');
      const shadow = this.safeHtml.nativeElement.attachShadow({ mode: 'open' });
      shadow.appendChild(dom.documentElement);
    }
  }
}
