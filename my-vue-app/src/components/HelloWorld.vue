<template>
  <div id="scene">
  </div>
</template>
<script setup>
import { onMounted } from "vue";
import card3D from "@/utils/3Dmap/3dCard.js";
onMounted(() => {
  new card3D("#scene");
});
</script>
<style scoped>
#scene {
  width: 100%;
  height: 100vh;
}
</style>
