import 'package:flutter/material.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-loyalty-settings.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-wallet.graphql.dart';

class ReputationUtils {
  ReputationUtils();
  UniqueKey uniqueKey = UniqueKey();

  static int getWalletAmount(
    Query$getUserWalletWithReputations$getUserWalletWithReputations? getUserWalletWithReputations,
  ) =>
      (getUserWalletWithReputations?.amount ?? '').toInteger();

  static bool isCurrentPreLevel({
    required Query$getUserWalletWithReputations$getUserWalletWithReputations? getUserWalletWithReputations,
    required Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget? findLoyaltySettingsByTarget,
  }) {
    var reputationLevels = getUserWalletWithReputations?.reputationLevels ?? [];
    var currentLevel = getCurrentLevel(getUserWalletWithReputations);
    var prelevel = findLoyaltySettingsByTarget?.prelevel;

    if (reputationLevels.isEmpty || currentLevel == null || prelevel == null) {
      return true;
    }

    return getWalletAmount(getUserWalletWithReputations) < (reputationLevels.first.levelInterval?.max ?? 0);
  }

  static Color getCurrentLevelColor({
    required Query$getUserWalletWithReputations$getUserWalletWithReputations? getUserWalletWithReputations,
    required Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget? findLoyaltySettingsByTarget,
  }) {
    var prelevelColor = findLoyaltySettingsByTarget?.prelevel?.color ?? '';
    var levelColor = getCurrentLevel(getUserWalletWithReputations)?.color ?? '';
    if (prelevelColor.isColor() == false) {
      prelevelColor = Colors.grey[800]!.toHex();
    }
    if (levelColor.isColor() == false) {
      levelColor = Colors.grey[800]!.toHex();
    }
    if (getUserWalletWithReputations?.reputationLevels?.isEmpty ?? true) {
      return Colors.grey[800]!;
    }

    return isCurrentPreLevel(
      getUserWalletWithReputations: getUserWalletWithReputations,
      findLoyaltySettingsByTarget: findLoyaltySettingsByTarget,
    )
        ? prelevelColor.toColor()
        : levelColor.toColor();
  }

  static Color getPrelevelColor({
    required Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget? findLoyaltySettingsByTarget,
  }) {
    var prelevelColor = findLoyaltySettingsByTarget?.prelevel?.color ?? '';
    if (prelevelColor.isColor() == false) {
      return Colors.grey[800]!;
    } else {
      return prelevelColor.toColor();
    }
  }

  static Query$getUserWalletWithReputations$getUserWalletWithReputations$reputationLevels? getCurrentLevel(
    Query$getUserWalletWithReputations$getUserWalletWithReputations? getUserWalletWithReputations,
  ) {
    var reputationLevels = getUserWalletWithReputations?.reputationLevels ?? [];
    var walletAmount = getWalletAmount(getUserWalletWithReputations);
    Query$getUserWalletWithReputations$getUserWalletWithReputations$reputationLevels? currentLevel;

    for (final level in reputationLevels) {
      if (walletAmount >= (level.levelInterval?.max ?? 0)) {
        currentLevel = level;
      }
    }
    return currentLevel;
  }

  static Query$getUserWalletWithReputations$getUserWalletWithReputations$reputationLevels? getCurrentNextLevel(
    Query$getUserWalletWithReputations$getUserWalletWithReputations? getUserWalletWithReputations,
  ) {
    var reputationLevels = getUserWalletWithReputations?.reputationLevels ?? [];
    var walletAmount = getWalletAmount(getUserWalletWithReputations);
    Query$getUserWalletWithReputations$getUserWalletWithReputations$reputationLevels? currentLevel;

    for (final level in reputationLevels) {
      var min = level.levelInterval?.min ?? 0;
      var max = level.levelInterval?.max ?? 0;
      if (walletAmount >= min && walletAmount <= max) {
        currentLevel = level;
      }
    }
    return currentLevel;
  }

