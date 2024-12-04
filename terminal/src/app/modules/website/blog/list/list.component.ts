import moment from 'moment';
import Swal from 'sweetalert2';
import { values } from 'lodash';
import { Observable, Subject } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';
import { BlogType, VisibilityStatusEnum } from '@sifca-monorepo/terminal-generator';

import { BlogService } from '../blog.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { WebsiteIntegrationType } from '@sifca-monorepo/terminal-generator';
import { WebsiteService } from '../../../system/apps/apps/website/website.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'list-blogs',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListBlogsComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  _moment = moment;
  blogs: BlogType[];
  pageChanged: boolean;
  pagination: IPagination;
  breadCrumbItems!: Array<{}>;
  statusControl = new FormControl();
  status = values(VisibilityStatusEnum);
  selectedStatus: VisibilityStatusEnum[] = [];
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  website$: Observable<WebsiteIntegrationType> = this.websiteService.website$;
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private blogService: BlogService,
    private sharedService: SharedService,
    private websiteService: WebsiteService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.blogService.blogs$.pipe(takeUntil(this.unsubscribeAll)).subscribe((blogs: BlogType[]) => {
      this.blogs = blogs;
      this.changeDetectorRef.markForCheck();
    });
    this.blogService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.blogService.pageIndex ? this.blogService.pageIndex + 1 : 1,
        size: this.blogService.filterLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.blogService.pageIndex || 0) * this.blogService.filterLimit,
        endIndex: Math.min(((this.blogService.pageIndex || 0) + 1) * this.blogService.filterLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.WEBSITE').subscribe((website: string) => {
      this.translate.get('MENUITEMS.TS.BLOGS').subscribe((blogs: string) => {
        this.breadCrumbItems = [{ label: website }, { label: blogs, active: true }];
      });
    });

    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.blogService.searchString = searchValues.searchString;
          return this.blogService.findBlogsByTargetPaginated();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  onChange(status: VisibilityStatusEnum, isChecked: boolean) {
    if (isChecked) {
      this.blogService.status.push(status);
    } else {
      const index = this.blogService.status.indexOf(status);
      if (index > -1) {
        this.blogService.status.splice(index, 1);
      }
    }
    this.selectedStatus = this.blogService.status;
    this.blogService.findBlogsByTargetPaginated().subscribe();
  }

  filterBy(event: any) {
    event.target.value !== 'All' ? (this.blogService.status = event.target.value) : (this.blogService.status = null);

    this.blogService.pageIndex = 0;
    this.blogService.findBlogsByTargetPaginated().subscribe();
  }

  onPageChange(page: number) {
    this.page = page;
    this.blogService.pageIndex = page - 1;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    if (this.pageChanged) {
      this.blogService.findBlogsByTargetPaginated().subscribe();
    }
  }

  position() {
    this.translate.get('MENUITEMS.TS.WORK_SAVED').subscribe((workSaved: string) => {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: workSaved,
        showConfirmButton: false,
        timer: 1500,
      });
    });
  }

  publishBlog(blog: BlogType): void {
    this.blogService.publishBlog(blog.id).subscribe((result: any) => {
      if (result.data) {
        this.position();
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  deleteBlog(blog: BlogType): void {
    this.blogService.deleteBlog(blog.id).subscribe((result: any) => {
      if (result.data) {
        this.position();
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    this.blogService.pageIndex = 0;
    this.blogService.searchString = '';
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
