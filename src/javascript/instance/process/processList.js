'use strict';

export default {
  methods: {
    checkProcess(row) {
      this.$emit('checkProcess', row);
    }
  },
  watch: {
    status() {
      this.$emit("drawerStatusUpdated", this.status);
      if (this.status) {
        this.loading = true;
        this.data = {};
        this.error = "";
        this.getAgentProcesses().then(data => {
          this.data = data;
          this.loading = false;
        }).catch(err => {
          this.error = err;
          this.loading = false;
        });
      }
    },
    open() {
      this.status = this.open;
    }
  },
  computed: {
    title() {
      return `实例 ${this.agentId} 下的 Node.js 进程列表`;
    },
    list() {
      const data = this.data;
      const processes = data.processes || [];
      return processes;
    }
  }
};
