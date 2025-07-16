import axios from 'axios';

export const axiosJupiter = axios.create({
  baseURL: 'https://lite-api.jup.ag',
});

export const fetcherJupiter = (url: string) =>
  axiosJupiter.get(url).then((res) => res);
