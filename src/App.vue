<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { decompressFromEncodedURIComponent, compressToEncodedURIComponent } from 'lz-string';
const str = ref('');
const jsonObj = ref('');
watchEffect(() => {
  jsonObj.value = '';
  if (str.value) {
    let jsonData = decompressFromEncodedURIComponent(str.value);
    jsonObj.value = JSON.stringify(JSON.parse(jsonData), null, 4);
  }
});
const jsonStr = ref('');
const lzStr = ref('');
watchEffect(() => {
  lzStr.value = '';
  if (jsonStr.value) {
    let jsonData = compressToEncodedURIComponent(JSON.stringify(JSON.parse(jsonStr.value)));
    lzStr.value = jsonData;
  }
});
</script>

<template>
  <div class="box">
  <div class="">str -> json</div>
  <div style="width: 90%;">
    <n-input v-model:value="str" style="width: 100%;" rows="10" type="textarea" placeholder="编码字符串" />
  </div>
  <div style="height: 520px;width: 90%;">
    <d-code-editor v-model="jsonObj" :options="{ language: 'json' }" style="height: 520px;width: 100%;"></d-code-editor>
  </div>
  <div class="">str -> json</div>
  <div style="width: 90%;">
    <n-input v-model:value="jsonStr" style="width: 100%;" rows="10" type="textarea" placeholder="json string" />
  </div>
  <div style="width: 90%;word-break: break-all;">
    {{ lzStr }}
  </div>
</div>
  <!-- <RouterView /> -->
</template>
<style scoped lang="less">
.box{
  padding: 30px;
  div {
    border: 1px solid green;
  }
}
</style>
