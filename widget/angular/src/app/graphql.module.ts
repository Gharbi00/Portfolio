import { Apollo } from 'apollo-angular';
import { Inject, NgModule, PLATFORM_ID } from '@angular/core';
import { HttpLink } from 'apollo-angular/http';
import { WebSocketLink } from '@apollo/client/link/ws';
import { HttpClientModule } from '@angular/common/http';
import { getMainDefinition } from '@apollo/client/utilities';
import { ApolloLink, DefaultOptions, InMemoryCache, split } from '@apollo/client/core';

import { isPlatformBrowser } from '@angular/common';

@NgModule({
  imports: [HttpClientModule],
})
export class GraphQLModule {

  constructor(apollo: Apollo, httpLink: HttpLink, @Inject(PLATFORM_ID) private platformId: object) {
    let link: ApolloLink;
    const BACKEND_URL = 'https://sfca-sbx-bck.diktup.cloud/graphql';
    const BACKEND_URL_WSS = 'wss://sfca-sbx-bck.diktup.cloud/graphql';
    const defaultOptions: DefaultOptions = {
      watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
      },
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
    };
    const https = httpLink.create({
      uri: BACKEND_URL,
    });
    if (isPlatformBrowser(this.platformId)) {
      const wss = new WebSocketLink({
        uri: BACKEND_URL_WSS,
        options: {
          reconnect: true,
        },
      });
      link = split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
        },
        wss,
        https,
      );
    }

    apollo.createDefault({
      link,
      cache: new InMemoryCache({ addTypename: false }),
      defaultOptions,
      ssrMode: true,
      ssrForceFetchDelay: 1000,
    });
  }
}
