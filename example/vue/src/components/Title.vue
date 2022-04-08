<script setup lang="ts">
const count = ref(0);
</script>

<template>
  <div class="title">
    <h1>Once Init</h1>
    <p>A package that prevents useless promise requests</p>
    <div>
      <a href="https://github.com/darkXmo/once-init/blob/main/LICENSE"
        ><img
          src="https://img.shields.io/npm/l/once-init.svg?sanitize=true"
          alt="npm"
      /></a>
      <a href="https://www.npmjs.com/package/once-init"
        ><img
          src="https://img.shields.io/npm/v/once-init.svg?sanitize=true"
          alt="gzip size"
      /></a>
    </div>
  </div>
</template>

<style scoped>
div.title {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
