import { Observable, combineLatest, takeUntil, map as rxMap, Subject } from 'rxjs';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';
import {
  ChallengeType,
  LeaderboardBaseType,
  LoyaltySettingsType,
  LeaderboardCycleEnum,
  WidgetIntegrationType,
  ReputationWithoutTargetType,
  WidgetVisualsType,
  PictureType,
} from '@sifca-monorepo/widget-generator';

import { PlayerService } from '../../player.service';
import { LeaderboardService } from './leaderboard.service';
import { ChallengeService } from '../challenge/challenge.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { BASE_URL, defaultPicture } from '../../../../../environments/environment';
import { find } from 'lodash';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
      @import '${BASE_URL}/assets/css/styles.min.css';
      @import '${BASE_URL}/assets/css/vendor/simplebar.css';
      @import '${BASE_URL}/assets/css/vendor/bootstrap.min.css';
      :host {
        display: contents;
      }
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
      .empty-fill {
        fill: #000000;
      }
      .dark-mode .empty-fill {
        fill: #ffffff;
      }
      .dark-mode.active {
        fill: #fff !important;
      }
      .dark-mode.section-pager-bar {
        background-color: #1d2333 !important;
      }
      .dark-mode.section-pager-bar .section-pager-controls .slider-control {
        background-color: #1d2333 !important;
      }
      .dark-mode.form-input label {
        color: #9aa4bf !important;
      }
      .dark-mode.section-pager .section-pager-item.active .section-pager-item-text,
      .dark-mode.section-pager .section-pager-item:hover .section-pager-item-text {
        background-color: #21283b !important;
        color: #fff;
      }
      .section-pager .section-pager-item .section-pager-item-text {
        background-color: #1d2333 !important;
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

      @media (max-width: 600px) {
        .mr-small {
          margin-right: 8px;
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
export class LeaderboardComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  rtl: boolean;
  blur = false;
  darkMode: boolean;
  baseUrl = BASE_URL;
  isFinalLevel: boolean;
  pagination: IPagination;
  headerImagePath: string;
  challenge: ChallengeType;
  selectedCycle = 'overall';
  groupPicture: PictureType;
  currentLevelPercentage: number;
  defaultPicture = defaultPicture;
  leaderboard: LeaderboardBaseType[];
  loyaltySettings: LoyaltySettingsType;
  widgetSettings: WidgetIntegrationType;
  nextLevel: ReputationWithoutTargetType;
  currentLevel: ReputationWithoutTargetType;
  perPage = this.leaderboardService.pageLimit;
  currentUser$: Observable<LeaderboardBaseType> = this.leaderboardService.currentUser$;
  leaderboard$: Observable<LeaderboardBaseType[]> = this.leaderboardService.leaderboard$;
  loadingLeaderboard$: Observable<boolean> = this.leaderboardService.loadingLeaderboard$;
  widgetSettings$: Observable<WidgetIntegrationType> = this.playerService.widgetSettings$;
  currentLevel$: Observable<ReputationWithoutTargetType> = this.playerService.currentLevel$;

  constructor(
    private element: ElementRef,
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
    private playerService: PlayerService,
    private challengeService: ChallengeService,
    private leaderboardService: LeaderboardService,
  ) {
    this.playerService.widgetVisuals$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widgetVisuals) => {
      if (widgetVisuals) {
        this.groupPicture = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_GROUP_ICON').picture;
        this.cd.markForCheck();
      }
    })
    this.leaderboardService.cycle = LeaderboardCycleEnum.OVERALL;
    this.leaderboardService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.leaderboardService.pageIndex || 0,
        size: this.leaderboardService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.leaderboardService.pageIndex || 0) * this.leaderboardService.pageLimit,
        endIndex: Math.min(((this.leaderboardService.pageIndex || 0) + 1) * this.leaderboardService.pageLimit - 1, pagination?.length - 1),
      };
      this.cd.markForCheck();
    });
    this.playerService.loyaltySettings$.pipe(takeUntil(this.unsubscribeAll)).subscribe((loyaltySettings) => {
      this.loyaltySettings = loyaltySettings;
      this.blur = loyaltySettings?.leaderboard?.blur;
    });
    this.challengeService.selectedChallenge$.pipe(takeUntil(this.unsubscribeAll)).subscribe((challenge) => {
      this.challenge = challenge;
    });
    this.playerService.widgetSettings$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widgetSettings) => {
      this.widgetSettings = widgetSettings;
    });
    combineLatest([this.leaderboardService.leaderboard$, this.leaderboardService.currentUser$])
      .pipe(
        takeUntil(this.unsubscribeAll),
        rxMap(([leaderboard, currentUser]) => {
          this.leaderboard = leaderboard;
          if (leaderboard) {
            this.leaderboard.forEach((data, index) => {
              // console.log("🚀 ~ LeaderboardComponent ~ this.leaderboard.forEach ~ index:", index)
              // console.log("🚀 ~ LeaderboardComponent ~ this.leaderboard.forEach ~ data:", data)
              let color = '';
              if (data?.rank < 4) {
                color = data?.rank === 1 ? '#FFD700' : data?.rank === 2 ? '#C0C0C0' : data?.rank === 3 ? '#CD7F32' : '';
              } else {
                console.log(404, data)
                color = this.widgetSettings?.theme;
              }
              const selector = `.fill${index + 1}`;
              setTimeout(() => {
                this.setStrokeDashoffset(this.element, selector, color);
              }, 1400 + data?.rank * 400);
            });
            setTimeout(() => {
              const strokeStyle =
                currentUser?.rank === 1
                  ? '#FFD700'
                  : currentUser?.rank === 2
                  ? '#C0C0C0'
                  : currentUser?.rank === 3
                  ? '#CD7F32'
                  : this.widgetSettings?.theme;
              this.setStrokeDashoffset(this.element, '.fill', strokeStyle);
            }, 1000);
          }
        }),
      )
      .subscribe();
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
      this.cd.detectChanges();
    });
  }

  onChangeLeaderboard(cycle: string) {
    this.selectedCycle = cycle;
    this.leaderboardService.cycle =
      cycle === 'daily'
        ? LeaderboardCycleEnum.DAILY
        : cycle === 'monthly'
        ? LeaderboardCycleEnum.MONTHLY
        : cycle === 'weekly'
        ? LeaderboardCycleEnum.WEEKLY
        : LeaderboardCycleEnum.OVERALL;
    this.leaderboardService.getLiveLeaderboardByCycleForCurrentUserPaginated().subscribe();
  }

  onPageChange(page: number) {
    this.leaderboardService.pageIndex = page - 1;
    this.leaderboardService.getLiveLeaderboardByCycleForCurrentUserPaginated().subscribe();
  }

  private setStrokeDashoffset(element: ElementRef, selector: string, color: string): void {
    const el = element.nativeElement.shadowRoot.querySelector(selector) as HTMLElement;
    if (el) {
      el.style.stroke = color;
      el.style.strokeDashoffset = '0';
    }
  }

  ngOnDestroy(): void {
    this.leaderboard = null;
    this.leaderboardService.cycle = LeaderboardCycleEnum.OVERALL;
    this.leaderboardService.leaderboard$ = null;
    this.leaderboardService.pageIndex = 0;
    this.playerService.currentPage$ = 1;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
