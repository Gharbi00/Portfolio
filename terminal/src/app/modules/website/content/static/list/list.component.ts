import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import { find, findIndex, isEqual, keys, map, omit, some } from 'lodash';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap, take, takeUntil } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';
import { FormHelper } from '@diktup/frontend/helpers';
import { LanguageType, StaticTranslationTranslationType, StaticTranslationType } from '@sifca-monorepo/terminal-generator';

import { StaticService } from '../static.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { WebsiteService } from '../../../../system/apps/apps/website/website.service';
import { WebsiteIntegrationType } from '@sifca-monorepo/terminal-generator';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'static-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaticListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  languages: any[];
  initialValues: any;
  pageChanged: boolean;
  staticForm: FormGroup;
  isButtonDisabled = true;
  pagination: IPagination;
  isReferenceExist = false;
  isAddTranslation: boolean;
  breadCrumbItems!: Array<{}>;
  selectedLanguage: LanguageType;
  selctedTranslation: StaticTranslationType;
  selectedStaticTranslation: StaticTranslationType;
  defaultLanguage: any = { name: 'Default', id: '1' };
  selectedTranslation: StaticTranslationTranslationType;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  website$: Observable<WebsiteIntegrationType> = this.websiteService.website$;
  loadingStaticTranslations$: Observable<boolean> = this.staticService.loadingStaticTranslations$;
  staticTranslations$: Observable<StaticTranslationType[]> = this.staticService.staticTranslations$;

  get translation() {
    return this.staticForm.get('translation');
  }
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
    private staticService: StaticService,
    private sharedService: SharedService,
    private websiteService: WebsiteService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.WEBSITE').subscribe((website: string) => {
      this.translate.get('MENUITEMS.TS.STATIC').subscribe((statics: string) => {
        this.breadCrumbItems = [{ label: website }, { label: statics, active: true }];
      });
    });
    this.websiteService.website$
      .pipe(
        takeUntil(this.unsubscribeAll),
        switchMap((website: any) => {
          const languages = [this.defaultLanguage, ...(website?.multilanguage?.languages || []).map((lang) => lang.language)];
          this.languages = languages;
          this.selectedLanguage = this.defaultLanguage;
          return of(website);
        }),
      )
      .subscribe();
    this.staticForm = this.formBuilder.group({
      reference: [''],
      translation: this.formBuilder.group({
        language: [this.defaultLanguage],
      }),
    });
    this.staticService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.staticService.pageIndex ? this.staticService.pageIndex + 1 : 1,
        size: this.staticService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.staticService.pageIndex || 0) * this.staticService.pageLimit,
        endIndex: Math.min(((this.staticService.pageIndex || 0) + 1) * this.staticService.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  onChangeLanguage(translate: LanguageType) {
    this.staticService.language = translate?.name === 'Default' ? null : translate?.id;
    this.staticService.getStaticTranslationsByTargetAndLanguagePaginated().subscribe((res) => {
      this.selectedTranslation = find(this.selectedStaticTranslation?.translation, (trs) => trs?.language.id === translate?.id);
      this.selectedLanguage = this.selectedTranslation?.language || translate;
      this.staticForm = this.formBuilder.group({
        reference: [this.selectedStaticTranslation?.reference || ''],
        translation: this.formBuilder.group({
          language: [this.selectedTranslation?.language || translate],
          content: [this.selectedTranslation?.content || ''],
        }),
      });
      this.initialValues = this.staticForm.value;
      this.staticForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
        this.isButtonDisabled = isEqual(values, this.initialValues);
      });
      this.isButtonDisabled = true;
      this.changeDetectorRef.markForCheck();
    });
  }

  openStaticModal(content: any, staticTranslation: StaticTranslationType) {
    this.selectedStaticTranslation = staticTranslation;
    this.isAddTranslation = staticTranslation ? false : true;
    this.staticTranslations$
      .pipe(
        take(1),
        switchMap((translations) => {
          this.selctedTranslation = find(translations, (trans) => some(trans.translation, (tr) => tr.language?.id === this.selectedLanguage?.id));
          return of(translations);
        }),
      )
      .subscribe();
    const selctedTranslation = find(
      staticTranslation?.translation,
      (trs: any) =>
        (trs?.language?.id === this.selectedLanguage?.id && this.selectedLanguage?.id !== '1') ||
        (this.selectedLanguage?.id === '1' && !trs?.language?.id),
    );
    this.modalService.open(content, { centered: true });
    this.staticForm = this.formBuilder.group({
      reference: [staticTranslation?.reference || ''],
      translation: this.formBuilder.group({
        language: [this.selectedLanguage],
        content: [selctedTranslation?.content || ''],
        contentId: [selctedTranslation?._id || ''],
      }),
    });
    this.initialValues = this.staticForm.value;
    this.staticForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isButtonDisabled = isEqual(values, this.initialValues);
    });
    this.staticForm.get('reference').valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((reference) => {
          this.changeDetectorRef.markForCheck();
          return this.staticService.targetHasStaticTranslationsReference(reference);
        }),
      )
      .subscribe((res) => {
        this.isReferenceExist = res;
        this.changeDetectorRef.markForCheck();
      });
  }

  save(): void {
    this.isButtonDisabled = true;
    let translation;
    let translations = this.selectedStaticTranslation?.translation;
    const index = findIndex(this.selectedStaticTranslation?.translation, (trs) => trs?.language?.id === this.selectedLanguage?.id);
    if (index > -1 && this.isAddTranslation === false) {
      translations.splice(index, 1);
    }
    translation = [
      ...map(translations, (trans) => {
        return {
          ...omit(trans, 'language', 'contentId'),
          _id: trans?._id,
          language: trans?.language?.id,
          content: trans?.content,
        };
      }),
      {
        ...omit(this.translation.value, 'language', 'id', 'contentId'),
        ...(this.translation?.get('language').value?.name && this.translation?.get('language').value?.name !== 'Default'
          ? { language: this.translation.value?.language?.id }
          : {}),
        content: this.translation.value?.content,
      },
    ];
    const updateInput = {
      id: this.selectedStaticTranslation?.id,
      ...(this.translation.value?.contentId ? { contentId: this.translation.value?.contentId } : {}),
      ...(this.translation?.get('language').value?.name && this.translation?.get('language').value?.name !== 'Default'
        ? { language: this.translation.value?.language?.id }
        : {}),
      content: this.translation.value?.content,
      ...(this.initialValues.reference === this.staticForm?.get('reference').value ? {} : { reference: this.staticForm?.get('reference').value }),
    };
    const input: any = {
      ...(keys(translation)?.length ? { translation } : {}),
      ...FormHelper.getDifference(omit(this.initialValues, 'translation'), omit(this.staticForm.value, 'translation')),
    };
    if (this.selectedStaticTranslation) {
      this.staticService
        .updateStaticTranslation({ ...updateInput, id: this.selectedStaticTranslation?.id })
        .pipe(
          catchError(() => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res: any) => {
          if (res) {
            this.modalService.dismissAll();
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      this.staticService
        .createStaticTranslation(input)
        .pipe(
          catchError(() => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res: any) => {
          if (res) {
            this.pagination.length--;
            this.pagination.endIndex--;
            this.modalService.dismissAll();
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.staticService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.staticService.getStaticTranslationsByTargetAndLanguagePaginated().subscribe();
    }
  }

  openDeleteModal(content: any, translation: StaticTranslationType) {
    this.selectedStaticTranslation = translation;
    this.modalService.open(content, { centered: true });
  }

  deleteStaticTranslation() {
    this.staticService
      .deleteStaticTranslation(this.selectedStaticTranslation.id)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe(() => {
        this.pagination.length--;
        this.pagination.endIndex--;
        this.position();
        this.modalService.dismissAll();
        this.modalService.dismissAll();
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

  ngOnDestroy(): void {
    this.staticService.pageIndex = 0;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
