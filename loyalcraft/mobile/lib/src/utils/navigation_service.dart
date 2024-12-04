import 'package:flutter/material.dart';

// Singleton NavigationService class
class NavigationService {
  // Factory ructor to return the single instance
  factory NavigationService() => _instance;

  // Private ructor
  NavigationService._internal();
  static final NavigationService _instance = NavigationService._internal();

  // Global key to access NavigatorState
  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
}
