<template>
  <div class="top-iframe-container">
    <iframe
      :src="url"
      :height="height"
      frameborder="0"
      allowfullscreen
    ></iframe>
  </div>
</template>

<script>
export default {
  name: 'TopIframe',
  props: {
    url: {
      type: String,
      required: true
    },
    height: {
      type: String,
      default: '400px'
    }
  }
}
</script>

<style scoped>
.top-iframe-container {
  width: 100%;
  z-index: 0;
}

iframe {
  width: 100%;
  border: none;
}
</style>
