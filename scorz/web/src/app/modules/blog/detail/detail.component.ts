import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService, BaseBlogDetailsComponent, SeoService, SharedService } from '@sifca-monorepo/clients';
import { OwlOptions } from 'ngx-owl-carousel-o';
@Component({
  selector: 'app-blog-details',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class BlogDetailsComponent extends BaseBlogDetailsComponent {
  constructor(
    protected router: Router,
    protected renderer: Renderer2,
    protected appService: AppService,
    protected sharedService: SharedService,
    protected activatedRoute: ActivatedRoute,
    protected seoService: SeoService,
    protected titleTagService: Title,
    protected metaTagService: Meta,
    protected changeDetectorRef: ChangeDetectorRef,
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
      platformId
    );
  }
  blogCarousel:OwlOptions = {
    nav: false,
    dots: true,
    loop: true,
    margin:30,
    responsive: {
      0: {
        items: 1,
      },
      700: {
        items: 2,
      },

    },
  };
}
