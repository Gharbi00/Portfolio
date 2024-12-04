import 'package:graphql/client.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/interceptors.dart';

class SGraphQLClient {
  factory SGraphQLClient({String? origin, String? linkedUserToken}) => _instance(origin, linkedUserToken);

  SGraphQLClient._(this.origin, this.linkedUserToken) {
    _client = GraphQLClient(
      cache: GraphQLCache(),
      queryRequestTimeout: const Duration(seconds: 8),
      link: HttpLink(
        kSandboxBaseUrl,
        httpClient: BaseInterceptor(linkedUserToken: linkedUserToken, origin: origin),
      ),
      defaultPolicies: DefaultPolicies(
        watchMutation: Policies(fetch: FetchPolicy.noCache),
        watchQuery: Policies(fetch: FetchPolicy.noCache),
        subscribe: Policies(fetch: FetchPolicy.noCache),
        mutate: Policies(fetch: FetchPolicy.noCache),
        query: Policies(fetch: FetchPolicy.noCache),
      ),
    );
  }
  static SGraphQLClient _instance(String? origin, String? linkedUserToken) => SGraphQLClient._(origin, linkedUserToken);

  final policies = Policies(fetch: FetchPolicy.noCache);
  GraphQLClient get client => _client;
  late GraphQLClient _client;
  final String? origin;
  final String? linkedUserToken;
}
