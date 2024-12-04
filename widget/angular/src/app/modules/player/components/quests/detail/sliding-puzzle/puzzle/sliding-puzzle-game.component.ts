import Swal from 'sweetalert2';
import { findIndex } from 'lodash';
import { Subject, Subscription, combineLatest, interval } from 'rxjs';
import { wrapGrid } from 'animate-css-grid';
import { map, takeUntil, takeWhile } from 'rxjs/operators';
import { Input, OnInit, Output, Component, Renderer2, ElementRef, EventEmitter, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';

import { QuestActionDefinitionDefinitionGamePuzzleThresholdType, QuestActivityType } from '@sifca-monorepo/widget-generator';

import { QuestsService } from '../../../quests.service';
import { BASE_URL } from '../../../../../../../../environments/environment';
import { ModalService } from '../../../../../../../shared/services/modal.service';
import { TimeBlockLimitationService } from '../services/time-block-limitation.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sliding-puzzle-game',
  templateUrl: './sliding-puzzle-game.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
      @import '${BASE_URL}/assets/css/vendor/bootstrap.min.css';
      @import '${BASE_URL}/assets/css/styles.min.css';

      .icon-custom-arrow {
        fill: #4850bf;
        width: 11px;
        height: 11px;
        margin-left: 5px;
      }

      .swal2-container {
        z-index: 1000000 !important;
      }
      .custom-swal-container {
        z-index: 1000000 !important;
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

      .grid {
        display: grid;
        grid-template-areas:
          'A B C'
          'D E F'
          'G H I';
      }

      .tile {
        height: 0;
        padding-bottom: 100%;
        grid-area: var(--area, auto);
        background-size: 300%;
      }
      canvas {
        display: none !important;
      }

      .tile--1 {
        background-position: top left;
      }
      .tile--2 {
        background-position: top center;
      }
      .tile--3 {
        background-position: top right;
      }
      .tile--4 {
        background-position: center left;
      }
      .tile--5 {
        background-position: center;
      }
      .tile--6 {
        background-position: center right;
      }
      .tile--7 {
        background-position: bottom left;
      }
      .tile--8 {
        background-position: bottom center;
      }
      .tile--empty {
        background-position: bottom right;
      }

      .grid > button {
        border: none;
      }

      .modal {
        pointer-events: none;
      }

      .modal-dialog {
        pointer-events: all;
      }
      .grid {
        display: grid;
        grid-template-columns: auto !important;
        grid-gap: 2px !important;
        -ms-flex-align: start;
        align-items: start;
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
export class PgpageComponent implements OnInit {
  private subscription: Subscription;
  private unsubscribeAll: Subject<any> = new Subject<any>();

  @Input() timer: number;
  @Input() timeLeft: number;
  @Input() hasAmount: boolean;

  @Output() argsUpdate = new EventEmitter<any>();
  @Output() performActivity = new EventEmitter<any>();
  @Output() puzzleDisplayChange = new EventEmitter<boolean>();

  grid: any;
  tiles: any;
  prize: any;
  moveCount = 0;
  imgData: string;
  puzzleKeys: any;
  showImage = false;
  darkMode: boolean;
  baseUrl = BASE_URL;
  obs = interval(1000);
  displayedTime: string;
  retryTime: string = '';
  isLastActivity: boolean;
  timerOn: boolean = false;
  timeBlockLimitation: number;
  isRetryButtonDisabled = true;
  questActivities: QuestActivityType[];
  selectedQuestActivity: QuestActivityType;
  thresholds: QuestActionDefinitionDefinitionGamePuzzleThresholdType[];

  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
    private translate: TranslateService,
    private questsService: QuestsService,
    private timeBlockLimitationService: TimeBlockLimitationService,
  ) {
    this.puzzleKeys = {
      A: ['B', 'D'],
      B: ['A', 'C', 'E'],
      C: ['B', 'F'],
      D: ['A', 'E', 'G'],
      E: ['B', 'D', 'F', 'H'],
      F: ['C', 'E', 'I'],
      G: ['D', 'H'],
      H: ['E', 'G', 'I'],
      I: ['F', 'H'],
    };
    this.timeLeft = this.timeBlockLimitationService.getTimeLeft();
    this.displayedTime = this.displayTime(this.timeLeft);
    this.timeBlockLimitation = this.timeBlockLimitationService.getLimitation();
  }

  ngOnInit(): void {
    this.questsService.questActivitesByQuest$.pipe(takeUntil(this.unsubscribeAll)).subscribe((questActivitesByQuest) => {
      this.questActivities = questActivitesByQuest;
    });
    this.questsService.selectedQuestActivity$.pipe(takeUntil(this.unsubscribeAll)).subscribe((questActivity) => {
      this.selectedQuestActivity = questActivity;
      this.thresholds = this.selectedQuestActivity?.activity?.action?.definition?.game?.sliding?.threshold;
      if (questActivity) {
        this.isLastActivity = this.selectedQuestActivity?.id === this.questActivities[this.questActivities?.length - 1]?.id;
      }
      this.grid = this.element.nativeElement.shadowRoot.querySelector('.grid') as HTMLElement;
      let canvas = this.element.nativeElement.shadowRoot.appendChild(document.createElement('canvas') as HTMLCanvasElement);
      canvas.width = 480;
      canvas.height = 480;
      let context = canvas.getContext('2d')!;
      let img = new Image();
      const encodedPath = encodeURIComponent(questActivity?.activity?.action?.definition?.game?.sliding?.picture?.path);
      this.imgData = `${questActivity?.activity?.action?.definition?.game?.sliding?.picture.baseUrl}/${encodedPath}`;
      img.src = this.imgData;
      console.log("🚀 ~ PgpageComponent ~ this.questsService.selectedQuestActivity$.pipe ~ this.imgData:", this.imgData)
      img.onload = () => {
        context.drawImage(img, 0, 0, 480, 480);
        if (this.element.nativeElement.shadowRoot.querySelector('#puzzle-img')) {
          (this.element.nativeElement.shadowRoot.querySelector('#puzzle-img') as HTMLImageElement).src = this.imgData;
        }
        this.tiles = this.element.nativeElement.shadowRoot.querySelectorAll('.tile');
        for (let i = 0; i < this.tiles.length; i++) {
          let tile = this.tiles[i] as HTMLElement;
          tile.style.backgroundImage = 'url(' + this.imgData + ')';
          if (tile.classList.contains('tile--empty')) {
            tile.style.opacity = '0.5';
          }
        }
        this.shuffle();
        this.addListeners();
      };
    });
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
      this.cd.detectChanges();
    });
  }

  exitGame(): void {
    this.puzzleDisplayChange.emit(false);
  }

  private displayTime(time: number) {
    let min = Math.floor(time / 60);
    let sec = time % 60;
    return sec < 10 ? min.toString() + ':0' + sec.toString() : min.toString() + ':' + sec.toString();
  }

  private addListeners() {
    Array.from(this.tiles).map((tile) => {
      (tile as HTMLInputElement).addEventListener('click', this.tileMovement);
    });
  }

  tileMovement = (event: MouseEvent) => {
    const { forceGridAnimation } = wrapGrid(this.grid);
    if (this.timerOn == false) {
      if (this.timer) {
        this.timerOn = this.timer ? true : false;
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
            Array.from(this.tiles).map((tile) => ((tile as HTMLInputElement).disabled = true));
            let count = this.timeBlockLimitation * 60;
            const decTimeBlock = () => {
              setTimeout(() => {
                if (count !== 0) {
                  count--;
                  let min = Math.floor(count / 60);
                  let sec = count % 60;
                  let retryTime = sec < 10 ? `${min}:0${sec}` : `${min}:${sec}`;
                  this.retryTime = retryTime;
                  if (retryTime === '0:00') {
                    this.timeLeft = this.timeBlockLimitationService.getTimeLeft();
                  }
                  decTimeBlock();
                }
              }, 1);
            };
            decTimeBlock();
          }
        });
      }
    }
    const target = event.target as HTMLElement;
    const currentButton = target.closest('.tile') as HTMLElement | null;

    if (!currentButton) {
      return;
    }
    const tileArea = currentButton.style.getPropertyValue('--area');
    const emptyTile = this.element.nativeElement.shadowRoot.querySelector('.tile--empty') as HTMLElement;
    const emptyTileArea = emptyTile.style.getPropertyValue('--area');
    emptyTile.style.setProperty('--area', tileArea);
    currentButton.style.setProperty('--area', emptyTileArea);
    this.moveCount++;
    forceGridAnimation();
    this.unlockTiles(tileArea);
    this.checkIsSolved();
  };

  private unlockTiles(currentTileArea: string) {
    Array.from(this.tiles).map((t) => {
      let tile = t as HTMLInputElement;
      const tileArea = tile.style.getPropertyValue('--area');
      tile.disabled = this.puzzleKeys[currentTileArea].includes(tileArea) ? false : true;
    });
  }

  private solvable(puzzleTiles: string[]) {
    let invCount = 0;
    let order = Object.keys(this.puzzleKeys).map((x) => puzzleTiles.indexOf(x) + 1);

    for (let i = 0; i < order.length; i++) {
      if (order[i] == 9) continue;
      for (let j = i + 1; j < order.length; j++) {
        if (order[i] > order[j]) invCount++;
      }
    }
    return invCount % 2 === 0;
  }

  private shuffle() {
    let puzzleTiles = Object.keys(this.puzzleKeys);
    puzzleTiles.sort(() => 0.5 - Math.random());
    while (!this.solvable(puzzleTiles)) {
      puzzleTiles.sort(() => 0.5 - Math.random());
    }
    Array.from(this.tiles).map((tile, i) => (tile as HTMLInputElement).style.setProperty('--area', puzzleTiles[i]));
    let emptyTile = this.element.nativeElement.shadowRoot.querySelector('.tile--empty') as HTMLInputElement;
    this.unlockTiles(emptyTile?.style.getPropertyValue('--area'));
  }

  private checkIsSolved() {
    let currentTiles = Array.from(this.tiles).map((tile) => (tile as HTMLInputElement).style.getPropertyValue('--area'));
    if (JSON.stringify(currentTiles) === JSON.stringify(Object.keys(this.puzzleKeys))) {
      this.timerOn = false;
      this.subscription?.unsubscribe();
      this.navigateNextSlide();
    }
  }

  retry(): void {
    this.moveCount = 0;
    this.isRetryButtonDisabled = true;
    this.timeBlockLimitationService.setTimeLeft(this.timeLeft);
    this.displayedTime = this.displayTime(this.timeLeft);
    this.timerOn = false;
    this.shuffle();
    this.retryTime = '';
    this.addListeners();
  }

  navigateNextSlide() {
    const index = findIndex(this.questActivities, (qst) => qst?.id === this.selectedQuestActivity?.id);
    const game = {
      index,
      game: {
        activity: this.selectedQuestActivity?.id,
        movesCount: this.moveCount,
        duration: this.timer - this.timeLeft,
        timer: this.thresholds[0]?.timer,
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

  ngOnDestroy(): void {
    this.timeLeft = -1;
    this.subscription?.unsubscribe();
    this.timerOn = false;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
