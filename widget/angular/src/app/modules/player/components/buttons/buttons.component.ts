import isAfter from 'date-fns/isAfter';
import parseISO from 'date-fns/parseISO';
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';

import { PictureType, QuestWithRepeatDateType, WidgetVisualsType } from '@sifca-monorepo/widget-generator';

import { PlayerService } from '../../player.service';
import { BASE_URL } from '../../../../../environments/environment';
import { CustomQuestStatus } from '../reputation/custom-quest-status';
import { ModalService } from '../../../../shared/services/modal.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { find } from 'lodash';

@Component({
  selector: 'app-buttons',
  templateUrl: './buttons.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
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

      :host {
        display: contents;
      }

      .experience-design {
        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        align-content: end;
      }

      @media (max-width: 600px) {
        .point-reward-box {
          display: -ms-flexbox;
          display: flex !important;
          flex-direction: column !important;
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

      .text-sticker {
        min-width: 100px !important;
        box-shadow: 3px 5px 20px 0 rgb(0 0 0/12%);
        margin-top: 3px;
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
      .empty-fill {
        fill: #000000;
      }

      .dark-mode .widget-box {
        background-color: #1d2333 !important;
      }

      .widget-box {
        background-color: #fff;
      }

      .dark-mode {
        .empty-fill {
          fill: #ffffff;
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
        .point-reward-box {
          background-color: #1d2333 !important;
        }
        .product-preview.small .product-preview-info .text-sticker {
          right: -8px;
        }
        .product-preview .product-preview-info .text-sticker {
          position: absolute !important;
          top: -14px !important;
          right: 14px;
        }
        .album-preview .text-sticker {
          position: absolute !important;
          top: 18px !important;
          right: 18px !important;
          z-index: 3 !important;
          pointer-events: none;
        }
        .badge-item-stat .text-sticker {
          position: absolute !important;
          top: 10px !important;
          right: -6px;
        }
        .quest-item .text-sticker {
          color: white;
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
          color: white !important;
        }
      }
      .l-auto {
        left: auto !important;
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
export class ButtonsComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  darkMode;
  rtl: boolean;
  countDown: any;
  headerImagePath;
  baseUrl = BASE_URL;
  badgesIcon: PictureType;
  authenticated$: Observable<boolean> = this.playerService.authenticated$;
  loadingQuests$: Observable<boolean> = this.playerService.loadingQuests$;
  quests$: Observable<QuestWithRepeatDateType[]> = this.playerService.quests$;

  constructor(private modalService: ModalService, private playerService: PlayerService, private cd: ChangeDetectorRef) {
    this.modalService.rtl$.subscribe((direction) => {
      this.rtl = direction;
      this.cd.detectChanges();
    });
    this.playerService.widgetVisuals$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widgetVisuals) => {
      if (widgetVisuals) {
        this.badgesIcon = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_BADGES_ICON').picture;
      }
    })
  }

  ngOnInit(): void {
    this.playerService.findPredefinedQuestsByTargetWithRepeatDate().subscribe();
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
      this.cd.detectChanges();
    });

    this.modalService.headerImagePath$.subscribe((path) => {
      this.headerImagePath = path;
      this.cd.detectChanges();
    });
  }

  getQuestStatusText(quest: QuestWithRepeatDateType): string {
    const status = this.getQuestStatus(quest);
    switch (status) {
      case CustomQuestStatus.RecurrentNotDone:
        return 'RecurrentNotDone';
      case CustomQuestStatus.RecurrentDone:
        return 'RecurrentDone';
      case CustomQuestStatus.OnceNotDone:
        return 'OnceNotDone';
      case CustomQuestStatus.Unlimited:
        return 'Unlimited';
      case CustomQuestStatus.OnceDone:
        return 'OnceDone';
      default:
        return 'Unknown';
    }
  }

  getQuestStatus(quest: QuestWithRepeatDateType): CustomQuestStatus {
    const cycle = quest.recurrence?.cycle ?? -1;
    const enable = quest.recurrence?.enable ?? false;
    const repeatDate = quest.repeatDate;
    if (enable && cycle === 0) {
      return CustomQuestStatus.Unlimited;
    }
    if (!enable) {
      return repeatDate === null ? CustomQuestStatus.OnceNotDone : CustomQuestStatus.OnceDone;
    }
    if (enable && cycle > 0) {
      return repeatDate === null
        ? CustomQuestStatus.RecurrentNotDone
        : isAfter(parseISO(repeatDate), new Date())
        ? CustomQuestStatus.RecurrentDone
        : CustomQuestStatus.RecurrentNotDone;
    }
    return CustomQuestStatus.Unknown;
  }

  getCountdown(quest: QuestWithRepeatDateType): any {
    if (!quest.repeatDate) return null;
    const cycle = quest.recurrence?.cycle ?? 0;
    const enable = quest.recurrence?.enable ?? false;
    const repeatDate = quest.repeatDate;
    if (enable && cycle > 0 && repeatDate && isAfter(parseISO(repeatDate), new Date())) {
      const questDate = new Date(repeatDate);
      const now = new Date();
      const difference = Math.abs(questDate.getTime() - now.getTime());
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      this.countDown = { days, hours, minutes, seconds };
      return { days, hours, minutes, seconds };
    } else {
      this.countDown = 0;
      return 0;
    }
  }

  getUserCountdown(quest: QuestWithRepeatDateType): any {
    if (!quest?.startDate || !quest?.dueDate) return null;
    const dueDate = quest.dueDate;

    if (dueDate && isAfter(parseISO(dueDate), new Date())) {
      const questDate = new Date(dueDate);
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

  getComingCountdown(quest: QuestWithRepeatDateType): any {
    if (!quest.startDate) return null;
    const startDate = quest.startDate;
    if (startDate && isAfter(parseISO(startDate), new Date())) {
      const questDate = new Date(startDate);
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

  getQuestDuration(quest: QuestWithRepeatDateType): number {
    const cycle = quest.recurrence?.cycle ?? 0;
    const enable = quest.recurrence?.enable ?? false;
    const repeatDate = quest.repeatDate;

    if (enable && cycle > 0 && repeatDate && isAfter(parseISO(repeatDate), new Date())) {
      const differenceInMillis = differenceInMilliseconds(parseISO(repeatDate), new Date());
      return differenceInMillis;
    } else {
      return 0;
    }
  }

  getQuestColor(quest: QuestWithRepeatDateType): string {
    const status = this.getQuestStatus(quest);
    switch (status) {
      case CustomQuestStatus.OnceDone:
        return 'danger';
      case CustomQuestStatus.OnceNotDone:
        return 'success';
      case CustomQuestStatus.RecurrentDone:
        return 'warning';
      case CustomQuestStatus.RecurrentNotDone:
        return 'success';
      case CustomQuestStatus.Unlimited:
        return 'success';
      default:
        return 'light';
    }
  }

  getQuestIconData(quest: QuestWithRepeatDateType): string {
    switch (this.getQuestStatus(quest)) {
      case CustomQuestStatus.OnceDone:
        return 'check-icon';
      case CustomQuestStatus.OnceNotDone:
      case CustomQuestStatus.RecurrentDone:
      case CustomQuestStatus.RecurrentNotDone:
        return 'time-icon';
      case CustomQuestStatus.Unlimited:
        return 'typhoon-icon';
      default:
        return 'question-icon';
    }
  }
}
