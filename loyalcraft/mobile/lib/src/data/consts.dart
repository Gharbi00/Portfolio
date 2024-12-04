import 'package:flutter/material.dart';
import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:loyalcraft/src/models/commun_class.dart';
import 'package:loyalcraft/src/models/dial_code.dart';

// <!---- AMAZONE FILE UPLOAD INTEGRATION ----!>
const String kS3BaseUrl = 'https://$kS3Storage.s3.$kS3Region.amazonaws.com';
const String kS3Storage = 'sifca-storage';
const String kS3Region = 'eu-central-1';
// <!---- COLORS ----!>
Color kFacebookBlueColor = const Color(0xFF4267B2);
const Color kAccentDarkColor = Color(0xFF212121);
const Color kMainDarkColor = Color(0xFFFFFFFF);
Color kSilverColor = const Color(0xFFC0C0C0);
Color kBronzeColor = const Color(0xFFCD7F32);
const Color kAccentColor = Color(0xFCEEEEEE);
Color kGoldColor = const Color(0xFFFFD700);
const Color kMainColor = Color(0xFF000000);
Color kAppColor = const Color(0xFFF89B00);
// <!---- BASE URLS ----!>
const String kSandboxBaseUrl = 'https://sfca-sbx-bck.diktup.cloud/graphql';
const String kProductionBaseUrl = 'https://bck-prd.sifca.app/graphql';
// <!---- URLS ----!>
const String kImageBackgroundShape1 = '$kS3BaseUrl/loyalcraft/image-background-shape-1.svg';
const String kImageBackgroundShape2 = '$kS3BaseUrl/loyalcraft/image-background-shape-2.svg';
const String kLoyalcraftBlackText = '$kS3BaseUrl/loyalcraft/loyalcraft-black-text.svg';
const String kLoyalcraftWhiteText = '$kS3BaseUrl/loyalcraft/loyalcraft-white-text.svg';
const String kLordIconLinkUnlink = '$kS3BaseUrl/loyalcraft/lord-icon-link-unlink.gif';
const String kSubscriptionSandboxBaseUrl = 'wss://sfca-sbx-bck.diktup.cloud/graphql';
const String kLordIconClockTime = '$kS3BaseUrl/loyalcraft/lord-icon-clock-time.gif';
const String kCornerBottomRight = '$kS3BaseUrl/loyalcraft/corner-bottom-right.svg';
const String kReferFriendBanner = '$kS3BaseUrl/loyalcraft/refer-friend-banner.jpg';
const String kCornerBottomLeft = '$kS3BaseUrl/loyalcraft/corner-bottom-left.svg';
const String kLordIconConfetti = '$kS3BaseUrl/loyalcraft/lord-icon-confetti.gif';
const String kAccelerateBanner = '$kS3BaseUrl/loyalcraft/accelerate-banner.jpg';
const String kUserCardShape1 = '$kS3BaseUrl/loyalcraft/user-card-shape-1.svg';
const String kUserCardShape2 = '$kS3BaseUrl/loyalcraft/user-card-shape-2.svg';
const String kUserCardShape3 = '$kS3BaseUrl/loyalcraft/user-card-shape-3.svg';
const String kCornerTopRight = '$kS3BaseUrl/loyalcraft/corner-top-right.svg';
const String kHappySticker14 = '$kS3BaseUrl/loyalcraft/happy-sticker-14.svg';
const String kHappySticker15 = '$kS3BaseUrl/loyalcraft/happy-sticker-15.svg';
const String kHappySticker16 = '$kS3BaseUrl/loyalcraft/happy-sticker-16.svg';
const String kHappySticker17 = '$kS3BaseUrl/loyalcraft/happy-sticker-17.svg';
const String kHappySticker18 = '$kS3BaseUrl/loyalcraft/happy-sticker-18.svg';
const String kHappySticker19 = '$kS3BaseUrl/loyalcraft/happy-sticker-19.svg';
const String kHappySticker20 = '$kS3BaseUrl/loyalcraft/happy-sticker-20.svg';
const String kTunisieTelecom = '$kS3BaseUrl/loyalcraft/tunisie-telecom.png';
const String kLordIconChecked = '$kS3BaseUrl/widget/lord-icon-checked.gif';
const String kCornerTopLeft = '$kS3BaseUrl/loyalcraft/corner-top-left.svg';
const String kRedeemStory1 = '$kS3BaseUrl/loyalcraft/redeem-story-1.jpg';
const String kEmptyPicture = '$kS3BaseUrl/loyalcraft/empty-picture.svg';
const String kSplashScreen = '$kS3BaseUrl/loyalcraft/splash-screen.png';
const String kReputation = '$kS3BaseUrl/loyalcraft/reputation_512.gif';
const String kLoyaltyCard = '$kS3BaseUrl/loyalcraft/loyalty-card.png';
const String kOnboarding1 = '$kS3BaseUrl/loyalcraft/onboarding-1.png';
const String kOnboarding2 = '$kS3BaseUrl/loyalcraft/onboarding-2.png';
const String kOnboarding3 = '$kS3BaseUrl/loyalcraft/onboarding-3.png';
const String kTunisiaFlag = '$kS3BaseUrl/loyalcraft/tunisia-flag.svg';
const String kAngrySticker10 = '$kS3BaseUrl/loyalcraft/emoji-10.svg';
const String kAngrySticker11 = '$kS3BaseUrl/loyalcraft/emoji-11.svg';
const String kAngrySticker12 = '$kS3BaseUrl/loyalcraft/emoji-12.svg';
const String kAngrySticker13 = '$kS3BaseUrl/loyalcraft/emoji-13.svg';
const String kUserAvatar = '$kS3BaseUrl/loyalcraft/user-avatar.svg';
const String kClockWatch = '$kS3BaseUrl/loyalcraft/clock-watch.svg';
const String kAngrySticker1 = '$kS3BaseUrl/loyalcraft/emoji-1.svg';
const String kAngrySticker2 = '$kS3BaseUrl/loyalcraft/emoji-2.svg';
const String kAngrySticker3 = '$kS3BaseUrl/loyalcraft/emoji-3.svg';
const String kAngrySticker4 = '$kS3BaseUrl/loyalcraft/emoji-4.svg';
const String kAngrySticker5 = '$kS3BaseUrl/loyalcraft/emoji-5.svg';
const String kAngrySticker6 = '$kS3BaseUrl/loyalcraft/emoji-6.svg';
const String kAngrySticker7 = '$kS3BaseUrl/loyalcraft/emoji-7.svg';
const String kAngrySticker8 = '$kS3BaseUrl/loyalcraft/emoji-8.svg';
const String kAngrySticker9 = '$kS3BaseUrl/loyalcraft/emoji-9.svg';
const String kSendData = '$kS3BaseUrl/loyalcraft/send-data.png';
const String kDesktops = '$kS3BaseUrl/loyalcraft/desktops.png';
const String kFacebook = '$kS3BaseUrl/loyalcraft/facebook.svg';
const String kAppIcon = '$kS3BaseUrl/loyalcraft/app-icon.svg';
const String kPrivacyPolicyUrl = '$kLoyalcraftPortal/privacy';
const String kOoredoo = '$kS3BaseUrl/loyalcraft/ooredoo.png';
const String kCoin = '$kS3BaseUrl/loyalcraft/coin_512.gif';
const String kGoogle = '$kS3BaseUrl/loyalcraft/google.svg';
const String kOrange = '$kS3BaseUrl/loyalcraft/orange.png';
const String kTrophy = '$kS3BaseUrl/loyalcraft/trophy.svg';
const String kLoyalcraftPortal = 'https://loyalcraft.com';
const String kTermsOfUseUrl = '$kLoyalcraftPortal/terms';
const String kApple = '$kS3BaseUrl/loyalcraft/apple.svg';
const String kStars = '$kS3BaseUrl/loyalcraft/stars.svg';
const String kEmail = '$kS3BaseUrl/loyalcraft/email.svg';
const String kHelp = '$kS3BaseUrl/loyalcraft/help.png';
const String kGift = '$kS3BaseUrl/loyalcraft/gift.svg';
const String kStar = '$kS3BaseUrl/loyalcraft/star.png';
const String kBox = '$kS3BaseUrl/loyalcraft/box.png';
const String kElevokPortal = 'https://elevok.com';

