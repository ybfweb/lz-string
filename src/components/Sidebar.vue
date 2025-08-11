<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// 定义菜单项数据
const menuItems = [
  { id: 'lz-decode', title: 'LZ-String 解码' },
  { id: 'lz-encode', title: 'LZ-String 编码' },
  { id: 'text-compare', title: '文本对比' },
  { id: 'image-base64', title: '图片Base64互转' },
  { id: 'url-encode-decode', title: 'URL编解码' },
];

// 当前激活的菜单项
const activeItem = ref<string | null>(null);

// 处理滚动事件，更新当前激活的菜单项
const handleScroll = () => {
  const sections = menuItems.map(item => document.getElementById(item.id));
  const scrollPosition = window.scrollY + 100;

  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i];
    if (section && section.offsetTop <= scrollPosition) {
      activeItem.value = menuItems[i].id;
      break;
    }
  }
};

// 滚动到指定部分
const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    window.scrollTo({
      top: element.offsetTop - 20,
      behavior: 'smooth'
    });
    activeItem.value = id;
  }
};

// 组件挂载时添加事件监听
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  // 初始加载时触发一次滚动事件
  handleScroll();
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-title">功能导航</div>
    <div class="menu-items">
      <div
        v-for="item in menuItems"
        :key="item.id"
        :class="['menu-item', activeItem === item.id ? 'active' : '']"
        @click="scrollToSection(item.id)"
      >
        {{ item.title }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.sidebar {
  width: 220px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.sidebar-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.menu-item {
  padding: 0.5rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;

  &:hover {
    background-color: #f5f5f5;
    color: #333;
  }

  &.active {
    background-color: #e6f7ff;
    color: #1890ff;
    font-weight: 500;
  }
}

// 响应式调整
@media (max-width: 992px) {
  .sidebar {
    width: 100%;
    margin-bottom: 1.5rem;
    position: relative;
    top: 0;
  }
}
</style>