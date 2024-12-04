import { ChangeDetectorRef, Component ,HostListener } from '@angular/core';
import { StorageHelper } from '@diktup/frontend/helpers';
import { AuthService, SharedService } from '@sifca-monorepo/clients';
import { POS_ID } from '../environments/environment';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  constructor(
    public sharedService: SharedService,
    public authService: AuthService,
		private storageHelper: StorageHelper,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.sharedService.setPosId(POS_ID);
    this.authService.authenticated$.subscribe((authenticated: boolean) => {
      this.storageHelper.setData({ posId: POS_ID });
      this.changeDetectorRef.markForCheck();
    });
  }
  
  showBackToTop: boolean = false;

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.showBackToTop = window.pageYOffset > 100;
    console.log('Scrolled!');
  }
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    console.log('hello!');
  }
}
