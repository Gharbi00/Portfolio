import Lottie from 'lottie-web';
import { QuillModule } from 'ngx-quill';
import { NgModule } from '@angular/core';
import { AgmCoreModule } from '@agm/core';
import { CountUpModule } from 'ngx-countup';
import { NgxBarcodeModule } from 'ngx-barcode';
import { QRCodeModule } from 'angularx-qrcode';
import { defineElement } from '@lordicon/element';
import { GraphQLModule } from '../graphql.module';
import { PortalModule } from '@angular/cdk/portal';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { OverlayModule } from '@angular/cdk/overlay';
import { FlatpickrModule } from 'angularx-flatpickr';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AmazonS3Helper, HelpersModule } from '@diktup/frontend/helpers';

import { WidgetGeneratorModule } from '@sifca-monorepo/widget-generator';

import { HttpClient } from '@angular/common/http';
import { ModulesResolver } from './modules.resolver';
import { TranslateLoader } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { PlayerService } from './player/player.service';
import { IndexComponent } from './index/index.component';
import { GuestModeComponent } from './guest/guest.component';
import { TruncatePipe } from '../shared/pipes/truncate.pipe';
import { EmbedModeComponent } from './embed/embed.component';
import { PlayerModeComponent } from './player/player.component';
import { GraphQLTranslateLoader } from './graphql-translate-loader';
import { OnboardingComponent } from './onboarding/onboarding.component';
import { LanguageService } from '../shared/services/language.service';
import { ResetApiService } from '../shared/services/reset-api.service';
import { ChatComponent } from './player/components/chat/chat.component';
import { HomeComponent } from './player/components/home/home.component';
import { EarnComponent } from './player/components/earn/earn.component';
import { CircularMenuModule } from './circular-menu/circular-menu.module';
import { QuestsService } from './player/components/quests/quests.service';
import { BadgeComponent } from './player/components/badge/badge.component';
import { ProfileService } from './player/components/profile/profile.service';
import { RedeemComponent } from './player/components/redeem/redeem.component';
import { InterceptorsModule } from '../shared/interceptors/interceptors.module';
import { ButtonsComponent } from './player/components/buttons/buttons.component';
import { ProgressBarDirective } from '../shared/directives/progress-bar.directive';
import { ChatSupportService } from './player/components/chat/chat-support.service';
import { ChallengeService } from './player/components/challenge/challenge.service';
import { CloseMenuModule } from '../shared/components/close-menu/close-menu.module';
import { QuestListComponent } from './player/components/quests/list/list.component';
import { MovableWidgetDirective } from '../shared/directives/movable-widget.directive';
import { ProfileEditComponent } from './player/components/profile/edit/edit.component';
import { QuizzComponent } from './player/components/quests/detail/quiz/quizz.component';
import { LeaderboardService } from './player/components/leaderboard/leaderboard.service';
import { ReputationComponent } from './player/components/reputation/reputation.component';
import { QuestDetailComponent } from './player/components/quests/detail/detail.component';
import { ChallengeListComponent } from './player/components/challenge/list/list.component';
import { PaginationComponent } from '../shared/components/pagination/pagination.component';
import { TransactionsService } from './player/components/transactions/transactions.service';
import { LeaderboardComponent } from './player/components/leaderboard/leaderboard.component';
import { ProfileDetailComponent } from './player/components/profile/detail/detail.component';
import { ActiveModeComponent } from '../shared/components/active-mode/active-mode.component';
import { NotificationsService } from './player/components/notification/notifications.service';
import { ConnectUserComponent } from './player/components/connect-user/connect-user.component';
import { AggregatorLoginComponent } from './guest/aggregator-login/aggregator-login.component';
import { NotificationComponent } from './player/components/notification/notification.component';
import { TransactionsComponent } from './player/components/transactions/transactions.component';
import { GameService } from './player/components/quests/detail/memory-game/services/game.service';
import { WidgetFooterComponent } from '../shared/components/widget-footer/widget-footer.component';
import { BoardComponent } from './player/components/quests/detail/memory-game/board/board.component';
import { DonationDetailsComponent } from './player/components/challenge/donation/donation.component';
import { LeaderboardDetailsComponent } from './player/components/challenge/leaderboard/details.component';
import { CompleteProfileComponent } from '../shared/components/complete-profile/complete-profile.component';
import { AppageComponent } from './player/components/quests/detail/sliding-puzzle/sliding/sliding.component';
import { JigsawPuzzleComponent } from './player/components/quests/detail/jigsaw-puzzle/jigsaw-puzzle.component';
import { ActivityHightlightComponent } from '../shared/components/activity-hightlight/activity-hightlight.component';
import { MemoryCardComponent } from './player/components/quests/detail/memory-game/memory-card/memory-card.component';
import { PgpageComponent } from './player/components/quests/detail/sliding-puzzle/puzzle/sliding-puzzle-game.component';
import { MarketplaceComponent } from './player/components/marketplace/marketplace.component';
import { ProductComponent } from '../shared/components/app-product/app-product.component';
import { RewardsComponent } from '../shared/components/rewards/rewards.component';

