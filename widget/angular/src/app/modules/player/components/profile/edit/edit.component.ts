import Swal from 'sweetalert2';
import { cloneDeep, filter, find, forEach, isEqual, keys, map, omit, pickBy, sortBy, values } from 'lodash';
import { Observable, Subject, combineLatest, takeUntil, map as rxMap, identity, of, catchError, switchMap } from 'rxjs';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';

import {
  Gender,
  UserType,
  StateType,
  SocialType,
  CountryType,
  LanguageType,
  AcademicLevel,
  MaritalStatus,
  ZoneTypesEnum,
  DeleteFileFromAwsGQL,
  GenerateS3SignedUrlGQL,
  ReputationWithoutTargetType,
  LoyaltySettingsType,
  WidgetIntegrationType,
  WidgetVisualsType,
  PictureType,
} from '@sifca-monorepo/widget-generator';
import { AmazonS3Helper, FormHelper } from '@diktup/frontend/helpers';

import { ProfileService } from '../profile.service';
import { PlayerService } from '../../../player.service';
import { ModalService } from '../../../../../shared/services/modal.service';
import { AWS_CREDENTIALS, BASE_URL } from '../../../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './edit.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
      @import '${BASE_URL}/assets/css/flatpickr/flatpickr.css';
      @import '${BASE_URL}/assets/css/ng-select/themes/default.theme.css';
      @import '${BASE_URL}/assets/css/styles.min.css';
      @import '${BASE_URL}/assets/css/vendor/simplebar.css';
      @import '${BASE_URL}/assets/css/vendor/bootstrap.min.css';
      @import '${BASE_URL}/assets/css/emoji/picker.css';
      @import '${BASE_URL}/assets/css/swiper/swiper-bundle.css';
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

      .flatpickr-wrapper {
        width: 100% !important;
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

      .custom-select2 {
        height: 48px;
        border-radius: 13px;
        border: 1px solid #dedeea;
        align-items: center;
      }

      .custom-select2 .select2-selection {
        height: 48px !important;
        display: flex;
        align-items: center;
        border-radius: 13px !important;
        border: 1px solid #dedeea !important;
      }

      .swal2-container {
        z-index: 1000000 !important;
      }
      .custom-swal-container {
        z-index: 1000000 !important;
      }

      .popup-event-subtitle {
        margin-bottom: 32px !important;
        font-size: 16px;
        font-weight: 700;
      }

      agm-map {
        height: 240px;
      }

      .fs-17 {
        font-size: 17px;
      }

      @media screen and (max-width: 600px) {
        .b-12 {
          bottom: 12px; /* Applies bottom spacing for small screens */
        }
      }

      @media screen and (min-width: 601px) {
        .b-sm-50 {
          bottom: 50px; /* Applies different bottom spacing for screens larger than 600px */
        }
      }

      .ngb-dp-arrow {
        display: none !important;
      }

      .gap-2 {
        gap: 8px;
      }

      .custom-checkbox {
        appearance: none;
        -webkit-appearance: none;
        width: 1.25em;
        height: 1.25em;
        border: 1px solid #d9d9d9;
        border-radius: 0.25em;
        cursor: pointer;
        display: inline-block;
        position: relative;
      }

      .custom-checkbox:checked {
        background-color: #23d2e2;
        border-color: #23d2e2;
      }

      .custom-checkbox:checked::after {
        content: '\u2714';
        font-size: 1em;
        color: white;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .dropdown-item.active,
      .dropdown-item:active {
        background-color: #e9ecef !important;
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

      .edit-profile.content-grid .section,
      .edit-profile.content-grid .section-header {
        margin-top: 0px;
      }

      .chat.profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
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

      .challenge.profile-header .profile-header-cover img {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
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
      .custom-button {
        width: 40% !important;
        margin-top: 22px;
        margin: 5%;
      }
      .sidebar-box .sidebar-box-footer {
        padding: 6px 0px 21px;
      }

      .edit-profile-card {
        width: -webkit-fill-available;
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

      .section-banner .section-banner-icon {
        width: 92px;
        height: 86px !important;
      }

      .profile-cnt {
        position: relative;
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

      .user-short-description.big .user-short-description-avatar {
        top: -90px;
        margin-left: -74px;
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

      .special-margin-bottom-x {
        margin-bottom: 54px;
        @media (min-width: 600px) {
          margin-bottom: 14px;
          bottom: 8%;
        }
        @media (max-width: 600px) {
          margin-bottom: 14px;
          bottom: 8%;
        }
      }

      .level-backgrund-edit {
        z-index: 600 !important;
        scale: 1.3;
        background: white !important;
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
        background: var(--i) center/cover;
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

      .progress .track {
        stroke: rgb(56, 71, 83);
      }

      .dark-mode label {
        color: #fff !important;
      }
      .dark-mode.active {
        fill: #fff !important;
      }
      textarea {
        padding: 14px 18px !important;
        resize: none;
      }
      textarea:-ms-input-placeholder {
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
      .dark-mode.progress-edit {
        background-color: #161b28 !important;
      }
      .dark-mode.form-select .form-select-icon {
        fill: #fff !important;
        -webkit-transform: rotate(90deg) !important;
        transform: rotate(90deg) !important;
        position: absolute !important;
        top: 20px !important;
        right: 20px !important;
        pointer-events: none;
      }
      .dark-mode.form-select label {
        background-color: #1d2333 !important;
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
      .dark-mode.form-counter-wrap label {
        background-color: #1d2333 !important;
        color: #9aa4bf !important;
      }
      .dark-mode.icon-small-arrow {
        fill: #616a82 !important;
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
      .dark-mode.social-link.void.facebook .icon-facebook {
        fill: #3763d2;
      }
      .dark-mode.social-link.void.twitter .icon-twitter {
        fill: #1abcff;
      }
      .dark-mode.user-short-description .user-short-description-title a {
        color: #fff !important;
      }
      .dark-mode.user-short-description .user-short-description-text {
        color: #9aa4bf !important;
      }
      .dark-mode.user-short-description .user-short-description-text a {
        color: #9aa4bf !important;
      }
      .dark-mode.user-short-description .user-short-description-text a:hover {
        color: #fff;
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
      .dark-mode.upload-box {
        background-color: #1d2333 !important;
      }
      .dark-mode.upload-box:hover .upload-box-icon {
        fill: #fff;
      }
      .dark-mode.upload-box .upload-box-icon {
        fill: #616a82 !important;
        transition: fill 0.25s ease-in-out;
      }
      .dark-mode.upload-box .upload-box-text {
        margin-top: 4px !important;
        color: #9aa4bf !important;
        font-size: 12px !important;
        font-weight: 500;
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
      .dark-mode.user-preview {
        border-radius: 12px !important;
        background-color: #1d2333 !important;
        box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.06);
      }
      .dark-mode.user-preview .user-preview-info .user-short-description + .user-stats {
        margin-top: 30px;
      }
      .dark-mode.user-preview .user-preview-info .user-short-description + .button {
        margin-top: 34px;
      }
      .dark-mode.user-preview .user-preview-info .badge-list {
        margin-top: 28px;
      }
      .dark-mode.user-preview .user-preview-info .user-preview-stats-slides {
        margin-top: 40px;
      }
      .dark-mode.user-preview .user-preview-info .user-preview-stats-roster {
        position: absolute !important;
        top: 22px !important;
        right: 28px;
      }
      .dark-mode.user-preview .user-preview-info .user-preview-text {
        width: 270px !important;
        margin: -10px auto 0 !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        line-height: 1.4285714286em !important;
        text-align: center;
      }
      .dark-mode.user-preview .user-preview-info .social-links {
        margin-top: 24px;
      }
      .dark-mode.user-preview .user-preview-info .user-preview-social-links-wrap {
        height: 36px !important;
        margin-top: 20px !important;
        position: relative;
      }
      .dark-mode.user-preview .user-preview-info .user-preview-social-links-wrap .user-preview-social-links {
        padding-top: 4px !important;
        margin: 0 auto !important;
        position: relative !important;
        z-index: 2;
      }
      .dark-mode.user-preview .user-preview-info .user-preview-social-links-wrap .slider-controls {
        width: 234px !important;
        display: -ms-flexbox !important;
        display: flex !important;
        -ms-flex-pack: justify !important;
        justify-content: space-between !important;
        -ms-flex-align: center !important;
        align-items: center !important;
        position: absolute !important;
        top: 10px !important;
        left: -40px !important;
        z-index: 1;
      }
      .dark-mode.user-preview .user-preview-info .user-avatar-list {
        margin-top: 34px;
      }
      .dark-mode.user-preview .user-preview-info .user-avatar-list + .user-preview-actions {
        margin-top: 36px;
      }
      .dark-mode.user-preview .user-preview-info .user-preview-actions {
        display: -ms-flexbox !important;
        display: flex !important;
        margin-top: 40px;
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
      .dark-mode.user-preview .user-preview-info .user-preview-actions .button.white .button-icon {
        fill: #616a82;
      }
      .dark-mode.user-preview .user-preview-info .user-preview-actions .button.white:hover .button-icon {
        fill: #fff;
      }
      .dark-mode.user-preview .user-preview-info .user-preview-actions .button.full {
        width: 100%;
      }
      .dark-mode.user-preview .user-preview-info .user-preview-actions .button.full .button-icon {
        position: relative !important;
        left: -12px;
      }
      .dark-mode.user-preview .user-preview-author {
        padding-left: 26px !important;
        position: relative;
      }
      .dark-mode.user-preview .user-preview-author .user-preview-author-image {
        position: absolute !important;
        top: 1px !important;
        left: 0;
      }
      .dark-mode.user-preview .user-preview-author .user-preview-author-title {
        font-size: 10px !important;
        font-weight: 500;
      }
      .dark-mode.user-preview .user-preview-author .user-preview-author-text {
        margin-top: 1px !important;
        font-size: 12px !important;
        font-weight: 700;
      }
      .dark-mode.user-preview .user-preview-author .user-preview-author-text a {
        color: #fff !important;
        font-weight: 700;
      }
      .dark-mode.user-preview .user-preview-footer {
        display: -ms-flexbox !important;
        display: flex !important;
        -ms-flex-align: center !important;
        align-items: center !important;
        height: 65px !important;
        border-top: 1px solid #2f3749 !important;
        border-bottom-left-radius: 12px !important;
        border-bottom-right-radius: 12px !important;
        background-color: #21283b;
      }
      .dark-mode.user-preview .user-preview-footer.padded {
        height: auto !important;
        padding: 16px 28px;
      }
      .dark-mode.user-preview .user-preview-footer .user-preview-footer-action {
        display: -ms-flexbox !important;
        display: flex !important;
        -ms-flex-align: center !important;
        align-items: center !important;
        -ms-flex-pack: center !important;
        justify-content: center !important;
        width: 50% !important;
        border-right: 1px solid #2f3749;
      }
      .dark-mode.user-preview .user-preview-footer .user-preview-footer-action:last-child {
        border-right: none;
      }
      .dark-mode.user-preview .user-preview-footer .user-preview-footer-action.full {
        width: 100% !important;
        padding: 0 28px;
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
      .dark-mode.popup-box .popup-box-body .popup-box-sidebar .user-preview {
        box-shadow: none !important;
        border-top-right-radius: 0;
      }
      .dark-mode.popup-box .popup-box-body .popup-box-sidebar .user-preview .user-preview-cover {
        border-top-right-radius: 0;
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
      .dark-mode.section-header-info .section-pretitle {
        color: #9aa4bf !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        text-transform: uppercase;
      }
      .dark-mode.section-header-info .section-title .highlighted {
        color: #fff;
      }
      .dark-mode.section-header-info .section-title .highlighted.secondary {
        color: var(--dynamic-color);
      }
      .dark-mode.section-header-info .section-title.pinned:before {
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
      .dark-mode.background-profile-edit {
        background: #161b28 !important;
      }
      .dark-mode.level-backgrund-edit {
        z-index: 600;
        scale: 1.3;
        background: #161b28 !important;
      }
      .dark-mode.progress-edit .editFill {
        stroke: #40d04f !important;
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
        .checkbox-wrap .checkbox-box {
          right: 0 !important;
          left: auto !important;
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
        .form-select label {
          left: auto !important;
        }
        .form-input label {
          left: auto !important;
        }
        .item-margin {
          margin-right: 0px !important;
          margin-left: 15px !important;
        }
      }
      .item-margin {
        margin-right: 15px;
      }
      .dark-mode.section-menu.secondary .section-menu-item.active,
      .section-menu.secondary .section-menu-item:hover {
        border-bottom: 4px solid var(--dynamic-color);
      }
      .dark-mode.section-menu.secondary .section-menu-item.active .section-menu-item-icon {
        fill: var(--dynamic-color);
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

      .tag-delete:hover {
        color: #dc3545;
      }
      .dark-mode.checkbox-line .checkbox-line-text {
        color: #fff !important;
      }
      .dark-mode .checkbox-wrap input[type='checkbox']:checked + .checkbox-box {
        background-color: #fff !important;
        border-color: #fff !important;
      }
      .dark-mode.checkbox-wrap input[type='radio']:checked + .checkbox-box.round {
        border: 6px solid #fff !important;
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
      .countdown-container {
        font-size: 2em;
        text-align: center;
        padding: 20px;
        background-color: #f0f0f0;
        border-radius: 10px;
        width: 200px;
        margin: 0 auto;
      }

      .dark-mode .dropdown-item.active,
      .dropdown-item:active {
        color: #fff !important;
        background-color: #3a4047 !important;
      }
      .dark-mode .dropdown-item {
        color: #fff !important;
        background-color: #222732 !important;
      }
      .dark-mode .dropdown-menu {
        background-color: #222732 !important;
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
      .mr-15 {
        margin-right: 15px;
      }
      .ml-15 {
        margin-left: 15px;
      }
      .right-0 {
        right: 0px;
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

      .ltr-widget {
        left: 6px;
        position: absolute;
        top: 4px;
      }

      .rtl-widget {
        left: 22px;
        position: absolute;
        top: 4px;
      }
      .ltr-img {
        left: 10px;
      }
      .rtl-img {
        left: -11px;
      }
      .text-truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      ::placeholder {
        font-size: 14px !important;
      }
    `,
  ],
})
export class ProfileEditComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  darkMode;
  state = '';
  country = '';
  rtl: boolean;
  position: any;
  loading = true;
  user: UserType;
  headerImagePath;
  genders: string[];
  baseUrl = BASE_URL;
  initialValues: any;
  userForm: FormGroup;
  states: StateType[];
  media: SocialType[];
  selectedWorkIndex = 0;
  isButtonDisabled = true;
  maritalStatus: string[];
  countries: CountryType[];
  languages: LanguageType[];
  selectedEducationIndex = 0;
  originalStates: StateType[];
  accountHubIcon: PictureType;
  languageNames: string[] = [];
  profileStatsIcon: PictureType;
  originalCountries: CountryType[];
  languageList: LanguageType[] = [];
  hobbyControl = new FormControl('');
  loyaltySettings: LoyaltySettingsType;
  interestControl = new FormControl('');
  levels: string[] = values(AcademicLevel);
  stateInputControl: FormControl = new FormControl();
  workCountryInputControl: FormControl = new FormControl();
  residCountryInputControl: FormControl = new FormControl();
  educationCountryInputControl: FormControl = new FormControl();
  states$: Observable<StateType[]> = this.profileService?.infiniteStates$;
  widgetSettings$: Observable<WidgetIntegrationType> = this.playerService.widgetSettings$;
  currentLevel$: Observable<ReputationWithoutTargetType> = this.playerService.currentLevel$;
  landingBgIcon: PictureType;

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
    private renderer: Renderer2,
    private element: ElementRef,
    private formBuilder: FormBuilder,
    private modalService: ModalService,
    private translate: TranslateService,
    private playerService: PlayerService,
    private amazonS3Helper: AmazonS3Helper,
    private profileService: ProfileService,
    private changeDetectorRef: ChangeDetectorRef,
    private deleteFileFromAwsGQL: DeleteFileFromAwsGQL,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
  ) {
    this.playerService.widgetVisuals$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widgetVisuals) => {
      if (widgetVisuals) {
        this.accountHubIcon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_ACCOUNT_HUB').picture;
        this.profileStatsIcon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_BANNER_PROFILE_STATS').picture;
        this.landingBgIcon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_LANDING_BACKGROUND').picture;
        this.changeDetectorRef.markForCheck();
      }
    });
    combineLatest([
      this.profileService.findCountriesPagination(),
      this.profileService.findSocialsPagination(),
      this.profileService.getLanguages(),
    ]).subscribe(([res, result]) => {
      if (res) {
        this.countries = sortBy(res, ['name']);
        this.originalCountries = sortBy(res, ['name']);
        this.media = result.objects;
        this.changeDetectorRef.markForCheck();
      }
    });
    this.residCountryInputControl.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        rxMap((query: string) => {
          this.userForm.get(['residentialAddress', 'countryName']).patchValue('');
          this.filterCountries(query);
        }),
      )
      .subscribe();

    this.workCountryInputControl.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        rxMap((query: string) => {
          this.work.at(this.selectedWorkIndex).get('countryName').patchValue('');
          this.filterCountries(query);
        }),
      )
      .subscribe();

    this.educationCountryInputControl.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        rxMap((query: string) => {
          this.education.at(this.selectedEducationIndex).get('countryName').patchValue('');
          this.filterCountries(query);
        }),
      )
      .subscribe();

    this.stateInputControl.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        rxMap((query: string) => {
          this.filterStates(query);
        }),
      )
      .subscribe();

    this.profileService.infiniteStates$.pipe(takeUntil(this.unsubscribeAll)).subscribe((states) => {
      this.states = sortBy(states, ['name']);
      this.originalStates = sortBy(states, ['name']);
    });
  }

  ngOnInit(): void {
    this.maritalStatus = filter(Object.values(MaritalStatus), (status) => status !== MaritalStatus.PREFER_NOT_TO_SAY);
    this.genders = filter(Object.values(Gender), (status) => status !== Gender.PREFER_NOT_TO_SAY);
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
      ])
        .pipe(
          takeUntil(this.unsubscribeAll),
          rxMap(([currentLevelPercentage, nextLevel, loyaltySettings, isFinalLevel, currentLevel]) => {
            this.loyaltySettings = loyaltySettings;
            const trackElement = this.element.nativeElement.shadowRoot.querySelector('.track') as HTMLElement;
            const fillElement = this.element.nativeElement.shadowRoot.querySelector('.editFill') as HTMLElement;
            if (fillElement && trackElement) {
              const strokeStyle =
                !nextLevel && !isFinalLevel ? loyaltySettings?.prelevel?.color : isFinalLevel ? currentLevel?.color : nextLevel?.color;
              fillElement.style.strokeDashoffset = `${((100 - (!isFinalLevel ? currentLevelPercentage : 100)) / 100) * 2160}px`;
              trackElement.style.stroke = fillElement.style.stroke = strokeStyle;
              trackElement.style.opacity = '0.4';
            }
            this.changeDetectorRef.markForCheck();
          }),
        )
        .subscribe();
    }, 2000);
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
      this.changeDetectorRef.detectChanges();
    });
    this.modalService.rtl$.subscribe((direction) => {
      this.rtl = direction;
      this.changeDetectorRef.detectChanges();
    });

    this.modalService.headerImagePath$.subscribe((path) => {
      this.headerImagePath = path;
      this.changeDetectorRef.detectChanges();
    });
    this.profileService.languages$.pipe(takeUntil(this.unsubscribeAll)).subscribe((languages) => {
      const filteredLanguages = filter(
        languages,
        (lang) =>
          lang.name === 'Arabic (Saudi Arabia)' ||
          lang.name === 'English (United States)' ||
          lang.name === 'French (Standard)' ||
          lang.name === 'German (Standard)',
      );

      this.languages = filteredLanguages.map((lang) => ({
        ...lang,
        isChecked: this.user?.languages?.some((userLang) => userLang?.id === lang?.id),
      }));
    });
    this.profileService.currentUser$.pipe(takeUntil(this.unsubscribeAll)).subscribe((user) => {
      this.user = user;
      this.position = {
        lng: user?.residentialAddress?.[0]?.location?.coordinates?.[0],
        lat: user?.residentialAddress?.[0]?.location?.coordinates?.[1],
      };
      this.languageNames = map(user?.languages, 'name');
      this.languageList = user?.languages;
      this.country = user?.residentialAddress?.[0]?.country?.name || '';
      this.state = user?.residentialAddress?.[0]?.state?.name || '';
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
        work: this.formBuilder.array(
          user?.work?.length
            ? map(user?.work, (work) => {
                return this.formBuilder.group({
                  to: [work?.to || ''],
                  from: [work?.from || ''],
                  city: [work?.city?.id || undefined],
                  stateName: [work?.city?.name || undefined],
                  states: [[]],
                  country: [work?.country?.id || undefined],
                  countryName: [work?.country?.name || ''],
                  company: [work?.company || ''],
                  position: [work?.position || ''],
                  current: [work?.current || false],
                  description: [work?.description || ''],
                });
              })
            : [
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
              ],
        ),
        education: this.formBuilder.array(
          user?.education?.length
            ? map(user?.education, (education) => {
                return this.formBuilder.group({
                  to: [education?.to || ''],
                  name: [education?.name || ''],
                  from: [education?.from || ''],
                  city: [education?.city?.id || ''],
                  stateName: [education?.city?.name || ''],
                  states: [[]],
                  country: [education?.country?.id || ''],
                  countryName: [education?.country?.name || ''],
                  level: [education?.level || undefined],
                  graduated: [education?.graduated || false],
                  description: [education?.description || ''],
                });
              })
            : [
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
              ],
        ),
        phone: this.formBuilder.group({
          countryCode: [this.user?.phone?.countryCode],
          number: [this.user?.phone?.number],
        }),
        email: [this.user?.email, Validators.email],
        gender: [this.user?.gender || Gender.MALE],
        dateOfBirth: [this.user?.dateOfBirth || ''],
        lastName: [this.user?.lastName || ''],
        username: [this.user?.username || ''],
        about: [this.user?.about || ''],
        languages: [this.user?.languages?.[0]?.id || []],
        firstName: [this.user?.firstName || ''],
        interests: this.formBuilder.array(
          this.user?.interests?.length
            ? map(this.user?.interests, (item) => {
                return this.formBuilder.control(item);
              })
            : [],
        ),
        hobbies: this.formBuilder.array(
          this.user?.hobbies?.length
            ? map(this.user?.hobbies, (item) => {
                return this.formBuilder.control(item);
              })
            : [],
        ),
        maritalStatus: [this.user?.maritalStatus || MaritalStatus.SINGLE],
        residentialAddress: this.formBuilder.group({
          address: [this.user?.residentialAddress?.length ? this.user?.residentialAddress[0]?.address : ''],
          postCode: [this.user?.residentialAddress?.length ? this.user?.residentialAddress[0]?.postCode : ''],
          city: [this.user?.residentialAddress?.length ? this.user?.residentialAddress[0]?.city : undefined],
          country: [this.user?.residentialAddress?.length ? this.user?.residentialAddress[0]?.country?.id : ''],
          countryName: [this.user?.residentialAddress?.[0]?.country?.name || ''],
          state: [this.user?.residentialAddress?.length ? this.user?.residentialAddress[0]?.state?.id : ''],
          stateName: [this.user?.residentialAddress?.[0]?.state?.name || ''],
          states: [[]],
          location: this.formBuilder.group({
            type: [this.user?.residentialAddress?.length ? this.user?.residentialAddress[0]?.location?.type : ZoneTypesEnum.POINT],
            coordinates: [this.user?.residentialAddress?.length ? this.user?.residentialAddress[0]?.location?.coordinates : []],
          }),
        }),
      });
      forEach(this.work.controls, (workControl) => {
        if (workControl.value.country) {
          this.profileService.findStatesByCountryPagination(workControl.value.country).subscribe((res) => {
            workControl.get('states').patchValue(res);
            this.isButtonDisabled = true;
          });
        }
      });
      forEach(this.education.controls, (control) => {
        if (control.value.country) {
          this.profileService.findStatesByCountryPagination(control.value.country).subscribe((res) => {
            control.get('states').patchValue(res);
            this.isButtonDisabled = true;
          });
        }
      });
      const residentialAddressControl = this.userForm.get('residentialAddress');
      if (residentialAddressControl.get('country').value) {
        this.profileService.findStatesByCountryPagination(residentialAddressControl.get('country').value).subscribe((res) => {
          residentialAddressControl.get('states').patchValue(res);
          this.isButtonDisabled = true;
        });
      }
      this.initialValues = this.userForm.value;
      this.userForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
        this.isButtonDisabled = isEqual(this.initialValues, values);
      });
      if (this.media) {
        this.patchSocialValues();
        this.isButtonDisabled = true;
      }
    });
    this.profileService.socialMedia$.pipe(takeUntil(this.unsubscribeAll)).subscribe((res) => {
      this.media = res;
      this.patchSocialValues();
      this.isButtonDisabled = true;
      this.changeDetectorRef.markForCheck();
    });
  }

  addInterest() {
    this.interests.push(this.formBuilder.control(this.interestControl.value));
    this.interestControl.setValue('');
    this.changeDetectorRef.markForCheck();
  }

  removeInterest(index: number) {
    this.interests.removeAt(index);
    this.changeDetectorRef.markForCheck();
  }

  addHobby() {
    this.hobbies.push(this.formBuilder.control(this.hobbyControl.value));
    this.hobbyControl.setValue('');
    this.changeDetectorRef.markForCheck();
  }

  removeHobby(index: number) {
    this.hobbies.removeAt(index);
    this.changeDetectorRef.markForCheck();
  }

  modalSuccess() {
    this.translate.get('WORK_SAVED').subscribe((workSaved: string) => {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: workSaved,
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
    this.translate.get('STH_WENT_WRONG').subscribe((sthWentWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: sthWentWrong,
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

  toggleModal(modalName: string): void {
    this.modalService.togglePopUp(modalName, this.element);
  }

  patchSocialValues() {
    this.userForm.get('socialMedia').patchValue({
      facebook: {
        value: this.user?.socialMedia?.find((item) => item.name.code === 'FB')?.value || '',
        name: this.media?.find((item) => item.code === 'FB')?.id || '',
      },
      instagram: {
        value: this.user?.socialMedia?.find((item) => item.name.code === 'IG')?.value || '',
        name: this.media?.find((item) => item.code === 'IG')?.id || '',
      },
      twitter: {
        value: this.user?.socialMedia?.find((item) => item.name.code === 'TT')?.value || '',
        name: this.media?.find((item) => item.code === 'TT')?.id || '',
      },
      youtube: {
        value: this.user?.socialMedia?.find((item) => item.name.code === 'YT')?.value || '',
        name: this.media?.find((item) => item.code === 'YT')?.id || '',
      },
      tikTok: {
        value: this.user?.socialMedia?.find((item) => item.name.code === 'TK')?.value || '',
        name: this.media?.find((item) => item.code === 'TK')?.id || '',
      },
      linkedin: {
        value: this.user?.socialMedia?.find((item) => item.name.code === 'LI')?.value || '',
        name: this.media?.find((item) => item.code === 'LI')?.id || '',
      },
      pinterest: {
        value: this.user?.socialMedia?.find((item) => item.name.code === 'PR')?.value || '',
        name: this.media?.find((item) => item.code === 'PR')?.id || '',
      },
    });
  }

  upload(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.name = 'fileUpload';
    fileInput.id = 'fileUpload';
    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      const posId = (window as any).widgetInit.appId;
      const timestamp = Date.now();
      const fileName = `${posId}_${timestamp}_${file.name}`;
      this.generateS3SignedUrlGQL
        .fetch({
          fileName,
          fileType: file.type,
        })
        .subscribe(async (res) => {
          const picture = await this.amazonS3Helper.uploadS3AwsWithSignature(
            res.data.generateS3SignedUrl.message,
            file,
            fileName,
            AWS_CREDENTIALS.storage,
            AWS_CREDENTIALS.region,
          );
          const input = {
            picture: {
              path: picture.path,
              baseUrl: picture.baseUrl,
            },
          };
          this.updateCureentUser(input);
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
  }

  removePicture() {
    const fileName = this.user.picture.path;
    this.deleteFileFromAwsGQL.fetch({ fileName }).subscribe((res) => {
      if (res.data.deleteFileFromAws) {
        const input: any = {
          media: { pictures: [{ baseUrl: '', path: '' }] },
        };
        this.updateCureentUser(input);
      }
    });
  }

  updateCureentUser(input) {
    this.profileService
      .updateCurrentUser(input)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
        switchMap(() => {
          return this.profileService.getProfileCompletnessProgress();
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.modalSuccess();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  pickAddress(event) {
    this.position = event.coords;
    this.userForm.get(['residentialAddress', 'location', 'coordinates']).patchValue([event.coords.lng, event.coords.lat]);
  }

  save() {
    this.isButtonDisabled = true;
    const work = map(this.work.value, (value) => {
      const mappedValue = {
        ...pickBy(omit(value, 'countryName', 'stateName', 'states'), identity),
      };
      return Object.keys(mappedValue).length > 0 ? mappedValue : null;
    }).filter(Boolean);
    const education = map(this.education.value, (value) => {
      const mappedValue = {
        ...pickBy(omit(value, 'countryName', 'states', 'stateName'), identity),
      };
      return Object.keys(mappedValue).length > 0 ? mappedValue : null;
    }).filter(Boolean);
    const residentialAddress = {
      ...FormHelper.getNonEmptyValues(omit(this.userForm.get('residentialAddress').value, 'states', 'countryName', 'stateName', 'location')),
      ...(!this.position?.lng
        ? {}
        : {
            location: {
              coordinates: [this.position.lng, this.position.lat],
              type: ZoneTypesEnum.POINT,
            },
          }),
    };
    const socialMediaFormValue = this.userForm?.get('socialMedia').value;
    const socialPlatforms = ['facebook', 'instagram', 'twitter', 'youtube', 'tikTok', 'linkedin', 'pinterest'];
    const socialMedia = socialPlatforms
      .filter((platform) => socialMediaFormValue[platform]?.value !== '')
      .map((platform) => ({
        value: socialMediaFormValue[platform]?.value,
        name: socialMediaFormValue[platform]?.name,
      }));
    const input: any = {
      ...FormHelper.getDifference(
        omit(this.initialValues, 'work', 'education', 'residentialAddress', 'phone', 'socialMedia', 'location', 'interests', 'hobbies'),
        omit(this.userForm.value, 'work', 'education', 'residentialAddress', 'phone', 'socialMedia', 'location', 'interests', 'hobbies'),
      ),
      ...(keys(residentialAddress)?.length ? { residentialAddress } : {}),
      ...(this.initialValues.phone.number !== this.userForm.value.phone.number ||
      this.initialValues.phone.countryCode !== this.userForm.value.phone.countryCode
        ? {
            phone: {
              ...(this.userForm.value.phone === this.initialValues.phone ? {} : { number: this.userForm.value.phone.number }),
              ...(this.userForm.value.phone.countryCode === this.initialValues.phone.countryCode
                ? {}
                : { countryCode: this.userForm.value.phone.countryCode }),
            },
          }
        : {}),
      ...(isEqual(this.initialValues.socialMedia, this.userForm.get('socialMedia').value) ? {} : { socialMedia: socialMedia }),
      ...(isEqual(this.work.value, this.initialValues.work) || !keys(work) ? {} : { work }),
      ...(isEqual(this.education.value, this.initialValues.education) || !keys(education) ? {} : { education }),
      ...(isEqual(
        (this.initialValues.interests ? cloneDeep(this.initialValues.interests) : []).sort(),
        (this.userForm?.value?.interests?.length ? cloneDeep(this.userForm?.value?.interests) : []).sort(),
      )
        ? {}
        : { interests: this.userForm.value.interests }),
      ...(isEqual(
        (this.initialValues.hobbies ? cloneDeep(this.initialValues.hobbies) : []).sort(),
        (this.userForm?.value?.hobbies?.length ? cloneDeep(this.userForm?.value?.hobbies) : []).sort(),
      )
        ? {}
        : { hobbies: this.userForm.value.hobbies }),
    };
    this.updateCureentUser(input);
  }

  patchSocialMediaValues() {
    const socialMediaControls = this.userForm.get('socialMedia');
    socialMediaControls.get('facebook').patchValue({
      value: this.user?.socialMedia?.find((item) => item.name.code === 'FB')?.value || '',
      name: this.media?.find((item) => item.code === 'FB')?.id || '',
    });
    const instagramValue = this.user?.socialMedia?.find((item) => item.name.code === 'IG')?.value || '';
    const instagramId = this.media?.find((item) => item.code === 'IG')?.id || '';
    socialMediaControls.get('instagram').patchValue({ value: instagramValue, name: instagramId });
  }

  onSearchCountry(query: string, field: string, index?: number) {
    this.filterCountries(query);
    // if (field === 'residentialAddress') {
    //   this.userForm.get(['residentialAddress', 'country']).patchValue('');
    // } else if (field === 'work') {
    //   this.work.at(index).get('country').patchValue('');
    // } else if (field === 'education') {
    //   this.education.at(index).get('country').patchValue('');
    // }
  }

  onBlur(): void {
    setTimeout(() => {
      this.countries = this.originalCountries;
    }, 500);
  }

  selectWork(index: number) {
    this.selectedWorkIndex = index;
  }

  selectEducation(index: number) {
    this.selectedEducationIndex = index;
  }

  onCurrentWorkChange(workControl: AbstractControl) {
    workControl.get('current').patchValue(!workControl.get('current').value);
    workControl.get('to').patchValue('');
  }

  onGraduatedChange(educationControl: AbstractControl) {
    educationControl.get('graduated').patchValue(!educationControl.get('graduated').value);
    educationControl.get('to').patchValue('');
  }

  addEducationField() {
    this.education.push(
      this.formBuilder.group({
        to: [''],
        name: [''],
        from: [''],
        city: [''],
        states: [[]],
        country: [''],
        stateName: [''],
        countryName: [''],
        level: [undefined],
        description: [''],
        graduated: [false],
      }),
    );
  }

  addWorkField() {
    this.work.push(
      this.formBuilder.group({
        to: [''],
        from: [''],
        country: [undefined],
        countryName: [''],
        city: [undefined],
        stateName: [''],
        states: [[]],
        company: [''],
        position: [''],
        current: [false],
        description: [''],
      }),
    );
  }

  removeWorkField(index: number) {
    this.work.removeAt(index);
  }

  removeEducationField(index: number) {
    this.education.removeAt(index);
  }

  filterStates(searchTerm: string) {
    this.states = filter(this.originalStates, (state) => state.name?.toLowerCase().includes(searchTerm !== null ? searchTerm?.toLowerCase() : ''));
  }

  filterCountries(searchTerm: string) {
    this.countries = filter(this.originalCountries, (country) =>
      country.name?.toLowerCase().includes(searchTerm !== null ? searchTerm?.toLowerCase() : ''),
    );
  }

  onLanguageChange(language?: LanguageType, isChecked?: boolean) {
    if (isChecked) {
      this.languageNames.push(language.name);
      this.languageList = [...(this.languageList || []), language];
    } else {
      const index = this.languageNames.indexOf(language.name);
      if (index > -1) {
        this.languageNames.splice(index, 1);
        this.languageList = this.languageList.filter((lang) => lang.id !== language.id);
        this.user = {
          ...this.user,
          languages: this.languageList,
        };
      }
    }
    this.userForm.get('languages').patchValue(this.languageList.map((lang) => lang.id));
    this.languages = this.languages.map((lang) => ({
      ...lang,
      isChecked: this.languageList.some((userLang) => userLang.id === lang.id),
    }));
  }

  onChangeWorkCountry(country: CountryType, workControl: AbstractControl) {
    this.workCountryInputControl.patchValue('');
    workControl.get('country').patchValue(country.id);
    workControl.get('countryName').patchValue(country.name);
    workControl.get('city').patchValue('');
    workControl.get('stateName').patchValue('');
    this.profileService.findStatesByCountryPagination(country?.id).subscribe((res) => {
      workControl.get('states').patchValue(res);
    });
  }

  onChangeWorkState(state: StateType, workControl: AbstractControl) {
    this.stateInputControl.patchValue('');
    workControl.get('city').patchValue(state.id);
    workControl.get('stateName').patchValue(state.name);
  }

  onChangeEducationCountry(country: CountryType, educationControl: AbstractControl) {
    this.educationCountryInputControl.patchValue('');
    educationControl.get('country').patchValue(country.id);
    educationControl.get('countryName').patchValue(country.name);
    educationControl.get('city').patchValue('');
    educationControl.get('stateName').patchValue('');
    this.profileService.findStatesByCountryPagination(country?.id).subscribe((res) => {
      if (res) {
        educationControl.get('states').patchValue(res);
      }
    });
  }

  onChangeEducationState(state: StateType, educationControl: AbstractControl) {
    this.stateInputControl.patchValue('');
    educationControl.get('city').patchValue(state.id);
    educationControl.get('stateName').patchValue(state.name);
  }

  onChangeField(item: any, field: string) {
    if (field === 'maritalStatus') {
      this.userForm.get('maritalStatus').patchValue(item);
    } else if (field === 'gender') {
      this.userForm.get('gender').patchValue(item);
    } else if (field === 'country') {
      this.country = item.name;
      this.residCountryInputControl.patchValue('');
      this.userForm.get(['residentialAddress', 'country']).patchValue(item.id);
      this.userForm.get(['residentialAddress', 'countryName']).patchValue(item.name);
      this.userForm.get(['residentialAddress', 'state']).patchValue('');
      this.userForm.get(['residentialAddress', 'stateName']).patchValue('');
      this.profileService.findStatesByCountryPagination(item?.id).subscribe((res) => {
        if (res) {
          this.userForm.get(['residentialAddress', 'states']).patchValue(res);
        }
      });
    } else if (field === 'state') {
      this.state = item.name;
      this.stateInputControl.patchValue('');
      this.userForm.get(['residentialAddress', 'state']).patchValue(item.id);
      this.userForm.get(['residentialAddress', 'stateName']).patchValue(item.name);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
