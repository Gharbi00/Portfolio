import Swal from 'sweetalert2';
import isAfter from 'date-fns/isAfter';
import parseISO from 'date-fns/parseISO';
import { Clipboard } from '@angular/cdk/clipboard';
import { CookieService } from 'ngx-cookie-service';
import { TranslateService } from '@ngx-translate/core';
import { difference, filter, find, isEqual, map, values } from 'lodash';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable, Subject, combineLatest, take, takeUntil, map as rxMap, switchMap, of } from 'rxjs';
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewEncapsulation } from '@angular/core';

import {
  Gender,
  UserType,
  QuestType,
  SocialType,
  PictureType,
  CountryType,
  LanguageType,
  MaritalStatus,
  ZoneTypesEnum,
  AcademicLevel,
  WalletTypeEnum,
  WidgetVisualsType,
  QuestPerformedType,
  LoyaltySettingsType,
  CorporateUserCardType,
  WidgetIntegrationType,
  ReputationWithoutTargetType,
  WalletWithReputationDtoType,
  ProfileCompletnessProgressType,
  CurrentUserReputationsLossDateType,
  InternalProductWithRatingsWithFavoriteStatusType,
  PointOfSaleType,
  ProfileCompleteElementsEnum,
  LoyaltySettingsProfileCompleteLevelsType,
} from '@sifca-monorepo/widget-generator';
import { ValidationHelper } from '@diktup/frontend/helpers';

