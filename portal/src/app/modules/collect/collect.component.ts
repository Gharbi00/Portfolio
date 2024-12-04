import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID, Renderer2 } from '@angular/core';
import { fadeAnimations } from '../../shared/animations';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { BaseProjectDetailsComponent, LandingPagesService, SeoService, SharedService } from '@sifca-monorepo/clients';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { LanguageService } from '../../shared/language.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-competition-stand-out',
  templateUrl: './collect.component.html',
  styleUrls: ['./collect.component.scss'],
  animations: [fadeAnimations],
})
export class CompetitionComponent extends BaseProjectDetailsComponent implements OnInit {
  public rtl$: Observable<boolean> = this.languageService.rtl$;
  images = [
    'assets/images/media/img_110.jpg',
    'assets/images/media/img_111.jpg',
    'assets/images/media/img_110.jpg',
    'assets/images/media/img_111.jpg',
    'assets/images/media/img_110.jpg',
    'assets/images/media/img_111.jpg',
    'assets/images/media/img_110.jpg',
    'assets/images/media/img_111.jpg',
  ];

  stylesCarousel: OwlOptions = {
    margin: 10,
    dots: false,
    nav: true,
    items: 3,
    rtl: false,
    loop: true,
    navText: ['<i _ngcontent-lif-c31="" class="flaticon-right-arrow ng-tns-c31-3"></i>', '<i  class="flaticon-right-arrow ng-tns-c31-3"></i>'],
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 2,
      },
      800: {
        items: 3,
      },
    },
  };

  constructor(
    protected override renderer: Renderer2,
    protected override metaTagService: Meta,
    protected override seoService: SeoService,
    protected override titleTagService: Title,
    protected override sharedService: SharedService,
    protected override activatedRoute: ActivatedRoute,
    protected override changeDetectorRef: ChangeDetectorRef,
    protected override landingPagesService: LandingPagesService,
    private languageService: LanguageService,
    @Inject(DOCUMENT) protected override document: Document,
    @Inject(PLATFORM_ID) protected override platformId: Object,
  ) {
    super(
      renderer,
      metaTagService,
      seoService,
      titleTagService,
      sharedService,
      activatedRoute,
      changeDetectorRef,
      landingPagesService,
      document,
      platformId,
    );
  }
  initCarouselDirection(rtl) {
    this.stylesCarousel.rtl = rtl;
  }
  ngOnInit(): void {
    this.languageService.rtl$.subscribe((rtl) => {
      this.initCarouselDirection(rtl);
      this.changeDetectorRef.detectChanges();
    });
  }
}
