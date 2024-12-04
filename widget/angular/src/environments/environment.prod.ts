import { DefaultOptions } from "@apollo/client/core";

export const environment = {
  production: false,
  BASE_URL: 'widget.elevok.com',
  BACKEND_URL: 'https://sfca-sbx-bck.diktup.cloud/graphql',
  BACKEND_URL_WSS: 'wss://sfca-sbx-bck.diktup.cloud/graphql',
};
export const AWS_CREDENTIALS: any = {
  region: 'eu-central-1',
  storage: 'sifca-storage',
};
export const NETWORK_PROTOCOLS: any = {
  web: 'http://',
  socket: 'wss://',
};
export const ACCESS_TOKEN = 'elvkwdigttoken';
export const CLOUD_NAME = 'sifca';
export const GOOGLEMAPS_API_KEY = 'AIzaSyArN_5tS2hZfTjISRouwsFe9eID_3RTVq0';
export const BASE_URL = `${NETWORK_PROTOCOLS.web}${environment.BASE_URL}`;
export const defaultPicture = 'https://sifca-storage.s3.eu-central-1.amazonaws.com/sifca-brand/1698653958.png';

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
