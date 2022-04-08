import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import "./mock";
import oi from "once-init";

const axiosInstance = axios.create();

/**
 * 请求执行
 */
axiosInstance.interceptors.request.use((config) => {
  const consoleString = "%c🛸 [Axios] Send API Request => ";
  console.log(consoleString, "color: #2563eb; ", config.url);
  return config;
});
axiosInstance.interceptors.response.use((response) => {
  const consoleString = "%c🛸 [Axios] Received API Response => ";
  console.log(consoleString, "color: #378362; ", response.config.url);
  return response;
});

const oiRequest = oi((config: AxiosRequestConfig) => {
  return axiosInstance.request(config);
});
oiRequest.refresh;

function isFunction(target: any): target is (...args: any) => any {
  return target instanceof Function;
}

function oiObject<T extends object>(obj: T) {
  type K = {
    [k in keyof T]: T[k] extends (...args: any) => any
      ? (...args: Parameters<T[k]>) => Promise<Awaited<ReturnType<T[k]>>>
      : T[k];
  };
  const ans: K = {} as any;
  for (let key in obj) {
    if (obj[key] instanceof Function) {
      ans[key] = oi(obj[key] as any).refresh as any;
    } else {
      ans[key] = obj[key] as any;
    }
  }
  return ans;
}

const r = oiObject(axiosInstance);

export default oiRequest;
