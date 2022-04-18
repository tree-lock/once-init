<script setup lang="ts">
import Konva from "konva";
type EventParams = [type: keyof DocumentEventMap, func: (e: any) => void];
let eventList: EventParams[] = [];
let stage: Konva.Stage;
let layer: Konva.Layer;
const containerID = `container-${new Date().getTime()}${Math.random()}`;
class Progress extends $.Progress {}
const progressList: Progress[] = [];
let y: number = 20;
const stageWidth: number = 1000;
const create = () => {
  if (progressList.length < 10) {
    const progress = new Progress(
      { stage, layer },
      { x: 40, y },
      stageWidth - 60
    );
    progressList.push(progress);
    progress.find = () => {
      const master = progressList.find((ele) => ele.isMaster);
      if (master) {
        progress.chase(master);
      }
    };
    y += 40;
  }
};
const init = () => {
  const stageHeight = 400;
  stage = new Konva.Stage({
    container: containerID,
    width: stageWidth,
    height: stageHeight,
  });
  layer = new Konva.Layer();
  stage.add(layer);
};
onMounted(init);

onBeforeUnmount(() => {
  eventList.forEach((ele) => {
    document.removeEventListener(...ele);
  });
  if (stage) {
    stage.destroy();
  }
});
</script>

<template>
  <div class="content">
    <el-card class="init">
      <div class="info">
        <el-button @click="create">创建 Promise函数</el-button>
        <span>点击🚀模拟执行函数</span>
        <span>⭐️表示函数执行完成</span>
        <span>创建了{{}}个Promise</span>
      </div>
      <div :id="containerID"></div>
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
