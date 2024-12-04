import { trim } from 'lodash';
import format from 'date-fns/format';
import isToday from 'date-fns/isToday';
import { FormControl } from '@angular/forms';
import isYesterday from 'date-fns/isYesterday';
import { Observable, Subject, map, of, switchMap, takeUntil } from 'rxjs';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { ListenForNewMessageGQL, MessageType, PointOfSaleType, UnseenMessagesCountType, UserType, WidgetIntegrationType } from '@sifca-monorepo/widget-generator';

import { PlayerService } from '../../player.service';
import { ChatSupportService } from './chat-support.service';
import { ProfileService } from '../profile/profile.service';
import { BASE_URL } from '../../../../../environments/environment';
import { ModalService } from '../../../../shared/services/modal.service';
import { CircularMenuService } from '../../../circular-menu/circular-menu.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
      @import '${BASE_URL}/assets/css/styles.min.css';
      @import '${BASE_URL}/assets/css/vendor/simplebar.css';
      @import '${BASE_URL}/assets/css/vendor/bootstrap.min.css';
      @import '${BASE_URL}/assets/css/emoji/picker.css';

      :root {
        --dynamic-color: #7750f8;
        --dynamic-color2: #615dfa;
        --dynamic-color3: #45437f;
      }
      .fs-17 {
        font-size: 17px;
      }
      @media screen and (max-width: 680px) {
        .chat-widget,
        .navigation-widget-desktop {
          display: block;
        }
      }
      .chat-widget.chat-widget-overlay {
        padding-bottom: 0px;
      }
      .chat-widget-form {
        position: sticky;
        left: 0px;
        z-index: 9999;
        bottom: 10%;
      }
      .emoji-mart .emoji-mart-emoji {
        padding: 6px;
        width: 24px;
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

      .chat-widget-header {
        position: sticky;
        top: 0;
        z-index: 1;
        background-color: white;
        border-radius: 12px;
      }

      .quests.section-filters-bar.v2 .form .form-item.split .form-select {
        width: 100%;
        margin: 0px 6px 0px;
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

      .user-status {
        min-height: 44px;
        padding: 2px 0 0 60px;
        position: relative;
      }

      .chat-height {
        height: 100vh;
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

      .profile-cnt {
        position: relative;
      }

      @media (max-width: 600px) {
        .chat-widget-form {
          margin-top: 50px;
        }
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

      .chat-widget {
        width: auto !important;
      }

      .interactive-input.dark input {
        background-color: #5538b5 !important;
        color: #fff;
      }
      .dark-mode.interactive-input.dark input:-ms-input-placeholder {
        color: #8b88ff !important;
        opacity: 0.6;
      }
      .dark-mode.interactive-input.dark .interactive-input-icon-wrap .interactive-input-icon {
        fill: #9b7dff;
      }
      .dark-mode.interactive-input.dark .interactive-input-action:hover .interactive-input-action-icon {
        fill: #fff;
      }
      .dark-mode.interactive-input.dark .interactive-input-action .interactive-input-action-icon {
        fill: #9b7dff;
      }
      .dark-mode.interactive-input .interactive-input-icon-wrap.actionable .interactive-input-icon:hover {
        fill: #fff !important;
        opacity: 1;
      }
      .dark-mode.interactive-input .interactive-input-icon-wrap .interactive-input-icon {
        fill: #616a82 !important;
        opacity: 0.6 !important;
        transition: fill 0.2s ease-in-out, opacity 0.2s ease-in-out;
      }
      .dark-mode.interactive-input .interactive-input-action:hover .interactive-input-action-icon {
        fill: #fff !important;
        opacity: 1;
      }
      .dark-mode.interactive-input .interactive-input-action .interactive-input-action-icon {
        fill: #616a82 !important;
        opacity: 0.6 !important;
        pointer-events: none !important;
        transition: fill 0.2s ease-in, opacity 0.2s ease-in;
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
      .dark-mode.action-item .action-item-icon {
        fill: #adafca;
      }
      .dark-mode.action-item.dark .action-item-icon {
        fill: #fff;
      }
      .dark-mode.totals-line .totals-line-title .bold {
        color: #fff !important;
      }
      .dark-mode.switch-option .switch-option-meta .bold {
        color: #3e3f5e !important;
        font-weight: 700;
      }
      .dark-mode.user-avatar .user-avatar-border .hexagon-content {
        background-color: #fff;
      }
      .dark-mode.user-avatar .user-avatar-badge .user-avatar-badge-border .hexagon-content {
        background-color: #fff;
      }
      .dark-mode.user-avatar .user-avatar-badge .user-avatar-badge-text {
        color: #fff !important;
      }
      .dark-mode.user-avatar .user-avatar-overlay-content .user-avatar-overlay-content-text {
        color: #fff !important;
      }
      .dark-mode.user-status .user-status-activity.activity-reaction {
        background-color: #8560ff;
      }
      .dark-mode.user-status .user-status-activity.activity-comment {
        background-color: #08b8f1;
      }
      .dark-mode.user-status .user-status-activity.activity-share {
        background-color: #00e2cb;
      }
      .dark-mode.user-status .user-status-activity.activity-update {
        background-color: #66e273;
      }
      .dark-mode.user-status .user-status-activity .user-status-activity-icon {
        fill: #fff;
      }
      .dark-mode.user-status .user-status-title {
        color: #fff !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        line-height: 1.4285714286em;
      }
      .dark-mode.user-status .user-status-title.medium {
        font-size: 16px;
      }
      .dark-mode.user-status .user-status-title.medium + .user-status-text {
        margin-top: 2px;
      }
      .dark-mode.user-status .user-status-title .bold {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.user-status .user-status-title .highlighted {
        color: #fff !important;
        font-weight: 600;
      }
      .dark-mode.user-status .user-status-timestamp {
        margin-top: 10px !important;
        color: #9aa4bf !important;
        font-size: 12px !important;
        font-weight: 500;
      }
      .dark-mode.user-status .user-status-timestamp.small-space {
        margin-top: 4px;
      }
      .dark-mode.user-status .user-status-timestamp.floaty {
        margin-top: 0 !important;
        position: absolute !important;
        top: 7px !important;
        right: 0;
      }
      .dark-mode.user-status .user-status-text {
        margin-top: 4px !important;
        color: #9aa4bf !important;
        font-size: 14px !important;
        font-weight: 500;
      }
      .dark-mode.user-status .user-status-text.small {
        font-size: 12px;
      }
      .dark-mode.user-status .user-status-text.small-space {
        margin-top: 4px;
      }
      .dark-mode.user-status .user-status-text a {
        color: #9aa4bf;
      }
      .dark-mode.user-status .user-status-tag {
        display: inline-block !important;
        height: 20px !important;
        padding: 0 8px !important;
        border-radius: 200px !important;
        background-color: #3e3f5e !important;
        color: #fff !important;
        font-size: 12px !important;
        font-weight: 700 !important;
        line-height: 20px !important;
        text-transform: uppercase !important;
        position: relative !important;
        top: -3px;
      }
      .dark-mode.user-status .user-status-tag.online {
        background-color: #40d04f;
      }
      .dark-mode.user-status .user-status-tag.offline {
        background-color: #f9515c;
      }
      .dark-mode.user-status .user-status-tag.away {
        background-color: #adafca;
      }
      .dark-mode.user-status .user-status-icon {
        opacity: 0.4 !important;
        position: absolute !important;
        top: 10px !important;
        right: 0;
      }
      .dark-mode.user-status .action-request-list {
        position: absolute !important;
        top: 2px !important;
        right: 0;
      }
      .dark-mode.form-box .form {
        margin-top: 76px;
      }
      .dark-mode.dropdown-box-actions .dropdown-box-action .button {
        width: 156px;
      }
      .dark-mode.navigation-widget .navigation-widget-info-wrap .navigation-widget-info .user-avatar {
        position: absolute !important;
        top: 0 !important;
        left: 0;
      }
      .dark-mode.navigation-widget.closed .user-avatar {
        margin: 0 auto;
      }
      .dark-mode.chat-widget {
        background-color: #1d2333 !important;
        box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.06) !important;
        transition: -webkit-transform 0.4s ease-in-out !important;
        transition: transform 0.4s ease-in-out !important;
        transition: transform 0.4s ease-in-out, -webkit-transform 0.4s ease-in-out;
      }
      .dark-mode.chat-widget .chat-widget-messages .chat-widget-message .user-status .user-status-text,
      .chat-widget .chat-widget-messages .chat-widget-message .user-status .user-status-timestamp,
      .chat-widget .chat-widget-messages .chat-widget-message .user-status .user-status-title {
        transition: opacity 0.4s ease-in-out, visibility 0.4s ease-in-out;
      }
      .dark-mode.chat-widget-header {
        padding: 20px 28px !important;
        border-bottom: 1px solid #2f3749 !important;
        position: relative;
      }
      .dark-mode.chat-widget-header .chat-widget-settings {
        position: absolute !important;
        top: 12px !important;
        right: 14px !important;
        z-index: 2;
      }
      .dark-mode.chat-widget-header .chat-widget-close-button {
        display: -ms-flexbox !important;
        display: flex !important;
        -ms-flex-pack: center !important;
        justify-content: center !important;
        -ms-flex-align: center !important;
        align-items: center !important;
        width: 70px !important;
        height: 50px !important;
        cursor: pointer !important;
        position: absolute !important;
        top: 0 !important;
        right: 0 !important;
        z-index: 2;
      }
      .dark-mode.chat-widget-header .chat-widget-close-button .chat-widget-close-button-icon {
        fill: #616a82;
      }
      .dark-mode.chat-widget-conversation {
        height: 615px !important;
        padding: 35px 28px !important;
        background-color: #21283b !important;
        overflow-y: auto;
      }
      .dark-mode.chat-widget-conversation .chat-widget-speaker {
        display: -ms-flexbox !important;
        display: flex !important;
        -ms-flex-flow: column !important;
        flex-flow: column !important;
        position: relative;
      }
      .dark-mode.chat-widget-conversation .chat-widget-speaker + .chat-widget-speaker {
        margin-top: 16px;
      }
      .dark-mode.chat-widget-conversation .chat-widget-speaker.left {
        padding: 0 26px 0 36px;
      }
      .dark-mode.chat-widget-conversation .chat-widget-speaker.left .chat-widget-speaker-avatar {
        left: 0;
      }
      .dark-mode.chat-widget-conversation .chat-widget-speaker.left .chat-widget-speaker-message {
        border-top-left-radius: 0;
      }
      .dark-mode.chat-widget-conversation .chat-widget-speaker.right {
        padding-left: 64px !important;
        -ms-flex-align: end !important;
        align-items: flex-end;
      }
      .dark-mode.chat-widget-conversation .chat-widget-speaker.right .chat-widget-speaker-message {
        border-top-right-radius: 0 !important;
        background-color: var(--dynamic-color) !important;
        color: #fff;
      }
      .dark-mode.chat-widget-conversation .chat-widget-speaker .chat-widget-speaker-avatar {
        position: absolute !important;
        top: 0;
      }
      .dark-mode.chat-widget-conversation .chat-widget-speaker .chat-widget-speaker-message {
        display: inline-block !important;
        padding: 12px !important;
        border-radius: 10px !important;
        background-color: #293249 !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        line-height: 1.1428571429em;
      }
      .dark-mode.chat-widget-conversation .chat-widget-speaker .chat-widget-speaker-message + .chat-widget-speaker-message {
        margin-top: 8px;
      }
      .dark-mode.chat-widget-conversation .chat-widget-speaker .chat-widget-speaker-timestamp {
        margin-top: 12px !important;
        color: #adafca !important;
        font-size: 12px !important;
        font-weight: 500;
      }
      .dark-mode.chat-widget-form {
        background-color: #21283b !important;
      }
      @media screen and (max-width: 960px) {
        .chat-widget-wrap .chat-widget:first-child,
        .chat-widget-wrap .chat-widget:last-child {
          width: 100% !important;
          box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.06);
        }
      }
      .dark-mode.post-preview-line .user-avatar {
        margin-right: 8px;
      }
      .dark-mode.post-comment.reply-2 .user-avatar {
        left: 56px;
      }
      .dark-mode.post-comment .user-avatar {
        position: absolute !important;
        top: 28px !important;
        left: 28px;
      }
      .dark-mode.post-comment .post-comment-text .bold {
        font-weight: 700;
      }
      .dark-mode.post-comment .post-comment-form .user-avatar {
        left: -24px;
      }
      .dark-mode.post-comment-form.with-title .user-avatar {
        top: 82px;
      }
      .dark-mode.post-comment-form .user-avatar {
        position: absolute !important;
        top: 28px !important;
        left: 28px;
      }
      .dark-mode.product-preview .product-preview-info .button {
        margin-top: 36px;
      }
      .dark-mode.video-status .video-status-info .video-status-title .bold {
        font-weight: 700;
      }
      .dark-mode.user-avatar-list.reverse.medium .user-avatar:first-child {
        margin-left: 0;
      }
      .dark-mode.user-avatar-list.reverse.medium .user-avatar:last-child {
        margin-left: -10px;
      }
      .dark-mode.user-avatar-list.medium .user-avatar {
        margin-left: -10px;
      }
      .dark-mode.user-avatar-list.medium .user-avatar:last-child {
        margin-left: 0;
      }
      .dark-mode.user-avatar-list .user-avatar {
        margin-left: -8px;
      }
      .dark-mode.user-avatar-list .user-avatar .user-avatar-border {
        z-index: 3;
      }
      .dark-mode.user-avatar-list .user-avatar:last-child {
        margin-left: 0;
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
      .dark-mode.user-preview .user-preview-footer .user-preview-footer-action.full .button {
        width: 100%;
      }
      .dark-mode.user-preview .user-preview-footer .user-preview-footer-action .button {
        width: 64px !important;
        height: 44px;
      }
      .dark-mode.popup-box .popup-box-body .popup-box-sidebar .popup-box-sidebar-footer .button {
        margin-bottom: 16px;
      }
      .dark-mode.popup-box .popup-box-body .popup-box-sidebar .popup-box-sidebar-footer .button:last-child {
        margin-bottom: 0;
      }
      .dark-mode.popup-box .form {
        margin-top: 32px;
      }
      .dark-mode.popup-box .form .form-row {
        padding: 0 28px;
      }
      .dark-mode.popup-box .form .form-uploadables {
        margin-top: 32px !important;
        padding: 0 28px 40px !important;
        height: 406px !important;
        overflow-y: auto;
      }
      .dark-mode.popup-box .widget-box .form .form-row {
        padding: 0;
      }
      .dark-mode.streamer-box.small .streamer-box-info .button {
        margin-top: 28px;
      }
      .dark-mode.streamer-box .streamer-box-info .button {
        margin-top: 40px !important;
        width: 100%;
      }
      .dark-mode.calendar-event-preview .calendar-event-preview-info .calendar-event-preview-time .bold {
        font-weight: 700;
      }
      .dark-mode.event-preview .event-preview-timestamp .bold {
        font-weight: 700;
      }
      .dark-mode.event-preview .button {
        width: 100% !important;
        margin-top: 38px;
      }
      .dark-mode.forum-post .forum-post-info .forum-post-paragraph .bold {
        font-weight: 700;
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
      .dark-mode.header .header-actions .login-form .button {
        width: 52px !important;
        height: 52px !important;
        -ms-flex-negative: 0 !important;
        flex-shrink: 0;
      }
      .dark-mode a,
      .dark-mode h1,
      .dark-mode h2,
      .dark-mode h3,
      .dark-mode h4,
      .dark-mode h5,
      .dark-mode h6,
      .dark-mode p,
      .dark-mode.quest-item .quest-item-title,
      .dark-mode.quest-item-meta-title {
        color: white;
      }
      .dark-mode.chat-widget-header {
        background-color: #21283b !important;
      }
      .dark-mode use {
        filter: invert(1);
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
      .rtl {
        .user-status .user-status-activity,
        .user-status .user-status-avatar {
          right: 0 !important;
          left: auto !important;
        }
        .user-status-title,
        .user-status-tag {
          margin-right: 60px !important;
        }
        .emoji-btn {
          left: 55px !important;
          right: auto !important;
        }
        .interactive-input .interactive-input-icon-wrap {
          right: auto !important;
          left: 0;
        }
      }

      ::placeholder {
        font-size: 14px !important;
      }
    `,
  ],
})
export class ChatComponent implements OnInit {
  @ViewChild('scrollRef') scrollRef: ElementRef;
  @ViewChild('scrollContainer') private scrollContainer: ElementRef;

  private unsubscribeAll: Subject<any> = new Subject<any>();

  rtl;
  darkMode;
  emoji = '';
  activeModal;
  message: string;
  messageText = '';
  isHidden: boolean;
  baseUrl = BASE_URL;
  currentUserId: string;
  unseenMessages: number;
  showEmojiPicker = false;
  messages: MessageType[];
  unseenMessagesCount: number;
  unCountMessages: UnseenMessagesCountType;
  textInputControl: FormControl = new FormControl();
  pos$: Observable<PointOfSaleType> = this.playerService.pos$;
  currentUser$: Observable<UserType> = this.profileService.currentUser$;
  loadingMessages$: Observable<boolean> = this.chatSupportService.loadingMessages$;
  widgetSettings$: Observable<WidgetIntegrationType> = this.playerService.widgetSettings$;

  constructor(
    private element: ElementRef,
    private modalService: ModalService,
    private playerService: PlayerService,
    private profileService: ProfileService,
    private changeDetectorRef: ChangeDetectorRef,
    private chatSupportService: ChatSupportService,
    private circularMenuService: CircularMenuService,
    private listenForNewMessageGQL: ListenForNewMessageGQL,
  ) {
    this.circularMenuService.messageNotification$ = false;
    this.profileService.currentUser$.pipe(takeUntil(this.unsubscribeAll)).subscribe((currentUser) => {
      this.currentUserId = currentUser?.id;
    });
    this.playerService.unseenMessagesCount$.pipe(takeUntil(this.unsubscribeAll)).subscribe((count) => {
      this.unseenMessagesCount = count;
    });
  }

  ngOnInit(): void {
    this.textInputControl.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        map((query: string) => {
          this.message = query;
        }),
      )
      .subscribe();
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
      this.changeDetectorRef.detectChanges();
    });
    this.modalService.rtl$.subscribe((direction) => {
      this.rtl = direction;
      this.changeDetectorRef.detectChanges();
    });
    this.chatSupportService
      .getMessagesByMemberPaginated()
      .pipe(switchMap((messages) => {
        if (messages?.length && this.unseenMessagesCount > 0) {
          return this.playerService.markAllMessageGroupMessagesAsSeen(messages?.[0]?.messageGroup?.id)
        } else return of(null);
      }))
      .subscribe();
    this.chatSupportService.messages$.pipe(takeUntil(this.unsubscribeAll)).subscribe((messages) => {
      if (messages?.length) {
        this.messages = this.formatDate(messages);
        this.onListScroll();
      }
    });
    this.listenForNewMessageGQL.subscribe({ userId: this.currentUserId }).subscribe(({ data }: any) => {
      this.messages = this.formatDate([...this.messages, data.listenForNewMessage]);
      this.onListScroll();
    });
  }

  onScroll() {
    const element = this.scrollContainer.nativeElement;
    if (element.scrollTop === 0) {
      // this.loadMessages();
    }
  }

  scrollHandler(e) {
    if (e === 'top') {
      this.loadMoreMessages();
    }
  }

  loadMoreMessages() {
    this.chatSupportService.isLastPage$.pipe(takeUntil(this.unsubscribeAll)).subscribe((isLast) => {
      if (!isLast) {
        this.chatSupportService.messagesPageIndex++;
        this.chatSupportService.getMessagesByMemberPaginated().subscribe();
      }
    });
  }

  formatDate(messages: any[]): any[] {
    let lastFormattedTime = '';
    let groupedMessages: any[] = [];

    messages.reduce((acc, message, index) => {
      const createdAt = new Date(message.createdAt);
      let formattedTime = format(createdAt, 'h:mmaa');
      let dateTimeString = '';

      if (isToday(createdAt)) {
        dateTimeString = formattedTime;
      } else if (isYesterday(createdAt)) {
        dateTimeString = `Yesterday at ${formattedTime}`;
      } else {
        dateTimeString = format(createdAt, "MMM d 'at' h:mmaa");
      }

      if (dateTimeString !== lastFormattedTime && acc.length > 0) {
        acc[acc.length - 1].date = lastFormattedTime;
        groupedMessages.push(...acc);
        acc = [];
      }

      lastFormattedTime = dateTimeString;
      acc.push({ ...message, date: '' });

      if (index === messages.length - 1) {
        acc[acc.length - 1].date = lastFormattedTime;
        groupedMessages.push(...acc);
      }

      return acc;
    }, []);

    return groupedMessages;
  }

  send(): void {
    if (!trim(this.message)) {
      return;
    }
    this.chatSupportService.sendMessageToTarget(this.message).subscribe((res) => {
      if (res) {
        setTimeout(() => {
          this.onListScroll();
          this.changeDetectorRef.markForCheck();
        });
      }
    });
    this.textInputControl.reset();
  }

  onListScroll() {
    if (this.scrollRef !== undefined) {
      setTimeout(() => {
        this.scrollRef.nativeElement.scrollTop = this.scrollRef.nativeElement.scrollHeight;
        this.changeDetectorRef.markForCheck();
      }, 500);
    }
  }

  toggleModal(modalName: string): void {
    this.modalService.togglePopUp(modalName, this.element);
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
    this.changeDetectorRef.markForCheck();
  }

  addEmoji(event: any) {
    const emoji = event.emoji.native;
    this.emoji += emoji;
  }

  ngOnDestroy() {
    this.chatSupportService.messages$ = [];
    this.chatSupportService.messagesPageIndex = 0;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
