import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class  BetPagesService {
  betPages = ['ALL', 'IN_PLAY', 'UPCOMING', 'FINISHED'];

 
  private actualBetPageSubject = new BehaviorSubject<string>(this.betPages[0]);
  actualBetPage$ = this.actualBetPageSubject.asObservable(); 

  chooseBetPage(betPageChosen: string) {
    this.actualBetPageSubject.next(betPageChosen); 
  }

  getCurrentBetPage(): string {
    return this.actualBetPageSubject.getValue(); 
  }
}