  static double getMaxProgress({
    required Query$getUserWalletWithReputations$getUserWalletWithReputations? getUserWalletWithReputations,
    required Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget? findLoyaltySettingsByTarget,
  }) {
    var reputationLevels = getUserWalletWithReputations?.reputationLevels ?? [];
    var prelevel = findLoyaltySettingsByTarget?.prelevel;

    if (reputationLevels.isEmpty || prelevel == null) {
      return 100;
    }

    if (isCurrentPreLevel(
      getUserWalletWithReputations: getUserWalletWithReputations,
      findLoyaltySettingsByTarget: findLoyaltySettingsByTarget,
    )) {
      var nextLevel = reputationLevels.first;
      return (nextLevel.levelInterval?.max ?? 0) - (nextLevel.levelInterval?.min ?? 0).toDouble();
    }

    var currentNextLevel = getCurrentNextLevel(getUserWalletWithReputations);
    var level = currentNextLevel ?? getCurrentLevel(getUserWalletWithReputations);
    var max = level?.levelInterval?.max ?? 100;
    var min = level?.levelInterval?.min ?? 0;
    return (max - min).toDouble();
  }

  static int getProgress({
    required Query$getUserWalletWithReputations$getUserWalletWithReputations? getUserWalletWithReputations,
    required Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget? findLoyaltySettingsByTarget,
  }) {
    var reputationLevels = getUserWalletWithReputations?.reputationLevels ?? [];
    var prelevel = findLoyaltySettingsByTarget?.prelevel;

    if (reputationLevels.isEmpty || prelevel == null) {
      return 100;
    }

    if (isCurrentPreLevel(
      getUserWalletWithReputations: getUserWalletWithReputations,
      findLoyaltySettingsByTarget: findLoyaltySettingsByTarget,
    )) {
      return getWalletAmount(getUserWalletWithReputations);
    }

    var currentLevel = getCurrentLevel(getUserWalletWithReputations);
    if (currentLevel != null) {
      if (reputationLevels.length == 1) {
        return currentLevel.levelInterval?.max ?? 0;
      }

      var nextLevel = getCurrentNextLevel(getUserWalletWithReputations);
      var currentLevelMax = currentLevel.levelInterval?.max ?? 0;
      if (nextLevel == null && reputationLevels.length > 1) {
        var previousLevel = reputationLevels[reputationLevels.indexOf(currentLevel) - 1];
        var previousLevelMax = previousLevel.levelInterval?.max ?? 0;
        return getWalletAmount(getUserWalletWithReputations) - previousLevelMax;
      }

      if (getWalletAmount(getUserWalletWithReputations) > 0 && getWalletAmount(getUserWalletWithReputations) == currentLevelMax) {
        return currentLevelMax;
      } else {
        return getWalletAmount(getUserWalletWithReputations) - currentLevelMax;
      }
    }

    return 100;
  }

  static Color getCurrentNextLevelColor({
    required Query$getUserWalletWithReputations$getUserWalletWithReputations? getUserWalletWithReputations,
    required Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget? findLoyaltySettingsByTarget,
  }) {
    var reputationLevels = getUserWalletWithReputations?.reputationLevels ?? [];
    var prelevel = findLoyaltySettingsByTarget?.prelevel;

    if (reputationLevels.isEmpty || prelevel == null) {
      return Colors.grey[800]!;
    }

    if (isCurrentPreLevel(
      findLoyaltySettingsByTarget: findLoyaltySettingsByTarget,
      getUserWalletWithReputations: getUserWalletWithReputations,
    )) {
      return colorFromLevel(reputationLevels.first);
    }

    return colorFromLevel(
      getCurrentNextLevel(getUserWalletWithReputations) ?? getCurrentLevel(getUserWalletWithReputations),
    );
  }

