import axios, { AxiosRequestConfig } from "axios";
import "./mock";

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

export default axiosInstance;
