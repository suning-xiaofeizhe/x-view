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
    <Modal style="border-radius:0px" v-model="showModal" width="560" closable>
      <p slot="header" style="color:white;">
        <Icon type="ios-information-circle"></Icon>
        <span>抓取性能数据</span>
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
            <Row v-if="data.ok" style="text-align:left;">
              <p>
                <span v-if="type === 'save_process_data'">保存过去 24h 进程趋势数据成功，请访问</span>
                <span v-if="type !== 'save_process_data'">操作成功，请访问</span>
                <router-link :to="{path:`/app/${appId}/file`}" target="_blank">文件列表</router-link>
                <span>查看详情</span>
              </p>
              <div v-if="type ==='cpu_profiling'">
                <p style="margin-top:5px;">
                  <span>CPU Profiling 文件路径:</span>
                  <span>{{ filePath }}</span>
                </p>
                <p style="margin-top:5px;">
                  <span>注意：CPU 采样快照生成需要约 5 分钟，请耐性等待</span>
                </p>
              </div>
              <div v-if="type ==='heapdump'">
                <p style="margin-top:5px;">
                  <span>堆快照文件路径:</span>
                  <span>{{ filePath }}</span>
                </p>
                <p style="margin-top:5px;">
                  <span>注意：堆快照生成可能需要几秒到几十秒，请耐性等待</span>
                </p>
              </div>
              <div v-if="type ==='heap_profiling'">
                <p style="margin-top:5px;">
                  <span>Heap Profiling 文件路径:</span>
                  <span>{{ filePath }}</span>
                </p>
                <p style="margin-top:5px;">
                  <span>注意：Heap 采样快照生成需要约 5 分钟，请耐性等待</span>
                </p>
              </div>
              <div v-if="type ==='gc_tracing'">
                <p style="margin-top:5px;">
                  <span>GC Tracing 文件路径:</span>
                  <span>{{ filePath }}</span>
                </p>
                <p style="margin-top:5px;">
                  <span>注意：GC 追踪文件生成需要约 5 分钟，请耐性等待</span>
                </p>
              </div>
              <div v-if="type ==='diag_report'">
                <p style="margin-top:5px;">
                  <span>诊断报告文件路径:</span>
                  <span>{{ filePath }}</span>
                </p>
                <p style="margin-top:5px;">
                  <span>注意：诊断报告生成可能需要几秒，请耐性等待</span>
                </p>
              </div>
              <div v-if="type ==='save_process_data'">
                <p style="margin-top:5px;">
                  <span>进程数据已保存至 oss，文件名:</span>
                  <span>{{ filePath }}</span>
                </p>
              </div>
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
  props: ["appId", "show", "loading", "cancel", "data"],
  data() {
    return {
      showModal: false
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
    type() {
      let data = this.data || {};
      data = data.data || {};
      const type = data.type || "unknown";
      return type;
    },
    filePath() {
      let data = this.data || {};
      data = data.data || {};
      const filePath = data.file || "unknown";
      return filePath;
    }
  }
};
</script>
