import Swal from 'sweetalert2';
import { CookieService } from 'ngx-cookie-service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, combineLatest, of, switchMap, take, takeUntil, throwError } from 'rxjs';
import { ChangeDetectorRef, Component, ElementRef, HostBinding, OnInit, ViewEncapsulation } from '@angular/core';

import {
  ListenForUserLoggedInForTargetGQL,
  LoyaltySettingsType,
  PartnershipNetworkType,
  PictureType,
  PointOfSaleType,
  ReputationType,
  VisualsType,
  WidgetIntegrationType,
  WidgetVisualsType,
} from '@sifca-monorepo/widget-generator';

import { PlayerService } from '../player/player.service';
import { ACCESS_TOKEN, BASE_URL, defaultPicture } from '../../../environments/environment';
import { ModalService } from '../../shared/services/modal.service';
import { fadeAnimations } from '../../shared/animations/animations';
import { LanguageService } from '../../shared/services/language.service';
import { HighlightService } from '../../shared/services/highlight.service';
import { CircularMenuService } from '../circular-menu/circular-menu.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AppCookieService, StorageHelper } from '@diktup/frontend/helpers';
import { ProfileService } from '../player/components/profile/profile.service';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { find } from 'lodash';

@Component({
  selector: 'app-guest-mode',
  templateUrl: './guest.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  animations: [fadeAnimations],
  styles: [
    `
      @import '${BASE_URL}/assets/css/styles.min.css';
      @import '${BASE_URL}/assets/css/vendor/simplebar.css';
      @import '${BASE_URL}/assets/css/vendor/bootstrap.min.css';
      @import '${BASE_URL}/assets/css/owl/owl.carousel.min.css';
      @import '${BASE_URL}/assets/css/owl/owl.theme.default.min.css';

      :root {
        --dynamic-color: #7750f8;
        --dynamic-color2: #615dfa;
        --dynamic-color3: #45437f;
      }

      .no-hover {
        color: #000;
      }

      .no-hover:hover {
        color: #000;
        text-decoration: none;
      }

      sticky-button {
        position: sticky;
        padding: 0 !important;
        bottom: 0px;
        height: 96px;
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
      }

      .color-light {
        color: #5d5858 !important;
      }

      .color-white {
        color: #fff !important;
      }

      .user-data-leaderboard {
        background-color: var(--dynamic-color) !important;
        border-radius: 12px !important;
        display: inline-table !important;
        width: 100% !important;
      }
      .header-row {
        float: right;
        margin-top: 12px;
      }

      .special-badge-text {
        color: #fff;
        font-size: 12px;
        font-weight: 700;
        pointer-events: none;
        position: relative;
        z-index: 6;
        font-size: 16px;
      }

      .small-progress {
        width: 45px !important;
        height: 46px !important;
      }

      .small-profile-image:before {
        content: '';
        position: absolute;
        top: 0%;
        bottom: 0%;
        left: 0%;
        right: 0%;
        background: var(--i) center/cover;
        animation: inherit;
        animation-direction: reverse;
      }

      .special-margin-bottom {
        @media (min-width: 600px) {
          margin-bottom: 72px;
        }

        @media (max-width: 600px) {
          margin-bottom: 70px;
        }
      }

      .progress-edit .track {
        stroke: rgb(56, 71, 83);
      }

      .progress .track,
      .progress .fillLeaderboard {
        fill: rgba(0, 0, 0, 0);
        stroke-width: 140px;
        transform: translate(75px, 685px) rotate(-90deg);
      }

      .progress .track {
        stroke: rgb(56, 71, 83);
      }

      .progress .fillLeaderboard {
        stroke: rgb(255, 255, 255);
        stroke-linecap: round;
        stroke-dasharray: 2160;
        stroke-dashoffset: 2160;
        transition: stroke-dashoffset 1s;
      }

      .progress.blue .fillLeaderboard {
        stroke: rgb(104, 214, 198);
      }

      .popup-container {
        font-family: Rajdhani, sans-serif !important;
        position: fixed;
        top: 10.5%;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 110000;
        transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
      }

      .dark-mode .popup-picture {
        background-color: #161b28 !important;
      }

      .popup-picture {
        display: grid !important;
        position: relative;
        z-index: 100001;
        opacity: 1;
        visibility: visible;
        margin: auto;
        background-color: #f8f8fb;
        border-radius: 12px;
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
        .information-line {
          display: flex !important;
        }

        .information-line .information-line-text,
        .information-line .information-line-title {
          font-weight: 500 !important;
          line-height: 16px !important;
        }

        .special-widget-box {
          padding: 15px 25px;
        }
      }

      .popup-picture {
        max-height: 100%;
        @media (min-width: 1501px) {
          max-width: 47%;
        }

        @media (1200px<width<1500px) {
          max-width: 59%;
        }

        @media (max-width: 700px) {
          width: 90%;
        }
      }

      @media (min-width: 800px) {
        .widget-box-scrollable {
          min-height: 65vh !important;
        }
      }

      @media (600px<width<800px) {
        .widget-box-scrollable {
          max-height: 87vh !important;
        }

        .popup-container {
          top: 8% !important;
        }
      }

      @media (width<600px) {
        .popup-container {
          top: 7% !important;
        }
      }

      @media (min-width: 777px) {
        ::ng-deep.collapse-special {
          display: block !important;
        }
      }

      @media (max-width: 767px) {
        .doc-sidebar {
          border: none;
          background: #f5f5f5;
          top: 78px;
          padding: 10px 0 !important;
          z-index: 9;
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
        flex-direction: column !important;
      }

      .grid.grid-half {
        grid-template-columns: none;
      }

      ::ng-deep.quest-carousel.owl-item {
        width: auto;
      }

      ::ng-deep.owl-item {
        display: flex;
        justify-content: center;
      }

      .achievement-box {
        flex-direction: column;
        padding: 28px 18px;
      }

      .progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .appProgressBar {
        border-radius: 2px;
      }

      .badge-item-stat .progress-stat {
        max-width: 204px;
        margin: 0px auto 0;
      }

      .level-progress-box .progress-stat {
        width: 90% !important;
      }

      div.close-zone {
        position: fixed;
        width: 100%;
        top: 80%;
        bottom: 0px;
        background: rgb(255, 255, 255);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 0.5) 100%);
        -webkit-animation: slide-fwd-top 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        animation: slide-fwd-top 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;

        div.icon-close {
          display: flex;
          justify-content: center;
          align-items: center;
          -webkit-animation: slide-fwd-top 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
          animation: slide-fwd-top 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
      }

      .wrap-background {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 999;
      }

      @-webkit-keyframes slide-fwd-top {
        0% {
          -webkit-transform: translateZ(160px) translateY(100px);
          transform: translateZ(160px) translateY(100px);
        }

        100% {
          -webkit-transform: translateZ(0) translateY(0);
          transform: translateZ(0) translateY(0);
        }
      }

      @keyframes slide-fwd-top {
        0% {
          -webkit-transform: translateZ(160px) translateY(100px);
          transform: translateZ(160px) translateY(100px);
        }

        100% {
          -webkit-transform: translateZ(0) translateY(0);
          transform: translateZ(0) translateY(0);
        }
      }

      @media (min-width: 777px) {
        ::ng-deep.collapse-special {
          display: block !important;
        }
      }

      @media (min-width: 777px) {
        ::ng-deep.hello {
          display: none !important;
        }
      }

      @media (max-width: 767px) {
        .doc-sidebar {
          border: none;
          background: #f5f5f5;
          top: 78px;
          padding: 10px 0 !important;
          z-index: 9;
        }
      }

      .grid.grid-half {
        grid-template-columns: none;
      }

      ::ng-deep.owl-item {
        display: flex;
        justify-content: center;
      }

      .progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .appProgressBar {
        border-radius: 2px;
      }

      .progress-stat .bar-progress-wrap:first-child {
        margin-bottom: -5px;
      }

      // .popup-picture {
      //   @media (min-width: 701px) and (max-width: 1199px) {
      //     max-width: 70%;
      //   }
      // }

      .widget-box-modal {
        width: 100%;
        max-height: 80%;
      }

      .hidden-overflow {
        overflow: hidden auto;
      }

      .achievement-box.primary {
        background: url(${BASE_URL}/assets/img/achievement/banner/02.jpg) no-repeat 50%;
        background-size: cover;
      }

      .scrollable-content {
        max-height: 260px;
        overflow-y: auto;
      }

      .quest-preview-list {
        max-height: inherit;
      }

      .stats-decoration-title,
      .stats-decoration-subtitle,
      .stats-decoration-text,
      .percentage-diff {
        flex: 1;
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

      .disabled-level {
        filter: grayscale(1);
        opacity: 0.5;
      }

      .chat-special-view {
        padding-left: 0px !important;
        padding-right: 0px !important;
        margin-top: 0 !important;
      }

      .chat-height {
        height: 100vh;
      }

      .edit-profile-card {
        width: -webkit-fill-available;
      }

      .accordion-undisplayed {
        display: none;
      }

      .level-display {
        display: flex;
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

      .dots-dropdown-active {
        display: block;
      }

      .modal-background {
        cursor: pointer;
        width: 100%;
        height: 100%;
        background-color: rgba(21, 21, 31, 0.96);
        position: fixed;
        top: 0px;
        left: 0px;
        z-index: 100000;
        opacity: 1;
        visibility: visible;
        transition: opacity 0.3s ease-in-out 0s, visibility 0.3s ease-in-out 0s;
      }

      .timeline-information-text {
        font-weight: 500 !important;
      }

      .special-margin-bottom {
        @media (min-width: 600px) {
          margin-bottom: 72px;
        }
        @media (max-width: 600px) {
          margin-bottom: 70px;
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
      p a {
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
      .dark-mode {
        .popup-color {
          background-color: #161b28 !important;
        }
      }
      .dark-mode.widget-box {
        background-color: #1d2333 !important;
      }
      .dark-mode.level-progress-box {
        background-color: #1d2333 !important;
      }
      .button.small {
        font-weight: 800 !important;
      }
      .dark-mode.draggable-item {
        background-color: #21283b !important;
      }
      .dark-mode.button.small {
        background-color: #293249 !important;
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

      .special-bottom {
        bottom: 20px;
      }

      @media (max-width: 800px) {
        .special-bottom {
          bottom: 0px;
        }
      }

      .dark-mode .product-preview {
        border-radius: 12px !important;
        background-color: #1d2333 !important;
        box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.06);
      }

      .dark-mode .widget-exit {
        background-color: #1d2333 !important;
      }
      .text-truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .border-radius-12 {
        border-radius: 12px !important;
      }

      @media (min-width: 800px) {
        .btn-pos {
          position: relative;
          bottom: 0px;
        }
      }

      @media (800px<width<1100px) {
        .btn-pos {
          position: relative;
          bottom: 0px;
        }
      }

    `,
  ],
})
export class GuestModeComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  @HostBinding('style.--dynamic-color') dynamicColor: string = '#ffffff';
  @HostBinding('style.--dynamic-color2') dynamicColor2: string = '#ffffff';
  @HostBinding('style.--dynamic-color3') dynamicColor3: string = '#ffffff';

  embed: any;
  posId: any;
  rtl: boolean;
  isLoaded = true;
  headerImagePath;
  urlText: string;
  darkMode: boolean;
  isHidden: boolean;
  isMobile: boolean;
  baseUrl = BASE_URL;
  activeModal: string;
  dierction: boolean = false;
  defaultPicture = defaultPicture;
  isAccordionClosed: boolean[] = [];
  isPrelevelAccordionClosed: boolean;
  widgetSettings: WidgetIntegrationType;
  pos$: Observable<PointOfSaleType> = this.playerService.pos$;
  vibrating$: Observable<boolean> = this.highlightService.vibrating$;
  isFinalLevel$: Observable<boolean> = this.playerService.isFinalLevel$;
  widgetVisuals$: Observable<WidgetVisualsType[]> = this.playerService.widgetVisuals$;
  reputationLevels$: Observable<ReputationType[]> = this.playerService.reputations$;
  partnership$: Observable<PartnershipNetworkType[]> = this.playerService.partnership$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.playerService.loyaltySettings$;
  widgetSettings$: Observable<WidgetIntegrationType> = this.playerService.widgetSettings$;
  walletPushedNotification$: Observable<boolean> = this.circularMenuService.walletPushedNotification$;
  visuals: VisualsType;

  challengesCarousel: OwlOptions = {
    loop: true,
    dots: false,
    navSpeed: 700,
    lazyLoad: true,
    autoplay: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    navText: ['', ''],
    autoplayHoverPause: true,
    responsive: {
      0: {
        items: 2,
      },
      400: {
        items: 2,
      },
      740: {
        items: 2,
      },
      940: {
        items: 5,
      },
    },
    nav: false,
  };
  widgetVisuals: WidgetVisualsType[];
  cupPhoto: PictureType;
  overviewPhoto: PictureType;
  roundedStarPhoto: PictureType;
  giftPhoto: PictureType;
  earn3Photo: PictureType;
  banner2Photo: PictureType;
  banner1Photo: PictureType;
  levelNumberPhoto: PictureType;
  bannerBgPhoto: PictureType;
  loyaltySettings: LoyaltySettingsType;

  constructor(
    private element: ElementRef,
    private cd: ChangeDetectorRef,
    public translate: TranslateService,
    private modalService: ModalService,
    public storageHelper: StorageHelper,
    public cookiesService: CookieService,
    private playerService: PlayerService,
    public profileService: ProfileService,
    public languageService: LanguageService,
    public appCookieService: AppCookieService,
    private deviceInfo: DeviceDetectorService,
    private highlightService: HighlightService,
    private circularMenuService: CircularMenuService,
    private listenForUserLoggedInForTargetGQL: ListenForUserLoggedInForTargetGQL,
  ) {
    this.playerService.widgetVisuals$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widgetVisuals) => {
      this.widgetVisuals = widgetVisuals;
      if (widgetVisuals) {
        this.cupPhoto = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_TROPHY')?.picture;
        this.overviewPhoto = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_OVERVIEW_ICON').picture;
        this.roundedStarPhoto = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_ROUNDED_STAR').picture;
        this.earn3Photo = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_EARN_3').picture;
        this.banner2Photo = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_BANNER_02').picture;
        this.banner1Photo = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_BANNER_01').picture;
        this.levelNumberPhoto = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_LEVEL_NUMBER').picture;
        this.giftPhoto = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_GIFT').picture;
        this.bannerBgPhoto = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_BANNER_BG').picture;
      }
    });
    this.loyaltySettings$.pipe(take(1)).subscribe((loyaltySettings) => {
      if (loyaltySettings?.aggregator?.target?.pos?.id) {
        this.playerService.findVisualsByTarget(loyaltySettings?.aggregator?.target?.pos?.id).subscribe((res) => {
          if (res) {
            this.visuals = res;
            this.cd.markForCheck();
          }
        });
      }
    });
    this.playerService.pos$.pipe(take(1)).subscribe((pos) => {
      if (pos?.aggregator) {
        this.playerService.findVisualsByTarget().subscribe((res) => {
          if (res) {
            this.visuals = res;
            this.cd.markForCheck();
          }
        });
      }
    });
    this.isMobile = this.deviceInfo.isMobile();
    if (this.isMobile) {
      const timestampInSeconds = Math.floor(Date.now() / 1000).toString();
      this.posId = (window as any).widgetInit.appId;
      this.urlText = `//loyalcraft.com/m/lri=${timestampInSeconds}/${this.posId}`;
      this.listenForUserLoggedInForTargetGQL
        .subscribe({ reference: timestampInSeconds, target: { pos: this.posId } })
        .pipe(
          switchMap(({ data, errors }: any) => {
            if (data) {
              this.modalService.isCompleteProfile$ = true;
              this.playerService.loginVibrating$ = false;
              this.playerService.authenticated$ = true;
              this.storageHelper.setData({ [ACCESS_TOKEN]: data.listenForUserLoggedInForTarget.accessToken });
              this.appCookieService.set(ACCESS_TOKEN, data.listenForUserLoggedInForTarget.accessToken);
              this.storageHelper.setData({ elvkwdigtauth: 'true' });
              return combineLatest([
                this.profileService.currentUserComplete(),
                this.playerService.saveCurrentCorporateUserStatus(),
                this.playerService.getUserWalletWithReputations(),
                this.playerService.findPredefinedQuestsByTargetWithRepeatDate(),
              ]);
            } else if (errors) {
              this.playerService.authenticated$ = false;
              return throwError(() => new Error('Error while logging in.'));
            }
            return of(null);
          }),
        )
        .subscribe(([res]) => {
          this.storageHelper.setData({ elevkusr: res?.id });
          this.appCookieService.set('elevkusr', res?.id);
          this.modalService.toggleModal('player');
          this.modalService.togglePopUp('home');
          this.modalService.isHidden$ = false;
          this.cd.markForCheck();
        });
    }
    this.embed = (window as any).widgetInit.embed;
    this.modalService.isHidden$.pipe(take(1)).subscribe((hidden) => {
      this.isHidden = hidden;
      if (this.isHidden) {
        this.closeModal();
      }
    });
    setTimeout(() => {
      this.isLoaded = false;
      this.cd.markForCheck();
    }, 400);
    this.playerService.getReputationsByTarget().subscribe();
  }

  ngOnInit(): void {
    // this.playerService.initGoogleSignIn();
    this.playerService.loyaltySettings$.pipe(takeUntil(this.unsubscribeAll)).subscribe((loyaltySettings) => {
      this.loyaltySettings = loyaltySettings;
      this.cd.markForCheck();
    });
    this.playerService.widgetSettings$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widgetSettings) => {
      this.widgetSettings = widgetSettings;
      this.dynamicColor = widgetSettings?.theme || '#7750f8';
      this.updateColors();
      this.cd.markForCheck();
    });
    this.modalService.activeModal$.subscribe((modal) => {
      this.activeModal = modal;
    });
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
    });
    this.modalService.headerImagePath$.subscribe((path) => {
      this.headerImagePath = path;
      this.cd.detectChanges();
    });
    this.modalService.rtl$.subscribe((direction) => {
      this.rtl = direction;
      this.cd.detectChanges();
      this.updateCarouselOptions();
    });
  }

  signIn() {
    this.signOut();
    this.playerService.signIn().then((googleUser) => {
      console.log('🚀 ~ GuestModeComponent ~ this.playerService.signIn ~ googleUser:', googleUser);
      // this.user = googleUser.getBasicProfile();
      // this.loggedIn = true;
      console.log(googleUser);
    });
  }

  signOut() {
    this.playerService.signOut().then(() => {
      // this.loggedIn = false;
      // this.user = null;
    });
  }

  loginWithFacebook(): Promise<any> {
    console.log(222);
    return new Promise((resolve, reject) => {
      (window as any).FB.login(
        (response: any) => {
          console.log('🚀 ~ GuestModeComponent ~ returnnewPromise ~ response:', response);
          if (response.authResponse) {
            resolve(response.authResponse);
          } else {
            reject('User cancelled login or did not fully authorize.');
          }
        },
        { scope: 'email,public_profile' },
      );
    });
  }

  updateCarouselOptions() {
    this.challengesCarousel = {
      autoplay: true,
      autoplayTimeout: 8000,
      margin: 20,
      loop: true,
      dots: true,
      rtl: this.rtl,
      responsive: {
        0: { items: 1 },
        450: { items: 2 },
        700: { items: 3 },
        1000: { items: 4 },
        1300: { items: 5 },
      },
    };
  }

  goToHome() {
    this.circularMenuService.walletPushedNotification$ = false;
    this.modalService.modalType$ = 'player';
  }

  toggleModal(modalName: string): void {
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
    } else {
      this.modalService.togglePopUp(modalName, this.element);
    }
  }

  toggleCollapse(index: number) {
    this.isAccordionClosed[index] = !this.isAccordionClosed[index];
  }

  toggleButtonVibration() {
    this.highlightService.vibrating$.pipe(take(1)).subscribe((vibrating) => {
      this.highlightService.vibrating$ = !vibrating;
      if (!vibrating) {
        this.closeModal();
        this.translate.get('GET_REWARDED').subscribe((text: string) => {
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

  toggleLoginVibration() {
    this.playerService.loginVibrating$.pipe(take(1)).subscribe((vibrating) => {
      this.playerService.loginVibrating$ = !vibrating;
      this.modalService.isHidden$ = true;
      this.cd.markForCheck();
    });
  }

  hexToRgb(hex: string): { r: number; g: number; b: number } {
    let bigint = parseInt(hex.slice(1), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return { r, g, b };
  }

  rgbToHex(r: number, g: number, b: number): string {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

  generateSynergisticColors(mainColor: string): { color2: string; color3: string } {
    const { r, g, b } = this.hexToRgb(mainColor);
    const color2 = this.rgbToHex(Math.min(255, r + 28), Math.min(255, g + 30), Math.min(255, b + 7));
    const color3 = this.rgbToHex(Math.max(0, r - 18), Math.max(0, g - 18), Math.max(0, b - 30));
    return { color2, color3 };
  }

  updateColors(): void {
    const colors = this.generateSynergisticColors(this.dynamicColor);
    this.dynamicColor2 = colors.color2;
    this.dynamicColor3 = colors.color3;
  }

  badges = [
    {
      exp: 20,
      img: `${BASE_URL}/assets/img/badge/uexp-b.png`,
      alt: 'badge-uexp-b',
      title: 'Universe Explorer',
      text: 'Joined and posted on 20 different groups',
      progress: 17,
    },
    {
      exp: 40,
      img: `${BASE_URL}/assets/img/badge/verifieds-b.png`,
      alt: 'badge-verifieds-b',
      title: 'Verified Streamer',
      text: 'Has linked a stream that was verified by the staff',
      progress: 'unlocked!',
    },
    {
      exp: 40,
      img: `${BASE_URL}/assets/img/badge/qconq-b.png`,
      alt: 'badge-qconq-b',
      title: 'Quest Conqueror',
      text: 'Successfully completed at least 10 quests at 100%',
      progress: 10,
    },
  ];

  closeModal() {
    this.modalService.isHidden$ = true;
    this.toggleModal('home');
    this.circularMenuService.walletPushedNotification$.pipe(take(1)).subscribe((pushed) => {
      if (pushed) {
        this.circularMenuService.walletPushedNotification$ = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
