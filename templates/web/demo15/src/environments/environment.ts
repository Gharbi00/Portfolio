import { DefaultOptions } from "@apollo/client/core";
export const POS_ID: string = '65a167c3ce099893161669af';
export const bck_host: string = 'sfca-sbx-bck.diktup.cloud';
export const bck_url: string = `https://${bck_host}`;

export const environment = {
  production: false,
  demo: 'demo1',
  BACKEND_URL: `${bck_url}/graphql`,
  BACKEND_URL_WSS: `wss://${bck_host}/graphql`,
  // BACKEND_URL: `https://${window['env']['bck_server'] || 'prd-sfca-751.sifca.app'}/graphql`,
};

export const defaultPicture = {
  baseUrl: 'https://sifca-storage.s3.eu-central-1.amazonaws.com',
  path: 'default_cocospacio.png',
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
