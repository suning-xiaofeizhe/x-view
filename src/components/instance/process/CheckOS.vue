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
    <Modal style="border-radius:0px" v-model="showModal" width="580" closable>
      <p slot="header" style="color:white;">
        <Icon type="ios-information-circle"></Icon>
        <span>实例信息</span>
      </p>
      <Row
        type="flex"
        justify="center"
        style="margin-top:10px;margin-bottom:10px;text-align:center"
      >
        <Row v-if="loading">
          <Col span="1">
            <Spin fix style="color:#2db7f5">
              <Icon type="ios-loading" size="18" class="spin-icon-load"></Icon>
            </Spin>
          </Col>
        </Row>
        <Row v-if="!loading">
          <Col span="24">
            <Row v-if="data.ok" style="text-align:left;">
              <Table style="width:550px" :columns="columns" :data="list"></Table>
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
import * as common from "../../../javascript/common";

export default {
  props: ["show", "loading", "cancel", "data"],
  data() {
    return {
      showModal: false,
      columns: [
        {
          title: "信息",
          key: "type",
          width: 140
        },
        {
          title: "系统详情",
          key: "detail"
        }
      ]
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
    list() {
      const data = this.data.data;
      if (!data) {
        return [];
      }
      return [
        { type: "Node.js 版本", detail: `v${data.nodeVersion}` },
        {
          type: "X-Agent 信息",
          detail: data.xagentVersion
            ? `xagent@${data.xagentVersion}`
            : "未知"
        },
        {
          type: "核心转储文件",
          detail:
            `${data.ulimitC}` +
            (data.ulimitC !== "unlimited"
              ? ` (${common.formatMemory(data.ulimitC)})`
              : "")
        },
        { type: "操作系统信息", detail: `${data.osInfo}` }
      ];
    }
  }
};
</script>
