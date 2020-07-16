<style scoped>
.title {
  margin-top: 9px;
  font-size: 15px;
  text-align: left;
  font-weight: bold;
}
.button {
  text-align: right;
  margin-top: 10px;
}
.tip {
  font-size: 13px;
  margin-top: 10px;
  text-align: left;
}
</style>

<template>
  <div>
    <Alert>
      <Row style="text-align:left">
        <Col span="18">
          <div class="title">
            您收到了来自应用
            {{ invitation.appName }} (Owner: {{ invitation.owner }}) 的邀请！
          </div>
          <div class="tip">加入应用后您可以查看完整的监控数据、访问性能分析文件和协助定位问题</div>
        </Col>
        <Col class="button">
          <Button :loading="confirmLoading" type="info" @click="confirmInvitation">加入应用</Button>
          <Button
            style="margin-left:5px"
            type="info"
            :loading="cancelLoading"
            ghost
            @click="rejectInvitation"
          >谢绝邀请</Button>
        </Col>
      </Row>
    </Alert>
  </div>
</template>
<script>
import invitation from "../javascript/invitation";
const invitationModule = Object.assign(
  {
    props: ["invitation"],
    data() {
      return {
        cancelLoading: false,
        confirmLoading: false
      };
    }
  },
  invitation
);

export default invitationModule;
</script>
