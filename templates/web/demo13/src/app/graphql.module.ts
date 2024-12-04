import { Inject, NgModule, PLATFORM_ID } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { WebSocketLink } from '@apollo/client/link/ws';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { environment, defaultOptions } from './../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@NgModule({
  imports: [HttpClientModule],
})
export class GraphQLModule {
  constructor(apollo: Apollo, httpLink: HttpLink, @Inject(PLATFORM_ID) private platformId: object) {
    const https = httpLink.create({
      uri: environment.BACKEND_URL,
    });

    const loggingLink = new ApolloLink((operation, forward) => {
      // console.log('Request Payload:', operation);

      return forward(operation).map((response) => {
        // console.log('Response Payload:', response);
        return response;
      });
    });

    const errorLink = new ApolloLink((operation, forward) => {
      return forward(operation).map((response) => {
        if (response.errors) {
          // console.error('GraphQL Errors:', response.errors);
        }
        return response;
      });
    });

    const nonTerminatingLinks = [errorLink, loggingLink, https];
    let terminatingLink: ApolloLink;

    if (isPlatformBrowser(this.platformId)) {
      const wss = new WebSocketLink({
        uri: environment.BACKEND_URL_WSS,
        options: {
          reconnect: true,
        },
      }) as ApolloLink;
      const wsLink = ApolloLink.from([wss]);
      terminatingLink = ApolloLink.from([...nonTerminatingLinks, wsLink]);
    } else {
      terminatingLink = ApolloLink.from(nonTerminatingLinks);
    }

    apollo.createDefault({
      link: terminatingLink,
      cache: new InMemoryCache({ addTypename: false }),
      defaultOptions,
      ssrMode: true,
      ssrForceFetchDelay: 1000,
    });

    apollo.createNamed('auth', {
      link: terminatingLink,
      cache: new InMemoryCache({ addTypename: false }),
      defaultOptions,
      ssrMode: true,
      ssrForceFetchDelay: 1000,
    });
  }
}
