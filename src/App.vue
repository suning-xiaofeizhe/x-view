<template>
  <div id="app">
    <transition name="router-transition">
      <router-view />
    </transition>
  </div>
</template>

<script>
export default {
  name: "App"
};
</script>

<style>
@import url(assets/css/transition.css);

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.ivu-modal-close .ivu-icon.ivu-icon-ios-close {
  color: white;
}

.ivu-modal-content .ivu-modal-header {
  border: 0px;
  background-color: #5cadff;
}

.alarm-list .ivu-modal-content .ivu-modal-header {
  border: 0px;
  background-color: #2d8cf0;
}

.ivu-col button,
.ivu-modal .ivu-modal-content,
.ivu-modal-footer button,
.ivu-modal-footer a,
.ivu-modal-body .ivu-input-group-prepend,
.ivu-modal-body input,
.ivu-alert.ivu-alert-info,
.ivu-alert.ivu-alert-success,
.ivu-alert.ivu-alert-warning,
.ivu-row input,
.ivu-row .ivu-input-group-prepend,
.ivu-row-flex input,
.ivu-row-flex .ivu-input-group-prepend,
.ivu-table-cell button,
.ivu-select-selection,
.ivu-select-small.ivu-select-single .ivu-select-selection,
.ivu-select-dropdown,
.ivu-tag,
.ivu-btn,
.ivu-page.mini .ivu-page-options-elevator input {
  border-radius: 0px;
}

.info-bar {
  height: 25px;
  border-left: 5px solid #2d8cf0;
  margin-left: 20px;
  margin-top: 20px;
  margin-right: 20px;
  text-align: left;
}
.info-divider {
  height: 25px;
  margin-left: 20px;
  margin-top: 10px;
  margin-right: 20px;
  border-top: 1px solid #dcdee2;
}
.info-content {
  margin-left: 10px;
  font-size: 14px;
  margin-top: 2px;
  /* font-weight: bold; */
}

.info-prompt {
  text-align: left;
  margin-left: 20px;
  margin-top: -5px;
  margin-right: 20px;
}

.message-icon {
  font-size: 14px;
  margin-top: -2px;
  margin-right: 5px;
  color: #2db7f5;
}

.upload-file .ivu-select-dropdown,
.file-filter .ivu-select-dropdown {
  max-height: 300px;
}

.pre-setted-rules .ivu-select-dropdown {
  max-height: 300px;
}

.setted-rules .ivu-table-wrapper {
  overflow: visible;
}

.setted-rules .ivu-table-cell {
  overflow: visible;
}

.setted-rules .ivu-badge-count {
  top: -9px;
}

.ivu-tabs-tab .ivu-icon {
  margin-bottom: 4px;
  margin-right: 0px;
  font-size: 15px;
}

.ivu-tabs-nav .ivu-tabs-tab .ivu-icon {
  margin-right: 5px;
}

.tooltip {
  background: #f8f8f9;
  color: #515a6e;
  text-align: left;
  margin-right: 10px;
  position: absolute;
  z-index: -9999;
  display: none;
  /* padding: 3px 8px; */
  font-size: 12px;
  word-wrap: break-word;
  word-break: break-all;
  overflow: hidden;
  min-width: 300px;
  max-width: 500px;
  max-height: 300px;
}

.ivu-layout.ivu-layout-has-sider > .ivu-layout,
.ivu-layout.ivu-layout-has-sider > .ivu-layout-content {
  overflow-x: hidden;
  overflow-y: hidden;
}

.dashboard-message-tip {
  margin-top: 150px;
  font-size: 13px;
  color: #515a6e;
}

.spin-icon-load {
  animation: ani-demo-spin 1s linear infinite;
}
@keyframes ani-demo-spin {
  from {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.overview-icon-healthy {
  font-size: 18px;
  font-weight: bold;
  color: #19be6b;
}
.overview-icon-warn {
  font-size: 18px;
  font-weight: bold;
  color: #ff9900;
}
.overview-icon-error {
  font-size: 18px;
  font-weight: bold;
  color: #ed4014;
}
.analytics-overview-title {
  font-size: 12px;
  font-weight: bold;
  color: #515a6e;
}
.analytics-overview-value {
  margin-top: 5px;
  font-size: 14px;
  color: #17233d;
}
</style>
