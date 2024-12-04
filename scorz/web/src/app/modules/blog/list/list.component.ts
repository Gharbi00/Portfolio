import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID, Renderer2 } from '@angular/core';

import { PaginationService } from '../../../shared/components/pagination/pagination.service';
import { AppService, BaseBlogListComponent, LandingPagesService, SeoService, SharedService } from '@sifca-monorepo/clients';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-blog-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class BlogListComponent extends BaseBlogListComponent implements OnInit {
  perPage = 6;
  blogsdata = [
    {
      imgSrc: 'assets/img/blog/blog-post-1.jpg',
      category: 'euro jackpot',
      title: 'Even more and setted see.',
      link: 'blog-details.html',
      description:
        "In it in more its bad got what's the based they world the on small where them. Had the equally were so a in sign it like into the kind the found been themselves go.",
      creatorImg: 'assets/img/blog/user-1.jpg',
      creatorName: 'Sierra Guzman',
      postingTime: '3 days ago',
    },
    {
      imgSrc: 'assets/img/blog/blog-post-3.jpg',
      category: 'mega millions',
      title: 'Began a need detailed free.',
      link: 'blog-details.html',
      description:
        "In it in more its bad got what's the based they world the on small where them. Had the equally were so a in sign it like into the kind the found been themselves go.",
      creatorImg: 'assets/img/blog/user-3.jpg',
      creatorName: 'Peter Bowen',
      postingTime: '2 days ago',
    },
    {
      imgSrc: 'assets/img/blog/blog-post-4.jpg',
      category: 'online lotto',
      title: 'Similar empire for carpeting.',
      link: 'blog-details.html',
      description:
        "In it in more its bad got what's the based they world the on small where them. Had the equally were so a in sign it like into the kind the found been themselves go.",
      creatorImg: 'assets/img/blog/user-4.jpg',
      creatorName: 'Amelie Flynn',
      postingTime: '1 months ago',
    },
    {
      imgSrc: 'assets/img/blog/blog-post-6.jpg',
      category: 'Us powerball',
      title: 'Heaven with as best academic.',
      link: 'blog-details.html',
      description:
        "In it in more its bad got what's the based they world the on small where them. Had the equally were so a in sign it like into the kind the found been themselves go.",
      creatorImg: 'assets/img/blog/user-6.jpg',
      creatorName: 'Mason Knight',
      postingTime: '2 years ago',
    },
    {
      imgSrc: 'assets/img/blog/blog-post-2.jpg',
      category: 'super enalotto',
      title: 'Titled concept box made to.',
      link: 'blog-details.html',
      description:
        "In it in more its bad got what's the based they world the on small where them. Had the equally were so a in sign it like into the kind the found been themselves go.",
      creatorImg: 'assets/img/blog/user-2.jpg',
      creatorName: 'Henry Butler',
      postingTime: '1 days ago',
    },
    {
      imgSrc: 'assets/img/blog/blog-post-5.jpg',
      category: 'premier bet',
      title: 'Entered hard couple seman.',
      link: 'blog-details.html',
      description:
        "In it in more its bad got what's the based they world the on small where them. Had the equally were so a in sign it like into the kind the found been themselves go.",
      creatorImg: 'assets/img/blog/user-5.jpg',
      creatorName: 'Natasha Rowe',
      postingTime: '1 week ago',
    },
    {
      imgSrc: 'assets/img/blog/blog-post-6.jpg',
      category: 'Us powerball',
      title: 'Heaven with as best academic.',
      link: 'blog-details.html',
      description:
        "In it in more its bad got what's the based they world the on small where them. Had the equally were so a in sign it like into the kind the found been themselves go.",
      creatorImg: 'assets/img/blog/user-6.jpg',
      creatorName: 'Mason Knight',
      postingTime: '2 years ago',
    },
    {
      imgSrc: 'assets/img/blog/blog-post-2.jpg',
      category: 'super enalotto',
      title: 'Titled concept box made to.',
      link: 'blog-details.html',
      description:
        "In it in more its bad got what's the based they world the on small where them. Had the equally were so a in sign it like into the kind the found been themselves go.",
      creatorImg: 'assets/img/blog/user-2.jpg',
      creatorName: 'Henry Butler',
      postingTime: '1 days ago',
    },
    {
      imgSrc: 'assets/img/blog/blog-post-5.jpg',
      category: 'premier bet',
      title: 'Entered hard couple seman.',
      link: 'blog-details.html',
      description:
        "In it in more its bad got what's the based they world the on small where them. Had the equally were so a in sign it like into the kind the found been themselves go.",
      creatorImg: 'assets/img/blog/user-5.jpg',
      creatorName: 'Natasha Rowe',
      postingTime: '1 week ago',
    },
    {
      imgSrc: 'assets/img/blog/blog-post-1.jpg',
      category: 'euro jackpot',
      title: 'Even more and setted see.',
      link: 'blog-details.html',
      description:
        "In it in more its bad got what's the based they world the on small where them. Had the equally were so a in sign it like into the kind the found been themselves go.",
      creatorImg: 'assets/img/blog/user-1.jpg',
      creatorName: 'Sierra Guzman',
      postingTime: '3 days ago',
    },
    {
      imgSrc: 'assets/img/blog/blog-post-3.jpg',
      category: 'mega millions',
      title: 'Began a need detailed free.',
      link: 'blog-details.html',
      description:
        "In it in more its bad got what's the based they world the on small where them. Had the equally were so a in sign it like into the kind the found been themselves go.",
      creatorImg: 'assets/img/blog/user-3.jpg',
      creatorName: 'Peter Bowen',
      postingTime: '2 days ago',
    },
    {
      imgSrc: 'assets/img/blog/blog-post-4.jpg',
      category: 'online lotto',
      title: 'Similar empire for carpeting.',
      link: 'blog-details.html',
      description:
        "In it in more its bad got what's the based they world the on small where them. Had the equally were so a in sign it like into the kind the found been themselves go.",
      creatorImg: 'assets/img/blog/user-4.jpg',
      creatorName: 'Amelie Flynn',
      postingTime: '1 months ago',
    },
    {
      imgSrc: 'assets/img/blog/blog-post-1.jpg',
      category: 'euro jackpot',
      title: 'Even more and setted see.',
      link: 'blog-details.html',
      description:
        "In it in more its bad got what's the based they world the on small where them. Had the equally were so a in sign it like into the kind the found been themselves go.",
      creatorImg: 'assets/img/blog/user-1.jpg',
      creatorName: 'Sierra Guzman',
      postingTime: '3 days ago',
    },
  ];
  totalPages: number = 3;
  actualPage: number;
  pagesToBeShown = Math.ceil(this.blogsdata.length / 6);

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
    return this.blogsdata?.slice(startIndex, endIndex);
  }
}
