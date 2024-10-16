import axios, { AxiosRequestHeaders } from 'axios';
import queryString from 'query-string';

// export const baseURL = 'https://social-api-wiwb.onrender.com';
export const baseURL = 'https://test-lmrp.vercel.app';
// export const baseURL = 'http://localhost:5000';

const publicClient = axios.create({
    baseURL: `${baseURL}/api`,
    paramsSerializer: (params) => queryString.stringify(params),
});

publicClient.interceptors.request.use(async (config) => {
    return {
        ...config,
        headers: {
            'Content-Type': 'application/json',
        } as AxiosRequestHeaders,
    };
});

publicClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (err) => {
        throw err;
    },
);

export default publicClient;
