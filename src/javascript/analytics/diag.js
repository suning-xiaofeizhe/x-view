'use strict';

import axios from "axios";
import * as common from "../common";

export default {
  methods: {
    getDiag() {
      const error = '获取诊断报告失败，请重试';
      this.loading = true;
      const data = this.data;
      axios.get('/file/download', { params: { fileId: data.fileId, fileType: data.fileType } })
        .then(data => {
          data = data.data;
          this.diag = data;
          this.loading = false;
        })
        .catch(err => {
          common.error.call(this, `${error} ${err}`, err.code);
          this.loading = false;
        });
    },
    getSpaceName(space) {
      return space.name.split('_').join(' ');
    },
    getSpaceSize(space) {
      return common.formatMemory(space.size);
    },
    getHeapTotal() {
      const diag = this.diag || {};
      const heapStatistics = diag.heapStatistics || {};
      return common.formatMemory(heapStatistics.heapTotal || 0);
    },
    getHeapLimit() {
      const diag = this.diag || {};
      const heapStatistics = diag.heapStatistics || {};
      return common.formatMemory(heapStatistics.heapLimit || 0);
    },
    changePage(page) {
      this.libuvCurrentPage = page;
    }
  },
  computed: {
    jsStackList() {
      const diag = this.diag || {};
      const jsStacks = diag.jsStacks || [];
      return jsStacks.map(stack => {
        const pcAddress = stack.pcAddress;
        const frameType = stack.frameType;
        const functionName = stack.functionName ? `${stack.functionName}()` : 'anonymous()';
        let url = stack.scriptName;
        if (stack.lineNumber) {
          url += `:${stack.lineNumber}`;
        }
        if (stack.column) {
          url += `:${stack.column}`;
        }
        return { pcAddress, frameType, functionName, url };
      });
    },
    nativeStackList() {
      const diag = this.diag || {};
      const nativeStacks = diag.nativeStacks || [];
      return nativeStacks;
    },
    spaces() {
      const diag = this.diag || {};
      return diag.gcStatistics || diag.heapSpaceStatistics || [];
    },
    libuvTotalHandles() {
      const diag = this.diag || {};
      const handles = diag.libuvHandles || [];
      const countMap = handles.reduce((map, handle) => {
        if (map[handle.type]) {
          map[handle.type]++;
        } else {
          map[handle.type] = 1;
        }
        return map;
      }, {});
      const list = handles.map(handle => {
        const pcAddress = handle.address;
        const type = handle.type;
        const active = handle.isActive;
        let detail = `数量: ${countMap[handle.type]}, 活跃: ${active ? '是' : '否'}, 状态: ${handle.hasRef ? `ref` : `unref`}`;
        if (handle.detail) {
          detail += `, 详情: ${handle.detail}`;
        }
        return { pcAddress, type, detail, active };
      });
      list.sort((o, n) => countMap[o.type] < countMap[n.type] ? 1 : -1);
      return list;
    },
    libuvHandles() {
      const start = (this.libuvCurrentPage - 1) * this.libuvPageSize;
      const stop = this.libuvCurrentPage * this.libuvPageSize;
      return this.libuvTotalHandles.filter((...args) => args[1] >= start && args[1] < stop);
    },
    systemData() {
      const diag = this.diag || {};
      const system = diag.system || {};
      return system;
    },
    envList() {
      const env = this.systemData.env || [];
      return env.map(e => {
        const tmp = e.split('=');
        return {
          key: tmp[0],
          value: tmp[1]
        };
      });
    },
    resources() {
      return this.systemData.resourceLimits || [];
    },
    loadedLibs() {
      return this.systemData.loadedLibraries || [];
    }
  },
  watch: {
    messageType() {
      if (this.messageType !== this.$route.query.messageType) {
        this.libuvCurrentPage = 1;
        this.$router.push({
          path: this.$route.path,
          query: Object.assign({}, this.$route.query, { messageType: this.messageType, libuvCurrentPage: 1 })
        });
      }
    },
    libuvCurrentPage() {
      if (this.libuvCurrentPage !== Number(this.$route.query.libuvCurrentPage)) {
        this.$router.push({
          path: this.$route.path,
          query: Object.assign({}, this.$route.query, { libuvCurrentPage: this.libuvCurrentPage })
        });
      }
    }
  }
};
