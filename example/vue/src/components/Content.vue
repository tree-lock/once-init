<script setup lang="ts">
import { AxiosResponse } from "axios";
import oiRequest, { requestSent } from "../api/request";

const value = ref(-1);
/**
 *  Promise 请求执行的次数
 */
let promiseRequest = ref<number>(0);

/**
 * 创建一个Axios Promise请求，Promise每执行一次都会让promiseExecuted加一
 * @returns 通过Mockjs拦截，返回一个随机数字
 */
const refresh = async () => {
  promiseRequest.value++;
  const ans: AxiosResponse<number> = await oiRequest.send(
    {
      url: "/example",
    },
    "refresh"
  );
  value.value = ans.data;
};

const init = async () => {
  promiseRequest.value++;
  const tableRow: TableRow = reactive({
    ID: promiseRequest.value,
    by: "init",
    time: new Date().toLocaleTimeString(),
    value: -1,
  });
  tableData.push(tableRow);
  const ans: AxiosResponse<number> = await oiRequest.init(
    {
      url: "/example",
    },
    "init"
  );
  tableRow.value = ans.data;
  value.value = ans.data;
};

const exceed = async () => {
  promiseRequest.value++;
  const ans: AxiosResponse<number> = await oiRequest.exceed(
    {
      url: "/example",
    },
    "exceed"
  );
  value.value = ans.data;
};

interface TableRow {
  ID: number;
  by: "init" | "refresh" | "exceed";
  time: string;
  value: number;
}

const tableData: TableRow[] = reactive([]);
</script>

<template>
  <div class="content">
    <el-card class="main">
      <div class="main-body">
        <div class="title">random value from axios request</div>
        <div class="value">
          {{ value }}
        </div>
        <div class="operations">
          <el-button type="primary" @click="init">init</el-button>
          <el-button type="success" @click="refresh">refresh</el-button>
          <el-button type="danger" @click="exceed">exceed</el-button>
        </div>
      </div>
    </el-card>
    <el-card class="data">
      {{ promiseRequest }}
      {{ requestSent }}
      <el-table :data="tableData" style="width: 100%" height="300">
        <el-table-column prop="ID" label="Id" />
        <el-table-column prop="by" label="By" />
        <el-table-column prop="value" label="Value" />
        <el-table-column prop="time" label="Time" />
      </el-table>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.content {
  display: flex;
  > .main {
    min-width: 600px;
    .main-body {
      > .operations {
        display: flex;
        justify-content: space-evenly;
        > button {
          min-width: 80px;
        }
      }
    }
  }
  > .data {
    min-width: 400px;
  }
}
</style>
