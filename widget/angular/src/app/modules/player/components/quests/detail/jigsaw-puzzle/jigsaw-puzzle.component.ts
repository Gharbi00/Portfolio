import { findIndex } from 'lodash';
import { Subject, takeUntil } from 'rxjs';
import * as headbreaker from 'headbreaker';
import { Component, ElementRef, ViewEncapsulation, ChangeDetectorRef, OnInit, Output, EventEmitter } from '@angular/core';

import { QuestActivityType } from '@sifca-monorepo/widget-generator';

import { QuestsService } from '../../quests.service';
import { BASE_URL } from '../../../../../../../environments/environment';
import { ModalService } from '../../../../../../shared/services/modal.service';

@Component({
  selector: 'app-jigsaw-puzzle',
  templateUrl: './jigsaw-puzzle.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
      @import '${BASE_URL}/assets/css/styles.min.css';
      @import '${BASE_URL}/assets/css/vendor/simplebar.css';
      @import '${BASE_URL}/assets/css/vendor/bootstrap.min.css';

      #puzzle {
        position: relative;
      }

      @media (min-width: 600px) {
        .img-w {
          width: 217px;
        }
      }

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
    `,
  ],
})
export class JigsawPuzzleComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  @Output() performActivity = new EventEmitter<boolean>();

  imgData: string;
  darkMode: boolean;
  showImage = false;
  isButtonDisabled = true;
  isLastActivity: boolean;
  selectedQuestActivity: QuestActivityType;
  questActivities: QuestActivityType[];

  constructor(private elRef: ElementRef, private cd: ChangeDetectorRef, private modalService: ModalService, private questsService: QuestsService) {
    this.questsService.questActivitesByQuest$.pipe(takeUntil(this.unsubscribeAll)).subscribe((questActivitesByQuest) => {
      this.questActivities = questActivitesByQuest;
    });
    this.questsService.selectedQuestActivity$.pipe(takeUntil(this.unsubscribeAll)).subscribe((questActivity) => {
      this.selectedQuestActivity = questActivity;
      if (questActivity) {
        this.isLastActivity = this.selectedQuestActivity?.id === this.questActivities[this.questActivities?.length - 1]?.id;
      }
      this.imgData =
        questActivity?.activity?.action?.definition?.game?.jigsaw?.picture?.baseUrl +
        '/' +
        questActivity?.activity?.action?.definition?.game?.jigsaw?.picture?.path;
    });
  }

  ngOnInit() {
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
      this.cd.detectChanges();
    });
    this.play();
  }

  play() {
    const audio = new Audio(`${BASE_URL}/assets/img/connect.wav`);
    const calculateDimensions = () => {
      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight;
      const aspectRatio = 4 / 3;
      let width = containerWidth;
      let height = containerWidth / aspectRatio;
      if (height > containerHeight) {
        height = containerHeight;
        width = containerHeight * aspectRatio;
      }
      return { width, height };
    };
    const initialDimensions = calculateDimensions();
    const berni = new Image();
    berni.src = this.imgData;
    const canvasEl = this.elRef.nativeElement.shadowRoot.querySelector('#puzzle');
    const sound = new headbreaker.Canvas(canvasEl, {
      width: initialDimensions.width,
      height: initialDimensions.height * 0.6,
      pieceSize: 60,
      proximity: 20,
      borderFill: 10,
      strokeWidth: 1.5,
      lineSoftness: 0.18,
      image: berni,
      strokeColor: 'black',
      preventOffstageDrag: true,
      painter: new headbreaker.painters.Konva(),
    });
    berni.onload = () => {
      sound.adjustImagesToPuzzleHeight();
      sound.autogenerate({
        horizontalPiecesCount: this.selectedQuestActivity?.activity?.action?.definition?.game?.jigsaw?.pieces,
        verticalPiecesCount: this.selectedQuestActivity?.activity?.action?.definition?.game?.jigsaw?.pieces,
        insertsGenerator: headbreaker.generators.random,
      });
      sound.shuffleGrid();
      sound.draw();
      sound.onConnect((_piece, figure, _target, targetFigure) => {
        audio.play();
        figure.shape.stroke('yellow');
        targetFigure.shape.stroke('yellow');
        sound.redraw();
        sound.attachSolvedValidator();
        sound.onValid(() => {
          this.navigateNextSlide();
          this.isButtonDisabled = false;
        });
        setTimeout(() => {
          figure.shape.stroke('black');
          targetFigure.shape.stroke('black');
          sound.redraw();
        }, 200);
      });
      sound.onDisconnect((_it) => {
        audio.play();
      });
    };
    ['resize', 'DOMContentLoaded'].forEach((event) => {
      window.addEventListener(event, () => {
        if (container) {
          var container = document.getElementById('puzzle');
          sound.resize(container.offsetWidth, container.scrollHeight);
          sound.scale(container.offsetWidth / initialDimensions.width);
          sound.redraw();
        }
      });
    });
  }

  navigateNextSlide() {
    if (this.isLastActivity) {
      this.performActivity.emit(true);
    } else {
      let index = findIndex(this.questActivities, (item) => item?.id === this.selectedQuestActivity?.id);
      this.questsService.selectedQuestActivity$ = this.questActivities[index + 1];
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
