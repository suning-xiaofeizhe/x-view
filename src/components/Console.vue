<style scoped>
.layout {
  background: #f5f7f9;
  position: relative;
  overflow: hidden;
}
.layout-logo {
  width: 100px;
  color: white;
  float: left;
  left: 20px;
  font-weight: bold;
  font-size: 16px;
}
.layout-nav {
  width: 300px;
  margin: 0 auto;
  margin-right: 0;
}

.menu-icon {
  margin-bottom: 2px;
}
</style>
<template>
  <div class="layout">
    <x-header ref="xheader" :active-name="activeName"></x-header>
    <Layout>
      <Content ref="xbody" :style="{background: '#fff'}">
        <console-tab @appListChanged="updateFooterStyle"></console-tab>
      </Content>
      <Footer ref="xfooter" :style="layoutFooterCenter">2020 &copy; 苏宁易购</Footer>
    </Layout>
  </div>
</template>
<script>
import header from "./Header";
import consoleTab from "./ConsoleTab";
const defaultFootStyle = {
  textAlign: "center",
  position: "fixed",
  bottom: 0,
  width: "100%"
};
const homeModule = Object.assign({
  data() {
    return {
      activeName: "console",
      layoutFooterCenter: defaultFootStyle
    };
  },
  components: {
    "console-tab": consoleTab,
    "x-header": header
  },
  methods: {
    updateFooterStyle() {
      const winHeight = window.innerHeight;
      const needed =
        parseInt(window.getComputedStyle(this.$refs.xheader.$el).height, 10) +
        parseInt(window.getComputedStyle(this.$refs.xbody.$el).height, 10) +
        parseInt(window.getComputedStyle(this.$refs.xfooter.$el).height, 10);
      if (needed < winHeight) {
        this.layoutFooterCenter = defaultFootStyle;
      } else {
        this.layoutFooterCenter = {};
      }
    }
  }
});
export default homeModule;
</script>
