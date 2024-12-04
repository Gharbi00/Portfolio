import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_diktup_utilities/flutter_diktup_utilities.dart';
import 'package:flutter_loyalcraft_gql/graphql/corporate-link-account.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-card-user-card.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-loyalty-settings.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-referral.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/link_account.dart';
import 'package:loyalcraft/src/bloc/loyalty_settings.dart';
import 'package:loyalcraft/src/bloc/referral.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/repository/link_account.dart';
import 'package:loyalcraft/src/repository/loyalty_settings.dart';
import 'package:loyalcraft/src/repository/referral.dart';
import 'package:loyalcraft/src/repository/user_card.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:loyalcraft/src/widgets/non_linked_account_banner.dart';
import 'package:loyalcraft/src/widgets/qualitative_quantitative.dart';

// ignore: must_be_immutable
class ReferFriendLandingWidget extends StatefulWidget {
  ReferFriendLandingWidget({
    Key? key,
    required this.referralSettings,
  }) : super(key: key);
  Query$getReferralSettingsByTargetWithLinkedAccount$getReferralSettingsByTargetWithLinkedAccount$objects referralSettings;

  @override
  _ReferFriendLandingWidget createState() => _ReferFriendLandingWidget();
}

class _ReferFriendLandingWidget extends State<ReferFriendLandingWidget> {
  late GetCurrentUserLinkedCorporateAccountByTargetCubit _getCurrentUserLinkedCorporateAccountByTargetCubit;
  late FindLoyaltySettingsByTargetCubit _findLoyaltySettingsByTargetCubit;
  late LoyaltySettingsRepository _loyaltySettingsRepository;
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late LinkAccountRepository _linkAccountRepository;
  late GetLastReferralCubit _getLastReferralCubit;
  late ReferralRepository _referralRepository;
  late UserCardRepository _userCardRepository;
  late VariableCubit<int> _countCubit;
  bool _formHasError({required String token, required String reference}) => token.isEmpty || reference.isEmpty;
  Future<void> _autoLink({required String token}) async {
    _countCubit.updateValue(1);
    if (token.isEmpty) {
      if (_findLoyaltySettingsByTargetCubit.state!.aggregator?.target?.pos?.id == kPosID) {
        _userCardRepository.linkUserAccount(
          Variables$Mutation$linkUserAccount(
            reference: '${DateTime.now().toLocal().microsecondsSinceEpoch}',
            target: Input$TargetACIInput(
              pos: widget.referralSettings.target?.pos?.id ?? '',
            ),
          ),
        );
        _getCurrentUserLinkedCorporateAccountByTargetCubit.getCurrentUserLinkedCorporateAccountByTarget(
          Variables$Query$getCurrentUserLinkedCorporateAccountByTarget(
            target: Input$TargetWithoutUserInput(
              pos: widget.referralSettings.target?.pos?.id,
            ),
          ),
        );
        _getLastReferralCubit.getLastReferral(
          Variables$Query$getLastReferral(
            userToken: _getCurrentUserLinkedCorporateAccountByTargetCubit.state?.token,
          ),
        );

        FlutterMessenger.showSnackbar(context: context, string: translate(context, 'linkAccountDialogSuccessfulDescription'));
      }
    } else {
      _getLastReferralCubit.getLastReferral(
        Variables$Query$getLastReferral(
          userToken: token,
        ),
      );
    }
  }

