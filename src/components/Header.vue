<style scoped>
.layout-logo {
  width: 100px;
  color: white;
  float: left;
  margin-left: -57px;
  font-weight: bold;
  font-size: 16px;
}
.layout-nav {
  width: 330px;
  margin: 0 auto;
  margin-right: 0;
}
.menu-icon {
  margin-bottom: 2px;
}
</style>

<template>
  <Header :style="{width: '100%'}">
    <Menu :style="menuStyle" mode="horizontal" theme="dark" :active-name="activeName">
      <router-link :to="{path: '/'}">
        <div class="layout-logo">XNPP</div>
      </router-link>
      <div class="layout-nav">
        <a href="/public/docs/xnpp/index.html" target="_blank">
          <MenuItem name="doc">
            <Icon class="menu-icon" type="ios-book" />文档
          </MenuItem>
        </a>
        <router-link :to="{path:'/console', query:{type:'myApps'}}">
          <MenuItem name="console">
            <Icon class="menu-icon" type="ios-keypad" />控制台
          </MenuItem>
        </router-link>
        <MenuItem name="persona">
          <Icon class="menu-icon" type="ios-contact" />
          {{ userName }}
        </MenuItem>
      </div>
    </Menu>
  </Header>
</template>

<script>
import header from "../javascript/header";
const headerModule = Object.assign(
  {
    props: ["activeName", "menuStyle"],
    data() {
      return {
        userName: ""
      };
    },
    created() {
      this.getUserInfo();
    }
  },
  header
);
export default headerModule;
</script>
