import { DefaultOptions } from "@apollo/client/core";

export const POS_ID: string = '6641d8c6c2fff17ac4b0e551';
export const bck_host: string = 'sfca-sbx-bck.diktup.cloud';
export const bck_url: string = `https://${bck_host}`;

export const environment = {
  production: false,
  BACKEND_URL: `${bck_url}/graphql`,
  BACKEND_URL_WSS: `wss://${bck_host}/graphql`,
};

export const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
};
