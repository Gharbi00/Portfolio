import { OnInit, Component, OnDestroy, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import Swal from 'sweetalert2';
import { values } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap, takeUntil } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { SlidesType, SlideVisualTypeEnum } from '@sifca-monorepo/terminal-generator';

import { SlidesService } from '../slides.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { WebsiteIntegrationType } from '@sifca-monorepo/terminal-generator';
import { WebsiteService } from '../../../../system/apps/apps/website/website.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'slide',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlideComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  slides: SlidesType[];
  pageChanged: boolean;
  pagination: IPagination;
  selecteSlide: SlidesType;
  breadCrumbItems!: Array<{}>;
  visualTypes = values(SlideVisualTypeEnum);
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
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private sharedService: SharedService,
    private slidesService: SlidesService,
    private websiteService: WebsiteService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.slidesService.slides$.pipe(takeUntil(this.unsubscribeAll)).subscribe((slides: SlidesType[]) => {
      this.slides = slides;
      this.changeDetectorRef.markForCheck();
    });
    this.slidesService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.slidesService.pageIndex || 0,
        size: this.slidesService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.slidesService.pageIndex || 0) * this.slidesService.pageLimit,
        endIndex: Math.min(((this.slidesService.pageIndex || 0) + 1) * this.slidesService.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.WEBSITE').subscribe((website: string) => {
      this.translate.get('MENUITEMS.TS.SLIDES').subscribe((slides: string) => {
        this.breadCrumbItems = [{ label: website }, { label: slides, active: true }];
      });
    });
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.slidesService.searchString = searchValues.searchString;
          return this.slidesService.getSlides();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.slidesService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.slidesService.getSlides().subscribe();
    }
  }

  openDeleteModal(content: any, slide: SlidesType) {
    this.selecteSlide = slide;
    this.modalService.open(content, { centered: true });
  }

  modalError() {
    this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((sthWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: sthWrong,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
      });
    });
  }

  deleteSlide() {
    this.slidesService
      .deleteSlide(this.selecteSlide.id)
      .pipe(
        catchError((error) => {
          if (error) {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.modalService.dismissAll();
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
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

  ngOnDestroy() {
    this.slidesService.pageIndex = 0;
    this.slidesService.searchString = '';
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
