import Swal from 'sweetalert2';
import CryptoJS from 'crypto-js';
import { Location } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { every, filter, find, findIndex, isEqual, keys, map, omit, values } from 'lodash';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, catchError, combineLatest, of, take, takeUntil, throwError } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { PluginType } from '@sifca-monorepo/terminal-generator';
import { SmsIntegrationType, WebsiteIntegrationType } from '@sifca-monorepo/terminal-generator';
import {
  CurrencyType,
  LanguageType,
  SmsActionEnum,
  EmailTemplateTypeEnum,
  CorporateEmailTemplateType,
  ActivityTypeWithActiveStatusType,
  CorporateEmailTemplateTranslationType,
  WebsiteIntegrationMulticurrencyCurrencyType,
  WebsiteIntegrationMultilanguageLanguageType,
  SeoType,
} from '@sifca-monorepo/terminal-generator';
import { FormHelper } from '@diktup/frontend/helpers';

import { WebsiteService } from './website.service';
import { IntegrationAppsService } from '../../apps.service';
import { PosService } from '../../../../../core/services/pos.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { SmsIntegrationService } from '../sms-integration/sms-integration.service';
import { CorporateTemplateType, CorporateTemplateTypeEnum } from '@sifca-monorepo/terminal-generator';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'website',
  templateUrl: './website.component.html',
  styleUrls: ['./website.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebsiteComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  seo: SeoType;
  pageIndex = 0;
  htmlText: string;
  initialValues: any;
  seoForm: FormGroup;
  allLanguages: any[];
  emailForm: FormGroup;
  pagesForm: FormGroup;
  selectedField: string;
  seoInitialValues: any;
  filesHtmlText: string;
  isVisibleCode: boolean;
  websiteForm: FormGroup;
  sanitizedHtml: SafeHtml;
  isButtonDisabled = true;
  templateForm: FormGroup;
  websiteInitialValues: any;
  integrationForm: FormGroup;
  isSmsButtonDisabled = true;
  isSeoButtonDisabled = true;
  templateInitialValues: any;
  breadCrumbItems!: Array<{}>;
  isEmailButtonDisabled = true;
  currentLanguage: LanguageType;
  website: WebsiteIntegrationType;
  integration: SmsIntegrationType;
  template: CorporateTemplateType;
  isTemplateButtonDisabled = true;
  emails: CorporateEmailTemplateType[];
  selectedEmail: CorporateEmailTemplateType;
  filteredEmailNames: EmailTemplateTypeEnum[];
  selectedFileTemplate: CorporateTemplateType;
  templateNames = values(CorporateTemplateTypeEnum);
  isLast$: Observable<boolean> = this.websiteService.isLast$;
  selectedTranslation: CorporateEmailTemplateTranslationType;
  selectedCurrency: WebsiteIntegrationMulticurrencyCurrencyType;
  selectedLanguage: WebsiteIntegrationMultilanguageLanguageType;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  plugin$: Observable<PluginType> = this.integrationAppsService.plugin$;
  loadingEmails$: Observable<boolean> = this.websiteService.loadingEmails$;
  languages$: Observable<LanguageType[]> = this.posService?.infiniteLanguages$;
  currencies$: Observable<CurrencyType[]> = this.posService?.infiniteCurrencies$;
  emails$: Observable<CorporateEmailTemplateType[]> = this.websiteService.emails$;
  templates$: Observable<CorporateTemplateType[]> = this.websiteService.templates$;
  smsIntegration$: Observable<SmsIntegrationType> = this.integrationService.smsIntegration$;
  loadingSmsIntegration$: Observable<boolean> = this.integrationService.loadingSmsIntegration$;
  activityTypes$: Observable<ActivityTypeWithActiveStatusType[]> = this.websiteService.activityTypes$;

  definitions = [
    SmsActionEnum.REGISTRATION_REQUEST,
    SmsActionEnum.REGISTRATION_CONFIRMATION,
    SmsActionEnum.FORGOT_PASSWORD,
    SmsActionEnum.VALIDATE_PHONE,
  ];
  emailNames = [
    EmailTemplateTypeEnum.WELCOME_USER,
    EmailTemplateTypeEnum.VALIDATE_EMAIL,
    EmailTemplateTypeEnum.FORGOT_PASSWORD,
    EmailTemplateTypeEnum.CONTACT_REQUEST,
    EmailTemplateTypeEnum.LINK_ACCOUNT,
  ];
  defaultLanguage: any = {
    name: 'Default',
    id: '1',
  };
  defaultValue: any = {
    default: false,
    language: { name: 'Default', id: '1' },
  };
  selectedTrsIndex = 0;
  filteredTemplates: CorporateTemplateTypeEnum[];

  get translation() {
    return this.emailForm.get('translation');
  }
  get currencies(): FormArray {
    return this.websiteForm?.get(['multicurrency', 'currencies']) as FormArray;
  }
  get languages(): FormArray {
    return this.websiteForm?.get(['multilanguage', 'languages']) as FormArray;
  }

  get actions(): FormArray {
    return this.integrationForm?.get('actions') as FormArray;
  }
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private location: Location,
    private posService: PosService,
    private modalService: NgbModal,
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private websiteService: WebsiteService,
    private changeDetectorRef: ChangeDetectorRef,
    private integrationService: SmsIntegrationService,
    private integrationAppsService: IntegrationAppsService,
    private translate: TranslateService,
  ) {
    this.currentLanguage = this.defaultLanguage;
    this.integrationAppsService.findPluginByURL(this.location.path()).subscribe();
    combineLatest([
      this.websiteService.emails$,
      this.websiteService.website$,
      this.integrationService.smsIntegration$,
      this.websiteService.seo$,
      this.websiteService.templates$,
    ]).subscribe(([emails, website, smsIntegration, seo, templates]) => {
      this.filteredTemplates = this.templateNames.filter((name) => {
        return !templates.some((template) => template.name === name);
      });
      this.selectedFileTemplate = !this.selectedFileTemplate
        ? templates[0]
        : find(templates, (template) => this.selectedFileTemplate?.id === template?.id) || templates[0];
      this.templateForm = this.formBuilder.group({
        name: [undefined, Validators.required],
        content: ['', Validators.required],
      });
      if (this.selectedFileTemplate) {
        const bytes = CryptoJS?.enc?.Base64.parse(this.selectedFileTemplate?.content);
        this.filesHtmlText = CryptoJS?.enc?.Utf8.stringify(bytes);
        this.templateForm?.get('name')?.patchValue(this.selectedFileTemplate?.name);
        this.templateForm?.get('content')?.patchValue(this.filesHtmlText);
      }
      this.templateInitialValues = this.templateForm.value;
      this.templateForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
        this.isTemplateButtonDisabled = isEqual(this.templateInitialValues, values);
      });
      this.seo = seo;
      this.seoForm = this.formBuilder.group({
        // googleAnalyticsId: [''],
        metaDescriptionTag: [seo?.metaDescriptionTag || ''],
        titleTag: [seo?.titleTag || ''],
        headerTags: this.formBuilder.array(
          this.seo?.headerTags?.length
            ? map(this.seo?.headerTags, (tag) => {
                return this.formBuilder.group({
                  name: [tag?.name || ''],
                  content: [tag?.content || ''],
                });
              })
            : [
                this.formBuilder.group({
                  name: [''],
                  content: [''],
                }),
              ],
        ),
      });
      this.seoInitialValues = this.seoForm.value;
      this.seoForm.valueChanges.subscribe((values) => {
        this.isSeoButtonDisabled = isEqual(values, this.seoInitialValues);
      });
      this.integration = smsIntegration;
      this.integrationForm = this.formBuilder.group({
        actions: this.formBuilder.array(
          map(this.definitions, (def, i: number) => {
            const defualtAction = find(this.integration?.actions, { definition: def });
            return this.formBuilder.group({
              definition: [
                def === SmsActionEnum?.REGISTRATION_REQUEST
                  ? 'Registration Request'
                  : def === SmsActionEnum?.REGISTRATION_CONFIRMATION
                  ? 'Registration Confirmation'
                  : def === SmsActionEnum?.FORGOT_PASSWORD
                  ? 'Forgot Password'
                  : def === SmsActionEnum?.VALIDATE_PHONE
                  ? 'Validate Phone'
                  : '',
              ],
              enabled: [defualtAction?.enabled === true ? true : false],
              content: [defualtAction?.content || ''],
            });
          }),
        ),
      });
      const initialValues = this.integrationForm.value;
      this.integrationForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val) => {
        this.isSmsButtonDisabled = isEqual(val, initialValues);
      });
      this.website = website;
      this.allLanguages = [this.defaultLanguage, ...map(website?.multilanguage?.languages || [], 'language')];
      this.emails = filter(
        emails,
        (email) =>
          email?.name === EmailTemplateTypeEnum.WELCOME_USER ||
          email?.name === EmailTemplateTypeEnum.VALIDATE_EMAIL ||
          email?.name === EmailTemplateTypeEnum.FORGOT_PASSWORD ||
          email?.name === EmailTemplateTypeEnum.LINK_ACCOUNT ||
          email?.name === EmailTemplateTypeEnum.CONTACT_REQUEST,
      );
      this.filteredEmailNames = this.emailNames.filter((name) => {
        return !this.emails.some((email) => email.name === name);
      });
      this.selectedEmail = !this.selectedEmail
        ? this.emails[0]
        : find(this.emails, (email) => this.selectedEmail?.id === email?.id) || this.emails?.[0];
      if (this.selectedEmail) {
        const bytes = CryptoJS?.enc?.Base64?.parse(this.selectedEmail?.content);
        this.htmlText = CryptoJS?.enc?.Utf8?.stringify(bytes);
        this.sanitizedHtml = this.sanitizer?.bypassSecurityTrustHtml(this.htmlText);
      }
      this.emailForm = this.formBuilder.group({
        name: [this.selectedEmail?.name || undefined, Validators.required],
        content: [this.htmlText || '', Validators.required],
        translation: this.formBuilder.group({
          language: [this.defaultLanguage],
          content: [''],
        }),
      });
      this.initialValues = this.emailForm.value;
      this.emailForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
        this.isEmailButtonDisabled = isEqual(this.initialValues, values);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.findLanguagesAndCurrencies();
  }

  onChangeEmailLanguage(translate: LanguageType) {
    if ((!translate || this.translation?.get('language').value?.name === 'Default') && this.emails?.length) {
      const bytes = CryptoJS.enc.Base64.parse(this.selectedEmail?.content);
      this.htmlText = CryptoJS.enc.Utf8.stringify(bytes);
      this.sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml(this.htmlText);
      this.emailForm.get('content').patchValue(this.htmlText);
      this.emailForm.get('name').patchValue(this.selectedEmail?.name);
      this.initialValues = this.emailForm.value;
      this.isEmailButtonDisabled = true;
      this.changeDetectorRef.markForCheck();
    } else {
      this.selectedTranslation = find(this.selectedEmail?.translation, (trans) => trans?.language.id === translate?.id);
      this.selectedTrsIndex = findIndex(this.selectedEmail?.translation, (trans) => trans?.language.id === translate?.id);
      const bytes = CryptoJS.enc.Base64.parse(this.selectedTranslation?.content ? this.selectedTranslation?.content : '');
      this.htmlText = CryptoJS.enc.Utf8.stringify(bytes);
      this.sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml(this.htmlText);
      this.emailForm.get(['translation', 'content']).patchValue(this.htmlText);
      this.initialValues = this.emailForm.value;
      this.isEmailButtonDisabled = true;
      this.changeDetectorRef.markForCheck();
    }
  }

  selectTemplate(email?: CorporateEmailTemplateType) {
    this.selectedEmail = email;
    if (this.emailForm.get(['translation', 'language']).value.name === 'Default') {
      this.sanitizeContent(email?.content);
    } else {
      const content = find(
        email?.translation,
        (trs: CorporateEmailTemplateTranslationType) => trs?.language?.id === this.emailForm.get(['translation', 'language']).value.id,
      )?.content;
      this.sanitizeContent(content);
    }
  }

  getHtmlText(content: string) {
    const bytes = CryptoJS.enc.Base64.parse(content);
    return CryptoJS.enc.Utf8.stringify(bytes);
  }

  sanitizeContent(content: string) {
    if (content) {
      this.htmlText = this.getHtmlText(content);
      this.sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml(this.htmlText);
      if (this.selectedEmail && this.translation?.get('language').value?.name === 'Default') {
        this.emailForm.get('content').patchValue(this.htmlText);
      } else {
        this.translation?.get('content').patchValue(this.htmlText);
      }
    } else {
      if (this.selectedEmail && this.translation?.get('language').value?.name === 'Default') {
        this.emailForm.get('content').patchValue('');
      } else {
        this.translation?.get('content').patchValue('');
      }
      this.sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml('');
    }
    this.emailForm.get('name').patchValue(this.selectedEmail?.name);
    this.initialValues = this.emailForm.value;
    this.isEmailButtonDisabled = true;
    this.changeDetectorRef.markForCheck();
  }

  onShowCode(checked: boolean) {
    this.isVisibleCode = checked;
    this.htmlText = this.getHtmlText(this.selectedEmail?.content);
    if (this.selectedEmail && this.translation?.get('language').value?.name === 'Default') {
      this.emailForm.get('content').patchValue(this.htmlText);
    } else {
      this.translation?.get('content').patchValue(this.htmlText);
    }
  }

  saveEmail() {
    let translations;
    let input: any;
    this.isEmailButtonDisabled = true;
    const translation = this.selectedEmail?.translation?.filter((translate) => translate?.language?.id !== this.selectedTranslation?.language?.id);
    if (this.translation?.value?.language && this.selectedEmail && this.translation?.get('language').value?.name !== 'Default') {
      translations = [
        ...map(translation, (trs) => {
          return {
            language: trs?.language?.id,
            content: trs?.content,
          };
        }),
        {
          language: this.translation?.value?.language?.id,
          content: CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(this.translation?.value?.content)),
        },
      ];
    }
    const textToEncode = this.emailForm.get('content').value;
    const base64String = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(textToEncode));
    input = {
      ...FormHelper.getNonEmptyValues(omit(this.emailForm.value, 'translation')),
      title: this.emailForm.value.name,
      content: base64String,
      ...(translations?.length ? { translation: translations } : {}),
    };
    if (!this.selectedEmail) {
      this.websiteService
        .createCorporateEmailTemplate(input)
        .pipe(
          catchError(() => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.modalService.dismissAll();
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      this.websiteService
        .updateCorporateEmailTemplate(this.selectedEmail?.id, input, false)
        .pipe(
          catchError(() => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            const index = findIndex(this.emails, (email) => email?.id === res.id);
            this.emails[index] = res;
            this.selectedEmail = res;
            this.selectTemplate(this.selectedEmail)
            this.modalService.dismissAll();
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  generateEcomSitemapXml() {
    this.websiteService
      .generateEcomSitemapXml()
      .pipe(
        catchError((error) => {
          if (error) {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }
        }),
      )
      .subscribe((res) => {
        if (res) {
          const bytes = CryptoJS?.enc?.Base64.parse(res?.content);
          this.filesHtmlText = CryptoJS?.enc?.Utf8.stringify(bytes);
          this.templateForm?.get('content')?.patchValue(this.filesHtmlText);
          this.position();
          this.isButtonDisabled = true;
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  deleteFileCorporateTemplate() {
    this.websiteService
      .deleteCorporateTemplate(this.selectedFileTemplate?.id)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
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

  selectFileTemplate(template: CorporateTemplateType) {
    this.selectedFileTemplate = template;
    const bytes = CryptoJS?.enc?.Base64.parse(this.selectedFileTemplate?.content);
    this.filesHtmlText = CryptoJS?.enc?.Utf8.stringify(bytes);
    this.templateForm.get('content').patchValue(this.filesHtmlText);
    this.templateForm.get('name').patchValue(template?.name);
    this.initialValues = this.templateForm.value;
    this.isButtonDisabled = true;
    this.changeDetectorRef.markForCheck();
  }

  openFileTemplateModal(content: any) {
    this.selectedFileTemplate = null;
    this.templateForm.get('name').patchValue(undefined);
    if (this.selectedFileTemplate) {
      const bytes = CryptoJS.enc.Base64.parse(this.selectedFileTemplate?.content);
      this.filesHtmlText = CryptoJS.enc.Utf8.stringify(bytes);
      this.templateForm.get('content').patchValue(this.filesHtmlText);
    } else {
      this.templateForm.get('content').patchValue('');
    }
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
    });
  }

  saveTemplate() {
    this.isTemplateButtonDisabled = true;
    const textToEncode = this.templateForm.get('content').value;
    const base64String = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(textToEncode));
    const input: any = {
      ...FormHelper.getNonEmptyValues(this.templateForm.value),
      content: base64String,
      title: this.templateForm.value.value,
    };
    if (!this.selectedFileTemplate) {
      this.websiteService
        .createCorporateTemplate(input)
        .pipe(
          catchError(() => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.modalService.dismissAll();
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      this.websiteService
        .updateCorporateTemplate(this.selectedFileTemplate?.id, input)
        .pipe(
          catchError(() => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.selectedFileTemplate = res;
            this.modalService.dismissAll();
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  createTagForm(): FormGroup {
    return this.formBuilder.group({
      name: [''],
      content: [''],
    });
  }

  newTag(): void {
    const control = this.seoForm.get('headerTags') as FormArray;
    control.push(this.createTagForm());
    this.changeDetectorRef.markForCheck();
  }

  deleteTag(j: number): void {
    const control = this.seoForm.get('headerTags') as FormArray;
    control.removeAt(j);
    if (!control.length) {
      this.newTag();
    }
  }

  saveSeo(): void {
    this.isSeoButtonDisabled = true;
    const headerTags = {
      ...FormHelper.getDifference(this.seoInitialValues.headerTags, this.seoForm.value.headerTags),
    };
    const input: any = {
      ...FormHelper.getDifference(this.seoInitialValues, this.seoForm.value),
      ...(keys(headerTags)?.length && !this.seo ? { headerTags: this.seoForm.value.headerTags } : {}),
    };
    if (this.seo) {
      this.websiteService
        .updateSeo(this.seo?.id, input)
        .pipe(
          catchError(() => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res: any) => {
          if (res) {
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      this.websiteService
        .createSeo(input)
        .pipe(
          catchError(() => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res: any) => {
          if (res) {
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  deleteSection(index: number) {
    this.actions.removeAt(index);
    this.changeDetectorRef.markForCheck();
  }

  onChangeLanguage(language: LanguageType) {
    this.integrationForm = this.formBuilder.group({
      actions: this.formBuilder.array(
        map(this.definitions, (def, i: number) => {
          const defualtAction = find(this.integration?.actions, { definition: def });
          return this.formBuilder.group({
            definition: [defualtAction?.definition || def],
            enabled: [defualtAction?.enabled || true],
            content: [defualtAction?.content || ''],
            translation: this.formBuilder.group({
              language: [this.currentLanguage.id],
              content: [find(defualtAction?.translation, (trs) => trs?.language?.id === this.currentLanguage.id)?.content || ''],
            }),
          });
        }),
      ),
    });
    this.initialValues = this.integrationForm.value;
    this.integrationForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val) => {
      this.isSmsButtonDisabled = isEqual(val, this.initialValues);
    });
  }

  saveIntegration() {
    // const input: any = [
    //   ...map(this.integration?.actions, (action, i: number) => {
    //     const index = findIndex(
    //       action?.translation,
    //       (trs) => trs?.language?.id === this.currentLanguage?.id,
    //     );
    //     if (index > -1) {
    //       action?.translation.splice(index, 1);
    //     }
    //     const newTranslation = {
    //       content: this.actions.at(i).get(['translation', 'content'])?.value,
    //       language: this.actions.at(i).get(['translation', 'language'])?.value,
    //     };
    //     return {
    //       ...action,
    //       translation: [
    //         ...map(action?.translation, (trs) => {
    //           return {
    //             content: trs?.content,
    //             language: trs?.language?.id,
    //           };
    //         }),
    //         // this.currentLanguage?.name !== 'Default' ? newTranslation : null,
    //         ...(this.currentLanguage?.name !== 'Default' ? [newTranslation] : []),
    //       ],
    //     };
    //   }),
    // ];

    const input: any = [
      ...map(this.actions?.value, (action) => {
        return {
          ...action,
          definition:
            action?.definition === 'Registration Request'
              ? SmsActionEnum?.REGISTRATION_REQUEST
              : action?.definition === 'Registration Confirmation'
              ? SmsActionEnum?.REGISTRATION_CONFIRMATION
              : action?.definition === 'Forgot Password'
              ? SmsActionEnum?.FORGOT_PASSWORD
              : action?.definition === 'Validate Phone'
              ? SmsActionEnum?.VALIDATE_PHONE
              : '',
        };
      }),
    ];
    this.isSmsButtonDisabled = true;
    this.integrationService
      .updateSmsIntegration(this.integration?.id, { actions: input })
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.currentLanguage = this.defaultLanguage;
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  openDeleteEmailModal(content: any, email: CorporateEmailTemplateType) {
    this.selectedEmail = email;
    this.modalService.open(content, { centered: true });
  }

  deleteCorporateEmailTemplate() {
    this.websiteService
      .deleteCorporateEmailTemplate(this.selectedEmail?.id)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
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

  openEmailModal(content: any, email: CorporateEmailTemplateType) {
    this.selectedEmail = email;
    this.emailForm.get('name').patchValue(undefined);
    if (this.selectedEmail) {
      this.htmlText = this.getHtmlText(this.selectedEmail?.content);
      this.emailForm.get('content').patchValue(this.htmlText);
    } else {
      this.emailForm.get('content').patchValue('');
    }
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
    });
  }

  previewsPage() {
    this.pageIndex = this.websiteService.pageIndex -= 1;
    this.websiteService.getCorporateEmailsByTargetPaginated().subscribe();
  }

  nextPage() {
    this.pageIndex = this.websiteService.pageIndex += 1;
    this.websiteService.getCorporateEmailsByTargetPaginated().subscribe();
  }

  findLanguagesAndCurrencies() {
    combineLatest([this.posService.findCurrenciesPagination(), this.posService.findlanguagesPagination()]).subscribe((res) => {
      if (res) {
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  loadMoreCurrencies() {
    this.posService.isLastCurrencies$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.posService.currenciesPageIndex++;
        this.posService.findCurrenciesPagination().subscribe();
      }
    });
  }

  loadMoreLanguages() {
    this.posService.isLastLanguages$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.posService.languagesPageIndex++;
        this.posService.findlanguagesPagination().subscribe();
      }
    });
  }

  save() {
    const input: any = {
      ...(this.selectedField === 'currency'
        ? {
            multicurrency: {
              currencies: [
                ...map(this.currencies.value, (currency) => {
                  return {
                    currency: currency?.currency.id,
                    default: currency?.default,
                  };
                }),
              ],
            },
          }
        : {
            multilanguage: {
              languages: [
                ...map(this.languages.value, (language) => {
                  return {
                    language: language?.language.id,
                    default: language?.default,
                  };
                }),
              ],
            },
          }),
    };
    this.updateWebsite(input);
  }

  openIntegrationModal(content: any, field: string) {
    this.selectedField = field;
    this.modalService.open(content, { centered: true });
    this.websiteForm = this.formBuilder.group({
      multilanguage: this.formBuilder.group({
        active: [this.website?.multilanguage?.active || false],
        languages: this.formBuilder.array(
          this?.website?.multilanguage?.languages?.length
            ? map(this?.website?.multilanguage?.languages, (lng) => {
                return this.formBuilder.group({
                  default: [lng?.default || false],
                  language: [lng?.language],
                });
              })
            : [
                this.formBuilder.group({
                  default: [false],
                  language: [undefined],
                }),
              ],
        ),
      }),
      multicurrency: this.formBuilder.group({
        active: [this.website?.multicurrency?.active || true],
        currencies: this.formBuilder.array(
          this?.website?.multicurrency?.currencies?.length
            ? map(this?.website?.multicurrency?.currencies, (curr) => {
                return this.formBuilder.group({
                  default: [curr?.default || false],
                  currency: [curr?.currency],
                });
              })
            : [
                this.formBuilder.group({
                  default: [false],
                  currency: [undefined],
                }),
              ],
        ),
      }),
    });
    this.websiteInitialValues = this.websiteForm.value;
    this.websiteForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((ivalues) => {
      this.isButtonDisabled = isEqual(ivalues, this.websiteInitialValues);
    });
  }

  removeCurrencyField(index: number): void {
    this.currencies.removeAt(index);
    this.changeDetectorRef.markForCheck();
  }

  addCurrencyField(): void {
    const CurrencyFormGroup = this.formBuilder.group({
      currency: [undefined, Validators.required],
      default: [false],
    });
    this.currencies.push(CurrencyFormGroup);
    this.changeDetectorRef.markForCheck();
  }

  removeLanguageField(index: number): void {
    this.languages.removeAt(index);
    this.changeDetectorRef.markForCheck();
  }

  addLanguageField(): void {
    const languageFormGroup = this.formBuilder.group({
      language: [undefined, Validators.required],
      default: [false],
    });
    (this.languages as FormArray).push(languageFormGroup);
    this.changeDetectorRef.markForCheck();
  }

  onChangeField(checked: boolean, field: string, index: number) {
    if (field === 'multicurrency') {
      this.website.multicurrency.currencies[index].default = checked;
    } else {
      this.website.multilanguage.languages[index].default = checked;
    }
    const input: any = {
      ...(field === 'multicurrency'
        ? {
            multicurrency: {
              ...this.website.multicurrency,
              currencies: [
                ...map(this.website.multicurrency.currencies, (currency) => {
                  return {
                    currency: currency?.currency.id,
                    default: currency?.default,
                  };
                }),
              ],
            },
          }
        : {
            multilanguage: {
              ...this.website.multilanguage,
              languages: [
                ...map(this.website.multilanguage.languages, (language) => {
                  return {
                    language: language?.language.id,
                    default: language?.default,
                  };
                }),
              ],
            },
          }),
    };
    this.updateWebsite(input);
  }

  updateWebsite(input: any) {
    this.isButtonDisabled = true;
    this.websiteService
      .updateWebsiteIntegration(this.website?.id, input)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => of(null));
        }),
      )
      .subscribe(() => {
        this.modalService.dismissAll();
        this.position();
        this.changeDetectorRef.markForCheck();
      });
  }

  onCheckStatus(currencies: WebsiteIntegrationMulticurrencyCurrencyType[], languages: WebsiteIntegrationMultilanguageLanguageType[]) {
    if (currencies?.length) {
      return every(currencies, (currency) => currency?.default === false);
    } else {
      return every(languages, (language) => language?.default === false);
    }
  }

  onChangeStatus(checked: boolean, field: string) {
    const input: any = {
      ...(field === 'multicurrency'
        ? {
            multicurrency: {
              active: checked,
            },
          }
        : {
            multilanguage: {
              active: checked,
            },
          }),
    };
    this.updateWebsite(input);
  }

  openDeleteModal(content: any, currency: WebsiteIntegrationMulticurrencyCurrencyType, language: WebsiteIntegrationMultilanguageLanguageType) {
    this.selectedCurrency = currency;
    this.selectedLanguage = language;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  deleteItem() {
    let currencies: WebsiteIntegrationMulticurrencyCurrencyType[] = [];
    let languages: any[];
    if (this.selectedCurrency) {
      currencies = this.website?.multicurrency?.currencies.filter((item) => item?.currency.id !== this.selectedCurrency?.currency?.id);
    } else {
      languages = this.website?.multilanguage?.languages.filter((item) => item?.language.id !== this.selectedLanguage?.language?.id);
    }
    const input: any = {
      ...(this.selectedCurrency
        ? {
            multicurrency: {
              currencies: [
                ...map(currencies, (currency) => {
                  return {
                    currency: currency?.currency.id,
                    default: currency?.default,
                  };
                }),
              ],
            },
          }
        : {
            multilanguage: {
              languages: [
                ...map(languages, (language) => {
                  return {
                    language: language?.language.id,
                    default: language?.default,
                  };
                }),
              ],
            },
          }),
    };
    this.updateWebsite(input);
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
    this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((sthWentWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: sthWentWrong,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
      });
    });
  }

  ngOnDestroy(): void {
    this.websiteService.emails$ = null;
    this.websiteService.activityTypes$ = null;
    this.posService.currenciesPageIndex = 0;
    this.posService.languagesPageIndex = 0;
    this.posService.infiniteCurrencies$ = null;
    this.posService.infiniteLanguages$ = null;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
