import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, Renderer2, ViewEncapsulation } from '@angular/core';

import { Card } from '../card';
import { GameService } from '../services/game.service';
import { BASE_URL } from '../../../../../../../../environments/environment';
import { ModalService } from '../../../../../../../shared/services/modal.service';
import { QuestsService } from '../../../quests.service';
import { Subject, Subscription, combineLatest, interval, map, takeUntil, takeWhile } from 'rxjs';
import { GameTimerEnum, MemorySetupEnum, QuestActivityType } from '@sifca-monorepo/widget-generator';
import Swal from 'sweetalert2';
import { findIndex } from 'lodash';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'memory-game',
  templateUrl: './board.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
      @import '${BASE_URL}/assets/css/styles.min.css';
      @import '${BASE_URL}/assets/css/vendor/simplebar.css';
      @import '${BASE_URL}/assets/css/vendor/bootstrap.min.css';

      .swal2-container {
        z-index: 1000000 !important;
      }
      .custom-swal-container {
        z-index: 1000000 !important;
      }

      .wx {
        width: 400px;
      }

      @media (max-width: 430px) {
        .wx {
          width: 350px;
        }
      }
      .control-panel {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 50px;

        &.card-count {
          margin-right: 10px;
        }

        &.btn-new-game {
          margin-left: 10px;
        }
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

      .dark-mode .button {
        background-color: #293249 !important;
        color: #fff !important;
      }

      .dark-mode .button:hover {
        color: #fff !important;
        background-color: #323e5b !important;
      }

      .board {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        margin-left: auto;
        margin-right: auto;
      }
      mat-radio-button ~ .mat-radio-button {
        margin-left: 16px;
      }
      .mat-radio-outer-circle {
        box-sizing: border-box;
        display: block;
        height: 20px;
        left: 0;
        position: absolute;
        top: 0;
        transition: border-color ease 280ms;
        width: 20px;
        border-width: 2px;
        border-style: solid;
        border-radius: 50%;
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
      .icon-custom-arrow:hover {
        fill: #fefefe;
      }
      .icon-custom-arrow {
        fill: #4850bf;
        width: 11px;
        height: 11px;
        margin-left: 5px;
      }
      .mat-radio-input {
        bottom: 3px !important;
        left: 20% !important;
        position: absolute !important;
      }
      .mat-radio-outer-circle {
        border: 6px solid #23d2e2;
        background-color: #fff;
        box-sizing: border-box;
        display: block;
        height: 20px;
        left: 0;
        position: absolute;
        top: 0;
        transition: border-color ease 280ms;
        width: 20px;
        border-width: 4px !important;
        border-style: solid;
        border-radius: 50%;
      }
      mat-radio-button ~ .mat-radio-button {
        margin-left: 0px !important;
        width: 100px;
        height: 30px;
      }
      mat-radio-group {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(2, 1fr);
      }
      .dark-mode.mat-radio-outer-circle {
        border: 6px solid #25f73c !important;
      }
      .bold {
        color: #3e3f5e;
        font-weight: 600;
      }
      .dark-mode .bold {
        color: #fff;
        font-weight: 600;
      }
    `,
  ],
})
export class BoardComponent implements OnInit {
  private subscription: Subscription;
  private unsubscribeAll: Subject<any> = new Subject<any>();

  @Output() performActivity = new EventEmitter<any>();
  @Output() argsUpdate = new EventEmitter<any>();

  darkMode;
  doneMoves: number;
  cardCount: number;
  cards: Card[] = [];
  boardWidth: number;
  isButtonDisabled = true;
  isLastActivity: boolean;
  remainingCardPairs: number;
  questActivities: QuestActivityType[];
  selectedQuestActivity: QuestActivityType;
  timerOn: boolean;
  timeLeft: number;
  displayedTime: string;
  obs = interval(1000);
  timer: number;

  constructor(
    private renderer: Renderer2,
    private cd: ChangeDetectorRef,
    private gameService: GameService,
    private modalService: ModalService,
    private translate: TranslateService,
    private questsService: QuestsService,
  ) {}

  ngOnInit(): void {
    this.questsService.questActivitesByQuest$.pipe(takeUntil(this.unsubscribeAll)).subscribe((questActivitesByQuest) => {
      this.questActivities = questActivitesByQuest;
    });
    this.questsService.selectedQuestActivity$.pipe(takeUntil(this.unsubscribeAll)).subscribe((questActivitesByQuest) => {
      this.selectedQuestActivity = questActivitesByQuest;
      if (questActivitesByQuest) {
        this.isLastActivity = this.selectedQuestActivity?.id === this.questActivities[this.questActivities?.length - 1]?.id;
      }
      this.cardCount =
        questActivitesByQuest?.activity?.action?.definition?.game?.memory?.setup === MemorySetupEnum.EIGHT
          ? 8
          : (this.cardCount =
              questActivitesByQuest?.activity?.action?.definition?.game?.memory?.setup === MemorySetupEnum.FOUR
                ? 4
                : (this.cardCount = questActivitesByQuest?.activity?.action?.definition?.game?.memory?.setup === MemorySetupEnum.SIXTEEN ? 16 : 12));
      this.cd.markForCheck();
    });
    this.gameService.getRemainingCardPairs().subscribe((remainingCardPairs) => {
      if (remainingCardPairs === 0 && this.cards?.length) {
        this.isButtonDisabled = false;
        this.subscription?.unsubscribe();
        this.navigateNextSlide();
      }
      return (this.remainingCardPairs = remainingCardPairs);
    });
    this.gameService.getDoneMoves().subscribe((r) => (this.doneMoves = r));
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
      this.cd.detectChanges();
    });
    this.newGame();
  }

  play() {
    this.timerOn = true;
    this.timer = this.timeLeft =
      this.selectedQuestActivity?.activity?.action?.definition?.game?.memory?.timer === GameTimerEnum.FIVE_MINUTES
        ? 300
        : this.selectedQuestActivity?.activity?.action?.definition?.game?.memory?.timer === GameTimerEnum.HALF_MINUTE
        ? 30
        : this.selectedQuestActivity?.activity?.action?.definition?.game?.memory?.timer === GameTimerEnum?.MINUTE
        ? 60
        : 120;
    this.subscription = this.obs.pipe(takeWhile(() => this.timerOn)).subscribe(() => {
      this.timeLeft--;
      this.displayedTime = this.displayTime(this.timeLeft);
      if (this.timeLeft === 0) {
        combineLatest([this.translate.get('FAILURE_MSG'), this.translate.get('REPLAY_GAME')])
          .pipe(
            map(([failed, tryAgain]) => {
              Swal.fire({
                title: failed,
                text: tryAgain,
                icon: 'warning',
                showCancelButton: false,
                confirmButtonColor: 'rgb(3, 142, 220)',
                cancelButtonColor: 'rgb(243, 78, 78)',
                target: '#fail',
                ...(this.darkMode ? { background: '#1d2333', color: '#fff' } : {}),
              });
              const swalContainer = document.querySelector('.swal2-container');
              if (swalContainer) {
                this.renderer.setStyle(swalContainer, 'z-index', '1000000');
              }
            }),
          )
          .subscribe();
        this.timerOn = false;
      }
    });
  }

  private displayTime(time: number) {
    let min = Math.floor(time / 60);
    let sec = time % 60;
    return sec < 10 ? min.toString() + ':0' + sec.toString() : min.toString() + ':' + sec.toString();
  }

  navigateNextSlide() {
    const index = findIndex(this.questActivities, (qst) => qst?.id === this.selectedQuestActivity?.id);
    const game = {
      index,
      game: {
        activity: this.selectedQuestActivity?.id,
        movesCount: this.doneMoves,
        duration: this.timer - this.timeLeft,
      },
    };
    if (this.isLastActivity) {
      this.performActivity.emit(game);
    } else {
      let index = findIndex(this.questActivities, (item) => item?.id === this.selectedQuestActivity?.id);
      this.questsService.selectedQuestActivity$ = this.questActivities[index + 1];
      this.argsUpdate.emit(game);
    }
  }

  newGame() {
    this.gameService.getCards(this.cardCount).subscribe((r) => {
      this.cards = r;
      setTimeout(() => {
        this.play();
      }, 3000);
    });
  }

  ngOnDestroy(): void {
    this.cards = [];
    this.timerOn = true;
    this.timeLeft = -1;
    this.subscription?.unsubscribe();
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
