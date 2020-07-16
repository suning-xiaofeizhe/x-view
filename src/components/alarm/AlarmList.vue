<style scoped>
.time,
.contextType,
.agent-id,
.expr {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
}
.alert {
  color: #ed4014;
}
</style>

<template>
  <div>
    <Modal class="alarm-list" fullscreen style="border-radius:0px" v-model="showModal" closable>
      <p slot="header" style="color:white;">
        <Icon type="ios-information-circle"></Icon>
        <span>告警触发列表</span>
      </p>
      <Row class="info-prompt" style="margin-top:0px;margin-left:0px;margin-right:0px;">
        <Alert>
          <Icon class="message-icon" type="ios-alert-outline" />此规则下告警总数为
          <code class="alert">{{ totalCount }}</code>
          <span>条，默认只展示最近的</span>
          <code>100</code>
          <span>条告警记录</span>
        </Alert>
      </Row>
      <Row style="margin-top:10px;margin-bottom:10px;">
        <Row v-if="loading" type="flex" justify="center">
          <Col span="1">
            <Spin fix style="color:#2db7f5;margin-top:200px;text-align:center;">
              <Icon type="ios-loading" size="18" class="spin-icon-load"></Icon>
            </Spin>
          </Col>
        </Row>
        <Row v-if="!loading">
          <Col span="24">
            <Row v-if="data.ok" style="text-align:left;">
              <Col>
                <Table :columns="columns" :data="list">
                  <template slot-scope="{ row }" slot="time">
                    <span class="time">{{ row.time }}</span>
                  </template>
                  <template slot-scope="{ row }" slot="contextType">
                    <span class="contextType">{{ row.contextType }}</span>
                  </template>
                  <template slot-scope="{ row }" slot="appId">
                    <span class="agent-id">
                      {{ row.appId }}
                      <span v-if="row.owner">({{ row.owner }})</span>
                    </span>
                  </template>
                  <template slot-scope="{ row }" slot="agentId">
                    <span class="agent-id">{{ row.agentId }}</span>
                  </template>
                  <template slot-scope="{ row }" slot="expr">
                    <span class="expr">{{ row.expr }}</span>
                  </template>
                  <template slot-scope="{ row }" slot="action">
                    <Button
                      long
                      type="primary"
                      size="small"
                      style="margin-right: 5px"
                      @click="goToAgentPage(row)"
                    >详细信息页面</Button>
                  </template>
                </Table>
              </Col>
            </Row>
            <Row v-if="!data.ok" style="text-align:center;margin-top:100px;">
              <p>{{data.message}}</p>
            </Row>
          </Col>
        </Row>
      </Row>
      <div slot="footer">
        <Button type="primary" ghost @click="cancel">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  props: ["show", "loading", "cancel", "data", "getContextType"],
  data() {
    return {
      showModal: false,
      columns: [
        { title: "告警时间", slot: "time", width: 150 },
        { title: "上下文类型", slot: "contextType", width: 150 },
        { title: "应用 ID", slot: "appId", width: 125 },
        { title: "实例 ID", slot: "agentId", width: 300 },
        { title: "消息内容", slot: "expr" },
        { title: "操作", slot: "action", align: "center", width: 150 }
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
      let list = data.list;
      if (!Array.isArray(list)) {
        return [];
      }
      list = list.map(l =>
        Object.assign({}, l, {
          contextType: this.getContextType(l.contextType)
        })
      );
      return list;
    },
    totalCount() {
      const data = this.data.data;
      if (!data) {
        return 0;
      }
      return data.totalCount || 0;
    }
  },
  methods: {
    goToAgentPage(row) {
      const query = {
        agentId: row.agentId,
        instanceTab: row.instanceTab || "process"
      };
      if (query.instanceTab === "process") {
        query.selectPid = row.pid;
        query.showProcessDetailDrawer = 1;
      }

      const { href } = this.$router.resolve({
        path: `/app/${row.appId}/agent`,
        query
      });
      window.open(href, "_blank");
    }
  }
};
</script>