  static int getCurrentLevelIndex({
    required Query$getUserWalletWithReputations$getUserWalletWithReputations? getUserWalletWithReputations,
    required Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget? findLoyaltySettingsByTarget,
  }) {
    var reputationLevels = getUserWalletWithReputations?.reputationLevels ?? [];
    var prelevel = findLoyaltySettingsByTarget?.prelevel;

    if (reputationLevels.isEmpty || prelevel == null) {
      return 1;
    }

    return isCurrentPreLevel(
      findLoyaltySettingsByTarget: findLoyaltySettingsByTarget,
      getUserWalletWithReputations: getUserWalletWithReputations,
    )
        ? 1
        : reputationLevels.indexOf(getCurrentLevel(getUserWalletWithReputations)!) + 2;
  }

  static Color colorFromLevel(
    Query$getUserWalletWithReputations$getUserWalletWithReputations$reputationLevels? level,
  ) {
    var color = level?.color ?? '';
    return color.isColor() ? color.toColor() : Colors.grey[800]!;
  }

  static int getLevelAmountByLevel({
    required Query$getUserWalletWithReputations$getUserWalletWithReputations? getUserWalletWithReputations,
    required Query$getUserWalletWithReputations$getUserWalletWithReputations$reputationLevels? reputationLevels,
    required int index,
  }) {
    var walletAmount = getWalletAmount(getUserWalletWithReputations);
    var min = reputationLevels?.levelInterval?.min ?? 0;
    var max = reputationLevels?.levelInterval?.max ?? 0;

    if (index == 0) {
      return walletAmount.clamp(min, max);
    }
    if (index > 0) {
      var prevMax = getUserWalletWithReputations!.reputationLevels![index - 1].levelInterval?.max ?? 0;
      if (walletAmount > min && walletAmount <= max) {
        return walletAmount - prevMax;
      } else if (walletAmount > max) {
        return max - min;
      }
    }
    return 0;
  }

  // THE INDEX 0 INDICATES THAT IT'S ON PRELEVEL
  static bool isLevelPassed({
    required Query$getUserWalletWithReputations$getUserWalletWithReputations? getUserWalletWithReputations,
    required Query$getUserWalletWithReputations$getUserWalletWithReputations$reputationLevels? reputationLevels,
    required int index,
  }) {
    var min = reputationLevels?.levelInterval?.min ?? 0;
    var max = reputationLevels?.levelInterval?.max ?? 0;
    var walletAmount = getWalletAmount(getUserWalletWithReputations);

    if (index == 0) {
      return true;
    }
    return walletAmount > min && walletAmount >= max;
  }

  // THE INDEX 0 INDICATES THAT IT'S ON PRELEVEL
  static Color getColorByLevel({
    required Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget? findLoyaltySettingsByTarget,
    required Query$getUserWalletWithReputations$getUserWalletWithReputations? getUserWalletWithReputations,
    required Query$getUserWalletWithReputations$getUserWalletWithReputations$reputationLevels? reputationLevels,
    required int index,
  }) {
    var prelevelColor = findLoyaltySettingsByTarget?.prelevel?.color ?? '';
    if (index == 0) {
      return prelevelColor.isColor() ? prelevelColor.toColor() : Colors.grey[800]!;
    }
    if (index > 0 &&
        isLevelPassed(
          getUserWalletWithReputations: getUserWalletWithReputations,
          reputationLevels: reputationLevels,
          index: index,
        )) {
      var color = reputationLevels?.color ?? '';
      if (color.isColor()) {
        return color.toColor();
      }
    }
    return Colors.grey[800]!;
  }

  // THE INDEX 0 INDICATES THAT IT'S ON PRELEVEL
  static Color getRealColorByLevel({
    required Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget? findLoyaltySettingsByTarget,
    required Query$getUserWalletWithReputations$getUserWalletWithReputations? getUserWalletWithReputations,
    required Query$getUserWalletWithReputations$getUserWalletWithReputations$reputationLevels? reputationLevels,
    required int index,
  }) {
    var prelevelColor = findLoyaltySettingsByTarget?.prelevel?.color ?? '';
    if (index == 0) {
      return prelevelColor.isColor() ? prelevelColor.toColor() : Colors.grey[800]!;
    } else {
      var color = reputationLevels?.color ?? '';
      if (color.isColor()) {
        return color.toColor();
      }
    }
    return Colors.grey[800]!;
  }
}
