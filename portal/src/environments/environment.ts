import { DefaultOptions } from "@apollo/client/core";

export const POS_ID: string = '650b63c094e67c588943cc67';
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