const routes: Routes = [
  {
    path: '',
    component: IndexComponent,
    resolve: {
      player: ModulesResolver,
    },
  },
];

@NgModule({
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' },
    GameService,
    PlayerService,
    LanguageService,
    QuestsService,
    ProfileService,
    AmazonS3Helper,
    ModulesResolver,
    ResetApiService,
    ChallengeService,
    LeaderboardService,
    ChatSupportService,
    TransactionsService,
    NotificationsService,
  ],
  declarations: [
    TruncatePipe,
    HomeComponent,
    ChatComponent,
    EarnComponent,
    QuizzComponent,
    BoardComponent,
    IndexComponent,
    BadgeComponent,
    PgpageComponent,
    AppageComponent,
    RedeemComponent,
    ButtonsComponent,
    RewardsComponent,
    ProductComponent,
    GuestModeComponent,
    OnboardingComponent,
    EmbedModeComponent,
    QuestListComponent,
    MemoryCardComponent,
    PaginationComponent,
    PlayerModeComponent,
    ActiveModeComponent,
    ReputationComponent,
    ProgressBarDirective,
    ConnectUserComponent,
    LeaderboardComponent,
    ProfileEditComponent,
    MarketplaceComponent,
    QuestDetailComponent,
    WidgetFooterComponent,
    JigsawPuzzleComponent,
    NotificationComponent,
    TransactionsComponent,
    MovableWidgetDirective,
    ProfileDetailComponent,
    ChallengeListComponent,
    DonationDetailsComponent,
    AggregatorLoginComponent,
    CompleteProfileComponent,
    LeaderboardDetailsComponent,
    ActivityHightlightComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    FlatpickrModule.forRoot(),
    QuillModule,
    FormsModule,
    CommonModule,
    QRCodeModule,
    PickerModule,
    SharedModule,
    PortalModule,
    GraphQLModule,
    CountUpModule,
    MatCardModule,
    OverlayModule,
    HelpersModule,
    MatIconModule,
    NgSelectModule,
    MatRadioModule,
    CarouselModule,
    DragDropModule,
    MatSelectModule,
    NgxSliderModule,
    TranslateModule,
    CloseMenuModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
    NgxBarcodeModule,
    FlexLayoutModule,
    MatDividerModule,
    MatToolbarModule,
    FontAwesomeModule,
    NgbDropdownModule,
    InterceptorsModule,
    MatFormFieldModule,
    CircularMenuModule,
    InterceptorsModule,
    YouTubePlayerModule,
    ReactiveFormsModule,
    WidgetGeneratorModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDuBPYtFIzcu1rmVSupQEpPjOdhW8odjRY',
      libraries: ['places'],
    }),
    // TranslateModule.forRoot({
    //   loader: {
    //     provide: TranslateLoader,
    //     useClass: GraphQLTranslateLoader,
    //     deps: [HttpClient]
    //   }
    // }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: GraphQLTranslateLoader,
        deps: [HttpClient]
      }
    }),
  ],
  exports: [ActivityHightlightComponent],
})
export class ModulesModule {
  constructor() {
    defineElement(Lottie.loadAnimation);
  }
}
