import isAfter from 'date-fns/isAfter';
import parseISO from 'date-fns/parseISO';
import { DOCUMENT } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ChangeDetectorRef, Component, Inject, Input, OnInit, ViewEncapsulation } from '@angular/core';

import { LoyaltySettingsType, QuestWithRepeatDateType } from '@sifca-monorepo/widget-generator';

import { ModalService } from '../../services/modal.service';
import { BASE_URL } from '../../../../environments/environment';
import { PlayerService } from '../../../modules/player/player.service';
import { CustomQuestStatus } from '../../../modules/player/components/reputation/custom-quest-status';

@Component({
  selector: 'fw-activity-hightlight',
  templateUrl: './activity-hightlight.component.html',
  styles: [
    `
      @import '${BASE_URL}/assets/css/styles.min.css';
      @import '${BASE_URL}/assets/css/vendor/simplebar.css';
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

      .mxh-11 {
        max-height: 176px;
      }

      @media (max-width: 1199px) {
        .mxh-12 {
          max-height: 192px;
        }
      }

      @media (max-width: 681px) {
        .mxh-13 {
          max-height: 148px;
        }
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

      .dark-mode {
        .widget-box {
          padding: 0px 0px;
          border-radius: 12px;
          background-color: #1d2333 !important;
          box-shadow: 0 0 40px 0 #5e5c9a0f;
          position: relative;
        }

        .exp-line-text,
        .widget-box-title {
          color: #fff !important;
        }

        .text-sticker {
          min-width: 100px !important;
          box-shadow: 3px 5px 20px 0 rgb(0 0 0/12%);
          margin-top: 3px;
          color: #fff;
          background-color: #293249 !important;
          box-shadow: 3px 5px 20px 0 rgba(0, 0, 0, 0.12) !important;
        }

        .text-sticker .text-sticker-icon {
          margin-right: 4px !important;
          fill: #fff !important;
        }
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
        @media (min-width: 1200px) {
          max-width: 45%;
          max-height: 100%;
        }

        @media (700px<width<1200px) {
          max-width: 70%;
          max-height: 100%;
        }

        @media (max-width: 700px) {
          width: 90%;
          max-height: 100%;
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

      .level-24 .achievement-box {
        flex-direction: column;
        padding: 28px 18px;
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
      .countdown {
        direction: ltr;
        unicode-bidi: isolate;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class ActivityHightlightComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  @Input() questColor: string;
  @Input() cordsStyle: any;
  @Input() questDuration: number;
  @Input() questStatusText: string;
  @Input() quest: QuestWithRepeatDateType;
  @Input() questStatus: CustomQuestStatus;

  loaded: boolean;
  darkMode: boolean;
  baseUrl = BASE_URL;
  authenticated: boolean;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.playerService.loyaltySettings$;

  constructor(
    private modalService: ModalService,
    private playerService: PlayerService,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT) protected document: Document,
  ) {
    this.playerService.authenticated$.pipe(takeUntil(this.unsubscribeAll)).subscribe((authenticated: boolean) => {
      this.authenticated = authenticated;
    });
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
      this.changeDetectorRef.detectChanges();
    });
    setTimeout(() => {
      this.loaded = true;
    }, 300);
  }

  ngOnInit() {}

  getCountdown(quest: QuestWithRepeatDateType): any {
    if (!quest.repeatDate) return null;
    const cycle = quest.recurrence?.cycle ?? 0;
    const enable = quest.recurrence?.enable ?? false;
    const repeatDate = quest?.repeatDate;
    if (enable && cycle > 0 && repeatDate && isAfter(parseISO(repeatDate), new Date())) {
      const questDate = new Date(repeatDate);
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

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
