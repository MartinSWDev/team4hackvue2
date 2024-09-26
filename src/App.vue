<template>
  <Banner url="https://martinwilliam.8thwall.app/discovery/" height="400px" />
  <div id="app">
    <InterestMapApp />
  </div>
</template>

<script>
import InterestMapApp from './components/InterestMapApp.vue'
import Banner from './components/Banner.vue'
export default {
  name: 'App',
  components: {
    InterestMapApp,
    Banner
  }
}
</script>
