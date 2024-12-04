import { Inject, OnInit, Component, OnDestroy, ViewChild, PLATFORM_ID, HostBinding, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { find } from 'lodash';
import isAfter from 'date-fns/isAfter';
import parseISO from 'date-fns/parseISO';
import { ElementRef } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { differenceInMilliseconds } from 'date-fns';
import { isPlatformBrowser } from '@angular/common';
import { Observable, Subject, Subscription, combineLatest, map, takeUntil } from 'rxjs';

import { PlayerService } from './player.service';
import { BASE_URL } from '../../../environments/environment';
import { ModalService } from '../../shared/services/modal.service';
import { fadeAnimations, hightlightActivity } from '../../shared/animations/animations';
import {
  LoyaltySettingsType,
  WidgetIntegrationType,
  QuestWithRepeatDateType,
  LoyaltySettingsWalletCardType,
  ProfileCompletnessProgressType,
} from '@sifca-monorepo/widget-generator';
import { NotificationsService } from './components/notification/notifications.service';
import { ProfileService } from './components/profile/profile.service';

@Component({
  selector: 'app-player-mode',
  templateUrl: './player.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  animations: [fadeAnimations, hightlightActivity],
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
      .level-cover {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 17px;
        height: 17px;
        position: absolute;
        top: 27px;
        right: -46px;
        z-index: 5000;
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
        scale: 1.3;
        background-color: white;
        z-index: 600 !important;
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

      @media screen and (max-width: 599px) {
        .top-sm {
          top: 33px;
          position: relative;
        }
      }

      @media (min-width: 1200px) {
        .special-widget-box {
          padding: 15px 25px;
        }
      }

      @media (max-width: 1200px) {
        .special-widget-box {
          padding: 32px 28px;
        }
      }

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

      :host::ng-deep.table-body .table-row {
        border-radius: 12px !important;
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

      .user-status {
        min-height: 44px;
        padding: 2px 0 0 60px;
        position: relative;
      }

      .section-filters-bar.v2 .form .form-item.split {
        flex-direction: row;
      }

      .progress.blue .fillLeaderboard1 {
        stroke: #ffd700 !important;
      }

      .progress.blue .fillLeaderboard2 {
        stroke: #d3d3d3 !important;
      }

      .progress.blue .fillLeaderboard3 {
        stroke: #cd7f32 !important;
      }

      .progress.blue .fillLeaderboard4 {
        stroke: #23d2e2 !important;
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

      .white-color {
        color: #fff !important;
      }

      .profile-cnt {
        position: relative;
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

      .special-badge-text {
        color: #fff;
        font-size: 12px;
        font-weight: 700;
        pointer-events: none;
        position: relative;
        z-index: 6;
        font-size: 16px;
      }

      .small-profile-image {
        width: 35px;
        left: 5px;
        bottom: -6px;
        height: 35px;
        -webkit-clip-path: polygon(
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

      .profile-avatar-badge-small {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 17px;
        height: 17px;
        position: absolute;
        top: 27px;
        right: -46px;
        z-index: 5000;
        background-color: var(--dynamic-color3);
        -webkit-clip-path: polygon(
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
      .dark-mode h5,
      .dark-mode p,
      .dark-mode a {
        color: #fff !important;
      }
      a:hover {
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
      .dark-mode.progress.blue .fillLeaderboard4 {
        stroke: #40d04f !important;
      }
      .dark-mode.progress.blue .fillLeaderboard {
        stroke: #40d04f;
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
        color: white !important;
      }
      .dark-mode.user-data-leaderboard {
        background-color: #7750f8 !important;
        background-color: var(--dynamic-color) !important;
        border-radius: 12px !important;
        display: inline-table !important;
        width: 100% !important;
      }
      .dark-mode.simple-tab-item.active {
        border-bottom: 4px solid #fff;
        color: #3e3f5e;
        opacity: 1;
      }
      .rtl {
        .header-row {
          float: left !important;
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
        @media (min-width: 600px) {
          .table.table-top-friends .table-column:last-child,
          .table.table-top-friends .table-header-column:last-child {
            float: left !important;
          }
        }
        .user-status .user-status-activity,
        .user-status .user-status-avatar {
          left: auto !important;
          right: 50px;
        }
        .user-status-title,
        .user-status-text {
          margin-right: 65px !important;
        }
        .table.table-top-friends .table-row .table-column:first-child {
          width: 220px !important;
        }
        .profile-avatar-badge-small,
        .level-cover {
          right: auto !important;
          left: 0px !important;
        }
        .simple-tab-items .simple-tab-item:last-child {
          margin-right: 40px !important;
        }
        @media (max-width: 600px) {
          .user-status {
            min-height: 44px;
            padding: 2px 0 0 20px !important;
            position: relative;
          }
        }
      }

      .dark-mode {
        .popup-color {
          background-color: #161b28 !important;
        }
      }
      .product-preview.small .product-preview-info {
        padding: 20px 0 0;
      }

      .product-preview .product-preview-info .product-preview-text {
        margin-top: 20px !important;
        color: #9aa4bf !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        line-height: 1.4285714286em;
      }

      .form-switch.active {
        background-color: #23d2e2;
      }
      .user-data-leaderboard {
        background-color: var(--dynamic-color) !important;
        border-radius: 12px !important;
        display: inline-table !important;
        width: 110% !important;
      }
      .level-background {
        scale: 1.3;
        background-color: white !important;
        z-index: 600 !important;
      }
      .level-cover {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 17px;
        height: 17px;
        position: absolute;
        top: 27px;
        right: -46px;
        z-index: 5000;
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
        scale: 1.3;
        background-color: white;
        z-index: 600 !important;
      }

      .popup-color {
        background-color: rgb(238, 238, 238);
        border-radius: 12px;
        padding: 0px 0 0px !important;
      }
      .notification-section .notification-section-title {
        margin-top: 54px;
        color: var(--color-text);
        font-size: 20px;
        font-weight: 700;
        text-align: center;
      }

      .notification-section .notification-section-text {
        margin-top: 12px;
        font-size: 16px;
        font-weight: 500;
        text-align: center;
      }

      .emoji-mart .emoji-mart-emoji {
        padding: 6px;
        width: 24px;
      }

      .emoji-mart-preview {
        display: none;
      }
      .normal-icon-star {
        width: 12px !important;
        height: 12px !important;
        fill: #ffe00d;
      }
      .rating-normal {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 12px;
        height: 12px;
      }

      .emoji-mart {
        position: absolute;
        bottom: 30px;
        right: 0;
      }
      @media (max-width: 450px) {
        .emoji-mart {
          width: 275px !important;
        }
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
        .special-box {
          flex-wrap: wrap;
        }
        .box-1 {
          margin-top: 15px !important;
        }
      }

      @media (min-width: 1200px) {
        .information-line .information-line-title {
          flex-shrink: 0;
          width: 66px !important;
          color: #8f91ac;
        }
        .responsive-margin-top {
          margin-top: 14px;
        }

        .box-1 {
          margin-left: 15px !important;
        }
      }

      .progress-stat .bar-progress-wrap:first-child {
        margin-bottom: -5px;
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

        @media (700px<width<1200px) {
          max-width: 70%;
        }

        @media (max-width: 700px) {
          width: 90%;
        }
      }

      @media (min-width: 800px) {
        .widget-box-scrollable {
          min-height: 75vh !important;
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

      .progress-stat .bar-progress-wrap:first-child {
        margin-bottom: -5px;
      }

      .popup-picture {
        @media (min-width: 701px) and (max-width: 1199px) {
          max-width: 70%;
        }
      }

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

      //level-24 styles

      ::ng-deep.level-24 .widget-box {
        padding: 0px 0px;
        border-radius: 12px;
        background-color: #fff;
        box-shadow: 0 0 40px 0 #5e5c9a0f;
        position: relative;
      }

      .grid.grid-half {
        grid-template-columns: none;
      }

      //transactions-styles

      .grid.grid-half {
        grid-template-columns: none;
      }

      .achievement-box {
        flex-direction: column;
        padding: 28px 18px;
      }

      .transactions.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .transactions.appProgressBar {
        border-radius: 2px;
      }

      //reward styles

      .grid.grid-half {
        grid-template-columns: none;
      }

      .achievement-box {
        flex-direction: column;
        padding: 28px 18px;
      }

      .reward.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      //reward styles ends

      //earn styles

      .grid.grid-half {
        grid-template-columns: none;
      }

      .achievement-box {
        flex-direction: column;
        padding: 28px 18px;
      }

      .earn.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      :host::ng-deep.table-body .table-row {
        border-radius: 12px !important;
      }

      .earn.text-sticker {
        height: 32px;
        padding: 20px 14px;
        border-radius: 200px;
        background-color: #fff;
        box-shadow: 3px 5px 20px 0 #5e5c9a1f;
        font-size: 14px;
        font-weight: 700;
        line-height: 32px;
      }

      //earn styles ends

      //notifications styles

      .notifications.widget-box .widget-box-content.padded-for-scroll {
        height: max-content !important;
        padding-bottom: 28px;
      }

      ::ng-deep.notifications.widget-box {
        padding: 0px 0px;
        border-radius: 12px;
        background-color: #fff;
        box-shadow: 0 0 40px 0 #5e5c9a0f;
        position: relative;
      }

      .notifications.grid.grid-half {
        grid-template-columns: none;
      }

      .notifications.achievement-box {
        flex-direction: column;
        padding: 28px 18px;
      }

      .notifications.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      //notifications styles ends

      //profile styles

      ::ng-deep.profile.widget-box {
        padding: 0px 0px;
        border-radius: 12px;
        background-color: #fff;
        box-shadow: 0 0 40px 0 #5e5c9a0f;
        position: relative;
      }

      .grid.grid-half {
        grid-template-columns: none;
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

      .profile.profile-header .profile-header-info {
        height: auto;
        padding-bottom: 32px;
      }

      .profile.profile-header .profile-header-cover {
        height: 300px;
      }

      .profile.liquid {
        background-image: 'assets/img/cover/01.jpg';
      }

      @media (max-width: 1200px) {
        .profile.col-md-6 {
          padding-right: 0px;
          padding-left: 0px;
        }
      }

      :host::ng-deep.user-avatar-border {
        width: 120% !important;
        height: 120% !important;
      }

      ::ng-deep.profile.owl-item {
        display: flex;
        justify-content: center;
      }

      //profile styles ends

      //edit profile styles

      .edit-profile.grid.grid-half {
        grid-template-columns: none;
      }

      .edit-profile.achievement-box {
        flex-direction: column;
        padding: 28px 18px;
      }

      .edit-profile.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      .edit-profile.profile-header .profile-header-info {
        height: auto;
        padding-bottom: 32px;
      }

      .edit-profile.profile-header .profile-header-cover {
        height: 300px;
      }

      .edit-profile.liquid {
        background-image: url('${BASE_URL}/assets/img/cover/01.jpg');
      }

      .edit-profile.hexagon-image-100-110 {
        background-image: url('${BASE_URL}/assets/img/avatar/01.jpg');
      }

      .edit-profile.content-grid .section,
      .edit-profile.content-grid .section-header {
        margin-top: 0px;
      }

      .edit-profile.section-header {
        margin-top: 0px;
      }

      //edit profile styles ends

      //chat styles

      .chat.grid.grid-half {
        grid-template-columns: none;
      }

      .chat.achievement-box {
        flex-direction: column;
        padding: 28px 18px;
      }

      .chat.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .chat.profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      .chat.profile-header .profile-header-info {
        height: auto;
        padding-bottom: 32px;
      }

      .chat.profile-header .profile-header-cover {
        height: 300px;
      }

      .chat.liquid {
        background-image: url('${BASE_URL}/assets/img/cover/01.jpg');
      }

      .chat.hexagon-image-100-110 {
        background-image: url('${BASE_URL}/assets/img/avatar/01.jpg');
      }

      .chat.chat-widget.chat-widget-overlay {
        padding-bottom: 0px;
      }

      @media screen and (max-width: 680px) {
        .chat-widget,
        .navigation-widget-desktop {
          display: block !important;
        }
      }

      .chat.chat-widget-form {
        position: sticky;
        left: 0px;
        z-index: 9999;
        bottom: 10%;
      }

      .chat-widget-header {
        position: sticky;
        top: 0;
        z-index: 1;
        background-color: white;
        border-radius: 12px;
      }

      //chat styles ends

      //quests styles

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

      @media (min-width: 600px) {
        .quests.special-widget-box {
          padding: 32px 28px;
        }
      }

      @media (max-width: 600px) {
        .quests.special-widget-box {
          padding: 10px 0px;
        }
      }

      .quests.grid.grid-half {
        grid-template-columns: none;
      }

      ::ng-deep.quests.owl-item {
        display: flex;
        justify-content: center;
      }

      .quests.achievement-box {
        flex-direction: column;
        padding: 28px 18px;
      }

      .quests.progress-stat .bar-progress-wrap:last-child {
        margin-top: 0px;
      }

      .quests.reaction-stats {
        display: grid !important;
        justify-content: center;
        margin-right: 12%;
        margin-left: 12%;
      }

      .quests.reaction-stats .reaction-stat {
        width: auto;

        position: relative;
      }

      .quests.reaction-stat .reaction-stat-image {
        width: 40px !important;
        height: 40px;
      }

      :host::ng-deep.quests.owl-item img {
        display: block;
        width: auto !important;
      }

      .quests.section-filters-bar {
        -ms-flex-direction: column;
        flex-direction: column;
        height: auto;
        padding: 32px 28px !important;
      }

      @media (max-width: 1000px) {
        :host::ng-deep.quests.last-select {
          display: none;
        }
      }

      :host::ng-deep .quests.section-header {
        margin-top: 0px !important;
      }

      :host::ng-deep.quests.section-filters-bar {
        padding: 32px 28px !important;
      }

      .quests.section-filters-bar.v2 .form .form-item.split .form-select {
        width: 100%;
        margin: 0px 6px 0px;
      }

      //quests styles ends

      //challenge styles

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

      .challenge.special-widget-box {
        padding: 32px 28px;
      }

      .challenge.grid.grid-half {
        grid-template-columns: none;
      }

      ::ng-deep.owl-item {
        display: flex;
        justify-content: center;
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

      .challenge.profile-header .profile-header-info {
        height: auto;
        padding-bottom: 32px;
      }

      .challenge.profile-header .profile-header-cover {
        height: 300px;
      }

      .challenge.liquid {
        background-image: 'assets/img/cover/01.jpg';
      }

      .challenge.hexagon-image-100-110 {
        background-image: url('${BASE_URL}/assets/img/avatar/01.jpg');
      }

      :host::ng-deep.challenge.poll-box-actions {
        margin-top: 0px !important;
      }

      .poll-box .poll-box-actions {
        margin-top: 0px;
        margin-right: 16px;
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

      //challenges styles ends

      .hexagon {
        width: 100%;
        /* Adjust width to make the hexagon larger */
        height: 80px;
        /* Adjust height accordingly */
        background-color: rgb(255, 255, 255);
        position: relative;
        margin: 30px 0;

        border-radius: 10px;
      }

      .hexagon:before,
      .hexagon:after {
        content: '';
        left: 1px;

        position: absolute;
        width: 75px;
        border-left: 68px solid transparent;
        border-right: 76px solid transparent;
        border-bottom-left-radius: 5%;
        border-top-right-radius: 5%;
      }

      .hexagon:before {
        bottom: 94%;
        border-bottom: 37.5px solid #ffffff;
      }

      .hexagon:after {
        top: 95%;
        border-top: 35.5px solid rgb(255, 255, 255);
      }

      .user-avatar .user-avatar-border {
        position: absolute;
        top: 7px;
        left: 4px;
        z-index: 1;
      }

      .chat-widget {
        width: -webkit-fill-available;
        border-radius: 12px;
        background-color: #fff;
        box-shadow: 0 0 40px 0 rgba(94, 92, 154, 0.06);
        transition: transform 0.4s ease-in-out;
      }

      .active {
        fill: #fff !important;
      }

      .custom-button {
        width: 40% !important;
        margin-top: 22px;
        margin: 5%;
      }

      .user-status {
        min-height: 44px;
        padding: 2px 0 0 60px;
        position: relative;
      }

      .active-level {
        width: 50px;
        filter: drop-shadow(2px 4px 6px black) brightness(1.1);
        margin-left: -35%;
      }

      .sidebar-box .sidebar-box-footer {
        padding: 6px 0px 21px;
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

      .level-img {
        margin-right: 4%;
        margin-top: -2%;
      }

      .earn-card-images {
        width: 90px;
      }

      .tag-placeholder {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .ng-value {
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        border-radius: 20px;
        padding: 5px 10px;
        display: flex;
        align-items: center;
        font-size: 14px;
      }

      .ng-value-icon {
        margin-right: 5px;
        cursor: pointer;
      }
      .product-preview .product-preview-info .product-preview-category:before {
        content: none;
      }

      .ng-value-label {
        margin-right: 10px;
      }

      .section-filters-bar.v2 .form .form-item.split {
        flex-direction: row;
      }
      .progress.blue .fillLeaderboard1 {
        stroke: #ffd700 !important;
      }

      .progress.blue .fillLeaderboard2 {
        stroke: #d3d3d3 !important;
      }
      .progress.blue .fillLeaderboard3 {
        stroke: #cd7f32 !important;
      }
      .progress.blue .fillLeaderboard4 {
        stroke: #23d2e2 !important;
      }

      .poll-box {
        padding: 32px 0px;
        border-radius: 12px;
        background-color: transparent;
        box-shadow: none;
      }

      .survey-header {
        background-color: #7975d8;
        border-radius: 7px;
        padding: 20px;
      }

      .image-hover {
        width: 50px;
        height: 50px;
      }

      .poll-box .form-poll {
        margin: 28px 40px;
      }

      .poll-title {
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 15px !important;
        margin-top: 15px;
      }
      .reaction-emoji {
        margin-right: 2%;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border-radius: 50%;
      }
      .timeline-information-text {
        font-weight: 500 !important;
      }
      .reaction-emoji:hover,
      .people-choice:hover {
        transform: scale(1.3);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      .people-choice {
        width: 50px;
        height: 50px;
        margin-right: 2%;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border-radius: 50%;
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
        box-shadow: 3px 5px 20px 0 rgb(0 0 0 / 12%);
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

      ::ng-deep.owl-item {
        width: 300px !important;
      }

      .section-banner .section-banner-icon {
        width: 92px;
        height: 86px !important;
      }

      .progress-bar-width {
        width: -webkit-fill-available;
      }

      .rounded-circle {
        width: 20px;
      }

      .first-column-padding {
        padding-right: 10px;
      }
      .white-color {
        color: #fff !important;
      }
      .next-disabled {
        cursor: none;
        filter: grayscale(0.6);
        opacity: 0.7;
      }
      .next-disabled:hover {
        filter: grayscale(0.6);
      }

      .section-menu .section-menu-item {
        float: left;
        width: 120px;
        height: 80px;
        position: relative;
      }

      .profile-cnt {
        position: relative;
      }

      @media (max-width: 600px) {
        .chat.chat-widget-form {
          bottom: 2% !important;
        }
      }

      @media (max-width: 600px) {
        .table-header-column:nth-child(2),
        .table-column:nth-child(2) {
          display: none;
        }
      }

      .owl-carousel .owl-item {
        display: flex;
        justify-content: center;
        /* Center the card within the item */
        align-items: center;
        flex: 0 0 auto;
        /* Prevent items from stretching */
      }

      .owl-card {
        width: 100%;
        /* Adjust width as needed */
        /* Add your own styling for the card */
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
        background: var(--i) center / cover;
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

      .small-profile-image {
        width: 35px;
        left: 5px;
        bottom: -6px;
        height: 35px;
        -webkit-clip-path: polygon(
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
        background: var(--i) center / cover;
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

      .quest-item {
        width: 285px !important;
      }

      .benefits-margin {
        margin-top: -2%;
      }

      .reputation-progress-bar {
        margin-bottom: 15px;
        height: 5px;
        position: relative;
        margin-top: 0%;
      }
      .level-backgrund-edit {
        z-index: 600 !important;
        scale: 1.3;
        background: white !important;
      }
      .challenges-quests {
        padding: 0px 10%;
        margin-bottom: 20px;
      }
      .challenge-size {
        width: 220px;
      }
      .center-challenge {
        width: 280px;
        height: 105%;
      }
      .background-profile-edit {
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
        width: 105px;
        height: 105px;
      }

      .profile-image-edit {
        width: 72px;
        left: 10px;
        bottom: -11px;
        height: 72px;
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

      .profile-image-edit:before {
        content: '';
        position: absolute;
        top: 0%;
        bottom: 0%;
        left: 0%;
        right: 0%;
        background: var(--i) center / cover;
        animation: inherit;
        animation-direction: reverse;
      }

      .progress-edit {
        width: 93px;
        height: 93px;
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
        display: flex;

        overflow: hidden;
        font-size: 12px;
        background-color: #e9ecef;
        border-radius: 4px;
      }

      .progress-edit .track,
      .progress-edit .editFill {
        fill: rgba(0, 0, 0, 0);
        stroke-width: 110px;
        transform: translate(75px, 685px) rotate(-90deg);
      }

      .progress-edit .track {
        stroke: rgb(56, 71, 83);
      }

      .progress-edit .editFill {
        stroke: rgb(104, 214, 198);
        stroke-linecap: round;
        stroke-dasharray: 2160;
        stroke-dashoffset: 2160;
        transition: stroke-dashoffset 1s;
      }

      .profile-avatar-badge-edit {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 27px;
        height: 27px;
        position: absolute;
        top: 54px;
        right: 8px;
        z-index: 500000000;
        background-color: var(--dynamic-color3);
        -webkit-clip-path: polygon(
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
      .text-sticker .text-sticker-icon-red {
        margin-right: 4px;
        fill: #d90000;
      }
      .coin-transaction {
        width: 20px;
        height: 20px;
        margin-bottom: -12%;
      }
      .popup-event-subtitle {
        margin-bottom: 32px !important;
        font-size: 16px;
        font-weight: 700;
      }
      .dropdown-box {
        width: auto;
        padding-bottom: 0px;
        border-radius: 10px;
        background-color: #fff;
        box-shadow: 3px 5px 40px 0 rgba(94, 92, 154, 0.06);
        position: relative;
      }
      .form-item-margin {
        margin: 10px 0px;
      }

      .button.custom {
        background-color: transparent;
        border: 1px solid var(--dynamic-color3);
        color: var(--dynamic-color3);
        box-shadow: none;
        height: 40px;
        font-size: 15px;
        line-height: 40px;
        font-weight: 600;
      }
      .button.custom:hover {
        color: #fff;
        background-color: var(--dynamic-color3);
        border-color: var(--dynamic-color3);
      }
      .icon-custom-arrow {
        fill: #4850bf;
        width: 11px;
        height: 11px;
        margin-left: 5px;
      }
      .icon-custom-arrow:hover {
        fill: #fefefe;
      }
      @media (700px<width<750px) {
        .action-list .action-list-item {
          padding: 0 7px;
        }
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

      .profile-avatar-badge-small {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 17px;
        height: 17px;
        position: absolute;
        top: 27px;
        right: -46px;
        z-index: 5000;
        background-color: var(--dynamic-color3);
        -webkit-clip-path: polygon(
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

      .xm-tooltip {
        white-space: nowrap;
        position: absolute;
        z-index: 99999;
        right: -5px;
        bottom: 50px;
        margin-bottom: -12px;
        opacity: 0;
        visibility: hidden;
        transform: translate(0px, 20px);
        transition: all 0.3s ease-in-out;
      }

      .action-list-item:hover .xm-tooltip {
        opacity: 1;
        visibility: visible;
        transform: translate(0px, -10px);
      }
      .action-item:hover .xm-tooltip {
        opacity: 1;
        visibility: visible;
        transform: translate(0px, -10px);
      }

      .action-item-wrap::after {
        display: none !important;
      }
      .dark-mode .dropdown-item.active,
      .dropdown-item:active {
        color: #fff !important;
        background-color: #3a4047 !important;
      }
      .dark-mode .dropdown-item {
        color: #fff !important;
        background-color: #1d2333 !important;
      }
      .dark-mode .dropdown-menu {
        background-color: #1d2333 !important;
      }

      .dropdown-item.active,
      .dropdown-item:active {
        color: #1d2333 !important;
        background-color: #e6e2e2 !important;
      }
      .dropdown-item {
        color: #1d2333 !important;
        background-color: #fff !important;
      }
      .dropdown-menu {
        background-color: #fff !important;
      }

      .avatar-title {
        align-items: center !important;
        display: flex !important;
        font-weight: 500 !important;
        height: 100% !important;
        justify-content: center !important;
        width: 100% !important;
      }

      sticky-button {
        position: sticky;
        padding: 0 !important;
        bottom: 0px;
        height: 96px;
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
      }

      .special-bottom {
        bottom: 60px;
      }

      @media (max-width: 800px) {
        .special-bottom {
          bottom: 0px;
        }
      }
      .dark-mode .widget-exit {
        background-color: #1d2333 !important;
      }
    `,
  ],
})
export class PlayerModeComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  private unsubscribeAll: Subject<any> = new Subject<any>();

  @HostBinding('style.--dynamic-color') dynamicColor: string = '#ffffff';
  @HostBinding('style.--dynamic-color2') dynamicColor2: string = '#ffffff';
  @HostBinding('style.--dynamic-color3') dynamicColor3: string = '#ffffff';
  @ViewChild('darkModeTarget', { static: false }) darkModeTarget: ElementRef;

  date: Date;
  rtl: boolean;
  isLoaded: boolean;
  baseUrl = BASE_URL;
  activeModal = 'home';
  showProgress = false;
  questDuration: number;
  hightlightCoords: any;
  darkMode: boolean = false;
  dierction: boolean = false;
  currentLevelPercentage = 10;
  requestStopHighlighting: boolean;
  quests: QuestWithRepeatDateType[];
  widgetSettings: WidgetIntegrationType;
  loyaltyCard: LoyaltySettingsWalletCardType;
  settings: boolean[] = Array(15).fill(false);
  highlightedActivity: QuestWithRepeatDateType;
  levelColor$: Observable<string> = this.playerService.levelColor$;
  isHidden$: Observable<boolean> = this.modalService.isHidden$;
  isOnboarded$: Observable<boolean> = this.modalService.isOnboarded$;
  isFinalLevel$: Observable<boolean> = this.playerService.isFinalLevel$;
  unreadNotif$: Observable<boolean> = this.notificationsService.unreadNotif$;
  isCompleteProfile$: Observable<boolean> = this.modalService.isCompleteProfile$;
  widgetSettings$: Observable<WidgetIntegrationType> = this.playerService.widgetSettings$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.playerService.loyaltySettings$;
  completeProfile$: Observable<ProfileCompletnessProgressType> = this.profileService.completeProfile$;

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
  feuturedbadgesCarousel: OwlOptions = {
    items: 1,
    nav: false,
    dots: false,
  };
  reactsCarousel: OwlOptions = {
    items: 1,
    loop: false,
    dots: false,
  };
  isAggregator: boolean;
  connectButton = false;

  constructor(
    private element: ElementRef,
    private modalService: ModalService,
    private playerService: PlayerService,
    private profileService: ProfileService,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    @Inject(PLATFORM_ID) protected platformId: Object,
  ) {
    combineLatest([
      this.playerService.pos$,
      this.playerService.widgetSettings$,
      this.playerService.loyaltySettings$,
      this.playerService.connectButton$,
    ])
      .pipe(
        takeUntil(this.unsubscribeAll),
        map(([pos, widgetSettings, loyaltySettings, connectButton]) => {
          this.connectButton = connectButton;
          this.widgetSettings = widgetSettings;
          this.dynamicColor = this.widgetSettings?.theme || '#7750f8';
          this.updateColors();
          this.loyaltyCard = loyaltySettings?.loyaltyCard;
          this.isAggregator = pos?.aggregator;
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoaded = true;
      this.changeDetectorRef.markForCheck();
    }, 200);
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
      this.changeDetectorRef.detectChanges();
    });
    this.modalService.activeModal$.subscribe((modal) => {
      this.activeModal = modal;
    });
    this.modalService.rtl$.subscribe((direction) => {
      this.rtl = direction;
      this.changeDetectorRef.detectChanges();
    });
  }

  closeModal() {
    this.modalService.isHidden$ = true;
    this.modalService.togglePopUp('home', this.element);
  }

  triggerSettingsDropdown(index: number) {
    this.settings[index] = !this.settings[index];
  }

  mouseLeaveTarget(event: MouseEvent) {
    this.requestStopHighlighting = true;
    setTimeout(() => {
      if (this.requestStopHighlighting) {
        delete this.highlightedActivity;
      }
    }, 400);
  }

  mouseEnterTarget(event: MouseEvent) {
    if (isPlatformBrowser(this.platformId)) {
      const element: Element = event.target as Element;
      const target = find(this.quests, (quest: QuestWithRepeatDateType) =>
        (event.target as Element).classList.contains(`_${quest?.activityType.id}`),
      );
      this.highlightedActivity = target;
      this.questDuration = this.getQuestDuration();
      const screenXCenter = window.innerWidth / 2;
      const screenYCenter = window.innerHeight / 2;
      const goUp = event.clientY - event.offsetY > screenYCenter;
      const goRight = event.clientX - event.offsetX > screenXCenter;
      const isMobile = window.innerWidth < 601 ? true : false;
      this.hightlightCoords = {
        top: goUp ? 'auto' : `${event.clientY - event.offsetY + element.clientHeight + 5}px`,
        left: isMobile ? '10px' : goRight ? 'auto' : `${event.clientX - event.offsetX}px`,
        bottom: goUp ? `${window.innerHeight - (event.clientY - event.offsetY - 5)}px` : 'auto',
        right: isMobile
          ? '10px'
          : goRight
          ? `${window.innerWidth - event.clientX - event.offsetX > 0 ? window.innerWidth - event.clientX - event.offsetX : 10}px`
          : 'auto',
      };
      this.requestStopHighlighting = false;
    }
  }

  getQuestDuration(): number {
    const cycle = this.highlightedActivity.recurrence?.cycle ?? 0;
    const enable = this.highlightedActivity.recurrence?.enable ?? false;
    const repeatDate = this.highlightedActivity.repeatDate;
    if (enable && cycle > 0 && repeatDate && isAfter(parseISO(repeatDate), new Date())) {
      const differenceInMillis = differenceInMilliseconds(parseISO(repeatDate), new Date());
      return differenceInMillis;
    } else {
      return 0;
    }
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
