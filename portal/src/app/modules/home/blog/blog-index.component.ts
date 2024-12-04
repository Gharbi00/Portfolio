import { ChangeDetectorRef, Component } from '@angular/core';
import { AppService, BaseBlogComponent, SharedService } from '@sifca-monorepo/clients';

@Component({
  selector: 'app-blog-index',
  templateUrl: './blog-index.component.html',
  styleUrls: ['./blog-index.component.scss'],
})
export class BlogIndexComponent extends BaseBlogComponent {
  constructor(appService: AppService, protected override sharedService: SharedService, changeDetectorRef: ChangeDetectorRef) {
    super(appService, sharedService, changeDetectorRef);
    this.blogLimit = 3;
  }

  ngOnInit(): void {}
}
