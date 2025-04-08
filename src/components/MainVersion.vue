<template>
    <div class="version-info">
        版本号: {{ version }}
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const version = ref('')

// 更新版本号
function updateVersionNumber() {
    try {
        const storedVersion = localStorage.getItem('version')
        if (storedVersion) {
            version.value = storedVersion
        } else {
            console.error('未找到版本号信息')
        }
    } catch (error) {
        console.error('获取版本号时发生错误:', error)
    }
}

onMounted(() => {
    updateVersionNumber()
})

</script>

<style scoped>
.version-info {
    position: fixed;
    right: 10px;
    bottom: 10px;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border-radius: 4px;
    font-size: 0.9em;
}
</style>