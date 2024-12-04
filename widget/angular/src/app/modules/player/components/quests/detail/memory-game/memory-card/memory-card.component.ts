import { Component, OnInit, Input, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';

import { GameService } from '../services/game.service';
import { ModalService } from '../../../../../../../shared/services/modal.service';
import { Card } from '../card';

@Component({
  selector: 'memory-card',
  templateUrl: './memory-card.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
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
      }

      .card {
        height: 80px;
        width: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        margin: 10px;

        .front,
        .back {
          position: absolute;
          height: 100%;
          width: 100%;
          left: 0;
          top: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          backface-visibility: hidden;
        }

        .back {
          background-color: var(--dynamic-color3) !important;
          color: #fff;
        }

        .front {
          transform: rotateY(180deg);
          background-color: white;
          color: #ff9800;
        }
      }

      .card-inner {
        height: 100%;
        width: 100%;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
        transition: transform 0.6s;
        transform-style: preserve-3d;
      }

      .rotated {
        .card-inner {
          transform: rotateY(180deg);
        }
      }

      fa-icon {
        width: 20px !important;
      }
      .dark-mode.back {
        background-color: #25f73c !important;
        color: #fff;
      }
      .dark-mode .front {
        transform: rotateY(180deg);
        background-color: #161b28 !important;
        color: #ff9800;
      }
    `,
  ],
})
export class MemoryCardComponent implements OnInit {
  @Input() id: number;
  @Input() picture: Card;
  @Input() timerOn: boolean;

  darkMode;
  isRotated: boolean;
  isCardDisabled = false;

  constructor(private gameService: GameService, private cd: ChangeDetectorRef, private modalService: ModalService) {}

  ngOnInit(): void {
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
      this.cd.detectChanges();
    });
    this.gameService.isCardDisabled$.subscribe((isCardDisabled) => {
      this.isCardDisabled = isCardDisabled;
    });
    this.gameService.getCoveredCards().subscribe((r) => {
      this.isCardDisabled = false;
      this.cd.markForCheck();
      return r.map((v) => (this.isRotated = v.id == this.id ? false : this.isRotated));
    });
    this.cd.markForCheck();
  }

  onClick() {
    if (!this.isCardDisabled && this.timerOn) {
      this.isRotated = true;
      this.gameService.controlCards({ id: this.id, baseUrl: this.picture?.baseUrl, path: this.picture?.path });
    }
  }
}
