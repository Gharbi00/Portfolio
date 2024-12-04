import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { BaseIndexComponent, SeoService, SharedService, SlidesService } from '@sifca-monorepo/clients';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent extends BaseIndexComponent {

  constructor(
    protected override renderer: Renderer2,
    protected override metaTagService: Meta,
    protected override titleTagService: Title,
    protected override seoService: SeoService,
    protected override sharedService: SharedService,
    protected override slidesService: SlidesService,
    protected override changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT) protected document: Document,
    @Inject(PLATFORM_ID) protected platformId: Object,
  ) {
    super(renderer, metaTagService, titleTagService, seoService, sharedService, slidesService, changeDetectorRef, document, platformId);
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 50);
    }
  }
}
