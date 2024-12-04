import { Injectable } from '@angular/core';
import { delay, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';

import { Card } from '../card';
import { QuestsService } from '../../../quests.service';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  private coverCards = new BehaviorSubject<Card[]>([]);
  private remainingCardPairs = new BehaviorSubject<number>(8);
  private doneMoves = new BehaviorSubject<number>(0);
  private isCardDisabled = new BehaviorSubject<boolean>(false);

  pictures: Card[];
  cards: Card[] = [];
  cardCount: number = 0;
  moveCount: number = 0;
  selectedCard1: Card = null;
  selectedCard2: Card = null;
  card = new BehaviorSubject<Card>(null);

  get isCardDisabled$(): Observable<boolean> {
    return this.isCardDisabled.asObservable();
  }
  set isCardDisabled$(value: any) {
    this.isCardDisabled.next(value);
  }

  constructor(private questsService: QuestsService) {
    this.questsService.selectedQuestActivity$.pipe(takeUntil(this.unsubscribeAll)).subscribe((questActivitesByQuest) => {
      this.pictures =  questActivitesByQuest?.activity?.action?.definition?.game?.memory?.pictures.map((picture) => ({
        baseUrl: picture?.baseUrl,
        path: picture?.path,
      }));
    });
  }

  getCards(count: number) {
    this.cardCount = count;
    this.moveCount = 0;
    this.remainingCardPairs.next(this.cardCount);
    this.doneMoves.next(0);
    let arr = this.pictures.slice(0, count);
    let shuffledArr = this.shuffleCards([...arr, ...this.shuffleCards(arr)]);
    return of(shuffledArr);
  }

  shuffleCards(arr: Card[]) {
    for (let index = 0; index < arr.length; index++) {
      const temp = arr[index];
      const newIdx = Math.floor(Math.random() * arr.length);
      arr[index] = arr[newIdx];
      arr[newIdx] = temp;
    }
    return arr;
  }

  controlCards(choosen: Card) {
    if (this.selectedCard1 === null) {
      this.selectedCard1 = choosen;
    } else {
      if (choosen.id === this.selectedCard1.id) {
        return;
      }
      this.selectedCard2 = choosen;
      if (this.selectedCard1.path != this.selectedCard2.path) {
        this.isCardDisabled.next(true);
        this.coverCards.next([this.selectedCard1, this.selectedCard2]);
      } else {
        this.cardCount--;
        this.remainingCardPairs.next(this.cardCount);
      }
      this.selectedCard1 = null;
      this.selectedCard2 = null;
      this.moveCount++;
      setTimeout(() => {
        this.doneMoves.next(this.moveCount);
      }, 1200);
    }
  }

  getRemainingCardPairs() {
    return this.remainingCardPairs.asObservable();
  }

  getDoneMoves() {
    return this.doneMoves.asObservable();
  }

  getCoveredCards() {
    return this.coverCards.asObservable().pipe(delay(1200));
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