  Future<void> _initState() async {
    _referralRepository = ReferralRepository(_sGraphQLClient);
    _loyaltySettingsRepository = LoyaltySettingsRepository(_sGraphQLClient);
    _userCardRepository = UserCardRepository(_sGraphQLClient);
    _findLoyaltySettingsByTargetCubit = FindLoyaltySettingsByTargetCubit(_loyaltySettingsRepository);
    _linkAccountRepository = LinkAccountRepository(_sGraphQLClient);
    _countCubit = VariableCubit(value: 0);
    _getLastReferralCubit = GetLastReferralCubit(_referralRepository);
    _getCurrentUserLinkedCorporateAccountByTargetCubit = GetCurrentUserLinkedCorporateAccountByTargetCubit(_linkAccountRepository);
    _getCurrentUserLinkedCorporateAccountByTargetCubit.getCurrentUserLinkedCorporateAccountByTarget(
      Variables$Query$getCurrentUserLinkedCorporateAccountByTarget(
        target: Input$TargetWithoutUserInput(
          pos: widget.referralSettings.target?.pos?.id,
        ),
      ),
    );
    _findLoyaltySettingsByTargetCubit.findLoyaltySettingsByTarget(
      Variables$Query$findLoyaltySettingsByTarget(
        target: Input$TargetACIInput(
          pos: widget.referralSettings.target?.pos?.id,
        ),
      ),
    );
  }

  @override
  void dispose() {
    _getCurrentUserLinkedCorporateAccountByTargetCubit.close();
    _getLastReferralCubit.close();
    _countCubit.close();
    _findLoyaltySettingsByTargetCubit.close();

    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    if (mounted) {
      _initState();
    }
  }

