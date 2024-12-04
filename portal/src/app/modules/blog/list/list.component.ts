import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';

import { PaginationService } from '../../../shared/components/pagination/pagination.service';
import { AppService, BaseBlogListComponent, LandingPagesService, SeoService, SharedService } from '@sifca-monorepo/clients';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-blog-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class BlogListComponent extends BaseBlogListComponent {
  perPage = 3;
  blogss = [
    {
      date: '23 Apr. 2020',
      img: 'assets/images/blog/media_24.png',
      title: 'Quis Nostr Exercitation Ullamco Laboris nisi ut Aliquip exeal nothing.',
      description:
        'Tomfoolery crikey bits and bobs brilliant bamboozled down the pub amongst brolly hanky panky, cack bonnet arse over tit burke bugger all mate bodge..',
      url: 'details',
    },
    {
      date: '23 Apr. 2020',
      img: 'assets/images/blog/media_24.png',
      title: 'test1',
      description:
        'Tomfoolery crikey bits and bobs brilliant bamboozled down the pub amongst brolly hanky panky, cack bonnet arse over tit burke bugger all mate bodge..',
      url: 'details',
    },
    {
      date: '23 Apr. 2020',
      img: 'assets/images/blog/media_24.png',
      title: 'test3',
      description:
        'Tomfoolery crikey bits and bobs brilliant bamboozled down the pub amongst brolly hanky panky, cack bonnet arse over tit burke bugger all mate bodge..',
      url: 'details',
    },
    {
      date: '23 Apr. 2020',
      img: 'assets/images/blog/media_24.png',
      title: 'test4',
      description:
        'Tomfoolery crikey bits and bobs brilliant bamboozled down the pub amongst brolly hanky panky, cack bonnet arse over tit burke bugger all mate bodge..',
      url: 'details',
    },
    {
      date: '23 Apr. 2020',
      img: 'assets/images/blog/media_24.png',
      title: 'test5',
      description:
        'Tomfoolery crikey bits and bobs brilliant bamboozled down the pub amongst brolly hanky panky, cack bonnet arse over tit burke bugger all mate bodge..',
      url: 'details',
    },
    {
      date: '23 Apr. 2020',
      img: 'assets/images/blog/media_24.png',
      title: 'test6',
      description:
        'Tomfoolery crikey bits and bobs brilliant bamboozled down the pub amongst brolly hanky panky, cack bonnet arse over tit burke bugger all mate bodge..',
      url: 'details',
    },
    {
      date: '23 Apr. 2020',
      img: 'assets/images/blog/media_24.png',
      title: 'Quis Nostr Exercitation Ullamco Laboris nisi ut Aliquip exeal nothing.',
      description:
        'Tomfoolery crikey bits and bobs brilliant bamboozled down the pub amongst brolly hanky panky, cack bonnet arse over tit burke bugger all mate bodge..',
      url: 'details',
    },
    {
      date: '23 Apr. 2020',
      img: 'assets/images/blog/media_24.png',
      title: 'Quis Nostr Exercitation Ullamco Laboris nisi ut Aliquip exeal nothing.',
      description:
        'Tomfoolery crikey bits and bobs brilliant bamboozled down the pub amongst brolly hanky panky, cack bonnet arse over tit burke bugger all mate bodge..',
      url: 'details',
    },
    {
      date: '23 Apr. 2020',
      img: 'assets/images/blog/media_24.png',
      title: 'Quis Nostr Exercitation Ullamco Laboris nisi ut Aliquip exeal nothing.',
      description:
        'Tomfoolery crikey bits and bobs brilliant bamboozled down the pub amongst brolly hanky panky, cack bonnet arse over tit burke bugger all mate bodge..',
      url: 'details',
    },
    {
      date: '23 Apr. 2020',
      img: 'assets/images/blog/media_24.png',
      title: 'Quis Nostr Exercitation Ullamco Laboris nisi ut Aliquip exeal nothing.',
      description:
        'Tomfoolery crikey bits and bobs brilliant bamboozled down the pub amongst brolly hanky panky, cack bonnet arse over tit burke bugger all mate bodge..',
      url: 'details',
    },
    {
      date: '23 Apr. 2020',
      img: 'assets/images/blog/media_24.png',
      title: 'Quis Nostr Exercitation Ullamco Laboris nisi ut Aliquip exeal nothing.',
      description:
        'Tomfoolery crikey bits and bobs brilliant bamboozled down the pub amongst brolly hanky panky, cack bonnet arse over tit burke bugger all mate bodge..',
      url: 'details',
    },
    {
      date: '23 Apr. 2020',
      img: 'assets/images/blog/media_24.png',
      title: 'Quis Nostr Exercitation Ullamco Laboris nisi ut Aliquip exeal nothing.',
      description:
        'Tomfoolery crikey bits and bobs brilliant bamboozled down the pub amongst brolly hanky panky, cack bonnet arse over tit burke bugger all mate bodge..',
      url: 'details',
    },
    {
      date: '23 Apr. 2020',
      img: 'assets/images/blog/media_24.png',
      title: 'test finale',
      description:
        'Tomfoolery crikey bits and bobs brilliant bamboozled down the pub amongst brolly hanky panky, cack bonnet arse over tit burke bugger all mate bodge..',
      url: 'details',
    },
  ];
  totalPages: number = 3;
  actualPage: number;
  pagesToBeShown = Math.ceil(this.blogss.length / 3);

  constructor(
    protected override renderer: Renderer2,
    protected override metaTagService: Meta,
    protected override titleTagService: Title,
    private paginationService: PaginationService,
    protected override seoService: SeoService,
    protected override appService: AppService,
    protected override sharedService: SharedService,
    protected override changeDetectorRef: ChangeDetectorRef,
    protected override landingPagesService: LandingPagesService,
    @Inject(PLATFORM_ID) protected platformId: Object,
    @Inject(DOCUMENT) protected document: Document,
  ) {
    super(
      renderer,
      metaTagService,
      titleTagService,
      seoService,
      appService,
      sharedService,
      changeDetectorRef,
      landingPagesService,
      platformId,
      document,
    );
  }
  getSlicedBlogs(): any[] {
    const startIndex = (this.paginationService.actualPage - 1) * this.perPage;
    const endIndex = startIndex + this.perPage;
    return this.blogs?.slice(startIndex, endIndex);
  }
}
