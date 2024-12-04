import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService, BaseBlogDetailsComponent, SeoService, SharedService } from '@sifca-monorepo/clients';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends BaseBlogDetailsComponent {
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
}
