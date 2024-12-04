import isAfter from 'date-fns/isAfter';
import parseISO from 'date-fns/parseISO';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';
import { ChallengeType, PictureType, WalletType, WidgetVisualsType } from '@sifca-monorepo/widget-generator';

import { ChallengeService } from '../challenge.service';
import { BASE_URL } from '../../../../../../environments/environment';
import { ModalService } from '../../../../../shared/services/modal.service';
import { PlayerService } from '../../../player.service';
import { find } from 'lodash';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-challenge-list',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
      @import '${BASE_URL}/assets/css/quill/quill.snow.css';
      @import '${BASE_URL}/assets/css/styles.min.css';
      @import '${BASE_URL}/assets/css/vendor/simplebar.css';
      @import '${BASE_URL}/assets/css/vendor/bootstrap.min.css';
      @import '${BASE_URL}/assets/css/owl/owl.carousel.min.css';
      @import '${BASE_URL}/assets/css/owl/owl.theme.default.min.css';

      :host {
        display: contents;
      }

      :root {
        --dynamic-color: #7750f8;
        --dynamic-color2: #615dfa;
        --dynamic-color3: #45437f;
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

      .widget-box {
        background-color: #fff;
      }

      .progress-stat .bar-progress-wrap:first-child {
        margin-bottom: -5px;
      }

      @media (max-width: 470px) {
        .p-sm-4 {
          padding: 24px;
        }
      }

      @media (min-width: 470px) {
        .table .table-column:last-child {
          padding-right: 28px;
        }
        .table .table-column.padded-big-left {
          padding-left: 60px;
        }
      }
      @media (max-width: 470px) {
        .table .table-column:last-child {
          padding-right: 0px !important;
        }
        .table .table-column.padded-big-left {
          padding-left: 0px !important;
        }
      }
      .content-grid {
        max-width: 1184px;
        padding: 0 0 0 !important;
        width: 100%;
      }

      @media screen and (min-width: 1200px) {
        .progress-stat .bar-progress-wrap .bar-progress-info.progress-with-text .light {
          font-size: 12.8px;
          font-weight: 500;
          text-transform: none;
        }
        .progress-stat .bar-progress-wrap .bar-progress-info.progress-with-text {
          font-size: 16px;
          font-weight: 700;
        }
      }

      .displayed-center {
        display: flex !important;
        justify-content: center !important;
      }

      .progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }
      .badge-item-stat .progress-stat {
        max-width: 204px;
        margin: 0px auto 0;
      }
      .level-progress-box .progress-stat {
        width: 90% !important;
      }

      .progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }
      .progress-stat .bar-progress-wrap:first-child {
        margin-bottom: -5px;
      }

      .level-24 .progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .level-24 .badge-item img {
        position: relative !important;
      }

      .transactions.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .reward.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .earn.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }
      :host::ng-deep.table-body .table-row {
        border-radius: 12px !important;
      }

      .notifications.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .profile.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }
      .profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      .edit-profile.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }
      .profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      .edit-profile.content-grid .section,
      .edit-profile.content-grid .section-header {
        margin-top: 0px;
      }

      .chat.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .quests.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      :host::ng-deep.quests.owl-item img {
        display: block;
        width: auto !important;
      }

      .quests.section-filters-bar.v2 .form .form-item.split .form-select {
        width: 100%;
        margin: 0px 6px 0px;
      }

      .challenge.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      @media screen and (min-width: 1200px) {
        .table.table-quests .table-column:nth-child(3),
        .table.table-quests .table-header-column:nth-child(3),
        .table.table-top-friends .table-column:nth-child(4),
        .table.table-top-friends .table-column:nth-child(5),
        .table.table-top-friends .table-header-column:nth-child(4),
        .table.table-top-friends .table-header-column:nth-child(5) {
          display: table-cell !important;
        }
      }
      @media screen and (max-width: 1200px) {
        .table.table-quests .table-column:nth-child(3),
        .table.table-quests .table-header-column:nth-child(3),
        .table.table-top-friends .table-column:nth-child(5),
        .table.table-top-friends .table-header-column:nth-child(5) {
          display: table-cell !important;
        }
      }
      .table .table-header-column.padded {
        padding: 12px 24px;
      }

      .user-avatar .user-avatar-border {
        position: absolute;
        top: 7px;
        left: 4px;
        z-index: 1;
      }

      .section-filters-bar.v2 .form .form-item.split {
        flex-direction: row;
      }

      @media (max-width: 600px) {
        .section-filters-bar.v2 .form .form-item.split {
          flex-direction: column !important;
          align-items: center;
        }
        .quests.section-filters-bar.v2 .form .form-item.split .form-select {
          margin: 0px 6px 24px !important;
        }
      }
      .table .table-row .table-column {
        padding-top: 15px !important;
        padding-bottom: 15px !important;
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
      .table.table-quests .table-body .table-column:last-child {
        width: 180px !important;
      }

      .section-banner .section-banner-icon {
        width: 92px;
        height: 86px !important;
      }
      .rounded-circle {
        width: 20px;
      }
      .first-column-padding {
        padding-right: 10px;
      }

      .special-margin-bottom {
        @media (min-width: 600px) {
          margin-bottom: 72px;
        }
        @media (max-width: 600px) {
          margin-bottom: 70px;
        }
      }
      .quest-item {
        width: 285px !important;
        height: 380px;
      }

      .form {
        padding: 0px 18px;
      }
      .owl-carousel .owl-item {
        display: grid !important;
        place-items: center !important;
      }
      .dark-mode {
        label {
          color: #fff !important;
        }

        .widget-box {
          background-color: #1d2333 !important;
        }

        .form-input.active label {
          background-color: #1d2333 !important;
          padding: 0 6px !important;
          font-size: 12px !important;
          top: -6px !important;
          left: 12px;
        }

        .form-input label {
          color: #9aa4bf !important;
        }

        .form-select .form-select-icon {
          fill: #fff !important;
          -webkit-transform: rotate(90deg) !important;
          transform: rotate(90deg) !important;
          position: absolute !important;
          top: 20px !important;
          right: 20px !important;
          pointer-events: none;
        }

        .form-select label {
          background-color: #1d2333 !important;
          color: #9aa4bf !important;
        }

        .form-counter-wrap label {
          background-color: #1d2333 !important;
          color: #9aa4bf !important;
        }

        .icon-small-arrow {
          fill: #616a82 !important;
        }

        .button {
          background-color: #293249 !important;
          color: #fff !important;
        }

        .button:hover {
          color: #fff !important;
          background-color: #323e5b !important;
        }

        .button .button-icon {
          fill: #fff !important;
          transition: fill 0.2s ease-in-out;
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

        .table.join-rows .table-header-column {
          border-bottom: 1px solid #2f3749;
        }

        .table .table-body {
          display: table-row-group !important;
          box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.06) !important;
          border-radius: 12px;
        }

        .table .table-body.same-color-rows .table-row:nth-child(2n + 2) {
          background-color: #1d2333;
        }

        .table .table-body .table-row:nth-child(2n + 2) {
          background-color: #21283b;
        }

        .table .table-column .table-title .highlighted {
          color: #fff;
        }

        .table .table-column .table-text {
          color: #9aa4bf !important;
        }

        .table .table-column .table-text .light {
          color: #9aa4bf;
        }

        .table .table-column .table-link .highlighted {
          color: #fff;
        }

        .table .table-column .table-action .icon-delete:hover {
          fill: #fff !important;
          opacity: 1;
        }

        .progress-stat .bar-progress-wrap .bar-progress-info {
          color: #fff !important;
        }

        .progress-stat .bar-progress-wrap .bar-progress-info.negative {
          color: #fff;
        }

        .progress-stat .bar-progress-wrap .bar-progress-info .light {
          color: #9aa4bf;
        }

        .progress-stat .progress-stat-info {
          color: #9aa4bf !important;
        }

        .user-avatar .user-avatar-border .hexagon-content {
          background-color: #fff;
        }

        .user-avatar .user-avatar-badge .user-avatar-badge-border .hexagon-content {
          background-color: #fff;
        }

        .user-avatar .user-avatar-badge .user-avatar-badge-text {
          color: #fff !important;
        }

        .user-avatar .user-avatar-overlay-content .user-avatar-overlay-content-text {
          color: #fff !important;
        }

        .form-box .form {
          margin-top: 76px;
        }

        .dropdown-box-actions .dropdown-box-action .button {
          width: 156px;
        }

        .navigation-widget .navigation-widget-info-wrap .navigation-widget-info .user-avatar {
          position: absolute !important;
          top: 0 !important;
          left: 0;
        }

        .navigation-widget.closed .user-avatar {
          margin: 0 auto;
        }

        .post-preview-line .user-avatar {
          margin-right: 8px;
        }

        .post-comment.reply-2 .user-avatar {
          left: 56px;
        }

        .post-comment .user-avatar {
          position: absolute !important;
          top: 28px !important;
          left: 28px;
        }

        .post-comment .post-comment-form .user-avatar {
          left: -24px;
        }

        .post-comment-form.with-title .user-avatar {
          top: 82px;
        }

        .post-comment-form .user-avatar {
          position: absolute !important;
          top: 28px !important;
          left: 28px;
        }

        .product-preview.small .product-preview-info .text-sticker {
          right: -8px;
        }

        .product-preview .product-preview-info .text-sticker {
          position: absolute !important;
          top: -14px !important;
          right: 14px;
        }

        .product-preview .product-preview-info .button {
          margin-top: 36px;
        }

        .user-avatar-list {
          display: -ms-flexbox !important;
          display: flex !important;
          -ms-flex-pack: end !important;
          justify-content: flex-end !important;
          -ms-flex-direction: row-reverse !important;
          flex-direction: row-reverse;
        }

        .user-avatar-list.reverse.medium .user-avatar:first-child {
          margin-left: 0;
        }

        .user-avatar-list.reverse.medium .user-avatar:last-child {
          margin-left: -10px;
        }

        .user-avatar-list.medium .user-avatar {
          margin-left: -10px;
        }

        .user-avatar-list.medium .user-avatar:last-child {
          margin-left: 0;
        }

        .user-avatar-list .user-avatar {
          margin-left: -8px;
        }

        .user-avatar-list .user-avatar .user-avatar-border {
          z-index: 3;
        }

        .user-avatar-list .user-avatar:last-child {
          margin-left: 0;
        }

        .user-preview .user-preview-info .user-avatar-list {
          margin-top: 34px;
        }

        .user-preview .user-preview-info .user-preview-actions .button {
          width: 100% !important;
          margin-right: 16px;
        }

        .user-preview .user-preview-info .user-preview-actions .button:last-child {
          margin-right: 0;
        }

        .user-preview .user-preview-info .user-preview-actions .button .button-icon {
          fill: #fff;
        }

        .user-preview .user-preview-footer .user-preview-footer-action.full .button {
          width: 100%;
        }

        .user-preview .user-preview-footer .user-preview-footer-action .button {
          width: 64px !important;
          height: 44px;
        }

        .album-preview .text-sticker {
          position: absolute !important;
          top: 18px !important;
          right: 18px !important;
          z-index: 3 !important;
          pointer-events: none;
        }

        .popup-box .popup-box-body .popup-box-sidebar .popup-box-sidebar-footer .button {
          margin-bottom: 16px;
        }

        .popup-box .popup-box-body .popup-box-sidebar .popup-box-sidebar-footer .button:last-child {
          margin-bottom: 0;
        }

        .popup-box .form {
          margin-top: 32px;
        }

        .popup-box .form .form-row {
          padding: 0 28px;
        }

        .popup-box .form .form-uploadables {
          margin-top: 32px !important;
          padding: 0 28px 40px !important;
          height: 406px !important;
          overflow-y: auto;
        }

        .popup-box .widget-box .form .form-row {
          padding: 0;
        }

        .badge-item-stat .text-sticker {
          position: absolute !important;
          top: 10px !important;
          right: -6px;
        }

        .badge-item-stat .progress-stat {
          max-width: 204px !important;
          margin: 54px auto 0;
        }

        .streamer-box.small .streamer-box-info .button {
          margin-top: 28px;
        }

        .streamer-box .streamer-box-info .button {
          margin-top: 40px !important;
          width: 100%;
        }

        .event-preview .button {
          width: 100% !important;
          margin-top: 38px;
        }

        .quest-preview .progress-stat {
          margin-top: 16px;
        }

        .quest-item {
          border-radius: 12px !important;
          background-color: #1d2333 !important;
          box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.06) !important;
          position: relative;
        }

        .quest-item .quest-item-cover {
          width: 100% !important;
          height: 120px !important;
          border-top-right-radius: 12px !important;
          border-top-left-radius: 12px;
        }

        .quest-item .text-sticker {
          color: white;
        }

        .quest-item .quest-item-info {
          padding: 44px 28px 0 !important;
          position: relative;
        }

        .quest-item .quest-item-badge {
          border: 6px solid #1d2333 !important;
          border-radius: 50% !important;
          position: absolute !important;
          top: -28px !important;
          left: 22px;
        }

        .quest-item .quest-item-title {
          font-size: 18px !important;
          font-weight: 700;
        }

        .quest-item .quest-item-text {
          margin-top: 18px !important;
          color: #9aa4bf !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          line-height: 1.4285714286em;
        }

        .quest-item .progress-stat {
          max-width: 228px !important;
          margin-top: 48px;
        }

        .quest-item .quest-item-meta {
          display: -ms-flexbox !important;
          display: flex !important;
          -ms-flex-align: center !important;
          align-items: center !important;
          margin-top: 22px !important;
          padding: 14px 0 !important;
          border-top: 1px solid #2f3749;
        }

        .quest-item .quest-item-meta .quest-item-meta-info {
          margin-left: 10px;
        }

        .quest-item .quest-item-meta .quest-item-meta-title {
          font-size: 12px !important;
          font-weight: 700;
        }

        .quest-item .quest-item-meta .quest-item-meta-text {
          color: #9aa4bf !important;
          font-size: 10px !important;
          font-weight: 500;
        }

        .slider-panel .slider-panel-roster .button {
          width: 180px !important;
          margin-right: 28px !important;
          position: relative !important;
          z-index: 2;
        }

        .demo-box .button {
          margin-top: 36px !important;
          overflow: hidden !important;
          position: relative;
        }

        .demo-box .button .active-text,
        .demo-box .button .inactive-text {
          width: 100% !important;
          height: 100% !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          transition: -webkit-transform 0.3s ease-in-out !important;
          transition: transform 0.3s ease-in-out !important;
          transition: transform 0.3s ease-in-out, -webkit-transform 0.3s ease-in-out;
        }

        .demo-box .button .active-text {
          -webkit-transform: translateY(100%) !important;
          transform: translateY(100%);
        }

        .header .header-actions .progress-stat {
          width: 110px;
        }

        .header .header-actions .login-form .button {
          width: 52px !important;
          height: 52px !important;
          -ms-flex-negative: 0 !important;
          flex-shrink: 0;
        }

        .section-header-info .section-pretitle {
          color: #9aa4bf !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          text-transform: uppercase;
        }

        .section-header-info .section-title .highlighted {
          color: #fff;
        }

        .section-header-info .section-title .highlighted.secondary {
          color: var(--dynamic-color);
        }

        .section-header-info .section-title.pinned:before {
          content: 'pinned' !important;
          display: inline-block !important;
          margin-right: 12px !important;
          padding: 4px 8px !important;
          border-radius: 200px !important;
          background-color: #40d04f !important;
          color: #fff !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          line-height: 1em !important;
          text-transform: uppercase !important;
          position: relative !important;
          top: -4px;
        }

        .section-filters-bar .section-filters-bar-title a {
          color: #fff !important;
        }

        .section-filters-bar .section-filters-bar-title .separator {
          background-color: #fff;
        }

        .section-filters-bar .section-filters-bar-text {
          color: #9aa4bf !important;
        }

        .section-filters-bar .section-filters-bar-text .highlighted {
          color: #fff !important;
        }

        .table .table-row {
          background-color: #1d2333 !important;
          height: 100px;
        }

        .quest-item .quest-item-title,
        .quest-item-meta-title {
          color: white;
        }
        .section-filters-bar {
          background-color: #1d2333 !important;
        }
        .form-input.dark input[type='password'],
        .form-input.dark input[type='text'],
        .form-input.dark textarea,
        .input[type='password'],
        input[type='text'],
        select,
        textarea {
          background-color: #293249 !important;
          color: #fff;
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
        .table.split-rows .table-row .table-column:first-child {
          border-top-right-radius: 12px !important;
          border-bottom-right-radius: 12px !important;
          border-top-left-radius: 0px !important;
          border-bottom-left-radius: 0px !important;
        }
        .table.split-rows .table-row:first-child .table-column:last-child {
          border-top-right-radius: 0px !important;
          border-bottom-right-radius: 0px !important;
          border-top-left-radius: 12px !important;
          border-bottom-left-radius: 12px !important;
        }
        .table.split-rows .table-row .table-column:last-child {
          border-top-right-radius: 0px !important;
          border-bottom-right-radius: 0px !important;
          border-top-left-radius: 12px !important;
          border-bottom-left-radius: 12px !important;
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
        .form-select label {
          left: auto !important;
        }
      }
      .countdown {
        direction: ltr;
        unicode-bidi: isolate;
      }
      .text-truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
  ],
})
export class ChallengeListComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  rtl;
  darkMode;
  headerImagePath;
  baseUrl = BASE_URL;
  pagination: IPagination;
  progressBarColor: string;
  selectedField = 'onGoing';
  todayDate: Date = new Date();
  isFilterButtonDisabled = true;
  quantitativeWallet: WalletType;
  perPage = this.challengeService.pageLimit;
  challenges$: Observable<ChallengeType[]> = this.challengeService.challenges$;
  loadingChallenges$: Observable<boolean> = this.challengeService.loadingChallenges$;
  questCarousel: OwlOptions = {
    autoplay: true,
    autoplayTimeout: 8000,
    margin: 10,
    loop: true,
    dots: true,
    rtl: false,

    responsive: {
      0: { items: 1 },
      580: { items: 2 },
      850: { items: 3 },
      1120: { items: 4 },
      1500: { items: 5 },
    },
  };
  challengesIcon: PictureType;
  isMobile: boolean;

  constructor(
    private element: ElementRef,
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
    private playerService: PlayerService,
    private deviceInfo: DeviceDetectorService,
    private challengeService: ChallengeService,
  ) {
    this.isMobile = this.deviceInfo.isMobile();
    this.challengeService.isDonation = null;
    this.playerService.widgetVisuals$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widgetVisuals) => {
      if (widgetVisuals) {
        this.challengesIcon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_CHALLENGES_ICON').picture;
      }
    })
    this.challengeService.getOngoingChallengesByTargetAndUserAudiencePaginated().subscribe();
    this.challengeService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.challengeService.pageIndex || 0,
        size: this.challengeService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.challengeService.pageIndex || 0) * this.challengeService.pageLimit,
        endIndex: Math.min(((this.challengeService.pageIndex || 0) + 1) * this.challengeService.pageLimit - 1, pagination?.length - 1),
      };
      this.cd.markForCheck();
    });
  }

  ngOnInit(): void {
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
      this.updateCarouselOptions();
      this.cd.detectChanges();
    });

    this.playerService.quantitativeWallet$.pipe(takeUntil(this.unsubscribeAll)).subscribe((quantitativeWallet) => {
      this.quantitativeWallet = quantitativeWallet;
    });
  }

  ngAfterViewInit() {
    this.modalService.progressBarColor$.subscribe((color) => {
      this.progressBarColor = color;
      this.cd.detectChanges();
    });
  }

  handleClick(data: ChallengeType): void {
    if (!data?.donation) {
      this.toggleModal('challengesDetails', data);
    } else {
      this.toggleModal('donationDetails', data);
    }
  }

  isFuture(date1: string, date2: string) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1 < d2 ? true : false;
  }

  getCountdown(date: string): any {
    if (!date) return null;
    if (isAfter(parseISO(date), new Date())) {
      const challengeDate = new Date(date);
      const now = new Date();
      const difference = Math.abs(challengeDate.getTime() - now.getTime());
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      this.cd.markForCheck();
      return { days, hours, minutes, seconds };
    } else {
      return 0;
    }
  }

  filterChallenges(event: string) {
    this.isFilterButtonDisabled = false;
    this.challengeService.isDonation = event === 'challenge' ? false : event === 'donation' ? true : event === 'all' ? null : null;
  }

  onChangeChallenges(event: string) {
    this.isFilterButtonDisabled = false;
    if (event === 'onGoing') {
      this.selectedField = 'onGoing';
    } else {
      this.selectedField = 'upComing';
    }
  }

  onPageChange(page: number) {
    this.challengeService.pageIndex = page - 1;
    if (this.selectedField === 'upComing') {
      this.challengeService.getUpcomingChallengesByTargetAndUserAudiencePaginated().subscribe();
    } else {
      this.challengeService.getOngoingChallengesByTargetAndUserAudiencePaginated().subscribe();
    }
  }

  filter() {
    this.isFilterButtonDisabled = true;
    this.challengeService.pageIndex = 0;
    if (this.selectedField === 'upComing') {
      this.challengeService.getUpcomingChallengesByTargetAndUserAudiencePaginated().subscribe();
    } else {
      this.challengeService.getOngoingChallengesByTargetAndUserAudiencePaginated().subscribe();
    }
  }

  updateCarouselOptions() {
    this.questCarousel = {
      rtl: this.rtl,
      autoplay: true,
      autoplayTimeout: 8000,
      margin: 10,
      loop: true,
      dots: true,

      responsive: {
        0: { items: 1 },
        580: { items: 2 },
        850: { items: 3 },
        1120: { items: 4 },
        1500: { items: 5 },
      },
    };
  }

  toggleModal(modalName: string, challenge: ChallengeType): void {
    this.challengeService.selectedChallenge$ = challenge;
    this.modalService.togglePopUp(modalName, this.element);
  }

  ngOnDestroy(): void {
    this.challengeService.pageIndex = 0;
    this.playerService.currentPage$ = 1;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
