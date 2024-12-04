import { Observable, Subject, takeUntil } from 'rxjs';
import {
  GameTimerEnum,
  LoyaltySettingsType,
  QuestActionDefinitionDefinitionGamePuzzleThresholdType,
  QuestActivityType,
  RemunerationDtoType,
} from '@sifca-monorepo/widget-generator';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';

import { QuestsService } from '../../../quests.service';
import { ImageService } from '../services/image.service';
import { PlayerService } from '../../../../../player.service';
import { RouteChangeService } from '../services/route-change.service';
import { BASE_URL } from '../../../../../../../../environments/environment';
import { ModalService } from '../../../../../../../shared/services/modal.service';
import { TimeBlockLimitationService } from '../services/time-block-limitation.service';
import { some } from 'lodash';

@Component({
  selector: 'app-sliding',
  templateUrl: './sliding.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
      @import '${BASE_URL}/assets/css/vendor/bootstrap.min.css';
      @import '${BASE_URL}/assets/css/styles.min.css';

      .experience-design {
        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        align-content: center;
      }
      .dark-mode {
        .section-menu .section-menu-item .section-menu-item-text {
          color: #fff !important;
        }
        .section-menu .section-menu-item.active .section-menu-item-icon {
          fill: #fff !important;
        }
        .text-sticker {
          min-width: 100px !important;
          box-shadow: 3px 5px 20px 0 rgb(0 0 0/12%);
          margin-top: 3px;
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
      }
      .dark-mode.simple-accordion .simple-accordion-header .simple-accordion-icon .icon-minus-small,
      .simple-accordion .simple-accordion-header .simple-accordion-icon .icon-plus-small {
        fill: #fff;
      }
      .dark-mode.stats-box .stats-box-diff .stats-box-diff-icon.positive .icon-plus-small {
        fill: #fff;
      }

      .card {
        text-align: center;
        margin-bottom: 25px;
        padding: 0px !important;
      }

      .card-text {
        font-size: 35px;
      }
      .card-header {
        font-weight: 600;
        background-color: var(--dynamic-color);
        color: white;
      }
      .button {
        display: inline-block;
        border-radius: 10px;
        border: 1px solid var(--dynamic-color);
        background-color: transparent;
        font-size: 14px;
        font-weight: 700;
        text-align: center;
        cursor: pointer;
        transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out, border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        box-shadow: 3px 5px 10px 0 rgba(62, 63, 94, 0.2);
      }
      .button:hover {
        color: #fff !important;
        background-color: var(--dynamic-color) !important;
      }
      .card-header {
        border-radius: inherit !important;
      }
      .dark-mode.widget-box {
        background-color: #1d2333 !important;
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
    `,
  ],
})
export class AppageComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  @Output() argsUpdate = new EventEmitter<any>();
  @Output() performActivity = new EventEmitter<any>();

  timer: number;
  timeLeft: number;
  hasAmount = true;
  darkMode: boolean;
  skipDisplay: boolean;
  puzzleDisplay = false;
  questActivities: QuestActivityType[];
  selectedQuestActivity: QuestActivityType;
  thresholds: QuestActionDefinitionDefinitionGamePuzzleThresholdType[];
  loyaltySettings$: Observable<LoyaltySettingsType> = this.playerService.loyaltySettings$;

  constructor(
    private cd: ChangeDetectorRef,
    private imageService: ImageService,
    private modalService: ModalService,
    private playerService: PlayerService,
    private questsService: QuestsService,
    private routeChangeService: RouteChangeService,
    private timeService: TimeBlockLimitationService,
  ) {}

  ngOnInit(): void {
    this.questsService.questActivitesByQuest$.pipe(takeUntil(this.unsubscribeAll)).subscribe((questActivitesByQuest) => {
      this.questActivities = questActivitesByQuest;
    });
    this.questsService.selectedQuestActivity$.pipe(takeUntil(this.unsubscribeAll)).subscribe((questActivity) => {
      this.selectedQuestActivity = questActivity;
      this.thresholds = this.selectedQuestActivity?.activity?.action?.definition?.game?.sliding?.threshold;
      this.hasAmount = some(this.thresholds, (item) => some(item.bonus, (data: RemunerationDtoType) => data?.amount));
      if (this.thresholds?.length > 0 && this.hasAmount) {
        this.skipDisplay = true;
      }
      if (this.thresholds?.length === 1 && !this.hasAmount) {
        this.timer =
          this.selectedQuestActivity?.activity?.action?.definition?.game?.sliding?.threshold[0]?.timer === GameTimerEnum.FIVE_MINUTES
            ? 300
            : this.selectedQuestActivity?.activity?.action?.definition?.game?.sliding?.threshold[0]?.timer === GameTimerEnum.HALF_MINUTE
            ? 30
            : this.selectedQuestActivity?.activity?.action?.definition?.game?.sliding?.threshold[0]?.timer === GameTimerEnum?.MINUTE
            ? 60
            : this.selectedQuestActivity?.activity?.action?.definition?.game?.sliding?.threshold[0]?.timer === GameTimerEnum?.TWO_MINUTES
            ? 120
            : null;
        this.puzzleDisplay = true;
        this.timeLeft = this.timer;
        this.timeService.setTimeLeft(this.timer);
      } else if (!this.thresholds?.length) {
        this.timer = null;
        this.puzzleDisplay = true;
        this.hasAmount = false;
      }
    });
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
      this.cd.detectChanges();
    });
    this.routeChangeService.setRoute();
  }

  skip() {
    this.puzzleDisplay = true;
    this.timer = null;
  }

  perform(game) {
    this.performActivity.emit(game);
  }

  onArgsUpdate(game) {
    this.argsUpdate.emit(game);
  }

  loadImage(event: any) {
    let file: File = event.target.files[0];
    if (file) {
      let reader = new FileReader();
      reader.onload = (ev) => {
        let imgSrc = ev.target!.result as string;
        /* $('#puzzle-img').attr('src', imgSrc); */
        this.imageService.setPuzzleImgSrc(imgSrc);
      };
      reader.readAsDataURL(file);
    }
  }

  startGame(timeLeft: number): void {
    this.timer = timeLeft;
    this.timeLeft = timeLeft;
    this.timeService.setTimeLeft(timeLeft);
    this.puzzleDisplay = true;
  }

  onPuzzleDisplayChange(display: boolean): void {
    this.puzzleDisplay = display;
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
