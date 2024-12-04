import { fadeAnimations } from '../../shared/animations';
import { Component,ChangeDetectorRef } from '@angular/core';
import { BetPagesService } from './bet-pages.service';

@Component({
  selector: 'app-bet-screen',
  templateUrl: './bet.component.html',
  styleUrls: ['./bet.component.scss'],
  animations: [fadeAnimations],
})
export class BetComponent  {
  constructor(public betService: BetPagesService,public changeDetectorRef: ChangeDetectorRef){
  
  }
  currentPage: string;

  getCurrentPage(): string {
    return this.betService.getCurrentBetPage();
  }
  ngOnInit(): void {
    this.betService.actualBetPage$.subscribe((actualBetPage) => {
      this.currentPage = actualBetPage;
      this.changeDetectorRef.detectChanges(); 
    });
  }

  selectPage(betPage: string) {
    this.betService.chooseBetPage(betPage);
  }
}
