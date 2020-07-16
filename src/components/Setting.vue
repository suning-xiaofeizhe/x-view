<style scoped>
.content {
  margin-top: 50px;
  margin-left: 20px;
}
.setting-key {
  font-weight: bold;
  font-size: 13px;
}
.setting-value {
  /* font-weight: bold; */
  font-size: 13px;
}
.delete-warning {
  font-size: 13px;
  margin-bottom: 3px;
  margin-right: 2px;
  color: #ed4014;
}
</style>>

<template>
  <div>
    <Row class="info-bar">
      <Col class="info-content">
        {{ appName }}
        > 应用设置
      </Col>
    </Row>
    <Row class="info-divider"></Row>
    <Row class="content" type="flex" justify="center">
      <Col>
        <Row type="flex" justify="start">
          <Col>
            <span class="setting-key">应用名称：</span>
            <span class="setting-value">{{ appName }}</span>
          </Col>
        </Row>
        <br />
        <Row type="flex" justify="start">
          <Col>
            <span class="setting-key">应用 ID：</span>
            <span class="setting-value">{{ appId }}</span>
          </Col>
        </Row>
        <br />
        <Row type="flex" justify="start">
          <Col>
            <span class="setting-key">应用秘钥：</span>
            <span class="setting-value">{{ appSecret }}</span>
          </Col>
        </Row>
        <Row style="margin-top:15px; width:300px" type="flex" justify="start">
          <Col span="6">
            <Button size="small" type="info" long @click="modifyAppName">修改名称</Button>
          </Col>
          <Col style="margin-left:15px" span="6">
            <Button size="small" type="error" long @click="deleteApp">删除应用</Button>
          </Col>
        </Row>
      </Col>
    </Row>

    <!-- modify app name -->
    <Modal style="border-radius:0px" v-model="showModifyAppModal" width="500" closable>
      <p slot="header" style="color:white;">
        <Icon type="ios-information-circle"></Icon>
        <span>修改应用名称</span>
      </p>
      <div style="margin-top:25px;margin-bottom:15px;">
        <Input v-model="newAppName">
          <span slot="prepend">应用名称</span>
        </Input>
        <br />
        <span>
          <span style="font-weight:bold">注意</span>：应用名称最大长度不能超过 20 个字符
        </span>
      </div>
      <div slot="footer">
        <Button type="primary" ghost @click="cancelModifyAppCreation">取消</Button>
        <Button type="primary" :loading="modifyNewAppLoading" @click="submitNewAppName">提交</Button>
      </div>
    </Modal>

    <!-- delete app -->
    <Modal style="border-radius:0px" v-model="showDeleteAppModal" width="560" closable>
      <p slot="header" style="color:white;">
        <Icon type="ios-information-circle"></Icon>
        <span>删除应用</span>
      </p>
      <div style="margin-top:25px;margin-bottom:15px;">
        <Icon class="delete-warning" type="ios-warning-outline" />
        <span style="font-weight:bold">注意：</span>删除应用后您的所有实例都会断开，监控数据、性能分析文件等都会丢失，请谨慎操作！
      </div>
      <div slot="footer">
        <Button type="primary" ghost @click="cancelDeleteAppCreation">取消</Button>
        <Button type="primary" :loading="deleteAppLoading" @click="submitAppDeletion">确认删除</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import setting from "../javascript/setting";
const settingModule = Object.assign(
  {
    data() {
      return {
        appId: "",
        appSecret: "",
        showModifyAppModal: false,
        modifyNewAppLoading: false,
        showDeleteAppModal: false,
        deleteAppLoading: false,
        newAppName: ""
      };
    },
    props: ["appName"],
    created() {
      this.appId = this.$route.params.appId;
      this.getAppSecret();
    }
  },
  setting
);
export default settingModule;
</script>