  @override
  Widget build(BuildContext context) => MultiBlocProvider(
        providers: [
          BlocProvider(create: (context) => _getCurrentUserLinkedCorporateAccountByTargetCubit),
          BlocProvider(create: (context) => _countCubit),
          BlocProvider(create: (context) => _getLastReferralCubit),
        ],
        child: BlocBuilder<VariableCubit, dynamic>(
          bloc: _countCubit,
          builder: (context, count) => BlocBuilder<FindLoyaltySettingsByTargetCubit, Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget?>(
            bloc: _findLoyaltySettingsByTargetCubit,
            builder: (context, findLoyaltySettingsByTarget) => BlocBuilder<GetLastReferralCubit, Query$getLastReferral$getLastReferral?>(
              bloc: _getLastReferralCubit,
              builder: (context, getLastReferral) =>
                  BlocBuilder<GetCurrentUserLinkedCorporateAccountByTargetCubit, Query$getCurrentUserLinkedCorporateAccountByTarget$getCurrentUserLinkedCorporateAccountByTarget?>(
                bloc: _getCurrentUserLinkedCorporateAccountByTargetCubit,
                builder: (context, getCurrentUserLinkedCorporateAccountByTarget) {
                  var token = getCurrentUserLinkedCorporateAccountByTarget?.token ?? '';

                  if (getCurrentUserLinkedCorporateAccountByTarget != null && findLoyaltySettingsByTarget != null && count == 0) {
                    _autoLink(token: token);
                  }

                  return Scaffold(
                    appBar: AppBar(
                      automaticallyImplyLeading: false,
                      centerTitle: false,
                      elevation: 0,
                      title: Row(
                        children: [
                          GestureDetector(
                            onTap: () => Navigator.pop(context),
                            child: Container(
                              height: 36.0,
                              width: 36.0,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(100.0),
                                color: Theme.of(context).focusColor,
                              ),
                              child: Icon(
                                CupertinoIcons.arrow_turn_up_left,
                                color: Theme.of(context).colorScheme.secondary,
                                size: 18.0,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8.0),
                          Expanded(
                            child: Text(
                              translate(context, 'referAFriend'),
                              style: Theme.of(context).textTheme.headlineSmall,
                            ),
                          ),
                        ],
                      ),
                    ),
                    body: SafeArea(
                      left: false,
                      top: false,
                      right: false,
                      child: ListView(
                        padding: const EdgeInsets.all(16.0),
                        shrinkWrap: true,
                        primary: false,
                        children: [
                          if (findLoyaltySettingsByTarget != null &&
                              getCurrentUserLinkedCorporateAccountByTarget != null &&
                              findLoyaltySettingsByTarget.aggregator?.target?.pos?.id != kPosID &&
                              token.isEmpty)
                            NonLinkedAccountBannerWidget(
                              posID: widget.referralSettings.target?.pos?.id ?? '',
                            ),
                          Center(
                            child: Stack(
                              alignment: Alignment.center,
                              clipBehavior: Clip.none,
                              children: [
                                SharedImageProviderWidget(
                                  imageUrl: kStars,
                                  fit: BoxFit.cover,
                                  height: 140.0,
                                  width: 140.0,
                                ),
                                SharedImageProviderWidget(
                                  imageUrl: kGift,
                                  borderRadius: BorderRadius.circular(4.0),
                                  fit: BoxFit.cover,
                                  height: 140.0,
                                  width: 140.0,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16.0),
                          Text(
                            translate(context, 'referFriendText1'),
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.displayMedium,
                          ),
                          const SizedBox(height: 16.0),
                          Text(
                            '${translate(context, 'referFriendText2')} ${widget.referralSettings.limit?.rate ?? 0} ${translate(context, 'friendsEachDay')}.',
                            style: Theme.of(context).textTheme.bodyMedium,
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16.0),
                          Text(
                            translate(context, 'shareYourReferralLink'),
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                          const SizedBox(height: 16.0),
                          Row(
                            children: [
                              Expanded(
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(8.0),
                                    color: Theme.of(context).focusColor,
                                  ),
                                  child: Text(
                                    _formHasError(token: token, reference: getLastReferral?.reference ?? '') ? '-' : '${widget.referralSettings.url.removeNull()}${getLastReferral!.reference}',
                                    style: Theme.of(context).textTheme.bodyMedium,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8.0),
                              Opacity(
                                opacity: _formHasError(token: token, reference: getLastReferral?.reference ?? '') ? 0.5 : 1.0,
                                child: GestureDetector(
                                  onTap: _formHasError(token: token, reference: getLastReferral?.reference ?? '')
                                      ? null
                                      : () {
                                          copyToClipBoard("${widget.referralSettings.content.removeNull()}\n${widget.referralSettings.url.removeNull()}${getLastReferral?.reference ?? ''}");
                                          FlutterMessenger.showSnackbar(
                                            context: context,
                                            string: translate(context, 'successfullyCopiedToClipboard'),
                                          );
                                        },
                                  child: Container(
                                    padding: const EdgeInsets.all(8.0),
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(8.0),
                                      color: kAppColor,
                                    ),
                                    child: Text(
                                      translate(context, 'copy'),
                                      style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                            color: Colors.white,
                                          ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16.0),
                          Text(
                            translate(context, 'partner'),
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                          const SizedBox(height: 16.0),
                          Row(
                            children: [
                              (widget.referralSettings.target?.pos?.picture?.baseUrl ?? '').isEmpty || (widget.referralSettings.target?.pos!.picture?.path ?? '').isEmpty
                                  ? Container(
                                      height: 40.0,
                                      width: 40.0,
                                      padding: const EdgeInsets.all(4.0),
                                      decoration: BoxDecoration(
                                        color: Theme.of(context).focusColor,
                                        borderRadius: BorderRadius.circular(100.0),
                                      ),
                                      child: SharedImageProviderWidget(
                                        imageUrl: kEmptyPicture,
                                        color: Theme.of(context).colorScheme.secondary,
                                        width: 40.0,
                                        height: 40.0,
                                        fit: BoxFit.cover,
                                      ),
                                    )
                                  : SharedImageProviderWidget(
                                      imageUrl: '${widget.referralSettings.target!.pos!.picture!.baseUrl}/${widget.referralSettings.target!.pos!.picture!.path}',
                                      backgroundColor: Theme.of(context).focusColor,
                                      borderRadius: BorderRadius.circular(100.0),
                                      fit: BoxFit.cover,
                                      width: 40.0,
                                      height: 40.0,
                                    ),
                              const SizedBox(width: 8.0),
                              Expanded(
                                child: Text(
                                  widget.referralSettings.target?.pos?.title ?? translate(context, 'noDataFound'),
                                  style: Theme.of(context).textTheme.displayMedium!.copyWith(
                                        fontSize: 15.0,
                                      ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16.0),
                          Text(
                            translate(context, 'whatYouWillEarn'),
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                          const SizedBox(height: 16.0),
                          Wrap(
                            crossAxisAlignment: WrapCrossAlignment.center,
                            runSpacing: 8.0,
                            spacing: 8.0,
                            children: [
                              if ((widget.referralSettings.remuneration?.referrer?.quantitative?.amount ?? '0').toInteger() > 0)
                                Container(
                                  padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(100.0),
                                    color: Theme.of(context).focusColor,
                                  ),
                                  child: QualitativeQuantitativeWidget(
                                    textStyle: Theme.of(context).textTheme.bodyLarge,
                                    walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                                    baseUrl: widget.referralSettings.remuneration?.referrer?.quantitative?.wallet?.coin?.picture?.baseUrl,
                                    path: widget.referralSettings.remuneration?.referrer?.quantitative?.wallet?.coin?.picture?.path,
                                    amount: (widget.referralSettings.remuneration?.referrer?.quantitative?.amount ?? '0').toInteger(),
                                    size: const Size(18.0, 18.0),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              if ((widget.referralSettings.remuneration?.referrer?.qualitative?.amount ?? '0').toInteger() > 0)
                                Container(
                                  padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(100.0),
                                    color: Theme.of(context).focusColor,
                                  ),
                                  child: QualitativeQuantitativeWidget(
                                    amount: (widget.referralSettings.remuneration?.referrer?.qualitative?.amount ?? '0').toInteger(),
                                    textStyle: Theme.of(context).textTheme.bodyLarge,
                                    walletType: Enum$WalletTypeEnum.QUALITATIVE,
                                    size: const Size(18.0, 18.0),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 16.0),
                          Text(
                            translate(context, 'whatYourFriendWillEarn'),
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                          const SizedBox(height: 16.0),
                          Wrap(
                            crossAxisAlignment: WrapCrossAlignment.center,
                            runSpacing: 8.0,
                            spacing: 8.0,
                            children: [
                              if ((widget.referralSettings.remuneration?.referred?.quantitative?.amount ?? '0').toInteger() > 0)
                                Container(
                                  padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(100.0),
                                    color: Theme.of(context).focusColor,
                                  ),
                                  child: QualitativeQuantitativeWidget(
                                    textStyle: Theme.of(context).textTheme.bodyLarge,
                                    walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                                    baseUrl: widget.referralSettings.remuneration?.referred?.quantitative?.wallet?.coin?.picture?.baseUrl,
                                    path: widget.referralSettings.remuneration?.referred?.quantitative?.wallet?.coin?.picture?.path,
                                    amount: (widget.referralSettings.remuneration?.referred?.quantitative?.amount ?? '0').toInteger(),
                                    size: const Size(18.0, 18.0),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              if ((widget.referralSettings.remuneration?.referred?.qualitative?.amount ?? '0').toInteger() > 0)
                                Container(
                                  padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(100.0),
                                    color: Theme.of(context).focusColor,
                                  ),
                                  child: QualitativeQuantitativeWidget(
                                    amount: (widget.referralSettings.remuneration?.referred?.qualitative?.amount ?? '0').toInteger(),
                                    textStyle: Theme.of(context).textTheme.bodyLarge,
                                    walletType: Enum$WalletTypeEnum.QUALITATIVE,
                                    size: const Size(18.0, 18.0),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 16.0),
                          TextButton(
                            style: TextButton.styleFrom(
                              disabledBackgroundColor: kAppColor.withOpacity(0.5),
                              minimumSize: const Size.fromHeight(40.0),
                              backgroundColor: kAppColor,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                            ),
                            onPressed: _formHasError(token: token, reference: getLastReferral?.reference ?? '')
                                ? null
                                : () {
                                    copyToClipBoard('${widget.referralSettings.content.removeNull()}\n${widget.referralSettings.url.removeNull()}${getLastReferral!.reference}');
                                    FlutterMessenger.showSnackbar(
                                      context: context,
                                      string: translate(context, 'successfullyCopiedToClipboard'),
                                    );
                                  },
                            child: Text(
                              translate(context, 'copy'),
                              textAlign: TextAlign.center,
                              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                    color: Colors.white,
                                  ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ),
      );
}
