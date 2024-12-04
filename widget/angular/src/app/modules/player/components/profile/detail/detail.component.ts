import Swal from 'sweetalert2';
import { difference, find, map, random, times } from 'lodash';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Observable, Subject, catchError, combineLatest, of, takeUntil, map as rxMap } from 'rxjs';
import { ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';

import {
  UserType,
  UserWorkType,
  UserEducationType,
  LoyaltySettingsType,
  WidgetIntegrationType,
  ReputationWithoutTargetType,
  ProfileCompletnessProgressType,
  WidgetVisualsType,
  PictureType,
} from '@sifca-monorepo/widget-generator';

import { ProfileService } from '../profile.service';
import { PlayerService } from '../../../player.service';
import { ModalService } from '../../../../../shared/services/modal.service';
import { ACCESS_TOKEN, BASE_URL, defaultPicture } from '../../../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { AppCookieService, StorageHelper } from '@diktup/frontend/helpers';
@Component({
  selector: 'app-profile-detail',
  templateUrl: './detail.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
      @import '${BASE_URL}/assets/css/ng-select/themes/default.theme.css';
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
      :host {
        display: contents;
      }

      agm-map {
        height: 240px;
      }

      .gap-1 {
        gap: 4px;
      }

      @media (min-width: 1200px) {
        .display-flex {
          display: flex;
        }
      }
      .form-switch.active {
        background-color: #23d2e2;
      }
      .level-background {
        scale: 1.3;
        background-color: white !important;
        z-index: 600 !important;
      }
      .dark-mode .level-background {
        scale: 1.3;
        background-color: #161b28 !important;
        z-index: 600 !important;
      }
      .owl-carousel .owl-item {
        display: grid !important;
        place-items: center !important;
      }

      @media (min-width: 1200px) {
        .information-line .information-line-title {
          flex-shrink: 0;
          width: 66px !important;
          color: #8f91ac;
        }
      }

      .progress-stat .bar-progress-wrap:first-child {
        margin-bottom: -5px;
      }

      .widget-box {
        width: 100%;
      }
      .col-responsive-margin {
        @media (min-width: 1200px) {
          margin-top: 15px;
        }
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

      @media (max-width: 1200px) {
        .special-widget-box {
          padding: 32px 28px;
        }
        .special-col-padding {
          padding: 0px !important;
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

      ::ng-deep.level-24 .widget-box {
        padding: 0px 0px;
        border-radius: 12px;
        background-color: #fff;
        box-shadow: 0 0 40px 0 #5e5c9a0f;
        position: relative;
      }

      .level-24 .progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }
      .level-24 .timeline-information:after {
        content: none;
      }
      .level-24 .timeline-information:before {
        content: none;
      }
      .level-24 .badge-item img {
        position: relative !important;
      }

      .profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }
      .profile.profile-header .profile-header-info {
        height: auto;
        padding-bottom: 32px;
      }
      .profile.profile-header .profile-header-cover {
        height: 300px;
      }

      :host::ng-deep.quests.owl-item img {
        display: block;
        width: auto !important;
      }

      .user-avatar .user-avatar-border {
        position: absolute;
        top: 7px;
        left: 4px;
        z-index: 1;
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

      .timeline-information-text {
        font-weight: 500 !important;
      }

      .profile-cnt {
        position: relative;
      }

      .profile-image {
        width: 92px;
        left: 14px;
        bottom: -15px;
        height: 92px;
        clip-path: polygon(
          47.5% 5.66987%,
          48.2899% 5.30154%,
          49.13176% 5.07596%,
          50% 5%,
          50.86824% 5.07596%,
          51.7101% 5.30154%,
          52.5% 5.66987%,
          87.14102% 25.66987%,
          87.85495% 26.16978%,
          88.47124% 26.78606%,
          88.97114% 27.5%,
          89.33948% 28.2899%,
          89.56505% 29.13176%,
          89.64102% 30%,
          89.64102% 70%,
          89.56505% 70.86824%,
          89.33948% 71.7101%,
          88.97114% 72.5%,
          88.47124% 73.21394%,
          87.85495% 73.83022%,
          87.14102% 74.33013%,
          52.5% 94.33013%,
          51.7101% 94.69846%,
          50.86824% 94.92404%,
          50% 95%,
          49.13176% 94.92404%,
          48.2899% 94.69846%,
          47.5% 94.33013%,
          12.85898% 74.33013%,
          12.14505% 73.83022%,
          11.52876% 73.21394%,
          11.02886% 72.5%,
          10.66052% 71.7101%,
          10.43495% 70.86824%,
          10.35898% 70%,
          10.35898% 30%,
          10.43495% 29.13176%,
          10.66052% 28.2899%,
          11.02886% 27.5%,
          11.52876% 26.78606%,
          12.14505% 26.16978%,
          12.85898% 25.66987%
        );
        animation: clipRotateAnim 2s linear infinite;
        position: relative;
        overflow: hidden;
        z-index: 500;
      }
      .profile-image:before {
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
      .progress {
        width: 120px;
        height: 120px;
        clip-path: polygon(
          47.5% 5.66987%,
          48.2899% 5.30154%,
          49.13176% 5.07596%,
          50% 5%,
          50.86824% 5.07596%,
          51.7101% 5.30154%,
          52.5% 5.66987%,
          87.14102% 25.66987%,
          87.85495% 26.16978%,
          88.47124% 26.78606%,
          88.97114% 27.5%,
          89.33948% 28.2899%,
          89.56505% 29.13176%,
          89.64102% 30%,
          89.64102% 70%,
          89.56505% 70.86824%,
          89.33948% 71.7101%,
          88.97114% 72.5%,
          88.47124% 73.21394%,
          87.85495% 73.83022%,
          87.14102% 74.33013%,
          52.5% 94.33013%,
          51.7101% 94.69846%,
          50.86824% 94.92404%,
          50% 95%,
          49.13176% 94.92404%,
          48.2899% 94.69846%,
          47.5% 94.33013%,
          12.85898% 74.33013%,
          12.14505% 73.83022%,
          11.52876% 73.21394%,
          11.02886% 72.5%,
          10.66052% 71.7101%,
          10.43495% 70.86824%,
          10.35898% 70%,
          10.35898% 30%,
          10.43495% 29.13176%,
          10.66052% 28.2899%,
          11.02886% 27.5%,
          11.52876% 26.78606%,
          12.14505% 26.16978%,
          12.85898% 25.66987%
        );
      }
      .progress .track,
      .progress .fill {
        fill: rgba(0, 0, 0, 0);
        stroke-width: 140px;
        transform: translate(75px, 685px) rotate(-90deg);
      }
      .progress .track {
        stroke: rgb(56, 71, 83);
      }
      .progress .fill {
        stroke: rgb(255, 255, 255);
        stroke-linecap: round;
        stroke-dasharray: 2160;
        stroke-dashoffset: 2160;
        transition: stroke-dashoffset 1s;
      }
      .progress.blue .fill {
        stroke: rgb(104, 214, 198);
      }
      .progress-bar {
        position: absolute;
        top: 0;
      }
      .progress-bar {
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: hidden;
        color: #fff;
        text-align: center;
        white-space: nowrap;
        background-color: white;
        transition: width 0.6s ease;
        clip-path: polygon(
          47.5% 5.66987%,
          48.2899% 5.30154%,
          49.13176% 5.07596%,
          50% 5%,
          50.86824% 5.07596%,
          51.7101% 5.30154%,
          52.5% 5.66987%,
          87.14102% 25.66987%,
          87.85495% 26.16978%,
          88.47124% 26.78606%,
          88.97114% 27.5%,
          89.33948% 28.2899%,
          89.56505% 29.13176%,
          89.64102% 30%,
          89.64102% 70%,
          89.56505% 70.86824%,
          89.33948% 71.7101%,
          88.97114% 72.5%,
          88.47124% 73.21394%,
          87.85495% 73.83022%,
          87.14102% 74.33013%,
          52.5% 94.33013%,
          51.7101% 94.69846%,
          50.86824% 94.92404%,
          50% 95%,
          49.13176% 94.92404%,
          48.2899% 94.69846%,
          47.5% 94.33013%,
          12.85898% 74.33013%,
          12.14505% 73.83022%,
          11.52876% 73.21394%,
          11.02886% 72.5%,
          10.66052% 71.7101%,
          10.43495% 70.86824%,
          10.35898% 70%,
          10.35898% 30%,
          10.43495% 29.13176%,
          10.66052% 28.2899%,
          11.02886% 27.5%,
          11.52876% 26.78606%,
          12.14505% 26.16978%,
          12.85898% 25.66987%
        );
      }
      .background-profile {
        background: white;
        clip-path: polygon(
          47.5% 5.66987%,
          48.2899% 5.30154%,
          49.13176% 5.07596%,
          50% 5%,
          50.86824% 5.07596%,
          51.7101% 5.30154%,
          52.5% 5.66987%,
          87.14102% 25.66987%,
          87.85495% 26.16978%,
          88.47124% 26.78606%,
          88.97114% 27.5%,
          89.33948% 28.2899%,
          89.56505% 29.13176%,
          89.64102% 30%,
          89.64102% 70%,
          89.56505% 70.86824%,
          89.33948% 71.7101%,
          88.97114% 72.5%,
          88.47124% 73.21394%,
          87.85495% 73.83022%,
          87.14102% 74.33013%,
          52.5% 94.33013%,
          51.7101% 94.69846%,
          50.86824% 94.92404%,
          50% 95%,
          49.13176% 94.92404%,
          48.2899% 94.69846%,
          47.5% 94.33013%,
          12.85898% 74.33013%,
          12.14505% 73.83022%,
          11.52876% 73.21394%,
          11.02886% 72.5%,
          10.66052% 71.7101%,
          10.43495% 70.86824%,
          10.35898% 70%,
          10.35898% 30%,
          10.43495% 29.13176%,
          10.66052% 28.2899%,
          11.02886% 27.5%,
          11.52876% 26.78606%,
          12.14505% 26.16978%,
          12.85898% 25.66987%
        );
        width: 140px;
        height: 140px;
      }
      .user-short-description.big .user-short-description-avatar {
        top: -90px;
        margin-left: -74px;
      }
      .profile-avatar-badge {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 28px;
        width: 37px;
        height: 36px;
        position: absolute;
        top: 73px;
        right: 22px;
        z-index: 500000000;
        background-color: var(--dynamic-color3);
        clip-path: polygon(
          47.5% 5.66987%,
          48.2899% 5.30154%,
          49.13176% 5.07596%,
          50% 5%,
          50.86824% 5.07596%,
          51.7101% 5.30154%,
          52.5% 5.66987%,
          87.14102% 25.66987%,
          87.85495% 26.16978%,
          88.47124% 26.78606%,
          88.97114% 27.5%,
          89.33948% 28.2899%,
          89.56505% 29.13176%,
          89.64102% 30%,
          89.64102% 70%,
          89.56505% 70.86824%,
          89.33948% 71.7101%,
          88.97114% 72.5%,
          88.47124% 73.21394%,
          87.85495% 73.83022%,
          87.14102% 74.33013%,
          52.5% 94.33013%,
          51.7101% 94.69846%,
          50.86824% 94.92404%,
          50% 95%,
          49.13176% 94.92404%,
          48.2899% 94.69846%,
          47.5% 94.33013%,
          12.85898% 74.33013%,
          12.14505% 73.83022%,
          11.52876% 73.21394%,
          11.02886% 72.5%,
          10.66052% 71.7101%,
          10.43495% 70.86824%,
          10.35898% 70%,
          10.35898% 30%,
          10.43495% 29.13176%,
          10.66052% 28.2899%,
          11.02886% 27.5%,
          11.52876% 26.78606%,
          12.14505% 26.16978%,
          12.85898% 25.66987%
        );
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

      .popup-event-subtitle {
        margin-bottom: 32px !important;
        font-size: 16px;
        font-weight: 700;
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
      .dark-mode {
        .form-switch .form-switch-button {
          background-color: #fff !important;
        }

        .form-switch .form-switch-button:after,
        .form-switch .form-switch-button:before {
          content: '' !important;
          width: 2px !important;
          height: 8px !important;
          background-color: #1d2333 !important;
          opacity: 0.2 !important;
          position: absolute !important;
          top: 7px;
        }

        .form-switch .form-switch-button:before {
          left: 8px;
        }

        .form-switch .form-switch-button:after {
          right: 8px;
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

        .social-link.void.facebook .icon-facebook {
          fill: #3763d2;
        }

        .social-link.void.twitter .icon-twitter {
          fill: #1abcff;
        }

        .background-profile {
          background-color: #161b28 !important;
        }

        .user-short-description .user-short-description-title a {
          color: #fff !important;
        }

        .user-short-description .user-short-description-text {
          color: #9aa4bf !important;
        }

        .user-short-description .user-short-description-text a {
          color: #9aa4bf !important;
        }

        .user-short-description .user-short-description-text a:hover {
          color: #fff;
        }

        .simple-dropdown {
          background-color: #293249 !important;
          box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.12);
        }

        .simple-dropdown .simple-dropdown-link:hover {
          color: #fff;
        }

        .information-line .information-line-title {
          color: #9aa4bf;
        }

        .timeline-information:before {
          content: '' !important;
          width: 1px !important;
          height: 100% !important;
          background-color: #2f3749 !important;
          position: absolute !important;
          top: 0 !important;
          left: 6px;
        }

        .timeline-information:after {
          content: '' !important;
          width: 13px !important;
          height: 13px !important;
          border: 4px solid #fff !important;
          border-radius: 50% !important;
          position: absolute !important;
          top: -2px !important;
          left: 0;
        }

        .timeline-information .timeline-information-date {
          color: #9aa4bf !important;
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

        .achievement-status-list .achievement-status .achievement-status-info:after {
          content: '' !important;
          width: 1px !important;
          height: 100% !important;
          background-color: #2f3749 !important;
          position: absolute !important;
          top: 0 !important;
          right: 0;
        }

        .achievement-status .achievement-status-info .achievement-status-text {
          margin-top: 6px !important;
          color: #9aa4bf !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          text-transform: uppercase;
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

        .banner-promo img {
          width: 100% !important;
          height: 100% !important;
          border-radius: 12px;
        }

        .tab-box .tab-box-option .tab-box-option-title .highlighted {
          color: #fff;
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

        .progress-arc-wrap .progress-arc-info .progress-arc-text {
          color: #9aa4bf !important;
        }

        .progress-arc-summary .progress-arc-summary-info .progress-arc-summary-subtitle {
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

        .navigation-widget .navigation-widget-info-wrap .navigation-widget-info .user-avatar {
          position: absolute !important;
          top: 0 !important;
          left: 0;
        }

        .navigation-widget .navigation-widget-info-wrap .navigation-widget-info .navigation-widget-info-title a {
          color: #fff !important;
          font-weight: 700;
        }

        .navigation-widget .navigation-widget-section-link .highlighted {
          float: right !important;
          color: #fff;
        }

        .navigation-widget.closed .user-avatar {
          margin: 0 auto;
        }

        .profile-header {
          border-radius: 12px !important;
          background-color: #1d2333 !important;
          box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.06);
        }

        .progress.blue .fill {
          stroke: #40d04f !important;
        }

        .post-peek .post-peek-title a {
          color: #fff !important;
          font-weight: 700;
        }

        .post-preview-line .post-preview-line-title a {
          color: #fff !important;
          font-weight: 700;
        }

        .post-preview-line .user-avatar {
          margin-right: 8px;
        }

        .post-preview-line .post-preview-line-author a {
          color: #fff !important;
          font-weight: 700;
        }

        .post-comment.reply-2 .user-avatar {
          left: 56px;
        }

        .post-comment .user-avatar {
          position: absolute !important;
          top: 28px !important;
          left: 28px;
        }

        .post-comment .post-comment-text .highlighted {
          color: #fff !important;
          font-weight: 700;
        }

        .post-comment .post-comment-form .user-avatar {
          left: -24px;
        }

        .post-comment-heading .highlighted {
          color: #fff;
        }

        .post-comment-form.with-title .user-avatar {
          top: 82px;
        }

        .post-open .post-open-body .post-open-heading .post-open-timestamp .highlighted {
          color: #fff;
        }

        .product-preview.tiny .product-preview-info .product-preview-creator a {
          color: #9aa4bf !important;
          font-weight: 700;
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

        .stream-box.no-video-radius .stream-box-video iframe {
          border-radius: 0;
        }

        .stream-box.big .stream-box-video iframe {
          position: absolute !important;
          top: 0 !important;
          left: 0;
        }

        .stream-box .stream-box-video iframe {
          width: 100% !important;
          height: 100% !important;
          border-top-left-radius: 12px !important;
          border-top-right-radius: 12px;
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

        .popup-box .popup-box-body .popup-box-sidebar .popup-box-sidebar-footer .button {
          margin-bottom: 16px;
        }

        .popup-box .popup-box-body .popup-box-sidebar .popup-box-sidebar-footer .button:last-child {
          margin-bottom: 0;
        }

        .popup-box .popup-box-body .popup-box-content .widget-box {
          box-shadow: none;
        }

        .popup-box .widget-box .form .form-row {
          padding: 0;
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

        .quest-item .progress-stat {
          max-width: 228px !important;
          margin-top: 48px;
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
        a,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        p {
          color: #fff !important;
        }
      }
      .rtl {
        .timeline-information:after {
          content: '';
          left: auto !important;
          right: 0 !important;
        }
        .timeline-information {
          padding-left: 0px !important;
          padding-right: 28px !important;
        }
        .timeline-information:before {
          content: '';
          right: 6px !important;
          left: auto !important;
        }
        .widget-box .widget-box-settings {
          right: auto !important;
          left: 19px !important;
        }
        @media (min-width: 1200px) {
          .special-col-margin-2 {
            margin-right: 15px !important;
          }
        }
      }
      .dark-mode.post-open .post-open-body .post-open-content .post-open-content-body .tag-list {
        margin-top: 60px;
      }
      .dark-mode.tag-item {
        display: block !important;
        height: 24px !important;
        padding: 0 12px !important;
        border-radius: 200px !important;
        background-color: #3e3f5e !important;
        color: #fff !important;
        font-size: 12px !important;
        font-weight: 700 !important;
        line-height: 24px;
      }

      .achievement-status-progress {
        position: relative;
        display: inline-block;
      }

      .tooltip-x {
        position: relative;
        display: inline-block;
      }

      .xm-tooltip {
        white-space: nowrap;
        position: absolute;
        z-index: 0;
        right: -12px;
        bottom: 50px;
        margin-bottom: -12px;
        opacity: 0;
        visibility: hidden;
        transform: translate(0px, 20px);
        transition: all 0.3s ease-in-out;
      }

      .achievement-status-title:hover .xm-tooltip {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .tooltip-line-break {
        display: block; /* Forces a line break */
      }
      .experience-design {
        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        align-content: center;
      }

      .text-sticker {
        min-width: 100px !important;
        box-shadow: 3px 5px 20px 0 rgb(0 0 0/12%);
        margin-top: 3px;
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
        dark-mode.product-preview.small .product-preview-info .text-sticker {
        right: -8px;
      }
      .dark-mode.product-preview .product-preview-info .text-sticker {
        position: absolute !important;
        top: -14px !important;
        right: 14px;
      }
      .dark-mode.album-preview .text-sticker {
        position: absolute !important;
        top: 18px !important;
        right: 18px !important;
        z-index: 3 !important;
        pointer-events: none;
      }
        .dark-mode.badge-item-stat .text-sticker {
        position: absolute !important;
        top: 10px !important;
        right: -6px;
      }
    `,
  ],
})
export class ProfileDetailComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  rtl;
  position: any;
  loading = true;
  statisticsPath;
  headerImagePath;
  progress: number;
  baseUrl = BASE_URL;
  isDragging = false;
  works: UserWorkType[];
  starIcon: PictureType;
  badgeIcon: PictureType;
  darkMode: boolean = false;
  progressBarColor = '#41EFFF';
  switchButton: boolean = false;
  locationButtonDisabled = true;
  defaultPicture = defaultPicture;
  educations: UserEducationType[];
  landingBackgroundIcon: PictureType;
  settings: boolean[] = Array(15).fill(false);
  completeProfile: ProfileCompletnessProgressType;
  currentUser$: Observable<UserType> = this.profileService.currentUser$;
  widgetSettings$: Observable<WidgetIntegrationType> = this.playerService.widgetSettings$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.playerService.loyaltySettings$;
  currentLevel$: Observable<ReputationWithoutTargetType> = this.playerService.currentLevel$;

  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    private translate: TranslateService,
    private modalService: ModalService,
    private playerService: PlayerService,
    private storageHelper: StorageHelper,
    private profileService: ProfileService,
    private appCookieService: AppCookieService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.playerService.widgetVisuals$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widgetVisuals) => {
      if (widgetVisuals) {
        this.landingBackgroundIcon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_LANDING_BACKGROUND').picture;
        this.starIcon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_STAR').picture;
        this.badgeIcon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_PERFORMED_BADGE').picture;
        this.changeDetectorRef.markForCheck();
      }
    })
  }

  socialMediaCarousel: OwlOptions = {
    loop: true,
    dots: false,
    margin: 20,
    responsive: {
      0: { items: 1 },
      100: { items: 2 },
      200: { items: 3 },
      300: { items: 4 },
      400: { items: 5 },
      500: { items: 6 },
      600: { items: 7 },
    },
  };

  profileCarousel: OwlOptions = {
    loop: true,
    dots: false,
    margin: 20,
    responsive: {
      0: { items: 1 },
      100: { items: 2 },
      200: { items: 2 },
      300: { items: 4 },
      400: { items: 5 },
      500: { items: 6 },
      600: { items: 7 },
    },
  };

  ngOnInit(): void {
    setTimeout(() => {
      this.loading = false;
    }, 1000);
    setTimeout(() => {
      combineLatest([
        this.playerService.currentLevelPercentage$,
        this.playerService.nextLevel$,
        this.playerService.loyaltySettings$,
        this.playerService.isFinalLevel$,
        this.playerService.currentLevel$,
        this.profileService.completeProfile$,
        this.playerService.widgetSettings$,
      ])
        .pipe(
          takeUntil(this.unsubscribeAll),
          rxMap(([currentLevelPercentage, nextLevel, loyaltySettings, isFinalLevel, currentLevel, completeProfile, widgetSettings]) => {
            let levels = map(completeProfile?.levels, (profileLevel) => {
              const settingsLevel = find(loyaltySettings?.profileComplete?.levels, { name: profileLevel.name }) || { elements: [] };
              const missingElements = difference(settingsLevel.elements, profileLevel.elements);
              return {
                ...profileLevel,
                missingElements,
              };
            });
            this.completeProfile = {
              ...completeProfile,
              levels,
            };
            this.progress = +completeProfile?.progress;
            const trackElement = this.element.nativeElement.shadowRoot.querySelector('.track') as HTMLElement;
            const fillElement = this.element.nativeElement.shadowRoot.querySelector('.fill') as HTMLElement;
            if (fillElement && trackElement) {
              if (!loyaltySettings?.qualitative?.active) {
                const strokeStyle = widgetSettings?.theme;
                fillElement.style.strokeDashoffset = '100px';
                trackElement.style.stroke = fillElement.style.stroke = strokeStyle;
                trackElement.style.opacity = '0.4';
              } else {
                const strokeStyle =
                  !nextLevel && !isFinalLevel ? loyaltySettings?.prelevel?.color : isFinalLevel ? currentLevel?.color : nextLevel?.color;
                fillElement.style.strokeDashoffset = `${((100 - (!isFinalLevel ? currentLevelPercentage : 100)) / 100) * 2160}px`;
                trackElement.style.stroke = fillElement.style.stroke = strokeStyle;
                trackElement.style.opacity = '0.4';
              }
            }
            this.changeDetectorRef.markForCheck();
          }),
        )
        .subscribe();
    }, 2000);
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
      this.changeDetectorRef.detectChanges();
      if (this.darkMode) {
        this.progressBarColor = '#40d04f';
      } else {
        this.progressBarColor = '#41EFFF';
      }
    });
    this.modalService.rtl$.subscribe((direction) => {
      this.rtl = direction;
      this.updateCarouselOptions();
      this.changeDetectorRef.detectChanges();
    });
    this.profileService.currentUser$.pipe(takeUntil(this.unsubscribeAll)).subscribe((user) => {
      if (user?.education?.length) {
        this.educations = user?.education.map((edu) => ({
          ...edu,
          from: new Date(edu.from).getFullYear(),
          ...(edu?.to ? { to: new Date(edu?.from).getFullYear() } : {}),
        }));
      }
      if (user?.work?.length) {
        this.works = user?.work.map((item) => ({
          ...item,
          from: new Date(item.from).getFullYear(),
          ...(item.to ? { to: new Date(item.to).getFullYear() } : {}),
        }));
      }
      this.position = {
        lng: user?.residentialAddress?.[0]?.location?.coordinates?.[0],
        lat: user?.residentialAddress?.[0]?.location?.coordinates?.[1],
      };
    });
  }

  draggingChange() {
    this.isDragging = true;
    setTimeout(() => {
      this.isDragging = false;
    }, 500);
  }

  updateCarouselOptions() {
    this.socialMediaCarousel = {
      loop: true,
      dots: false,
      margin: 20,
      rtl: this.rtl,
      responsive: {
        0: { items: 1 },
        100: { items: 2 },
        200: { items: 3 },
        300: { items: 4 },
        400: { items: 5 },
        500: { items: 6 },
        600: { items: 7 },
      },
    };
  }

  validateEmail() {
    this.profileService
      .sendValidMail()
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.modalSuccess();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  toggleModal(modalName: string): void {
    this.modalService.togglePopUp(modalName, this.element);
  }
  triggerSettingsDropdown(index: number) {
    this.settings[index] = !this.settings[index];
  }
  toggleDarkMode() {
    this.modalService.toggleDarkMode();
  }

  modalSuccess() {
    this.translate.get('EMAIL_VALIDATION').subscribe((title: string) => {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title,
        showConfirmButton: false,
        timer: 1500,
        ...(this.darkMode ? { background: '#1d2333', color: '#fff' } : {}),
      });
    });
    const swalContainer = document.querySelector('.swal2-container');
    if (swalContainer) {
      this.renderer.setStyle(swalContainer, 'z-index', '1000000');
    }
  }

  modalError() {
    this.translate.get('EMAIL_ERROR').subscribe((text: string) => {
      Swal.fire({
        title: 'Oops...',
        text: text,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
        ...(this.darkMode ? { background: '#1d2333', color: '#fff' } : {}),
      });
    });
    const swalContainer = document.querySelector('.swal2-container');
    if (swalContainer) {
      this.renderer.setStyle(swalContainer, 'z-index', '1000000');
    }
  }

  generateRandomString(length: number): string {
    const now = new Date();
    const timestamp = now.getTime();
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomCharacters = times(length, () => characters.charAt(random(characters.length - 1)));
    return randomCharacters.join('') + timestamp;
  }

  logout() {
    this.playerService.authenticated$ = false;
    this.playerService.currentLevelPercentage$ = 0;
    this.playerService.remainingPoints$ = 0;
    this.playerService.currentLevel$ = null;
    this.profileService.currentUser$ = null;
    this.playerService.wallet$ = null;
    this.modalService.modalType$ = 'guest';
    this.appCookieService.set('elvkwdigtauth', 'false');
    this.storageHelper.remove(ACCESS_TOKEN);
    this.appCookieService.remove(ACCESS_TOKEN);
    this.storageHelper.setData({ elvkwdigtauth: 'false' });
    this.storageHelper.setData({ elvkwdigtref: this.generateRandomString(8) });
    this.toggleModal('home');
    this.changeDetectorRef.markForCheck();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
