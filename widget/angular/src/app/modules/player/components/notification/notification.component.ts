import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';
import {
  CorporateNotificationType,
  ListenForNewAdhocCorporateNotificationGQL,
  LoyaltySettingsType,
  PictureType,
  PointOfSaleType,
  WidgetVisualsType,
} from '@sifca-monorepo/widget-generator';

import { PlayerService } from '../../player.service';
import { ProfileService } from '../profile/profile.service';
import { NotificationsService } from './notifications.service';
import { BASE_URL } from '../../../../../environments/environment';
import { ModalService } from '../../../../shared/services/modal.service';
import ar from 'date-fns/locale/ar';
import fr from 'date-fns/locale/fr';
import de from 'date-fns/locale/de';
import { find } from 'lodash';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
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

      .empty-fill {
        fill: #000000;
      }
      .dark-mode .empty-fill {
        fill: #ffffff;
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

      .section-pager-item-text.dark {
        background-color: #21283b;
        color: #fff;
        box-shadow: 3px 5px 20px 0 rgba(0, 0, 0, 0.12);
      }
      .section-pager-bar.dark {
        background-color: #1d2333 !important;
      }
      .mr-left {
        margin-left: 16px;
      }
      .text-truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
  ],
})
export class NotificationComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  rtl: boolean;
  headerImagePath;
  darkMode: boolean;
  baseUrl = BASE_URL;
  currentUserId: string;
  authenticated: boolean;
  pagination: IPagination;
  newsFeedIcon: PictureType;
  unseenNotificationsCount: number;
  notifications: CorporateNotificationType[];
  perPage: number = this.notificationsService.pageLimit;
  pos$: Observable<PointOfSaleType> = this.playerService.pos$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.playerService.loyaltySettings$;
  loadingNotifications$: Observable<boolean> = this.notificationsService.loadingNotifications$;

  constructor(
    private modalService: ModalService,
    private playerService: PlayerService,
    private profileService: ProfileService,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private listenForNewAdhocCorporateNotificationGQL: ListenForNewAdhocCorporateNotificationGQL,
  ) {
    this.notificationsService.unseenNotificationsCount$.pipe(takeUntil(this.unsubscribeAll)).subscribe((count) => {
      this.unseenNotificationsCount = count;
    });
    this.notificationsService.unreadNotif$ = false;
    this.profileService.currentUser$.pipe(takeUntil(this.unsubscribeAll)).subscribe((currentUser) => {
      this.currentUserId = currentUser?.id;
    });
    this.notificationsService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.notificationsService.pageIndex || 0,
        size: this.notificationsService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.notificationsService.pageIndex || 0) * this.notificationsService.pageLimit,
        endIndex: Math.min(((this.notificationsService.pageIndex || 0) + 1) * this.notificationsService.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
      this.changeDetectorRef.markForCheck();
    });
    this.modalService.headerImagePath$.subscribe((path) => {
      this.headerImagePath = path;
      this.changeDetectorRef.markForCheck();
    });
    this.playerService.widgetVisuals$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widgetVisuals) => {
      if (widgetVisuals) {
        this.newsFeedIcon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_NEWSFEED_ICON').picture;
        this.changeDetectorRef.markForCheck();
      }
    })
    this.modalService.rtl$.subscribe((direction) => {
      this.rtl = direction;
      this.changeDetectorRef.detectChanges();
    });
    this.playerService.authenticated$.pipe(takeUntil(this.unsubscribeAll)).subscribe((authenticated) => {
      this.authenticated = authenticated;
      if (authenticated) {
        this.notificationsService
          .getCorporateNotificationsForUserPaginated()
          .pipe(
            switchMap((res) => {
              if (res?.length && this.unseenNotificationsCount > 0) {
                return this.notificationsService.markAllCorporateNotificationsAsSeenForUser();
              } else return of(null);
            }),
          )
          .subscribe();
      }
    });
    this.notificationsService.notifications$.pipe(takeUntil(this.unsubscribeAll)).subscribe((notifications) => {
      if (notifications?.length) {
        this.notifications = this.reduceNotification(notifications);
        this.changeDetectorRef.markForCheck();
      }
    });

    this.listenForNewAdhocCorporateNotificationGQL.subscribe({ userId: this.currentUserId }).subscribe(({ data }) => {
      this.notifications = this.reduceNotification([...this.notifications, data.listenForNewAdhocCorporateNotification]);
    });
  }

  onPageChange(page: number): void {
    this.notificationsService.pageIndex = page - 1;
    this.notificationsService.getCorporateNotificationsForUserPaginated().subscribe();
  }

  reduceNotification(notifications) {
    return notifications.reduce((acc, notif) => {
      const notifDate = new Date(notif.executedAt);
      const dateDifference = formatDistanceToNow(notifDate, {
        addSuffix: true,
        locale:
          (window as any).widgetInit.locale === 'ar'
            ? ar
            : (window as any).widgetInit.locale === 'fr'
            ? fr
            : (window as any).widgetInit.locale === 'ar-tn'
            ? ar
            : (window as any).widgetInit.locale === 'de'
            ? de
            : undefined,
      });
      acc.push({
        ...notif,
        dateDifference,
      });
      return acc;
    }, []);
  }

  ngOnDestroy() {
    this.playerService.currentPage$ = 1;
    this.notificationsService.pageIndex = 0;
    this.notificationsService.notifications$ = null;
  }
}