// <!---- VARIABLES ----!>
const String kDeleteUserPath = 'delete-user';
String kPosID = '6641d8c6c2fff17ac4b0e551';
const String kReferFriendIdPath = 'rfi=';
const String kForgotPasswordPath = 'fp';
Size kAppSize = const Size(1000, 400);
const String kLoginRefIdPath = 'lri=';
const int kMinimumAmountToRefill = 1;
const int kTunisiaDinarValue = 1000;
const String kTestQuestPath = 'tq';
const int kPaginationLimit = 20;
String kAppName = 'Loyalcraft';
const int kPaginationPage = 0;
BuildContext? kBuildContext;
const String kPosPath = 'p';
String kUserID = '';
const String kFacebookAppID = '1223473545660760';
// grizmo = 6553989ea06c6f0a87799a1a ; loyalcraft = 6641d8c6c2fff17ac4b0e551

const List<Locale> kLocaleList = [
  Locale('en', 'US'),
  Locale('fr', 'FR'),
  Locale('ar', 'TN'),
];

List<CommunClass> kStoryList = [
  CommunClass(
    selected: true,
    title: 'Earn',
    index: 0,
    video: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    image: kHelp,
  ),
  CommunClass(
    selected: true,
    title: 'Redeem',
    video: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    image: kStar,
    index: 1,
  ),
  CommunClass(
    selected: true,
    title: 'Play',
    image: 'https://cdn-icons-png.flaticon.com/512/808/808439.png',
    video: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    index: 2,
  ),
  CommunClass(
    selected: true,
    image: 'https://cdn-icons-png.flaticon.com/512/3789/3789382.png',
    video: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    title: 'Refill',
    index: 3,
  ),
  CommunClass(
    selected: true,
    image: 'https://cdn-icons-png.flaticon.com/512/2112/2112779.png',
    video: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    title: 'Conversion',
    index: 4,
  ),
];

