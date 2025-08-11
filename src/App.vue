<script setup lang="ts">
import { ref, watchEffect, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { decompressFromEncodedURIComponent, compressToEncodedURIComponent } from 'lz-string';
;

const str = ref('');
// 为codeEditorRef添加类型注释
const codeEditorRef: Ref<{ editor: { layout: () => void } } | null> = ref(null);

// 窗口大小变化处理
const handleResize = () => {
  if (codeEditorRef.value) {
    // 调用 Monaco Editor 的 layout 方法重新计算布局
    codeEditorRef.value.editor.layout();
  }
};

// 组件挂载时添加事件监听
onMounted(() => {
  window.addEventListener('resize', handleResize);
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
const jsonObj = ref('');
const jsonStr = ref('');
const lzStr = ref('');
const textCompareLeft = ref('');
const textCompareRight = ref('');
const textDiffResult = ref('');
const parsedDiffData = ref<{
  line: number;
  left: string;
  right: string;
  changed: boolean;
  charDiffs1: { position: number; length: number }[];
  charDiffs2: { position: number; length: number }[];
}[]>([]);

// 解析差异数据
watchEffect(() => {
  if (textDiffResult.value) {
    try {
      parsedDiffData.value = JSON.parse(textDiffResult.value);
    } catch (e) {
      parsedDiffData.value = [];
    }
  }
});

// 检查字符是否有变化
const isCharChanged = (charDiffs: { position: number; length: number }[], index: number) => {
  return charDiffs.some(diff => index >= diff.position && index < diff.position + diff.length);
};

watchEffect(() => {
  jsonObj.value = '';
  if (str.value) {
    let jsonData = decompressFromEncodedURIComponent(str.value);
    jsonObj.value = JSON.stringify(JSON.parse(jsonData), null, 4);
  }
});

watchEffect(() => {
  lzStr.value = '';
  if (jsonStr.value) {
    let jsonData = compressToEncodedURIComponent(JSON.stringify(JSON.parse(jsonStr.value)));
    lzStr.value = jsonData;
  }
});

const compareText = () => {
  try {
    const left = textCompareLeft.value
    const right = textCompareRight.value
    
    // 文本行拆分并过滤空白行
    const lines1 = left.split('\n').filter(line => line.trim() !== '')
    const lines2 = right.split('\n').filter(line => line.trim() !== '')
    
    // 计算行差异
    const diffData = []
    const maxLen = Math.max(lines1.length, lines2.length)
    
    for (let i = 0; i < maxLen; i++) {
      const line1 = lines1[i] || ''
      const line2 = lines2[i] || ''
      
      // 检查行是否有变化
      const changed = line1 !== line2
      
      // 计算字符级差异
      let charDiffs1 = []
      let charDiffs2 = []
      
      if (changed) {
        // 简单的字符差异检测
        const maxCharLen = Math.max(line1.length, line2.length)
        for (let j = 0; j < maxCharLen; j++) {
          const char1 = line1[j] || ''
          const char2 = line2[j] || ''
          
          if (char1 !== char2) {
            charDiffs1.push({ position: j, length: 1 })
            charDiffs2.push({ position: j, length: 1 })
          }
        }
      }
      
      diffData.push({
        line: i + 1,
        left: line1,
        right: line2,
        changed,
        charDiffs1,
        charDiffs2
      })
    }
    
    textDiffResult.value = JSON.stringify(diffData, null, 2)
  } catch (e: any) {
    textDiffResult.value = `错误: ${e.message}`
  }
}
</script>

<template>
  <div class="container">
    <div class="section">
      <h2 class="section-title">LZ-String 解码</h2>
      <div class="input-group">
        <n-input 
          v-model:value="str" 
          type="textarea" 
          placeholder="输入LZ-String编码" 
          :rows="5"
          class="input-field"
        />
      </div>
      <div class="output-group">
        <d-code-editor 
          v-model="jsonObj" 
          :options="{ language: 'json', readOnly: true, automaticLayout: true }" 
          :worker-path="'monaco-editor/esm/vs/editor/editor.worker.js'" 
          class="code-editor"
          ref="codeEditorRef"
          style="width: 100%"
        />
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">LZ-String 编码</h2>
      <div class="input-group">
        <n-input 
          v-model:value="jsonStr" 
          type="textarea" 
          placeholder="输入JSON字符串" 
          :rows="5"
          class="input-field"
        />
      </div>
      <div class="output-group">
        <n-input 
          v-model:value="lzStr" 
          type="textarea" 
          readonly
          class="result-field"
        />
      </div>
    </div>

    <!-- 文本对比 -->
    <div class="section">
      <h2 class="section-title">文本对比</h2>
      <div class="compare-container">
        <div class="compare-column">
          <h3>左侧文本</h3>
          <n-input
            v-model:value="textCompareLeft"
            type="textarea"
            :rows="10"
            class="compare-input"
            placeholder="请输入左侧文本..."
          />
        </div>
        <div class="compare-column">
          <h3>右侧文本</h3>
          <n-input
            v-model:value="textCompareRight"
            type="textarea"
            :rows="10"
            class="compare-input"
            placeholder="请输入右侧文本..."
          />
        </div>
      </div>
      <n-button type="primary" @click="compareText" class="compare-button">开始对比</n-button>
      <div class="diff-result">
          <h3>差异结果</h3>
          <div class="diff-viewer">
            <div class="diff-header">
              <div class="diff-header-left">原始文本</div>
              <div class="diff-header-right">修改后文本</div>
            </div>
            <div class="diff-content">
              <div class="diff-line-numbers">
                <div v-for="(line, index) in parsedDiffData" :key="index" class="line-number">
                  {{ line.line }}
                </div>
              </div>
              <div class="diff-left">
                <div v-for="(line, index) in parsedDiffData" :key="index" :class="['diff-line', line.changed ? 'diff-changed' : '']">
                  <span v-for="(char, charIndex) in line.left" :key="charIndex" :class="isCharChanged(line.charDiffs1, charIndex) ? 'diff-char-changed' : ''">
                    {{ char }}
                  </span>
                </div>
              </div>
              <div class="diff-separator"></div>
              <div class="diff-right">
                <div v-for="(line, index) in parsedDiffData" :key="index" :class="['diff-line', line.changed ? 'diff-changed' : '']">
                  <span v-for="(char, charIndex) in line.right" :key="charIndex" :class="isCharChanged(line.charDiffs2, charIndex) ? 'diff-char-changed' : ''">
                    {{ char }}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  box-sizing: border-box;
}

/* 添加响应式布局支持 */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  .compare-container {
    flex-direction: column;
  }
}

.section {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  margin-bottom: 1rem;
  color: #333;
}

.input-group, .output-group {
  margin-bottom: 1rem;
}

.input-field, .result-field {
  width: 100%;
  box-sizing: border-box;
}

.code-editor {
  height: 400px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.compare-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.compare-column {
  flex: 1;
}

.compare-input {
  width: 100%;
  height: 300px;
}

.compare-button {
  margin-bottom: 1rem;
}

.diff-result {
  width: 100%;
}

.diff-viewer {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.diff-header {
  display: flex;
  background: #f5f5f5;
  padding: 8px 12px;
  font-weight: bold;
  border-bottom: 1px solid #eee;
}

.diff-header-left {
  flex: 1;
  text-align: center;
  border-right: 1px solid #eee;
}

.diff-header-right {
  flex: 1;
  text-align: center;
}

.diff-content {
  display: flex;
  height: 600px;
  overflow: auto;
}

.diff-line-numbers {
  width: 50px;
  background: #f5f5f5;
  border-right: 1px solid #eee;
  padding: 8px 0;
  text-align: right;
}

.line-number {
  padding: 0 8px;
  line-height: 20px;
  font-family: monospace;
  color: #999;
}

.diff-left,
.diff-right {
  flex: 1;
  padding: 8px 0;
  overflow: visible;
}

.diff-separator {
  width: 5px;
  background: #f0f0f0;
  border-left: 1px solid #eee;
  border-right: 1px solid #eee;
}

.diff-line {
  padding: 0 12px;
  line-height: 20px;
  font-family: monospace;
  white-space: pre;
}

.diff-changed {
  background-color: rgba(255, 221, 87, 0.2);
}

.diff-char-changed {
  background-color: rgba(255, 87, 34, 0.2);
  border-bottom: 1px solid #ff5722;
}
</style>
