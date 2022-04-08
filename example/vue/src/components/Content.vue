<script setup lang="ts">
import axiosInstance from "../api/request";
import oi from "once-init";
</script>

<template>
  <div class="content">
    <el-card class="init">
      <div class="card-content">
        <el-button>init</el-button>
        <div class="progress">
          <el-progress :percentage="100" status="success" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.content {
  display: flex;
  div.init {
    div.card-content {
      display: flex;
      min-width: 600px;
      > div.progress {
        flex: 1;
      }
    }
  }
}
</style>
