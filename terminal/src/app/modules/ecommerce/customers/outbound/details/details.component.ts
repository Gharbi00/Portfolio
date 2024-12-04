import Swal from 'sweetalert2';
import { Buffer } from 'buffer';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { clone, filter, isEqual, keys, map, omit, uniq, values } from 'lodash';
import { take, Subject, takeUntil, Observable, map as rxMap, combineLatest, catchError, of } from 'rxjs';
import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID, SecurityContext } from '@angular/core';

import {
  TriggerEnum,
  AudienceType,
  OutboundType,
  LanguageType,
  OutboundEditorEnum,
  SmsIntegrationType,
  EmailIntegrationType,
  DeleteFileFromAwsGQL,
  LeaderboardCycleEnum,
  WidgetIntegrationType,
  GenerateS3SignedUrlGQL,
  OutboundWidgetActionsEnum,
  CorporateEmailTemplateType,
  NotificationIntegrationType,
  QuestWithProgressType,
  ChallengeType,
  QuestStatusEnum,
  ChallengeStatusEnum,
} from '@sifca-monorepo/terminal-generator';
import { AmazonS3Helper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';

import { OutboundService } from '../outbound.service';
import { AWS_CREDENTIALS } from '../../../../../../environments/environment';
import { WidgetService } from '../../../../system/apps/apps/widget/widget.service';
import { AudiencesService } from '../../../../engagement/audience/audience.service';
import { SharedService } from '../../../../../../app/shared/services/shared.service';
import { SelectAudienceModalComponent } from '../../../../../../app/shared/components/select-audience-modal/select-audience-modal.component';import { SmsIntegrationService } from '../../../../system/apps/apps/sms-integration/sms-integration.service';
import { EmailIntegrationService } from '../../../../system/apps/apps/email-integration/email-integration.service';
import { NotificationIntegrationService } from '../../../../system/apps/apps/notifications-integration/notifications-integration.service';
import { CampaignsService } from '../../../../engagement/campaigns/campaign/campaigns.service';
import { ChallengesService } from '../../../../engagement/campaigns/challenges/challenges.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'sifca-monorepo-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class OutboundDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  selectedNav = 1;
  htmlText: string;
  editView = false;
  intialValues: any;
  isDesktop: boolean;
  safeEmail: SafeHtml;
  emailNames: string[];
  emailContent: string;
  outbound: OutboundType;
  audience: AudienceType;
  outboundForm: FormGroup;
  isButtonDisabled = true;
  selectedContent = 'email';
  breadCrumbItems!: Array<{}>;
  selectedEmailType = 'email';
  triggers = values(TriggerEnum);
  smsIntegration: SmsIntegrationType;
  emails: CorporateEmailTemplateType[];
  emailIntegration: EmailIntegrationType;
  allEmails: CorporateEmailTemplateType[];
  selectedEmail: CorporateEmailTemplateType;
  notifIntegration: NotificationIntegrationType;
  leaderboardCycle = values(LeaderboardCycleEnum);
  widgetActions = values(OutboundWidgetActionsEnum);
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  oubounds$: Observable<OutboundType[]> = this.outboundService.outbounds$;
  audiences$: Observable<AudienceType[]> = this.audiencesService.audiences$;
  loadingEmails$: Observable<boolean> = this.outboundService.loadingEmails$;
  loadingOutbound$: Observable<boolean> = this.outboundService.loadingOutbounds$;
  email$: Observable<EmailIntegrationType> = this.emailIntegrationService.email$;
  emails$: Observable<CorporateEmailTemplateType[]> = this.outboundService.emails$;
  quests$: Observable<QuestWithProgressType[]> = this.campaignService.infiniteQuests$;
  challenges$: Observable<ChallengeType[]> = this.challengesService.infiniteChallenges$;
  smsIntegration$: Observable<SmsIntegrationType> = this.smsIntegrationService.smsIntegration$;
  notification$: Observable<NotificationIntegrationType> = this.notificationIntegrationService.notification$;

  text = `
  <p>Hi <%= firstName %></p>
  <p>This is an email just for you. We hope you like it. %></p>
  <p>The Team</p>
  `;
  widget: WidgetIntegrationType;
  languages: LanguageType[];
  widgetLanguages: LanguageType[];

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  get translation(): FormArray {
    return this.outboundForm.get(['content', 'widget', 'translation']) as FormArray;
  }

  get widgetAction(): FormArray {
    return this.outboundForm.get(['content', 'widget', 'callToAction', 'action', 'widgetAction']) as FormArray;
  }

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private widgetervice: WidgetService,
    private sharedService: SharedService,
    private storageHelper: StorageHelper,
    private amazonS3Helper: AmazonS3Helper,
    private outboundService: OutboundService,
    private campaignService: CampaignsService,
    private audiencesService: AudiencesService,
    private deviceService: DeviceDetectorService,
    private changeDetectorRef: ChangeDetectorRef,
    private challengesService: ChallengesService,
    private deleteFileFromAwsGQL: DeleteFileFromAwsGQL,
    private smsIntegrationService: SmsIntegrationService,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    private emailIntegrationService: EmailIntegrationService,
    private notificationIntegrationService: NotificationIntegrationService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.widgetervice.widget$,
      this.outboundService.outbound$,
      this.emailIntegrationService.email$,
      this.smsIntegrationService.smsIntegration$,
      this.notificationIntegrationService.notification$,
    ])
      .pipe(
        rxMap(([widgetIntegration, outbound, emailIntegration, smsIntegration, notification]) => {
          this.widget = widgetIntegration;
          console.log("🚀 ~ OutboundDetailsComponent ~ rxMap ~ widgetIntegration:", widgetIntegration)
          this.emailIntegration = emailIntegration;
          this.smsIntegration = smsIntegration;
          this.notifIntegration = notification;
          this.outbound = outbound;
          this.audience = outbound?.audience;
          this.languages = clone(map(widgetIntegration.multilanguage?.languages, 'language'));
          this.selectedEmailType =
            outbound?.content?.email?.editor === 'TEXT' ? 'text' : outbound?.content?.email?.editor === 'HTML' ? 'email' : 'email'; /// to be fixed
          this.selectedContent =
            outbound?.content?.push?.title && (this.notifIntegration?.web?.enable || this.notifIntegration?.mobile?.enable)
              ? 'push'
              : outbound?.content?.sms?.content && this.smsIntegration?.gateway
              ? 'sms'
              : outbound?.content?.email?.content && this.emailIntegration?.server?.host
              ? 'email'
              : outbound?.content?.widget?.title
              ? 'widget'
              : '';
          this.outboundForm = this.formBuilder.group({
            title: [outbound?.title || ''],
            description: [outbound?.description || ''],
            trigger: [outbound?.trigger || undefined],
            executedAt: [outbound?.executedAt === true ? true : false],
            picture: this.formBuilder.group({
              baseUrl: [outbound?.picture?.baseUrl || ''],
              path: [outbound?.picture?.path || ''],
            }),
            audience: [this.outbound?.audience?.id],
            content: this.formBuilder.group({
              email: this.formBuilder.group({
                subject: [outbound?.content?.email?.subject || ''],
                preview: [outbound?.content?.email?.preview || ''],
                content: [outbound?.content?.email?.content ? this.decodeFromBase64(outbound?.content?.email?.content) : ''],
                editor: [outbound?.content?.email?.editor || ''],
              }),
              sms: this.formBuilder.group({
                content: [outbound?.content?.sms?.content],
              }),
              push: this.formBuilder.group({
                title: [outbound?.content?.push?.title || ''],
                description: [outbound?.content?.push?.description || ''],
                picture: this.formBuilder.group({
                  baseUrl: [outbound?.content?.push?.picture?.baseUrl || ''],
                  path: [outbound?.content?.push?.picture?.path || ''],
                }),
              }),
              widget: this.formBuilder.group({
                title: [outbound?.content?.widget?.title || ''],
                description: [outbound?.content?.widget?.description || ''],
                picture: this.formBuilder.group({
                  baseUrl: [outbound?.content?.widget?.picture?.baseUrl || ''],
                  path: [outbound?.content?.widget?.picture?.path || ''],
                }),
                callToAction: this.formBuilder.group({
                  label: [outbound?.content?.widget?.callToAction?.label || ''],
                  action: this.formBuilder.group({
                    paramId: [outbound?.content?.widget?.callToAction?.action?.paramId || undefined],
                    leaderboard: [outbound?.content?.widget?.callToAction?.action?.leaderboard || undefined],
                    widgetAction: [outbound?.content?.widget?.callToAction?.action?.widgetAction || undefined],
                  }),
                }),
                translation: this.formBuilder.array(
                  outbound?.content?.widget?.translation?.length
                    ? map(outbound?.content?.widget?.translation, (trs) => {
                        return this.formBuilder.group({
                          language: [trs?.language],
                          content: this.formBuilder.group({
                            title: [trs?.content?.title || ''],
                            description: [trs?.content?.description || ''],
                            label: [trs?.content?.label || ''],
                          }),
                        });
                      })
                    : [
                        this.formBuilder.group({
                          language: [undefined],
                          content: this.formBuilder.group({
                            title: [''],
                            description: [''],
                            label: [''],
                          }),
                        }),
                      ],
                ),
              }),
            }),
          });
          this.checkTranslations();
          this.translation.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe(() => {
            this.checkTranslations();
          });
          this.intialValues = this.outboundForm.value;
          if (outbound?.content?.email?.content) {
            this.safeEmail = this.sanitizer?.bypassSecurityTrustHtml(this.decodeFromBase64(outbound?.content?.email?.content));
          }
          this.outboundForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
            this.isButtonDisabled = isEqual(values, this.intialValues);
          });
          this.outboundForm
            .get(['content', 'email', 'content'])
            .valueChanges.pipe(takeUntil(this.unsubscribeAll))
            .subscribe((val) => {
              if (val) {
                this.safeEmail = this.sanitizer?.bypassSecurityTrustHtml(val);
              }
            });
        }),
      )
      .subscribe();
    this.isDesktop = this.deviceService.isDesktop();
    this.outboundService.emails$.pipe(takeUntil(this.unsubscribeAll)).subscribe((emails) => {
      this.allEmails = emails;
      this.emailNames = uniq(map(emails, 'name'));
      this.emails = filter(this.allEmails, (item) => item?.name === this.emailNames[0]);
    });
    this.audiencesService.getAudiencesByTargetPaginated().subscribe();
    combineLatest([this.translate.get('MENUITEMS.TS.ENGAGEMENT'), this.translate.get('MENUITEMS.TS.AUDIENCE')])
      .pipe(
        rxMap(([engagement, audience]: [string, string]) => {
          return (this.breadCrumbItems = [{ label: engagement }, { label: audience, active: true }]);
        }),
      )
      .subscribe();
  }

  ngAfterViewInit() {
    combineLatest([
      this.outboundService.getAppCorporateEmailsPaginated(),
      this.campaignService.findNonPredefinedQuestsByTarget({ status: [QuestStatusEnum.ONGOING] }),
      this.challengesService.getChallengesByTargetWithDonationProgressPaginated({ status: [ChallengeStatusEnum.ONGOING] }),
    ]).subscribe();
  }

  onChangeAction() {
    this.outboundForm.get(['content', 'widget', 'callToAction', 'action', 'paramId']).patchValue(undefined);
  }

  checkTranslations() {
    this.widgetLanguages = this.languages.filter((lang) => !this.translation.value.some((trs) => trs?.language?.id === lang?.id));
  }

  loadMoreQuests() {
    this.campaignService.isLastQuestActivities$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.campaignService.questPageIndex += 1;
        this.campaignService.findNonPredefinedQuestsByTarget({ status: [QuestStatusEnum.ONGOING] }).subscribe();
      }
      this.changeDetectorRef.markForCheck();
    });
  }

  addTranslation() {
    this.translation.push(
      this.formBuilder.group({
        language: [undefined],
        content: this.formBuilder.group({
          title: [''],
          description: [''],
          label: [''],
        }),
      }),
    );
    this.changeDetectorRef.markForCheck();
  }

  removeTranslation(i: number) {
    this.translation.removeAt(i);
    this.changeDetectorRef.markForCheck();
  }

  sanitizeHtml(email: CorporateEmailTemplateType, content?: string): SafeHtml {
    this.htmlText = this.decodeFromBase64(email?.content || content);
    if (email) {
      const decodedStyle: string = this.isDesktop ? this.decodeFromBase64(email.style?.desktop) : this.decodeFromBase64(email.style?.mobile);
      const styleContent: string = `<style type="text/css">${decodedStyle}</style>`;
      const headEndIndex: number = this.htmlText.indexOf('</head>');
      this.htmlText = this.htmlText.slice(0, headEndIndex) + styleContent + this.htmlText.slice(headEndIndex);
    }
    return this.sanitizer?.bypassSecurityTrustHtml(this.htmlText);
  }

  decodeFromBase64(base64: string): string {
    return Buffer.from(base64, 'base64').toString('utf-8');
  }

  encodeToBase64(input: string): string {
    return Buffer.from(input).toString('base64');
  }

  useTemplate(index: number, field: string) {
    if (field !== 'modal') {
      this.selectedEmail = this.emails[index];
    }
    this.selectedNav = 4;
    this.outboundForm.get(['content', 'email', 'content']).patchValue(this.decodeFromBase64(this.selectedEmail.content));
    this.emailContent = this.decodeFromBase64(this.selectedEmail.content);
    this.onNavChange();
    this.modalService.dismissAll();
    this.changeDetectorRef.markForCheck();
  }

  onChangeEmailText(field: string) {
    this.selectedEmailType = field;
    if (field === 'text') {
      this.outboundForm.get(['content', 'email', 'content']).patchValue(this.text);
    } else {
      this.outboundForm.get(['content', 'email', 'content']).reset();
    }
  }

  changeTemplate() {
    this.selectedEmail = null;
    this.selectedEmailType = null;
    this.safeEmail = null;
    this.outboundForm.get(['content', 'email', 'content']).reset();
    this.outboundForm.get(['content', 'email', 'editor']).reset();
    this.selectedEmailType = 'email';
    this.changeDetectorRef.markForCheck();
  }

  openSelectAudienceModal() {
    this.audiencesService.pageIndex = 0;
    this.audiencesService.infiniteAudiences$ = [];
    const modalRef = this.modalService.open(SelectAudienceModalComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
    });
    modalRef.result.then((result) => {
      if (result.id) {
        this.audience = result;
        if (this.outbound) {
          const input: any = { audience: result.id };
          this.outboundService
            .updateOutbound(this.outbound?.id, input)
            .pipe(
              catchError(() => {
                this.modalError();
                this.changeDetectorRef.markForCheck();
                return of(null);
              }),
            )
            .subscribe((res) => {
              if (res) {
                this.position();
                this.changeDetectorRef.markForCheck();
              }
            });
        } else {
          this.outboundForm.get('audience').patchValue(result.id);
        }
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  onChangeEditView() {
    this.selectedNav = 4;
    this.changeDetectorRef.markForCheck();
  }

  isBase64(value: string): boolean {
    const base64Regex = /^(?:[A-Za-z0-9+\/]{4})*?(?:[A-Za-z0-9+\/]{2}(?:==)?|[A-Za-z0-9+\/]{3}=?)?$/;
    return base64Regex.test(value);
  }

  save() {
    if (this.selectedContent === 'widget' && this.widgetLanguages?.length > 0) {
      this.translate.get('SHARED.ALL_LANGUAGES_REQUIRED').subscribe((sthWentWrong: string) => {
        Swal.fire({
          title: 'Oops...',
          text: sthWentWrong,
          icon: 'warning',
          showCancelButton: false,
          confirmButtonColor: 'rgb(3, 142, 220)',
          cancelButtonColor: 'rgb(243, 78, 78)',
        });
      });
      return;
    }
    const emailHtmlText = this.outboundForm.get(['content', 'email', 'content']).value;
    const isBase64Email = this.isBase64(emailHtmlText);
    this.isButtonDisabled = true;
    const smsHtmlText = this.outboundForm.get(['content', 'sms', 'content']).value;
    let field: string;
    field = this.outbound ? 'updateOutbound' : 'insertOutbound';
    const push = {
      ...FormHelper.getDifference(omit(this.intialValues.content.push, 'picture'), omit(this.outboundForm.value.content.push, 'picture')),
      ...(this.intialValues.content.push.picture.path === this.outboundForm.value.content.push.picture.path
        ? {}
        : { picture: this.outboundForm.value.content.push.picture }),
    };
    const action = {
      ...FormHelper.getDifference(this.intialValues.content.widget.callToAction.action, this.outboundForm.value.content.widget.callToAction.action),
    };
    const callToAction = {
      ...(this.intialValues.content.widget.callToAction.label !== this.outboundForm.value.content.widget.callToAction.label
        ? { label: this.outboundForm.value.content.widget.callToAction.label }
        : {}),
      ...(keys(action)?.length ? { action } : {}),
    };
    const translation = map(this.translation.value, (trs) => {
      return {
        ...(trs.language ? { language: trs.language?.id } : {}),
        ...(trs.content?.title || trs.content?.description || trs.content?.label
          ? {
              content: {
                ...(trs.content?.title ? { title: trs.content?.title } : {}),
                ...(trs.content?.description ? { description: trs.content?.description } : {}),
                ...(trs.content?.label ? { label: trs.content?.label } : {}),
              },
            }
          : {}),
      };
    }).filter((item) => item?.language);
    const widget = {
      ...FormHelper.getDifference(
        omit(this.intialValues.content.widget, 'picture', 'callToAction'),
        omit(this.outboundForm.value.content.widget, 'picture', 'callToAction'),
      ),
      ...(keys(callToAction)?.length ? { callToAction } : {}),
      ...(translation?.length ? { translation } : {}),
      ...(this.intialValues.content.widget.picture.path === this.outboundForm.value.content.widget.picture.path
        ? {}
        : { picture: this.outboundForm.value.content.widget.picture }),
    };
    if (isPlatformBrowser(this.platformId)) {
      const input: any = {
        ...FormHelper.getDifference(omit(this.intialValues, 'content', 'picture'), omit(this.outboundForm.value, 'content', 'picture')),
        ...(this.intialValues.picture.path === this.outboundForm.value.picture.path ? {} : { picture: this.outboundForm.value.picture }),
        content: {
          ...(this.selectedContent === 'email'
            ? {
                email: {
                  ...this.outboundForm.get(['content', 'email']).value,
                  content:
                    this.selectedEmailType === 'email' || this.selectedEmailType === 'html'
                      ? !isBase64Email
                        ? this.encodeToBase64(emailHtmlText)
                        : emailHtmlText
                      : this.selectedEmailType === 'text'
                      ? window.btoa(emailHtmlText)
                      : '',
                  editor: this.selectedEmailType === 'text' ? OutboundEditorEnum.TEXT : OutboundEditorEnum.HTML,
                },
                sms: { content: null },
                push: { picture: { baseUrl: '', path: '' }, title: null, description: null },
                widget: {
                  title: null,
                  description: null,
                  picture: { baseUrl: '', path: '' },
                  callToAction: {
                    label: null,
                    action: {
                      paramId: null,
                      leaderboard: null,
                      widgetAction: null,
                    },
                    translation: [],
                  },
                },
              }
            : {}),
          ...(this.selectedContent === 'sms'
            ? {
                email: {
                  content: null,
                  subject: null,
                  preview: null,
                },
                sms: { content: smsHtmlText },
                push: { picture: { baseUrl: '', path: '' }, title: null, description: null },
                widget: {
                  title: null,
                  description: null,
                  picture: { baseUrl: '', path: '' },
                  callToAction: {
                    label: null,
                    action: {
                      paramId: null,
                      leaderboard: null,
                      widgetAction: null,
                    },
                    translation: [],
                  },
                },
              }
            : {}),
          ...(this.selectedContent === 'push'
            ? {
                email: {
                  content: null,
                  subject: null,
                  preview: null,
                },
                sms: { content: null },
                widget: {
                  title: null,
                  description: null,
                  picture: { baseUrl: '', path: '' },
                  callToAction: {
                    label: null,
                    action: {
                      paramId: null,
                      leaderboard: null,
                      widgetAction: null,
                    },
                    translation: [],
                  },
                },
                push,
              }
            : {}),

          ...(this.selectedContent === 'widget'
            ? {
                email: {
                  content: null,
                  subject: null,
                  preview: null,
                },
                sms: { content: null },
                push: { picture: { baseUrl: '', path: '' }, title: null, description: null },
                widget,
              }
            : {}),
        },
      };
      const args = this.outbound ? [this.outbound.id, input] : [input];
      this.outboundService[field](...args)
        .pipe(
          catchError(() => {
            this.modalError();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.position();
            this.router.navigate(['/ecommerce/customers/outbound']);
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  openDeleteModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  deleteAudience() {
    this.outboundService
      .removeAudienceFromOutbound(this.outbound?.id)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  onChangeEmail(name: string) {
    this.emails = filter(this.allEmails, (item) => item?.name === name);
    this.changeDetectorRef.markForCheck();
  }

  onGlobalTabChanged(tab: number) {
    this.selectedNav = tab;
    if (this.selectedEmail && this.safeEmail) {
      this.onNavChange();
    }
  }

  onNavChange(tab: number = 1) {
    let updatedSelectedSafeEmail: string = this.sanitizer.sanitize(SecurityContext.HTML, this.safeEmail);
    const decodedStyle: string =
      tab === 1 ? this.decodeFromBase64(this.selectedEmail.style?.desktop) : this.decodeFromBase64(this.selectedEmail.style?.mobile);
    updatedSelectedSafeEmail = this.replaceStyle(updatedSelectedSafeEmail, `<style type="text/css">${decodedStyle}</style>`);
    this.safeEmail = this.sanitizer?.bypassSecurityTrustHtml(updatedSelectedSafeEmail) as SafeHtml;
    this.changeDetectorRef.markForCheck();
  }

  replaceStyle(emailContent: string, style: string): string {
    const stylePattern = /<style type="text\/css">[\s\S]*?<\/style>/;
    return emailContent.replace(stylePattern, style);
  }

  openPreviewEmail(content: any, email: CorporateEmailTemplateType) {
    this.selectedEmail = email;
    this.safeEmail = this.sanitizeHtml(email);
    this.modalService.open(content, { centered: true, size: 'lg' });
  }

  upload(field?: string): void {
    const fileInput = this.document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.name = 'fileUpload';
    fileInput.id = 'fileUpload';
    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      const posId = this.storageHelper.getData('posId');
      const timestamp = Date.now();
      const fileName = `${posId}_${timestamp}_${file.name}`;
      this.changeDetectorRef.markForCheck();
      this.generateS3SignedUrlGQL
        .fetch({
          fileName,
          fileType: file.type,
        })
        .subscribe(async (res) => {
          const picture = await this.amazonS3Helper.uploadS3AwsWithSignature(
            res.data.generateS3SignedUrl.message,
            file,
            fileName,
            AWS_CREDENTIALS.storage,
            AWS_CREDENTIALS.region,
          );
          let input: any;
          if (field === 'push' || field === 'widget') {
            this.outboundForm.get(['content', field, 'picture']).patchValue({
              path: picture.path,
              baseUrl: picture.baseUrl,
            });
            input = {
              content: {
                ...(field === 'push'
                  ? {
                      push: {
                        picture: {
                          baseUrl: picture.baseUrl,
                          path: picture.path,
                        },
                      },
                    }
                  : {
                      widget: {
                        picture: {
                          baseUrl: picture.baseUrl,
                          path: picture.path,
                        },
                      },
                    }),
              },
            };
          } else {
            this.outboundForm.get('picture').patchValue({
              path: picture.path,
              baseUrl: picture.baseUrl,
            });
            input = {
              picture: {
                baseUrl: picture.baseUrl,
                path: picture.path,
              },
            };
          }
          if (this.outbound) {
            this.updateOutbound(input);
          }
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
  }

  removePicture(field?: string) {
    let input;
    let fileName;
    if (field === 'push' || field === 'widget') {
      fileName = this.outboundForm.get(['content', field, 'picture', 'path']).value;
      input = {
        content: {
          ...(field === 'push'
            ? {
                push: {
                  picture: {
                    baseUrl: '',
                    path: '',
                  },
                },
              }
            : {
                widget: {
                  picture: {
                    baseUrl: '',
                    path: '',
                  },
                },
              }),
        },
      };
      this.outboundForm.get(['content', 'push', 'picture']).patchValue({
        path: '',
        baseUrl: '',
      });
    } else {
      fileName = this.outboundForm.get('picture').value.path;
      this.outboundForm.get('picture').patchValue({
        path: '',
        baseUrl: '',
      });
      input = {
        picture: this.outboundForm.get('picture').value,
      };
    }
    this.deleteFileFromAwsGQL.fetch({ fileName }).subscribe((res) => {
      if (res.data.deleteFileFromAws && this.outbound) {
        this.updateOutbound(input);
      }
    });
  }

  updateOutbound(input: any) {
    this.outboundService
      .updateOutbound(this.outbound?.id, input)
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
  }

  loadMoreAudiences() {
    this.audiencesService.isLast$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.audiencesService.pageIndex += 1;
        this.audiencesService.getAudiencesByTargetPaginated().subscribe();
      }
      this.changeDetectorRef.markForCheck();
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

  ngOnDestroy() {
    this.challengesService.pageIndex = 0;
    this.campaignService.questPageIndex = 0;
    this.campaignService.infiniteQuests$ = null;
    this.challengesService.infiniteChallenges$ = null;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
