import { filter, find, findIndex, isEqual, map } from 'lodash';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Component, ViewEncapsulation, OnInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';

import { BASE_URL } from '../../../../../../../environments/environment';
import { GameTypeEnum, QuestActionDefinitionDefinitionGameQuizzType, QuestActivityType, QuestionTypeEnum } from '@sifca-monorepo/widget-generator';
import { QuestsService } from '../../quests.service';
import { Subject, takeUntil } from 'rxjs';
// import { ModalService } from 'apps/widget/angular/src/app/shared/services/modal.service';
import { ModalService } from '../../../../../../shared/services/modal.service';

@Component({
  selector: 'quizz-game',
  templateUrl: './quizz.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
      @import '${BASE_URL}/assets/css/flatpickr/flatpickr.css';
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

      .flatpickr-current-month {
        padding: 0px;
      }
      .numInputWrapper span.arrowUp {
        top: 13px;
        border-bottom: 0;
      }
      .numInputWrapper span {
        height: 11px;
        opacity: 1;
      }
      .numInputWrapper span.arrowDown {
        top: 46%;
      }
      .numInputWrapper span.arrowUp {
        top: 12px;
        border-bottom: 0;
      }
      .text-input {
        width: 100%;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 700;
        height: 54px;
        padding: 0 18px;
        background-color: #fff;
        border: 1px solid #dedeea;
        color: #3e3f5e;
        transition: border-color 0.2s ease-in-out;
      }

      text-input:focus {
        border-color: red !important;
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

      .inline-flatpickr .form-control,
      .flatpickr-calendar.arrowTop:before,
      .flatpickr-calendar.arrowTop:after {
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

      .progress-stat .bar-progress-wrap:first-child {
        margin-bottom: -5px;
      }
      .reaction-emoji:hover,
      .people-choice:hover {
        transform: scale(1.3);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }
      .selected-choice {
        transform: scale(1.3);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }
      .rating.filled .rating-icon {
        fill: #ffe00d;
        transform: scale(1.3);
        transition: transform 0.3s ease;
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

      @media (max-width: 1200px) {
        .special-widget-box {
          padding: 32px 28px;
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

      .quests.reaction-stat .reaction-stat-image {
        width: 40px !important;
        height: 40px;
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
      .challenge.profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
      }

      .poll-box .poll-box-actions {
        margin-top: 0px;
        margin-right: 16px;
      }

      .user-avatar .user-avatar-border {
        position: absolute;
        top: 7px;
        left: 4px;
        z-index: 1;
      }
      .active {
        fill: #fff !important;
      }
      .user-status {
        min-height: 44px;
        padding: 2px 0 0 60px;
        position: relative;
      }
      .sidebar-box .sidebar-box-footer {
        padding: 6px 0px 21px;
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

      .section-filters-bar.v2 .form .form-item.split {
        flex-direction: row;
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

      .section-banner .section-banner-icon {
        width: 92px;
        height: 86px !important;
      }

      .rounded-circle {
        width: 20px;
      }

      .section-menu .section-menu-item {
        float: left;
        width: 120px;
        height: 80px;
        position: relative;
      }

      .special-margin-bottom {
        @media (min-width: 600px) {
          margin-bottom: 72px;
        }
        @media (max-width: 600px) {
          margin-bottom: 70px;
        }
      }

      .form-item-margin {
        margin: 10px 0px;
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
      .form-row.split .form-item {
        margin-right: 0px !important;
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
      .dark-mode .checkbox-wrap input[type='checkbox']:checked + .checkbox-box {
        background-color: #fff !important;
        border-color: #fff !important;
      }
      .dark-mode.checkbox-wrap input[type='radio']:checked + .checkbox-box.round {
        border: 6px solid #fff !important;
      }
      .dark-mode label {
        color: #fff !important;
      }
      .dark-mode.active {
        fill: #fff !important;
      }
      .dark-mode textarea {
        padding: 14px 18px !important;
        resize: none;
      }
      .dark-mode textarea:-ms-input-placeholder {
        color: #9aa4bf !important;
        font-weight: 600;
      }
      .dark-mode.form-input.dark input[type='password'],
      .dark-mode.form-input.dark input[type='text'],
      .dark-mode.form-input.dark textarea {
        background-color: #5538b5 !important;
        color: #fff;
      }
      .dark-mode.form-input.dark input[type='password']:-ms-input-placeholder,
      .dark-mode.form-input.dark input[type='text']:-ms-input-placeholder,
      .dark-mode.form-input.dark textarea:-ms-input-placeholder {
        color: #8b88ff !important;
        opacity: 0.6;
      }
      .dark-mode.form-input.active label {
        background-color: #1d2333 !important;
        padding: 0 6px !important;
        font-size: 12px !important;
        top: -6px !important;
        left: 12px;
      }
      .dark-mode.form-input label {
        color: #9aa4bf !important;
      }
      .dark-mode.form-select label {
        background-color: #1d2333 !important;
        color: #9aa4bf !important;
      }
      .dark-mode.checkbox-line .checkbox-line-text {
        color: #fff !important;
      }
      .dark-mode.interactive-input.dark input {
        background-color: #5538b5 !important;
        color: #fff;
      }
      .dark-mode.interactive-input.dark input:-ms-input-placeholder {
        color: #8b88ff !important;
        opacity: 0.6;
      }
      .dark-mode.form-counter-wrap label {
        background-color: #1d2333 !important;
        color: #9aa4bf !important;
      }
      .dark-mode.icon-more-dots {
        fill: #fff !important;
      }
      .dark-mode h1,
      .dark-mode h2,
      .dark-mode h3,
      .dark-mode h4,
      .dark-mode h5,
      .dark-mode a {
        color: #fff !important;
      }
      .dark-mode a:hover {
        color: #fff !important;
      }
      .dark-mode.button {
        background-color: #293249 !important;
        color: #fff !important;
      }
      .dark-mode.button:hover {
        color: #fff !important;
        background-color: #323e5b !important;
      }
      .dark-mode.button .button-icon {
        fill: #fff !important;
        transition: fill 0.2s ease-in-out;
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
      .dark-mode.xm-tooltip-text {
        padding: 0 12px !important;
        border-radius: 200px !important;
        background-color: #293249 !important;
        color: #fff !important;
        font-size: 12px !important;
        font-weight: 700 !important;
        line-height: 24px;
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
      .dark-mode.slider-control.negative .slider-control-icon {
        fill: #fff;
      }
      .dark-mode.slider-control.negative.disabled:hover .slider-control-icon,
      .slider-control.negative[aria-disabled='true']:hover .slider-control-icon {
        fill: #fff !important;
        opacity: 0.4;
      }
      .dark-mode.slider-control.negative:hover .slider-control-icon {
        fill: #fff !important;
        opacity: 1;
      }
      .dark-mode.slider-control.disabled:hover .slider-control-icon,
      .slider-control[aria-disabled='true']:hover .slider-control-icon {
        fill: #616a82 !important;
        opacity: 0.5;
      }
      .dark-mode.slider-control .slider-control-icon {
        fill: #616a82 !important;
        pointer-events: none !important;
        opacity: 0.6 !important;
        transition: fill 0.2s ease-in-out, opacity 0.2s ease-in-out;
      }
      .dark-mode.slider-control:hover .slider-control-icon {
        fill: #fff !important;
        opacity: 1;
      }
      .dark-mode.simple-dropdown {
        background-color: #293249 !important;
        box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.12);
      }
      .dark-mode.simple-dropdown .simple-dropdown-link:hover {
        color: #fff;
      }
      .dark-mode.rating.dark .rating-icon {
        fill: #616a82;
      }
      .dark-mode.rating.dark.filled .rating-icon {
        fill: #fff10d;
      }
      .dark-mode.rating.filled .rating-icon {
        fill: #ffe00d;
      }
      .dark-mode.rating .rating-icon {
        fill: #616a82;
      }
      .dark-mode.meta-line .meta-line-text a {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.meta-line .meta-line-link.light {
        color: #9aa4bf;
      }
      .dark-mode.meta-line .meta-line-link:hover {
        color: #fff;
      }
      .dark-mode.meta-line .meta-line-timestamp {
        color: #9aa4bf !important;
      }
      .dark-mode.reaction-options {
        background-color: #293249 !important;
        box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.12);
      }
      .dark-mode.post-options {
        border-top: 1px solid #2f3749 !important;
        background-color: #21283b;
      }
      .dark-mode.post-option.active .post-option-icon,
      .post-option:hover .post-option-icon {
        fill: #fff !important;
        opacity: 1;
      }
      .dark-mode.post-option.active .post-option-text,
      .post-option:hover .post-option-text {
        color: #fff;
      }
      .dark-mode.post-option .post-option-icon {
        margin-right: 16px !important;
        fill: #616a82 !important;
        opacity: 0.6 !important;
        transition: fill 0.2s ease-in-out, opacity 0.2s ease-in-out;
      }
      .dark-mode.post-option .post-option-text {
        color: #9aa4bf !important;
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
      .dark-mode.quick-post .quick-post-body .form-textarea textarea {
        height: 120px !important;
        background-color: #21283b !important;
        border-radius: 0 !important;
        border: none;
      }
      .dark-mode.banner-promo img {
        width: 100% !important;
        height: 100% !important;
        border-radius: 12px;
      }
      .dark-mode.sidebar-box {
        background-color: #1d2333 !important;
      }
      .dark-mode.sidebar-box .sidebar-menu + .sidebar-box-footer {
        border-top: 1px solid #2f3749;
      }
      .dark-mode.totals-line .totals-line-title .bold {
        color: #fff !important;
      }
      .dark-mode.switch-option .switch-option-meta .bold {
        color: #3e3f5e !important;
        font-weight: 700;
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
      .dark-mode.cart-item-preview .cart-item-preview-title a {
        color: #fff !important;
        font-weight: 700;
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
      .dark-mode.navigation-widget .navigation-widget-info-wrap .navigation-widget-info .navigation-widget-info-title a {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.navigation-widget.closed .user-avatar {
        margin: 0 auto;
      }
      .dark-mode.chat-widget .chat-widget-messages .chat-widget-message .user-status .user-status-text,
      .chat-widget .chat-widget-messages .chat-widget-message .user-status .user-status-timestamp,
      .chat-widget .chat-widget-messages .chat-widget-message .user-status .user-status-title {
        transition: opacity 0.4s ease-in-out, visibility 0.4s ease-in-out;
      }
      .dark-mode.post-peek .post-peek-title a {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.post-preview-line .post-preview-line-title a {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.post-preview-line .user-avatar {
        margin-right: 8px;
      }
      .dark-mode.post-preview-line .post-preview-line-author a {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.post-comment.reply-2 .user-avatar {
        left: 56px;
      }
      .dark-mode.post-comment .user-avatar {
        position: absolute !important;
        top: 28px !important;
        left: 28px;
      }
      .dark-mode.post-comment .post-comment-text-wrap .rating-list {
        margin-right: 12px;
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
      .dark-mode.post-open .post-open-body .post-open-content .post-open-content-body .tag-list {
        margin-top: 60px;
      }
      .dark-mode.post-open .post-open-body .post-options {
        padding: 0 100px;
      }
      .dark-mode.product-preview.tiny .product-preview-info .product-preview-creator a {
        color: #9aa4bf !important;
        font-weight: 700;
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
      .dark-mode.stream-box.no-video-radius .stream-box-video iframe {
        border-radius: 0;
      }
      .dark-mode.stream-box.big .stream-box-video iframe {
        position: absolute !important;
        top: 0 !important;
        left: 0;
      }
      .dark-mode.stream-box .stream-box-video iframe {
        width: 100% !important;
        height: 100% !important;
        border-top-left-radius: 12px !important;
        border-top-right-radius: 12px;
      }
      .dark-mode.stream-box .stream-box-info .stream-box-title a {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.stream-box .stream-box-info .stream-box-text a {
        color: #9aa4bf !important;
        font-weight: 500;
      }
      .dark-mode.video-status {
        display: block !important;
        border-radius: 12px !important;
        box-shadow: 3px 5px 40px 0 rgba(0, 0, 0, 0.1);
      }
      .dark-mode.video-status .video-status-image {
        width: 100% !important;
        height: auto !important;
        border-top-left-radius: 12px !important;
        border-top-right-radius: 12px;
      }
      .dark-mode.video-status .video-status-info {
        padding: 22px 28px !important;
        border-bottom-left-radius: 12px !important;
        border-bottom-right-radius: 12px !important;
        background-color: #21283b;
      }
      .dark-mode.video-status .video-status-info .video-status-meta {
        color: #fff !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        text-transform: uppercase;
      }
      .dark-mode.video-status .video-status-info .video-status-title {
        margin-top: 12px !important;
        font-size: 18px !important;
        font-weight: 500;
      }
      .dark-mode.video-status .video-status-info .video-status-title .bold {
        font-weight: 700;
      }
      .dark-mode.video-status .video-status-info .video-status-title .highlighted {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.video-status .video-status-info .video-status-text {
        margin-top: 2px !important;
        color: #9aa4bf !important;
        font-size: 14px !important;
        line-height: 1.7142857143em !important;
        font-weight: 500;
      }
      .dark-mode.reaction-item-list .reaction-item .simple-dropdown .simple-dropdown-text:first-child {
        margin-bottom: 10px;
      }
      .dark-mode.user-avatar-list {
        display: -ms-flexbox !important;
        display: flex !important;
        -ms-flex-pack: end !important;
        justify-content: flex-end !important;
        -ms-flex-direction: row-reverse !important;
        flex-direction: row-reverse;
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
      .dark-mode.user-preview .user-preview-info .user-avatar-list {
        margin-top: 34px;
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
      .dark-mode.popup-box .popup-box-body .popup-box-sidebar .popup-box-sidebar-footer .button {
        margin-bottom: 16px;
      }
      .dark-mode.popup-box .popup-box-body .popup-box-sidebar .popup-box-sidebar-footer .button:last-child {
        margin-bottom: 0;
      }
      .dark-mode.popup-box .popup-box-body .popup-box-content .widget-box {
        box-shadow: none;
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
      .dark-mode.calendar-event-preview .calendar-event-preview-info .calendar-event-preview-time .bold {
        font-weight: 700;
      }
      .dark-mode.event-preview .event-preview-timestamp .bold {
        font-weight: 700;
      }
      .dark-mode.event-preview .meta-line {
        margin-top: 26px;
      }
      .dark-mode.event-preview .button {
        width: 100% !important;
        margin-top: 38px;
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
      .dark-mode.header .header-actions .progress-stat {
        width: 110px;
      }
      .dark-mode.header .header-actions .login-form .button {
        width: 52px !important;
        height: 52px !important;
        -ms-flex-negative: 0 !important;
        flex-shrink: 0;
      }
      .dark-mode.section-navigation {
        background-color: #1d2333 !important;
        box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.06) !important;
      }
      .dark-mode.section-navigation .slider-controls .slider-control {
        width: 43px !important;
        height: 80px !important;
        position: absolute !important;
        top: 0;
      }
      .dark-mode.section-navigation .slider-controls .slider-control.left {
        left: 0;
      }
      .dark-mode.section-navigation .slider-controls .slider-control.right {
        right: 0;
      }
      .dark-mode.section-menu {
        height: 80px !important;
        overflow: hidden;
      }
      .dark-mode.section-menu.secondary .section-menu-item.active,
      .section-menu.secondary .section-menu-item:hover {
        border-bottom: 4px solid var(--dynamic-color);
      }
      .dark-mode.section-menu.secondary .section-menu-item.active .section-menu-item-icon {
        fill: var(--dynamic-color);
      }
      .dark-mode.section-menu.medium .section-menu-item {
        width: 160px;
      }
      .dark-mode.section-menu .section-menu-item {
        float: left !important;
        width: 122px !important;
        height: 80px !important;
        position: relative;
      }
      .dark-mode.section-menu .section-menu-item.active {
        border-bottom: 4px solid #fff;
      }
      .dark-mode.section-menu .section-menu-item.active .section-menu-item-icon {
        fill: #fff !important;
        opacity: 1;
      }
      .dark-mode.section-menu .section-menu-item:hover {
        border-bottom: 4px solid #fff;
      }
      .dark-mode.section-menu .section-menu-item:hover .section-menu-item-icon {
        -webkit-transform: translateY(-20px) !important;
        transform: translateY(-20px) !important;
        opacity: 0 !important;
        visibility: hidden;
      }
      .dark-mode.section-menu .section-menu-item:hover .section-menu-item-text {
        -webkit-transform: translate(0) !important;
        transform: translate(0) !important;
        opacity: 1 !important;
        visibility: visible;
      }
      .dark-mode.section-menu .section-menu-item:after {
        content: '' !important;
        width: 1px !important;
        height: 20px !important;
        background-color: #2f3749 !important;
        position: absolute !important;
        top: 30px !important;
        right: 0;
      }
      .dark-mode.section-menu .section-menu-item:first-child:before {
        content: '' !important;
        width: 1px !important;
        height: 20px !important;
        background-color: #2f3749 !important;
        position: absolute !important;
        top: 30px !important;
        left: 0;
      }
      .dark-mode.section-menu .section-menu-item .section-menu-item-icon {
        fill: #616a82 !important;
        opacity: 0.6 !important;
        top: 30px !important;
        left: 50% !important;
        margin-left: -10px;
      }
      .dark-mode.section-menu .section-menu-item .section-menu-item-text {
        width: 100% !important;
        color: #fff !important;
        font-size: 14px !important;
        font-weight: 700 !important;
        text-align: center !important;
        top: 34px !important;
        -webkit-transform: translateY(20px) !important;
        transform: translateY(20px) !important;
        opacity: 0 !important;
        visibility: hidden;
      }
      .dark-mode.section-filters-bar .section-filters-bar-title a {
        color: #fff !important;
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
      .dark-mode.progress-stat .bar-progress-wrap .bar-progress-info.negative {
        color: white;
      }
      .rtl {
        .checkbox-wrap .checkbox-box {
          right: 0 !important;
          left: auto !important;
        }
        .next-button {
          right: auto !important;
          left: 15px !important;
          position: absolute;
          bottom: 15px;
        }
        .icon-custom-arrow {
          transform: scaleX(-1);
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
      .next-button {
        right: 15px;
        position: absolute;
        bottom: 15px;
      }

      ::placeholder {
        font-size: 14px !important;
      }
    `,
  ],
})
export class QuizzComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  @Output() performActivity = new EventEmitter<boolean>();

  darkMode: boolean;
  baseUrl = BASE_URL;
  showAlert: boolean;
  quizzForm: FormGroup;
  gameType: GameTypeEnum;
  selectedChoice: string;
  isButtonDisabled = true;
  isLastActivity: boolean;
  selectedChoices: string[] = [];
  questActivities: QuestActivityType[];
  selectedQuestActivity: QuestActivityType;
  quizz: QuestActionDefinitionDefinitionGameQuizzType;

  get choices(): FormArray {
    return this.quizzForm?.get('choices') as FormArray;
  }

  constructor(private formBuilder: FormBuilder, private modalService: ModalService, private questsService: QuestsService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.questsService.questActivitesByQuest$.pipe(takeUntil(this.unsubscribeAll)).subscribe((questActivitesByQuest) => {
      this.questActivities = questActivitesByQuest;
    });
    this.questsService.selectedQuestActivity$.subscribe((questActivity) => {
      this.selectedQuestActivity = questActivity;
      if (questActivity) {
        this.isLastActivity = this.selectedQuestActivity?.id === this.questActivities[this.questActivities?.length - 1]?.id
      }
      this.quizz = questActivity?.activity?.action?.definition?.game?.quizz;
      this.gameType = questActivity?.activity?.action?.definition?.game?.gameType;
      this.quizzForm = this.formBuilder.group({
        quizzType: [this.quizz?.quizzType],
        choices: this.formBuilder.array(
          map(this.quizz?.choices, (choice) => {
            return this.formBuilder.group({
              item: [choice?.item],
            });
          }),
        ),
      });
      const initialValues = this.quizzForm.value;
      this.quizzForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
        this.isButtonDisabled = isEqual(values, initialValues);
      });
      this.cd.markForCheck();
    });
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
    });
  }

  onChangeMultipleChoice(isChecked: boolean, item: string): void {
    this.showAlert = false;
    if (isChecked) {
      this.selectedChoices.push(item);
    } else {
      const index = this.selectedChoices.indexOf(item);
      if (index > -1) {
        this.selectedChoices.splice(index, 1);
      }
    }
  }

  onChangeSingleChoice(item: string): void {
    this.showAlert = false;
    this.selectedChoice = item;
  }

  nextStep() {
    if (this.isLastActivity) {
      this.performActivity.emit(true);
    } else {
      let index = findIndex(this.questActivities, (item) => item?.id === this.selectedQuestActivity?.id);
      this.questsService.selectedQuestActivity$ = this.questActivities[index + 1];
    }
  }

  navigateNextSlide() {
    if (this.quizz.quizzType === QuestionTypeEnum.SINGLE_CHOICE) {
      const correctAnswer = find(this.quizz?.choices, (choice) => choice?.correct)?.item;
      if (this.selectedChoice === correctAnswer) {
       this.nextStep();
      } else {
        this.showAlert = true;
      }
    } else {
      const correctAnswers = filter(this.quizz?.choices, (choice) => choice?.correct).map((choice) => choice.item);
      if (isEqual(correctAnswers.sort(), this.selectedChoices.sort())) {
        this.nextStep();
      } else {
        this.showAlert = true;
        this.cd.markForCheck();
      }
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
