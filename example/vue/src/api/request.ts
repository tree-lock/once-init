import axios, { AxiosRequestConfig } from "axios";
import "./mock";
import oi from "once-init";

const axiosInstance = axios.create();
export const requestSent = ref<number>(0);

/**
 * 请求执行
 */
axiosInstance.interceptors.request.use((config) => {
  const consoleString = "%c🛸 [Axios] Send API Request => ";
  requestSent.value++;
  console.log(consoleString, "color: #2563eb; ", config.url);
  return config;
});
axiosInstance.interceptors.response.use((response) => {
  const consoleString = "%c🛸 [Axios] Received API Response => ";
  console.log(consoleString, "color: #378362; ", response.config.url);
  return response;
});

const oiRequest = oi(
  (config: AxiosRequestConfig, by: "init" | "refresh" | "exceed") => {
    return axiosInstance.request(config);
  }
);

export default oiRequest;
