<style scoped>
.test {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
}
.title {
  font-weight: bold;
  margin-bottom: 10px;
}
</style>

<template>
  <div>
    <Modal style="border-radius:0px" v-model="showModal" width="600" closable>
      <p slot="header" style="color:white;">
        <Icon type="ios-information-circle"></Icon>
        <span>告警联系人设置</span>
      </p>
      <Row style="margin-top:10px;margin-bottom:10px;">
        <Row v-if="loading" type="flex" justify="center">
          <Col span="1">
            <Spin fix style="color:#2db7f5;;text-align:center;">
              <Icon type="ios-loading" size="18" class="spin-icon-load"></Icon>
            </Spin>
          </Col>
        </Row>
        <Row v-if="!loading">
          <Col span="24">
            <Row v-if="data.ok" style="text-align:left;">
              <Row class="info-prompt" style="margin-top:-15px;margin-left:0px;margin-right:0px">
                <Alert>
                  <Icon class="message-icon" type="ios-alert-outline" />为规则
                  <code style="color:#ed4014">{{ rule }}</code>
                  <span>配置告警联系人</span>
                </Alert>
              </Row>
              <Row class="title">已添加联系人</Row>
              <Row>
                <Col>
                  <Table :columns="memberColumns" :data="memberList" no-data-text="此规则下没有报警联系人">
                    <template slot-scope="{ row }" slot="time">
                      <span class="time">{{ row.user }}</span>
                    </template>
                    <template slot-scope="{ row }" slot="action">
                      <Button
                        ghost
                        long
                        type="primary"
                        size="small"
                        style="margin-right: 5px"
                        :loading="removeContactLoading"
                        @click="remove(row)"
                      >移出联系人列表</Button>
                    </template>
                  </Table>
                </Col>
              </Row>
              <Row class="title" style="margin-top:15px">可添加联系人</Row>
              <Row>
                <Col>
                  <Table :columns="settingColumns" :data="settingList" no-data-text="没有剩余可添加的联系人">
                    <template slot-scope="{ row }" slot="time">
                      <span class="time">{{ row.user }}</span>
                    </template>
                    <template slot-scope="{ row }" slot="action">
                      <Button
                        ghost
                        long
                        type="primary"
                        size="small"
                        style="margin-right: 5px"
                        :loading="addContactLoading"
                        @click="add(row)"
                      >添加至联系人列表</Button>
                    </template>
                  </Table>
                </Col>
              </Row>
            </Row>
            <Row v-if="!data.ok" style="text-align:center;">
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
  props: [
    "show",
    "loading",
    "cancel",
    "data",
    "rule",
    "removeContactLoading",
    "addContactLoading"
  ],
  data() {
    return {
      showModal: false,
      memberColumns: [
        { title: "成员信息", slot: "time" },
        { title: "操作", slot: "action", align: "center", width: 180 }
      ],
      settingColumns: [
        { title: "成员信息", slot: "time" },
        { title: "操作", slot: "action", align: "center", width: 180 }
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
    memberList() {
      const data = this.data.data;
      if (!data) {
        return [];
      }
      if (!Array.isArray(data.settedList)) {
        return [];
      }
      return data.settedList.map(l =>
        Object.assign({}, l, {
          user: l.workId + (l.userName ? ` (${l.userName})` : "")
        })
      );
    },
    settingList() {
      const data = this.data.data;
      if (!data) {
        return [];
      }
      if (!Array.isArray(data.remainList)) {
        return [];
      }
      return data.remainList.map(l =>
        Object.assign({}, l, {
          user: l.workId + (l.userName ? ` (${l.userName})` : "")
        })
      );
    }
  },
  methods: {
    remove(row) {
      this.$emit("removeFromContactList", row);
    },
    add(row) {
      this.$emit("addToContactList", row);
    }
  }
};
</script>
