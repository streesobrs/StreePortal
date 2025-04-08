<template>
    <div class="main-nav">
      <router-link to="/">主页</router-link>
      <router-link to="/tools">工具</router-link>
      <router-link to="/about">关于</router-link>
      <router-link to="/contact">联系</router-link>
      <router-link to="/settings" class="right">设置</router-link>
    </div>
  </template>
<script setup>

</script>
<style scoped>

.main-nav {
    display: flex;
    background-color: #333;
    padding: 10px;
    justify-content: space-between;
}
.main-nav router-link {

    padding: 14px 20px;
    display: block;
    color: white;
    text-align: center;
    text-decoration: none;
    margin: 0 10px;
}

.main-nav router-link:hover {
    background-color: #ddd;
    color: black;
}

.main-nav router-link.right {
    margin-left: auto;
}
</style>