import { PlayerService } from '../../player.service';
import { QuestsService } from '../quests/quests.service';
import { ProfileService } from '../profile/profile.service';
import { BASE_URL } from '../../../../../environments/environment';
import { ModalService } from '../../../../shared/services/modal.service';
import { TransactionsService } from '../transactions/transactions.service';
import { LanguageService } from '../../../../shared/services/language.service';
import { HighlightService } from '../../../../shared/services/highlight.service';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
      @import '${BASE_URL}/assets/css/quill/quill.snow.css';
      @import '${BASE_URL}/assets/css/styles.min.css';
      @import '${BASE_URL}/assets/css/owl/owl.carousel.min.css';
      @import '${BASE_URL}/assets/css/owl/owl.theme.default.min.css';
      @import '${BASE_URL}/assets/css/vendor/simplebar.css';
      @import '${BASE_URL}/assets/css/flatpickr/flatpickr.css';
      @import '${BASE_URL}/assets/css/vendor/bootstrap.min.css';
      @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');
      :root {
        --dynamic-color: #7750f8;
        --dynamic-color2: #615dfa;
        --dynamic-color3: #45437f;
      }

      :host {
        display: contents;
      }

      .dark-mode .widget-box {
        background-color: #1d2333;
      }

      .gap-2 {
        gap: 8px;
      }

      agm-map {
        height: 240px;
      }

      .flatpickr-wrapper {
        width: 100% !important;
      }

      .flatpickr-current-month {
        padding: 0px;
      }

      .inline-flatpickr .form-control,
      .flatpickr-calendar.arrowTop:before,
      .flatpickr-calendar.arrowTop:after {
        display: none;
      }

      .flatpickr-calendar {
        position: absolute !important;
        z-index: 9999999 !important;
      }

      .inline-flatpickr {
        overflow-x: auto;
        overflow-y: hidden;
        white-space: nowrap;
        height: 319px !important;
      }

      .inline-flatpickr input {
        display: inline-block; /* Ensure the input stays inline */
        width: 100%; /* Make the input take the full width of its container */
        max-width: none; /* Ensure the input does not have a maximum width */
      }
      .dark-mode .flatpickr-calendar {
        background-color: #1d2333;
        color: #fff;
      }

      .dark-mode .flatpickr-calendar .flatpickr-day {
        background-color: #141a2a;
        color: #fff;
      }

      .dark-mode .flatpickr-calendar .flatpickr-day.today {
        background-color: #555;
        color: #fff;
      }
      .dark-mode .flatpickr-next-month {
        color: #fff;
      }
      .dark-mode .flatpickr-current-month {
        color: #fff;
      }
      .dark-mode .flatpickr-month {
        color: #fff;
      }
      .dark-mode .flatpickr-prev-month {
        color: #fff;
      }
      .dark-mode .flatpickr-weekday {
        color: #fff;
      }

      .widget-box .widget-box-button {
        width: 100%;
        margin-top: 32px;
        color: var(--dynamic-color);
        font-weight: 700;
        background-color: white;
        border: 1px solid var(--dynamic-color);
      }
      .widget-box .widget-box-button:hover {
        color: white;
        font-weight: 700;
        background-color: var(--dynamic-color);
        border: 1px solid var(--dynamic-color);
      }

      .coin-card {
        padding-right: 0px !important;
      }

      @media (max-width: 1200px) {
        .coin-card {
          padding-left: 0px !important;
        }

        .responsive-right {
          padding-right: 0px !important;
        }
      }

      @media (min-width: 1200px) {
        .responsive-margin-top {
          margin-top: 14px;
        }
        .display-flex {
          display: flex;
        }
      }

      .progress-stat .bar-progress-wrap:first-child {
        margin-bottom: -5px;
      }

      .content-grid {
        max-width: 1184px;
        padding: 0 0 0 !important;
        width: 100%;
      }

      .widget-box {
        width: 100%;
      }

      .col-responsive-margin {
        @media (min-width: 1200px) {
          margin-top: 15px;
        }
      }

      @media screen and (max-width: 680px) {
        .level-progress-box {
          display: block;
          height: auto;
          padding: 32px 28px;
        }
      }

      @media screen and (min-width: 1200px) {
        .progress-with-text {
          display: flex !important;
          flex-direction: column;
          text-align: center;
        }

        .level-progress-box {
          display: block;
          height: auto;
          padding: 32px 28px;
        }

        .level-progress-box .level-progress-badge {
          margin: 0 auto;
        }

        .progress-stat .bar-progress-wrap .bar-progress-info.progress-with-text .light {
          font-size: 12.8px;
          font-weight: 500;
          text-transform: none;
        }

        .progress-stat .bar-progress-wrap .bar-progress-info.progress-with-text {
          font-size: 16px;
          font-weight: 700;
        }

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

      .displayed-center {
        display: flex !important;
        justify-content: center !important;
      }

      .achievement-box {
        flex-direction: column;
        padding: 28px 18px;
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

      .achievement-box {
        flex-direction: column;
        padding: 28px 18px;
      }

      .progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .progress-stat .bar-progress-wrap:first-child {
        margin-bottom: -5px;
      }

      ::ng-deep.level-24 .widget-box {
        padding: 0px 0px;
        border-radius: 12px;
        background-color: #fff;
        box-shadow: 0 0 40px 0 #5e5c9a0f;
        position: relative;
      }

      .level-24 .achievement-box {
        flex-direction: column;
        padding: 28px 18px;
      }

      .level-24 .progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .level-24 .badge-item img {
        position: relative !important;
      }

      .achievement-box {
        flex-direction: column;
        padding: 28px 18px;
      }

      .achievement-box {
        flex-direction: column;
        padding: 28px 18px;
      }

      .reward.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .achievement-box {
        flex-direction: column;
        padding: 28px 18px;
      }

      .earn.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .notifications.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .achievement-box {
        flex-direction: column;
        padding: 28px 18px;
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

      .chat.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .chat.profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      .quests.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .achievement-box {
        flex-direction: column;
        padding: 28px 18px;
      }

      .challenge.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .challenge.profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      .active {
        fill: #fff !important;
      }

      .level-progress-box .percentage-diff {
        position: absolute;
        top: 24px;
        right: 28px;
      }

      .scrollable-content {
        max-height: 260px;
        overflow-y: auto;
      }

      .quest-preview-list {
        max-height: inherit;
      }

      .level-progress-box {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
      }

      .badge-item-stat .badge-item-stat-text {
        width: auto;
        margin: 16px auto 0;
        color: #3e3f5e;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.4285714286em;
        text-align: center;
      }

      .dots-dropdown {
        position: absolute;
        z-index: 9999;
        top: 30px;
        right: 9px;
        opacity: 1;
        visibility: visible;
        display: none;
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
      .dak-mode {
        label {
          color: #fff !important;
        }

        .text-sticker {
          background-color: #293249 !important;
          box-shadow: 3px 5px 20px 0 rgba(0, 0, 0, 0.12) !important;
        }

        .active {
          fill: #fff !important;
        }

        .form-input label {
          color: #9aa4bf !important;
        }

        .interactive-input.dark input {
          background-color: #5538b5 !important;
          color: #fff;
        }

        .icon-more-dots {
          fill: #fff !important;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        p a {
          color: #fff!important;
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

        .action-list.dark .action-list-item.active .action-list-item-icon,
        .action-list.dark .action-list-item.unread .action-list-item-icon,
        .action-list.dark .action-list-item:hover .action-list-item-icon {
          fill: #fff;
        }

        .action-list.dark .action-list-item .action-list-item-icon {
          fill: #9b7dff;
        }

        .action-list .action-list-item.active .action-list-item-icon,
        .action-list .action-list-item.unread .action-list-item-icon,
        .action-list .action-list-item:hover .action-list-item-icon {
          fill: #3e3f5e;
        }

        .action-list .action-list-item .action-list-item-icon {
          fill: #dbf5fe !important;
          transition: fill 0.3s ease-in-out;
        }

        .user-short-description .user-short-description-title a {
          color: #fff !important;
        }

        .user-short-description .user-short-description-text a {
          color: #9aa4bf !important;
        }

        .user-short-description .user-short-description-text a:hover {
          color: #fff;
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

        .simple-dropdown {
          background-color: #293249 !important;
          box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.12);
        }

        .simple-dropdown .simple-dropdown-link:hover {
          color: #fff;
        }

        .tweet .tweet-text .highlighted {
          color: #fff !important;
        }

        .meta-line .meta-line-text a {
          color: #fff !important;
          font-weight: 700;
        }

        .post-settings .post-settings-icon {
          fill: #616a82 !important;
          opacity: 0.4 !important;
          transition: opacity 0.2s ease-in-out, fill 0.2s ease-in-out;
        }

        .post-settings.active .post-settings-icon,
        .post-settings:hover .post-settings-icon {
          fill: #fff !important;
          opacity: 1;
        }

        .simple-accordion .simple-accordion-header .simple-accordion-icon .icon-minus-small,
        .simple-accordion .simple-accordion-header .simple-accordion-icon .icon-plus-small {
          fill: #fff;
        }

        .forum-category .forum-category-info .forum-category-link a {
          color: #fff !important;
        }

        .forum-category .forum-category-info .forum-category-link a:hover {
          color: #fff;
        }

        .discussion-preview .discussion-preview-meta .discussion-preview-meta-text a {
          color: #fff !important;
          font-weight: 700;
        }

        .stats-box .stats-box-diff .stats-box-diff-icon.positive .icon-plus-small {
          fill: #fff;
        }

        .banner-promo img {
          width: 100% !important;
          height: 100% !important;
          border-radius: 12px;
        }

        .stats-decoration {
          background-color: #1d2333 !important;
          box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.06) !important;
        }

        .stats-decoration .stats-decoration-icon-wrap .stats-decoration-icon {
          fill: #fff;
        }

        .stats-decoration .stats-decoration-text {
          color: #9aa4bf !important;
        }

        .tab-box .tab-box-option .tab-box-option-title .highlighted {
          color: #fff;
        }

        .featured-stat-box {
          border-radius: 12px !important;
          background-color: #1d2333 !important;
          box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.06);
        }

        .featured-stat-box .featured-stat-box-cover .featured-stat-box-cover-text,
        .featured-stat-box .featured-stat-box-cover .featured-stat-box-cover-title {
          color: #fff !important;
        }

        .featured-stat-box .featured-stat-box-text {
          color: #9aa4bf !important;
        }

        .level-progress-box {
          border-radius: 12px !important;
          background-color: #1d2333 !important;
          box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.06);
        }

        .draggable-items {
          display: grid !important;
          grid-template-columns: repeat(auto-fit, 60px) !important;
          grid-gap: 24px;
        }

        .draggable-item {
          display: -ms-flexbox !important;
          display: flex !important;
          -ms-flex-align: center !important;
          align-items: center !important;
          width: 60px !important;
          height: 60px !important;
          border-radius: 12px !important;
          background-color: #21283b !important;
          box-shadow: 3px 5px 20px 0 rgba(0, 0, 0, 0.1) !important;
          cursor: pointer;
        }

        .table .table-column .table-title .highlighted {
          color: #fff;
        }

        .table .table-column .table-text .light {
          color: #9aa4bf;
        }

        .table .table-column .table-link .highlighted {
          color: #fff;
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

        .user-status .user-status-title .highlighted {
          color: #fff !important;
          font-weight: 600;
        }

        .user-status .user-status-text a {
          color: #9aa4bf;
        }

        .cart-item-preview .cart-item-preview-title a {
          color: #fff !important;
          font-weight: 700;
        }

        .cart-item-preview .cart-item-preview-price .highlighted {
          color: #fff;
        }

        .cart-preview-total .cart-preview-total-text .highlighted {
          color: #fff;
        }

        .dropdown-box .dropdown-box-header .dropdown-box-header-title .highlighted {
          color: #fff;
        }

        .dropdown-box-actions .dropdown-box-action .button {
          width: 156px;
        }

        .dropdown-navigation .dropdown-navigation-link .highlighted {
          float: right !important;
          color: #fff;
        }

        .navigation-widget .navigation-widget-info-wrap .navigation-widget-info .navigation-widget-info-title a {
          color: #fff !important;
          font-weight: 700;
        }

        .navigation-widget .navigation-widget-section-link .highlighted {
          float: right !important;
          color: #fff;
        }

        .post-peek .post-peek-title a {
          color: #fff !important;
          font-weight: 700;
        }

        .post-preview-line .post-preview-line-title a {
          color: #fff !important;
          font-weight: 700;
        }

        .post-preview-line .post-preview-line-author a {
          color: #fff !important;
          font-weight: 700;
        }

        .post-comment .post-comment-text .highlighted {
          color: #fff !important;
          font-weight: 700;
        }

        .post-comment-heading .highlighted {
          color: #fff;
        }

        .post-open .post-open-body .post-open-heading .post-open-timestamp .highlighted {
          margin-right: 12px !important;
          color: #fff;
        }

        .product-preview.small .product-preview-info .text-sticker {
          right: -8px;
        }

        .product-preview.tiny .product-preview-info .product-preview-creator a {
          color: #9aa4bf !important;
          font-weight: 700;
        }

        .product-preview .product-preview-info .text-sticker {
          position: absolute !important;
          top: -14px !important;
          right: 14px;
        }

        .product-preview .product-preview-info .product-preview-category a,
        .product-preview .product-preview-info .product-preview-title a {
          color: #fff !important;
          font-weight: 700;
        }

        .product-preview .product-preview-info .button {
          margin-top: 36px;
        }

        .product-preview .product-preview-author .product-preview-author-text a {
          color: #fff !important;
          font-weight: 700;
        }

        .stream-box .stream-box-info .stream-box-title a {
          color: #fff !important;
          font-weight: 700;
        }

        .stream-box .stream-box-info .stream-box-text a {
          color: #9aa4bf !important;
          font-weight: 500;
        }

        .video-status .video-status-info .video-status-title .highlighted {
          color: #fff !important;
          font-weight: 700;
        }

        .reaction-item-list .reaction-item .simple-dropdown .simple-dropdown-text:first-child {
          margin-bottom: 10px;
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

        .user-preview .user-preview-author .user-preview-author-text a {
          color: #fff !important;
          font-weight: 700;
        }

        .user-preview .user-preview-footer .user-preview-footer-action.full .button {
          width: 100%;
        }

        .user-preview .user-preview-footer .user-preview-footer-action .button {
          width: 64px !important;
          height: 44px;
        }

        .user-preview.landscape .user-preview-info .user-preview-actions .button:last-child,
        .user-preview.landscape .user-preview-info .user-preview-actions .tag-sticker:last-child {
          margin-bottom: 0;
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

        .popup-box .popup-box-body .popup-box-content .widget-box {
          box-shadow: none;
        }

        .popup-box .popup-box-subtitle .light {
          color: #9aa4bf !important;
          font-weight: 500;
        }

        .popup-box .widget-box .form .form-row {
          padding: 0;
        }

        .badge-item-stat {
          padding: 32px 28px !important;
          border-radius: 12px !important;
          background-color: #1d2333 !important;
          box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.06) !important;
          position: relative;
        }

        .badge-item-stat .badge-item-stat-image-preview {
          position: absolute !important;
          top: 32px !important;
          left: 28px;
        }

        .badge-item-stat .badge-item-stat-image {
          display: block !important;
          margin: 0 auto;
        }

        .badge-item-stat .badge-item-stat-title {
          margin-top: 36px !important;
          font-size: 18px !important;
          font-weight: 700 !important;
          text-align: center;
        }

        .badge-item-stat .badge-item-stat-text {
          width: 180px !important;
          margin: 16px auto 0 !important;
          color: #9aa4bf !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          line-height: 1.4285714286em !important;
          text-align: center;
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

        .quest-preview-list .quest-preview {
          margin-bottom: 28px;
        }

        .quest-preview-list .quest-preview:last-child {
          margin-bottom: 0;
        }

        .quest-preview .quest-preview-info {
          padding: 2px 8px 0 42px !important;
          position: relative;
        }

        .quest-preview .quest-preview-info .quest-preview-image {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          z-index: 1;
        }

        .quest-preview .quest-preview-info .quest-preview-title {
          font-size: 14px !important;
          font-weight: 700;
        }

        .quest-preview .quest-preview-info .quest-preview-text {
          margin-top: 4px !important;
          color: #9aa4bf !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          line-height: 1.3333333333em;
        }

        .quest-preview .progress-stat {
          margin-top: 16px;
        }

        .quest-item .text-sticker {
          position: absolute !important;
          top: 10px !important;
          right: -6px;
        }

        .forum-post .forum-post-user .forum-post-user-title a {
          color: #fff !important;
          font-weight: 700;
        }

        .forum-post .forum-post-user .forum-post-user-text a {
          color: #9aa4bf !important;
          font-weight: 500;
        }

        .forum-post .forum-post-user .forum-post-user-text a:hover {
          color: #fff;
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

        .section-header-info .section-title .highlighted {
          color: #fff;
        }

        .section-filters-bar .section-filters-bar-title a {
          color: #fff !important;
        }

        .section-filters-bar .section-filters-bar-text .highlighted {
          color: #fff !important;
        }
      }
      .dark-mode.active {
        fill: #fff !important;
      }
      .dark-mode.form-input label {
        color: #9aa4bf !important;
      }
      .dark-mode.interactive-input.dark input {
        background-color: #5538b5 !important;
        color: #fff;
      }
      .dark-mode.interactive-input.dark input:-ms-input-placeholder {
        color: #8b88ff !important;
        opacity: 0.6;
      }
      .dark-mode.icon-more-dots {
        fill: #fff !important;
      }
      .dark-mode h1,
      .dark-mode h2,
      .dark-mode h3,
      .dark-mode h4,
      h5,
      .dark-mode .special-span p a {
        color: #fff !important;
      }
      .dark-mode a:hover {
        color: #fff !important;
      }
      .dark-mode.button {
        background-color: #293249 !important;
        color: #fff !important;
        border: 1px solid #293249 !important;
      }
      .dark-mode.button:hover {
        color: #fff !important;
        background-color: #323e5b !important;
      }
      .dark-mode.button .button-icon {
        fill: #fff !important;
        transition: fill 0.2s ease-in-out;
      }
      .dark-mode.action-list.dark .action-list-item.active .action-list-item-icon,
      .action-list.dark .action-list-item.unread .action-list-item-icon,
      .action-list.dark .action-list-item:hover .action-list-item-icon {
        fill: #fff;
      }
      .dark-mode.action-list.dark .action-list-item .action-list-item-icon {
        fill: #9b7dff;
      }
      .dark-mode.action-list .action-list-item.active .action-list-item-icon,
      .action-list .action-list-item.unread .action-list-item-icon,
      .action-list .action-list-item:hover .action-list-item-icon {
        fill: #3e3f5e;
      }
      .dark-mode.action-list .action-list-item .action-list-item-icon {
        fill: #dbf5fe !important;
        transition: fill 0.3s ease-in-out;
      }
      .dark-mode.user-short-description .user-short-description-title a {
        color: #fff !important;
      }
      .dark-mode.user-short-description .user-short-description-text a {
        color: #9aa4bf !important;
      }
      .dark-mode.user-short-description .user-short-description-text a:hover {
        color: #fff;
      }
      .dark-mode.text-sticker {
        background-color: #293249 !important;
        box-shadow: 3px 5px 20px 0 rgba(0, 0, 0, 0.12) !important;
      }
      .dark-mode.text-sticker .highlighted {
        color: #fff;
      }
      .dark-mode.text-sticker .text-sticker-icon {
        margin-right: 4px !important;
        fill: #fff !important;
      }
      .dark-mode.simple-dropdown {
        background-color: #293249 !important;
        box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.12);
      }
      .dark-mode.simple-dropdown .simple-dropdown-link:hover {
        color: #fff;
      }
      .dark-mode.tweet .tweet-text .highlighted {
        color: #fff !important;
      }
      .dark-mode.meta-line .meta-line-text a {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.post-settings .post-settings-icon {
        fill: #616a82 !important;
        opacity: 0.4 !important;
        transition: opacity 0.2s ease-in-out, fill 0.2s ease-in-out;
      }
      .dark-mode.post-settings.active .post-settings-icon,
      .post-settings:hover .post-settings-icon {
        fill: #fff !important;
        opacity: 1;
      }
      .dark-mode.simple-accordion .simple-accordion-header .simple-accordion-icon .icon-minus-small,
      .simple-accordion .simple-accordion-header .simple-accordion-icon .icon-plus-small {
        fill: #fff;
      }
      .dark-mode.forum-category .forum-category-info .forum-category-link a {
        color: #fff !important;
      }
      .dark-mode.forum-category .forum-category-info .forum-category-link a:hover {
        color: #fff;
      }
      .dark-mode.discussion-preview .discussion-preview-meta .discussion-preview-meta-text a {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.stats-box .stats-box-diff .stats-box-diff-icon.positive .icon-plus-small {
        fill: #fff;
      }
      .dark-mode.banner-promo img {
        width: 100% !important;
        height: 100% !important;
        border-radius: 12px;
      }
      .dark-mode.stats-decoration {
        background-color: #1d2333 !important;
        box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.06) !important;
      }
      .dark-mode.stats-decoration .stats-decoration-icon-wrap .stats-decoration-icon {
        fill: #fff;
      }
      .dark-mode.stats-decoration .stats-decoration-text {
        color: #9aa4bf !important;
      }
      .dark-mode.tab-box .tab-box-option .tab-box-option-title .highlighted {
        color: #fff;
      }
      .dark-mode.featured-stat-box {
        border-radius: 12px !important;
        background-color: #1d2333 !important;
        box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.06);
      }
      .dark-mode.featured-stat-box .featured-stat-box-cover .featured-stat-box-cover-text,
      .featured-stat-box .featured-stat-box-cover .featured-stat-box-cover-title {
        color: #fff !important;
      }
      .dark-mode.featured-stat-box .featured-stat-box-text {
        color: #9aa4bf !important;
      }
      .dark-mode.level-progress-box {
        border-radius: 12px !important;
        background-color: #1d2333 !important;
        box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.06);
      }
      .dark-mode.draggable-items {
        display: grid !important;
        grid-template-columns: repeat(auto-fit, 60px) !important;
        grid-gap: 24px;
      }
      .dark-mode.draggable-item {
        display: -ms-flexbox !important;
        display: flex !important;
        -ms-flex-align: center !important;
        align-items: center !important;
        width: 60px !important;
        height: 60px !important;
        border-radius: 12px !important;
        background-color: #21283b !important;
        box-shadow: 3px 5px 20px 0 rgba(0, 0, 0, 0.1) !important;
        cursor: pointer;
      }
      .dark-mode.table .table-column .table-title .highlighted {
        color: #fff;
      }
      .dark-mode.table .table-column .table-text .light {
        color: #9aa4bf;
      }
      .dark-mode.table .table-column .table-link .highlighted {
        color: #fff;
      }
      .dark-mode.widget-box {
        background-color: #1d2333 !important;
      }
      .dark-mode.widget-box .widget-box-title .highlighted {
        color: #fff;
      }
      .dark-mode.widget-box .widget-box-text.light {
        color: #9aa4bf;
      }
      .dark-mode.widget-box .widget-box-status .content-actions {
        margin-top: 28px !important;
        border-top: 1px solid #2f3749;
      }
      .dark-mode.progress-stat .bar-progress-wrap .bar-progress-info {
        color: #fff !important;
      }
      .dark-mode.progress-stat .bar-progress-wrap .bar-progress-info.negative {
        color: #fff;
      }
      .dark-mode.progress-stat .bar-progress-wrap .bar-progress-info .light {
        color: #9aa4bf;
      }
      .dark-mode.progress-stat .progress-stat-info {
        color: #9aa4bf !important;
      }
      .dark-mode.user-status .user-status-title .highlighted {
        color: #fff !important;
        font-weight: 600;
      }
      .dark-mode.user-status .user-status-text a {
        color: #9aa4bf;
      }
      .dark-mode.cart-item-preview .cart-item-preview-title a {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.cart-item-preview .cart-item-preview-price .highlighted {
        color: #fff;
      }
      .dark-mode.cart-preview-total .cart-preview-total-text .highlighted {
        color: #fff;
      }
      .dark-mode.dropdown-box .dropdown-box-header .dropdown-box-header-title .highlighted {
        color: #fff;
      }
      .dark-mode.dropdown-box-actions .dropdown-box-action .button {
        width: 156px;
      }
      .dark-mode.dropdown-navigation .dropdown-navigation-link .highlighted {
        float: right !important;
        color: #fff;
      }
      .dark-mode.navigation-widget .navigation-widget-info-wrap .navigation-widget-info .navigation-widget-info-title a {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.navigation-widget .navigation-widget-section-link .highlighted {
        float: right !important;
        color: #fff;
      }
      .dark-mode.post-peek .post-peek-title a {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.post-preview-line .post-preview-line-title a {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.post-preview-line .post-preview-line-author a {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.post-comment .post-comment-text .highlighted {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.post-comment-heading .highlighted {
        color: #fff;
      }
      .dark-mode.post-open .post-open-body .post-open-heading .post-open-timestamp .highlighted {
        margin-right: 12px !important;
        color: #fff;
      }
      .dark-mode.product-preview.small .product-preview-info .text-sticker {
        right: -8px;
      }
      .dark-mode.product-preview.tiny .product-preview-info .product-preview-creator a {
        color: #9aa4bf !important;
        font-weight: 700;
      }
      .dark-mode.product-preview .product-preview-info .text-sticker {
        position: absolute !important;
        top: -14px !important;
        right: 14px;
      }
      .dark-mode.product-preview .product-preview-info .product-preview-category a,
      .product-preview .product-preview-info .product-preview-title a {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.product-preview .product-preview-info .button {
        margin-top: 36px;
      }
      .dark-mode.product-preview .product-preview-author .product-preview-author-text a {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.stream-box .stream-box-info .stream-box-title a {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.stream-box .stream-box-info .stream-box-text a {
        color: #9aa4bf !important;
        font-weight: 500;
      }
      .dark-mode.video-status .video-status-info .video-status-title .highlighted {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.reaction-item-list .reaction-item .simple-dropdown .simple-dropdown-text:first-child {
        margin-bottom: 10px;
      }
      .dark-mode.user-preview .user-preview-info .user-preview-actions .button {
        width: 100% !important;
        margin-right: 16px;
      }
      .dark-mode.user-preview .user-preview-info .user-preview-actions .button:last-child {
        margin-right: 0;
      }
      .dark-mode.user-preview .user-preview-info .user-preview-actions .button .button-icon {
        fill: #fff;
      }
      .dark-mode.user-preview .user-preview-author .user-preview-author-text a {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.user-preview .user-preview-footer .user-preview-footer-action.full .button {
        width: 100%;
      }
      .dark-mode.user-preview .user-preview-footer .user-preview-footer-action .button {
        width: 64px !important;
        height: 44px;
      }
      .dark-mode.album-preview .text-sticker {
        position: absolute !important;
        top: 18px !important;
        right: 18px !important;
        z-index: 3 !important;
        pointer-events: none;
      }
      .dark-mode.popup-box .popup-box-body .popup-box-sidebar .popup-box-sidebar-footer .button {
        margin-bottom: 16px;
      }
      .dark-mode.popup-box .popup-box-body .popup-box-sidebar .popup-box-sidebar-footer .button:last-child {
        margin-bottom: 0;
      }
      .dark-mode.popup-box .popup-box-body .popup-box-content .widget-box {
        box-shadow: none;
      }
      .dark-mode.popup-box .popup-box-subtitle .light {
        color: #9aa4bf !important;
        font-weight: 500;
      }
      .dark-mode.popup-box .widget-box .form .form-row {
        padding: 0;
      }
      .dark-mode.badge-item-stat {
        padding: 32px 28px !important;
        border-radius: 12px !important;
        background-color: #1d2333 !important;
        box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.06) !important;
        position: relative;
      }
      .dark-mode.badge-item-stat .text-sticker {
        position: absolute !important;
        top: 10px !important;
        right: -6px;
      }
      .dark-mode.badge-item-stat .badge-item-stat-image-preview {
        position: absolute !important;
        top: 32px !important;
        left: 28px;
      }
      .dark-mode.badge-item-stat .badge-item-stat-image {
        display: block !important;
        margin: 0 auto;
      }
      .dark-mode.badge-item-stat .badge-item-stat-title {
        margin-top: 36px !important;
        font-size: 18px !important;
        font-weight: 700 !important;
        text-align: center;
      }
      .dark-mode.badge-item-stat .badge-item-stat-text {
        width: 180px !important;
        margin: 16px auto 0 !important;
        color: #9aa4bf !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        line-height: 1.4285714286em !important;
        text-align: center;
      }
      .dark-mode.badge-item-stat .progress-stat {
        max-width: 204px !important;
        margin: 54px auto 0;
      }
      .dark-mode.streamer-box.small .streamer-box-info .button {
        margin-top: 28px;
      }
      .dark-mode.streamer-box .streamer-box-info .button {
        margin-top: 40px !important;
        width: 100%;
      }
      .dark-mode.event-preview .button {
        width: 100% !important;
        margin-top: 38px;
      }
      .dark-mode.quest-preview-list .quest-preview {
        margin-bottom: 28px;
      }
      .dark-mode.quest-preview-list .quest-preview:last-child {
        margin-bottom: 0;
      }
      .dark-mode.quest-preview .quest-preview-info {
        padding: 2px 8px 0 42px !important;
        position: relative;
      }
      .dark-mode.quest-preview .quest-preview-info .quest-preview-image {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        z-index: 1;
      }
      .dark-mode.quest-preview .quest-preview-info .quest-preview-title {
        font-size: 14px !important;
        font-weight: 700;
      }
      .dark-mode.quest-preview .quest-preview-info .quest-preview-text {
        margin-top: 4px !important;
        color: #9aa4bf !important;
        font-size: 12px !important;
        font-weight: 500 !important;
        line-height: 1.3333333333em;
      }
      .dark-mode.quest-preview .progress-stat {
        margin-top: 16px;
      }
      .dark-mode.quest-item .text-sticker {
        color: white;
      }
      .dark-mode.quest-item .progress-stat {
        max-width: 228px !important;
        margin-top: 48px;
      }
      .dark-mode.forum-post .forum-post-user .forum-post-user-title a {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.forum-post .forum-post-user .forum-post-user-text a {
        color: #9aa4bf !important;
        font-weight: 500;
      }
      .dark-mode.forum-post .forum-post-user .forum-post-user-text a:hover {
        color: #fff;
      }
      .dark-mode.slider-panel .slider-panel-roster .button {
        width: 180px !important;
        margin-right: 28px !important;
        position: relative !important;
        z-index: 2;
      }
      .dark-mode.demo-box .button {
        margin-top: 36px !important;
        overflow: hidden !important;
        position: relative;
      }
      .dark-mode.demo-box .button .active-text,
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
      .dark-mode.demo-box .button .active-text {
        -webkit-transform: translateY(100%) !important;
        transform: translateY(100%);
      }
      .dark-mode.header .header-actions .progress-stat {
        width: 110px;
      }
      .dark-mode.header .header-actions .login-form .button {
        width: 52px !important;
        height: 52px !important;
        -ms-flex-negative: 0 !important;
        flex-shrink: 0;
      }
      .dark-mode.section-header-info .section-title .highlighted {
        color: #fff;
      }
      .dark-mode.section-filters-bar .section-filters-bar-title a {
        color: #fff !important;
      }
      .dark-mode.section-filters-bar .section-filters-bar-text .highlighted {
        color: #fff !important;
      }
      .dark-mode.table .table-row {
        background-color: #1d2333 !important;
        height: 100px;
      }
      .dark-mode a,
      .dark-mode h1,
      .dark-mode h2,
      .dark-mode h3,
      .dark-mode h4,
      .dark-mode h5,
      .dark-mode h6,
      .dark-mode p,
      .dark-mode .quest-item .quest-item-title,
      .dark-mode .quest-item-meta-title {
        color: white;
      }
      .dark-mode .badge-item-stat {
        background-color: transparent !important;
      }
      .dark-mode input[type='password'],
      .dark-mode input[type='text'],
      .dark-mode select,
      .dark-mode textarea {
        background-color: #1d2333 !important;
        border: 1px solid #3f485f !important;
        color: #fff !important;
        transition: border-color 0.2s ease-in-out;
      }
      .dark-mode.color-invert {
        filter: invert(1);
      }
      .dark-mode .badge-item-stat .badge-item-stat-text {
        color: #b9b9b9 !important;
      }
      .dark-mode.quest-preview-text {
        color: #b9b9b9 !important;
      }
      .dark-mode.progress-stat .bar-progress-wrap .bar-progress-info.negative {
        color: #adafca !important;
      }
      .rtl {
        .section-banner {
          transform: scaleX(-1) !important;
        }
        .section-banner-text,
        .section-banner-title {
          transform: scaleX(-1) !important;
        }
        .widget-box .widget-box-settings {
          right: auto !important;
          left: 19px !important;
        }
        .form-input-decorated .form-input-icon {
          right: auto !important;
          left: 20px !important;
          transform: scaleX(-1);
        }
        .stats-decoration.v2 .percentage-diff,
        .level-progress-box .percentage-diff {
          right: auto !important;
          left: 28px !important;
        }
        .quest-preview .quest-preview-info .quest-preview-image {
          right: 0 !important;
          left: auto !important;
        }
        .quest-preview .quest-preview-info .quest-preview-title,
        .quest-preview .quest-preview-info .quest-preview-text {
          margin-right: 35px;
        }
        @media (min-width: 1200px) {
          .coin-card {
            padding-right: 15px !important;
            padding-left: 0px !important;
          }

          .special-col-margin-1 {
            padding-right: 0 !important;
          }
          .special-flex {
            flex: auto !important;
          }
        }
        .form-input-decorated input[type='text'] {
          padding-right: 0px !important;
        }
      }

      .dark-mode.stats-decoration {
        background-color: #1d2333 !important;
      }
      .dark-mode.draggable-item {
        background-color: #21283b !important;
      }

      .xm-tooltip-text {
        padding: 0 12px !important;
        border-radius: 200px !important;
        background-color: #293249 !important;
        color: #fff !important;
        font-size: 12px !important;
        font-weight: 700 !important;
        line-height: 24px;
      }

      .xm-tooltip,
      .rm-tooltip {
        white-space: nowrap;
        position: absolute;
        z-index: 99999;
        margin-bottom: -12px;
        transform: translate(0px, 20px);
        transition: all 0.3s ease-in-out;
        opacity: 0;
        visibility: hidden;
      }

      .perform-svg:hover .xm-tooltip {
        opacity: 1;
        visibility: visible;
        transform: translate(0px, -10px);
      }

      .quest-tool:hover .rm-tooltip {
        opacity: 1;
        visibility: visible;
        transform: translate(0px, -10px);
      }

      .left-x {
        left: 5px !important;
      }
      .pl-0 {
        padding-left: 0 !important;
      }
      .text-truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .progress-stat .bar-progress-wrap:first-child {
        margin-bottom: -5px;
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
        .widget-box .widget-box-content {
          margin-top: 15px;
        }
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
      // .progress-stat .bar-progress-wrap .bar-progress-info {
      //   color: #fff !important;
      // }

      // .progress-stat .bar-progress-wrap .bar-progress-info.negative {
      //   color: #fff;
      // }

      // .progress-stat .bar-progress-wrap .bar-progress-info .light {
      //   color: #9aa4bf;
      // }

      .progress-stat .progress-stat-info {
        color: #9aa4bf !important;
      }

      .badge-item-stat .progress-stat {
        max-width: 204px !important;
        margin: 54px auto 0;
      }

      .progress-arc-wrap .progress-arc-info .progress-arc-text {
        color: #9aa4bf !important;
      }

      .progress-arc-summary .progress-arc-summary-info .progress-arc-summary-subtitle {
        color: #9aa4bf !important;
      }

      ::placeholder {
        font-size: 14px !important;
      }
      .owl-carousel .owl-item {
        display: grid !important;
        place-items: center !important;
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  @Input() connectButton: boolean;

  rtl;
  state = '';
  activeModal;
  country = '';
  position: any;
  statisticsPath;
  headerImagePath;
  progress: number;
  darkMode: boolean;
  isLoaded: boolean;
  genders: string[];
  baseUrl = BASE_URL;
  initialValues: any;
  userForm: FormGroup;
  media: SocialType[];
  pos: PointOfSaleType;
  starIcon: PictureType;
  selectedWorkIndex = 0;
  authenticated: boolean;
  giftPhoto: PictureType;
  isButtonDisabled = true;
  countries: CountryType[];
  referraleRference: string;
  overviewIcon: PictureType;
  performedIcon: PictureType;
  selectedEducationIndex = 0;
  banner1Picture: PictureType;
  banner2Picture: PictureType;
  progressBarColor = '#41efff';
  chartBackground: PictureType;
  languageNames: string[] = [];
  roundedStarPhoto: PictureType;
  maritalStatus: MaritalStatus[];
  levelNumberPicture: PictureType;
  languageList: LanguageType[] = [];
  userCards: CorporateUserCardType[];
  bannerReactionPicture: PictureType;
  hobbyControl = new FormControl('');
  wallet: WalletWithReputationDtoType;
  selectedCard: CorporateUserCardType;
  loyaltySettings: LoyaltySettingsType;
  widgetSettings: WidgetIntegrationType;
  interestControl = new FormControl('');
  codeInputControl = new FormControl('');
  lossDate: CurrentUserReputationsLossDateType;
  reputationLevels: ReputationWithoutTargetType[];
  completeProfile: ProfileCompletnessProgressType;
  academicLevels: string[] = values(AcademicLevel);
  stateInputControl: FormControl = new FormControl();
  levels: LoyaltySettingsProfileCompleteLevelsType[];
  validateBarcode = this.validationHelper.validateBarcode;
  products: InternalProductWithRatingsWithFavoriteStatusType[];
  levelColor$: Observable<string> = this.playerService.levelColor$;
  vibrating$: Observable<boolean> = this.highlightService.vibrating$;
  isFinalLevel$: Observable<boolean> = this.playerService.isFinalLevel$;
  currentUser$: Observable<UserType> = this.profileService.currentUser$;
  remainingPoints$: Observable<number> = this.playerService.remainingPoints$;
  loadingProducts$: Observable<boolean> = this.playerService.loadingProducts$;
  quantitativeWallet$: Observable<any> = this.playerService.quantitativeWallet$;
  quests$: Observable<QuestPerformedType[] | QuestType[]> = this.questsService.quests$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.playerService.loyaltySettings$;
  widgetSettings$: Observable<WidgetIntegrationType> = this.playerService.widgetSettings$;
  currentLevelPercentage$: Observable<number> = this.playerService.currentLevelPercentage$;
  currentLevel$: Observable<ReputationWithoutTargetType> = this.playerService.currentLevel$;

  productsCarousel: OwlOptions = {
    autoplay: false,
    autoplayTimeout: 8000,
    margin: 20,
    loop: true,
    dots: true,
    rtl: false,
    responsive: {
      0: { items: 1 },
      450: { items: 2 },
      600: { items: 3 },
      1000: { items: 4 },
      1300: { items: 5 },
    },
  };
  isDragging: boolean;

  get work(): FormArray {
    return this.userForm.get('work') as FormArray;
  }

  get education(): FormArray {
    return this.userForm.get('education') as FormArray;
  }

  get interests(): FormArray {
    return this.userForm.get('interests') as FormArray;
  }

  get hobbies(): FormArray {
    return this.userForm.get('hobbies') as FormArray;
  }

  constructor(
    private element: ElementRef,
    private clipboard: Clipboard,
    private cd: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    public translate: TranslateService,
    private modalService: ModalService,
    public cookiesService: CookieService,
    private questsService: QuestsService,
    private playerService: PlayerService,
    private profileService: ProfileService,
    public languageService: LanguageService,
    private highlightService: HighlightService,
    private validationHelper: ValidationHelper,
    private transactionsService: TransactionsService,
  ) {
    this.genders = filter(Object.values(Gender), (status) => status !== Gender.PREFER_NOT_TO_SAY);
    this.maritalStatus = filter(Object.values(MaritalStatus), (status) => status !== MaritalStatus.PREFER_NOT_TO_SAY);
    this.playerService.widgetVisuals$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widgetVisuals) => {
      if (widgetVisuals) {
        this.overviewIcon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_OVERVIEW_ICON').picture;
        this.starIcon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_STAR').picture;
        this.performedIcon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_PERFORMED_BADGE').picture;
        this.roundedStarPhoto = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_ROUNDED_STAR').picture;
        this.giftPhoto = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_GIFT').picture;
        this.chartBackground = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_CHART_BACKGROUND').picture;
        this.levelNumberPicture = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_LEVEL_NUMBER').picture;
        this.banner1Picture = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_BANNER_01').picture;
        this.banner2Picture = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_BANNER_02').picture;
        this.bannerReactionPicture = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_BANNER_REACTION').picture;
        this.cd.markForCheck();
      }
    });
    this.playerService.authenticated$.pipe(takeUntil(this.unsubscribeAll)).subscribe((authenticated) => {
      if (authenticated) {
        this.authenticated = authenticated;
      }
    });
    if (this.authenticated) {
      combineLatest([
        this.profileService.completeProfile$,
        this.playerService.pos$,
        this.playerService.currentLevelPercentage$,
        this.playerService.nextLevel$,
        this.playerService.loyaltySettings$,
        this.playerService.isFinalLevel$,
        this.playerService.currentLevel$,
      ])
        .pipe(
          takeUntil(this.unsubscribeAll),
          rxMap(([completeProfile, pos, currentLevelPercentage, nextLevel, loyaltySettings, isFinalLevel, currentLevel]) => {
            this.completeProfile = completeProfile;
            this.loyaltySettings = loyaltySettings;
            this.levels = map(completeProfile?.levels, (profileLevel, i) => {
              const settingsLevel = find(loyaltySettings?.profileComplete?.levels, { name: profileLevel.name }) || { elements: [] };
              const missingElements: ProfileCompleteElementsEnum[] = difference(settingsLevel.elements, profileLevel.elements);
              let saveButton;
              if (
                (missingElements?.length === 1 &&
                  (missingElements[0] === ProfileCompleteElementsEnum.VERIFY_EMAIL ||
                    missingElements[0] === ProfileCompleteElementsEnum.VERIFY_PHONE)) ||
                (missingElements?.length === 2 &&
                  missingElements.includes(ProfileCompleteElementsEnum.VERIFY_EMAIL) &&
                  missingElements.includes(ProfileCompleteElementsEnum.VERIFY_PHONE))
              ) {
                saveButton = false;
              } else {
                saveButton = true;
              }
              return {
                ...profileLevel,
                missingElements,
                saveButton,
              };
            }).filter((level) => level.missingElements?.length > 0);
            this.completeProfile = {
              ...completeProfile,
              ...this.levels,
            };
            this.pos = pos;
            setTimeout(() => {
              const fillElement = this.element.nativeElement.shadowRoot.querySelector('.fill') as HTMLElement;
              if (fillElement) {
                fillElement.style.strokeDashoffset = `${((100 - (!isFinalLevel ? currentLevelPercentage : 100)) / 100) * 2160}px`;
                fillElement.style.stroke =
                  !nextLevel && !isFinalLevel ? loyaltySettings?.prelevel?.color : isFinalLevel ? currentLevel?.color : nextLevel?.color;
              }
              this.cd.markForCheck();
            }, 2000);
            this.cd.markForCheck();
          }),
        )
        .subscribe();
        if (this.loyaltySettings?.aggregator?.target?.pos?.id) {
          this.playerService.findLoyaltySettingsByTarget(this.loyaltySettings?.aggregator?.target?.pos?.id).subscribe();
        }
      this.playerService.filtredProducts$.pipe(takeUntil(this.unsubscribeAll)).subscribe((filtredProducts) => {
        if (filtredProducts) {
          this.products = filtredProducts.objects;
        }
      });
      this.playerService.userToken$.subscribe((token) => {
        if (!token) {
          this.playerService.getCurrentUserQuantitativeWallets().subscribe();
        }
      });
      combineLatest([
        this.playerService.getCorporateUserCardByUserAndTarget(),
        this.questsService.getQuestsByTargetAndUserAudiencePaginated(),
      ]).subscribe();
      if (this.loyaltySettings?.referral?.enable) {
        this.playerService.userToken$.subscribe((token) => {
          if (token) {
            this.playerService.getLastReferral(token).subscribe();
          } else {
            this.playerService.getLastReferral().subscribe();
          }
        });
        this.playerService.lastReferral$.pipe(takeUntil(this.unsubscribeAll)).subscribe((lastReferral) => {
          this.referraleRference = lastReferral?.reference;
          this.cd.markForCheck();
        });
      }
      this.playerService.userCard$.pipe(takeUntil(this.unsubscribeAll)).subscribe((userCards) => {
        if (userCards?.length) {
          this.userCards = userCards;
          this.selectedCard = userCards[0];
        }
      });
    }
    this.userForm = this.formBuilder.group({
      socialMedia: this.formBuilder.group({
        facebook: this.formBuilder.group({
          value: [''],
          name: [''],
        }),
        instagram: this.formBuilder.group({
          value: [''],
          name: [''],
        }),
        twitter: this.formBuilder.group({
          value: [''],
          name: [''],
        }),
        youtube: this.formBuilder.group({
          value: [''],
          name: [''],
        }),
        tikTok: this.formBuilder.group({
          value: [''],
          name: [''],
        }),
        linkedin: this.formBuilder.group({
          value: [''],
          name: [''],
        }),
        pinterest: this.formBuilder.group({
          value: [''],
          name: [''],
        }),
      }),
      work: this.formBuilder.array([
        this.formBuilder.group({
          to: [''],
          from: [''],
          city: [undefined],
          stateName: [''],
          states: [[]],
          country: [undefined],
          countryName: [''],
          company: [''],
          position: [''],
          current: [false],
          description: [''],
        }),
      ]),
      education: this.formBuilder.array([
        this.formBuilder.group({
          to: [''],
          name: [''],
          from: [''],
          city: [''],
          stateName: [''],
          states: [[]],
          country: [''],
          countryName: [''],
          level: [''],
          graduated: [false],
          description: [''],
        }),
      ]),
      phone: this.formBuilder.group({
        countryCode: [''],
        number: [''],
      }),
      email: [''],
      gender: [],
      dateOfBirth: [],
      about: [''],
      languages: [],
      firstName: [],
      interests: this.formBuilder.array([]),
      hobbies: this.formBuilder.array([]),
      maritalStatus: [],
      residentialAddress: this.formBuilder.group({
        address: [''],
        postCode: [''],
        city: [undefined],
        country: [''],
        countryName: [''],
        state: [''],
        stateName: [''],
        states: [[]],
        location: this.formBuilder.group({
          type: [ZoneTypesEnum.POINT],
          coordinates: [[]],
        }),
      }),
    });
    this.initialValues = this.userForm.value;
    this.userForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isButtonDisabled = isEqual(this.initialValues, values);
    });
  }

  ngOnInit(): void {
    this.playerService.widgetSettings$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widgetSettings) => {
      this.widgetSettings = widgetSettings;
      this.cd.markForCheck();
    });
    if (this.widgetSettings?.content?.marketplace) {
      this.playerService.getSimpleProductsForPartnerhipNetworkWithRatingsWithFavoriteStatusWithFilter().subscribe();
    }
    setTimeout(() => {
      this.isLoaded = true;
      this.cd.markForCheck();
    }, 200);
    this.playerService.frequencyLossDate$.pipe(takeUntil(this.unsubscribeAll)).subscribe((lossDate) => {
      this.lossDate = lossDate;
    });
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
    });

    this.modalService.headerImagePath$.subscribe((path) => {
      this.headerImagePath = path;
      this.cd.detectChanges();
    });

    this.modalService.statisticsPath$.subscribe((path) => {
      this.statisticsPath = path;
      this.cd.detectChanges();
    });
    this.modalService.rtl$.subscribe((direction) => {
      this.rtl = direction;
      // this.productsCarousel = {
      //   ...this.productsCarousel,
      //   rtl: direction
      // }
      this.cd.detectChanges();
    });
  }


  draggingChange() {
    this.isDragging = true;
    setTimeout(() => {
      this.isDragging = false;
    }, 500);
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

  copyText(textToCopy: string) {
    this.clipboard.copy(textToCopy);
  }

  getLossDateCountdown(): any {
    if (!this.lossDate?.lossDate) return 0;
    const lossDate = this.lossDate?.lossDate;
    if (lossDate && isAfter(parseISO(lossDate), new Date())) {
      const questDate = new Date(lossDate);
      const now = new Date();
      const difference = Math.abs(questDate.getTime() - now.getTime());
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      return { days, hours, minutes, seconds };
    } else {
      return 0;
    }
  }

  questModal(modalName: string, quest: QuestPerformedType | QuestType): void {
    this.questsService.quest$ = quest;
    this.questsService
      .getQuestActivitiesByQuest(quest.id)
      .pipe(
        switchMap((res) => {
          if (res?.[0]?.activity?.action?.definition?.form?.form?.id) {
            return this.questsService.getQuestionsByForm(res[0]?.activity?.action?.definition?.form?.form?.id);
          } else return of(null);
        }),
      )
      .subscribe();
    this.modalService.togglePopUp(modalName, this.element);
  }

  toggleModal(modalName: string, field?: string): void {
    if (modalName === 'earn') {
      const hasButtons = this.widgetSettings.content?.buttons;
      const hasCampaigns = this.widgetSettings.content?.campaigns;
      const isConverterActive = this.loyaltySettings?.prelevel?.onsiteConverter?.web?.active;
      if (!hasButtons && !isConverterActive && hasCampaigns) {
        this.modalService.togglePopUp('questsList', this.element);
      } else if (hasButtons && !isConverterActive && !hasCampaigns) {
        this.modalService.togglePopUp('buttons', this.element);
      } else if (isConverterActive) {
        this.modalService.togglePopUp(modalName, this.element);
      }
      return;
    }
    if (field === 'QUANTITATIVE') {
      this.transactionsService.walletType = WalletTypeEnum.QUANTITATIVE;
      this.transactionsService.getWalletTransactionsByAffectedPaginated().subscribe();
    } else if (field === 'QUALITATIVE') {
      this.transactionsService.walletType = WalletTypeEnum.QUALITATIVE;
      this.transactionsService.getWalletTransactionsByAffectedPaginated().subscribe();
    }
    this.modalService.togglePopUp(modalName, this.element);
  }

  closeModal() {
    this.modalService.isHidden$ = true;
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}

