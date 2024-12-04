import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService, BaseBlogDetailsComponent, SeoService, SharedService } from '@sifca-monorepo/clients';

@Component({
  selector: 'app-blog-details',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class BlogDetailsComponent extends BaseBlogDetailsComponent {
  constructor(
    protected override router: Router,
    protected override renderer: Renderer2,
    protected override appService: AppService,
    protected override sharedService: SharedService,
    protected override activatedRoute: ActivatedRoute,
    protected override seoService: SeoService,
    protected override titleTagService: Title,
    protected override metaTagService: Meta,
    protected override changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT) protected document: Document,
    @Inject(PLATFORM_ID) protected platformId: Object,
  ) {
    super(
      router,
      renderer,
      appService,
      sharedService,
      activatedRoute,
      seoService,
      titleTagService,
      metaTagService,
      changeDetectorRef,
      document,
      platformId,
    );
  }
}
