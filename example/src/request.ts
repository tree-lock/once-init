import axios, { AxiosResponse } from "axios";

const axiosInstance = axios.create();
let count = 0;
axiosInstance.interceptors.request.use(
  (config) => {
    const consoleString = "%c🛸 [Axios] Send API Request => ";
    console.log(consoleString, "color: #2563eb; ", config.url);
    const countEle = document.getElementById("count") as HTMLSpanElement;
    countEle.innerText = (++count).toString();
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);
axiosInstance.interceptors.response.use((response) => {
  const consoleString = "%c🛸 [Axios] Received API Response => ";
  console.log(consoleString, "color: #378362; ", response.config.url);
  return response;
});

let promiseExecuted = 0;

const getCount = async () => {
  const statusEle = document.getElementById("status") as HTMLSpanElement;
  statusEle.innerText = "pending";
  promiseExecuted++;
  const ans: AxiosResponse<number> = await axiosInstance.get("/example");
  promiseExecuted--;
  if (promiseExecuted === 0) {
    statusEle.innerText = "done";
  }
  return ans.data;
};

export default {
  count: getCount,
};
