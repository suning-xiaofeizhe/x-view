<style scoped>
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
</style>

<template>
  <div>
    <Modal style="border-radius:0px" v-model="showModal" width="500" closable>
      <p slot="header" style="color:white;">
        <Icon type="ios-information-circle"></Icon>
        <span>检查进程</span>
      </p>
      <Row type="flex" justify="center" style="margin-top:15px;margin-bottom:5px;text-align:center">
        <Row v-if="loading">
          <Col span="1">
            <Spin fix style="color:#2db7f5">
              <Icon type="ios-loading" size="18" class="spin-icon-load"></Icon>
            </Spin>
          </Col>
        </Row>
        <Row v-if="!loading">
          <Col span="24">
            <Row v-if="data.ok" style="text-align:left;font-size:12px">
              <p v-html="xnodeinstallTip"></p>
              <p style="margin-top:1px;" v-html="xnodeEnableTip"></p>
              <p style="margin-top:1px;" v-html="xnodeLogDirTip"></p>
              <p style="margin-top:1px;" v-html="processAdditionalTip"></p>
            </Row>
            <Row v-if="!data.ok">
              <p>{{data.message}}</p>
            </Row>
          </Col>
        </Row>
      </Row>
      <div slot="footer">
        <Button v-if="loading" type="primary" ghost @click="cancel" :loading="true">连接实例中...</Button>
        <Button v-if="!loading" type="primary" ghost @click="cancel">关闭</Button>
      </div>
    </Modal>
  </div>
</template>>

<script>
export default {
  props: ["show", "loading", "cancel", "data"],
  data() {
    return {
      showModal: false,
      secondTitleStyle: "margin-left:6px;"
    };
  },
  watch: {
    show() {
      this.showModal = this.show;
    },
    showModal() {
      this.$emit("modalStatusChanged", this.showModal);
    }
  },
  computed: {
    xnodeinstallTip() {
      const data = this.data.data;
      let res = "1. 插件 xprofiler 是否安装：";
      if (data.installXnode) {
        res += "✓";
      } else {
        res += "✗";
      }
      return res;
    },
    xnodeEnableTip() {
      const data = this.data.data;
      let res = "2. 插件 xprofiler 是否启用：";
      if (data.xnodeVersion) {
        res += "✓";
      } else {
        res += "✗";
      }
      return res;
    },
    xnodeLogDirTip() {
      const data = this.data.data;
      const secondTitleStyle = this.secondTitleStyle;
      let res = "3. 插件 xprofiler 生成日志目录是否与 x-agent 采集目录一致：";
      if (data.installXnode && data.xnodeVersion) {
        if (data.xnodeLogDir === data.xagentLogDir) {
          res += "✓";
        } else {
          res += "✗";
        }
        res += `<br><span style="${secondTitleStyle}">- 插件生成日志的目录: ${data.xnodeLogDir}</span>`;
        res += `<br><span style="${secondTitleStyle}">- 采集性能日志的目录: ${data.xagentLogDir}</span>`;
      } else {
        res += "✗";
      }
      return res;
    },
    processAdditionalTip() {
      const data = this.data.data;
      let res = "";
      if (data.nodeVersion) {
        res = `4. 进程 ${data.pid} 使用的 node.js 版本: v${data.nodeVersion}`;
      }
      if (data.xnodeVersion) {
        res += `, xprofiler 版本: v${data.xnodeVersion}`;
      }
      return res;
    }
  }
};
</script>