List<CommunClass> kOperatorsList = [
  CommunClass(
    title: 'Ooredoo',
    selected: true,
    image: kOoredoo,
    id: '2',
  ),
  CommunClass(
    title: 'Orange',
    image: kOrange,
    selected: true,
    id: '3',
  ),
  CommunClass(
    title: 'TT',
    image: kTunisieTelecom,
    selected: true,
    id: '1',
  ),
];
const List<String> kLoyalcraftAngryStickerList = [
  kAngrySticker1,
  kAngrySticker2,
  kAngrySticker3,
  kAngrySticker4,
  kAngrySticker5,
  kAngrySticker6,
  kAngrySticker7,
  kAngrySticker8,
  kAngrySticker9,
  kAngrySticker10,
  kAngrySticker11,
  kAngrySticker12,
  kAngrySticker13,
];

final GoogleSignIn kGoogleSignIn = GoogleSignIn(
  scopes: [
    'email',
  ],
);
final FacebookAuth kFacebookAuth = FacebookAuth.instance;
const List<String> kLoyalcraftHappyStickerList = [
  kHappySticker14,
  kHappySticker15,
  kHappySticker16,
  kHappySticker17,
  kHappySticker18,
  kHappySticker19,
  kHappySticker20,
];
final List<CommunClass> kOnboardingList = [
  CommunClass(
    description: 'onboardingDescription1',
    title: 'onboardingTitle1',
    image: 'img/onboarding-1.svg',
    color: Colors.deepPurple[800],
    selected: true,
  ),
  CommunClass(
    description: 'onboardingDescription2',
    title: 'onboardingTitle2',
    image: 'img/onboarding-2.svg',
    color: Colors.deepOrange[800],
    selected: true,
  ),
  CommunClass(
    description: 'onboardingDescription3',
    title: 'onboardingTitle3',
    image: 'img/onboarding-3.svg',
    color: kAppColor,
    selected: true,
  ),
];

List<DialCode> kDialCodeList = [
  DialCode(
    formatPattern: '## ### ###',
    dialCode: '216',
    numberLength: 8,
    name: 'Tunisia',
    flag: '🇹🇳',
    code: 'TN',
  ),
];
