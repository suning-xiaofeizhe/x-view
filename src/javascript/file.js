'use strict';

import axios from 'axios';
import * as common from "./common";

export default {
  methods: {
    getCsrfToken() {
      return common.getCsrfToken();
    },
    showUploadModal() {
      this.showUploadActivityModal = true;
    },
    cancelUpload() {
      this.showUploadActivityModal = false;
    },
    resetUploaderStatus() {
      this.selectedType = '';
      this.fileName = '';
      this.file = null;
      this.coreFileName = '';
      this.coreFile = null;
      this.executableFileName = '';
      this.executableFile = null;
    },
    handleUpload(file) {
      this.selectedType = '';
      this.fileName = '';
      const tmp = file.name.split('.');
      const ext = tmp[tmp.length - 1];
      for (let i = 0; i < this.activityType.length; i++) {
        const type = this.activityType[i];
        if (type.value === ext) {
          this.selectedType = ext;
        }
      }
      if (this.selectedType) {
        if (this.selectedType !== 'core') {
          this.fileName = file.name;
          this.file = file;
        } else {
          this.coreFileName = file.name;
          this.coreFile = file;
        }
      } else {
        this.fileName = `<span style="color:#ed4014">文件类型 .${ext} 错误!</span>`;
      }
      return false;
    },
    handleCoreFileUpload(file) {
      this.fileName = '';
      const tmp = file.name.split('.');
      const ext = tmp[tmp.length - 1];
      if (ext !== 'core') {
        this.coreFileName = `<span style="color:#ed4014">文件类型 .${ext} 错误!</span>`;
      } else {
        this.coreFileName = file.name;
        this.coreFile = file;
      }
      return false;
    },
    handleExecutableFileUpload(file) {
      this.fileName = '';
      const tmp = file.name.split('.');
      const ext = tmp[tmp.length - 1];
      if (ext !== 'node') {
        this.executableFileName = `<span style="color:#ed4014">文件类型 .${ext} 错误!</span>`;
      } else {
        this.executableFileName = file.name;
        this.executableFile = file;
      }
      return false;
    },
    submitUploadActivity() {
      if (!this.file) {
        this.$Message.error('请选择正确类型的文件！');
        return;
      }
      const error = '上传文件失败，请重试！';
      this.uploading = true;
      const formData = new FormData();
      formData.append('file', this.file);
      axios({
        method: 'POST',
        url: `/api/upload2oss?appId=${this.appId}&type=activity&fileType=${this.selectedType}`,
        headers: {
          'x-csrf-token': common.getCsrfToken(),
          'content-type': 'multipart/form-data'
        },
        data: formData
      }).then(data => {
        data = data.data;
        if (data.ok) {
          this.changeFilter('all');
          this.getActivityList();
          this.resetUploaderStatus();
        } else {
          common.error.call(this, data.message || `${error}`, data.code);
        }
        this.uploading = false;
        this.showUploadActivityModal = false;
      }).catch(err => {
        common.error.call(this, `${error} ${err}`, err.code);
        this.uploading = false;
        this.showUploadActivityModal = false;
      });
    },
    submitUploadCoredump() {
      if (!this.coreFile) {
        this.$Message.error('Coredump 需要上传 Core 文件 (.core)！');
        return;
      }
      if (!this.executableFile) {
        this.$Message.error('Coredump 需要上传可执行文件 (.node)！');
        return;
      }
      const error = '上传文件失败，请重试！';
      const tasks = [];
      const id = common.randomString();
      // put core
      const coreFormData = new FormData();
      coreFormData.append('file', this.coreFile);
      tasks.push(
        axios({
          method: 'POST',
          url: `/api/upload2oss?appId=${this.appId}&type=coredump&id=${id}`,
          headers: {
            'x-csrf-token': common.getCsrfToken(),
            'content-type': 'multipart/form-data'
          },
          data: coreFormData
        })
      );
      // put executable;
      const executableFormData = new FormData();
      executableFormData.append('file', this.executableFile);
      tasks.push(
        axios({
          method: 'POST',
          url: `/api/upload2oss?appId=${this.appId}&type=executable&id=${id}`,
          headers: {
            'x-csrf-token': common.getCsrfToken(),
            'content-type': 'multipart/form-data'
          },
          data: executableFormData
        })
      );
      // upload
      this.coreUploading = true;
      Promise.all(tasks).then(data => {
        data = data.map(d => d.data);
        if (data.length === 2 && data[0].ok && data[1].ok) {
          this.changeFilter('all');
          this.getActivityList();
          this.resetUploaderStatus();
        } else {
          common.error.call(this, data.message || `${error}`, data.code);
        }
        this.coreUploading = false;
        this.showUploadActivityModal = false;
      }).catch(err => {
        common.error.call(this, `${error} ${err}`, err.code);
        this.coreUploading = false;
        this.showUploadActivityModal = false;
      });
    },

    getActivityList(page = 1, filterType = 'all', showLoading = true) {
      const error = '获取文件列表失败，请重试！';
      if (showLoading) {
        this.filesLoading = true;
      }
      axios.get(`/api/file_list`, { params: { appId: this.appId, page, size: this.pageSize, filterType } }).then(data => {
        data = data.data;
        if (data.ok) {
          data = data.data;
          if (Array.isArray(data.list)) {
            this.files = data.list;
            this.checkCreatingFile();
            this.fileCount = data.totalCount;
          }
        } else {
          common.error.call(this, data.message || `${error}`, data.code);
        }
        this.filesLoading = false;
      }).catch(err => {
        common.error.call(this, `${error} ${err}`, err.code);
        this.filesLoading = false;
      });
    },
    changePage(page) {
      this.$router.push({
        path: this.$route.path,
        query: Object.assign({}, this.$route.query, { currentPage: page })
      });
      this.currentPage = page;
      this.getActivityList(page, this.selectedFilterType);
    },
    favor(data, key) {
      const error = '收藏/取消收藏失败，请重试！';
      this.$set(this.loadingObject, key, true);
      axios({
        method: 'POST',
        url: '/api/file_favor',
        headers: {
          'x-csrf-token': common.getCsrfToken()
        },
        data: {
          fileType: data.fileType,
          fileId: data.fileId,
          favor: data.favor === 0 ? 1 : 0
        }
      }).then(data => {
        data = data.data;
        if (data.ok) {
          this.getActivityList(this.currentPage, this.selectedFilterType, false);
        } else {
          common.error.call(this, data.message || `${error}`, data.code);
        }
        this.$set(this.loadingObject, key, false);
      }).catch(err => {
        common.error.call(this, `${error} ${err}`, err.code);
        this.$set(this.loadingObject, key, false);
      });
    },
    delete(data, key) {
      this.deleteLoadingKey = key;
      this.deleteData = data;
      this.showDeletionModal = true;
    },
    submitDeletion() {
      this.showDeletionModal = false;
      this.$set(this.loadingObject, this.deleteLoadingKey, true);
      const error = '删除文件失败，请重试！';
      axios({
        method: 'DELETE',
        url: '/api/file',
        headers: {
          'x-csrf-token': common.getCsrfToken()
        },
        data: {
          fileId: this.deleteData.fileId,
          fileType: this.deleteData.fileType
        }
      }).then(data => {
        data = data.data;
        if (data.ok) {
          this.getActivityList(this.currentPage, this.selectedFilterType);
        } else {
          common.error.call(this, data.message || `${error}`, data.code);
        }
        this.$set(this.loadingObject, this.deleteLoadingKey, false);
      }).catch(err => {
        common.error.call(this, `${error} ${err}`, err.code);
        this.$set(this.loadingObject, this.deleteLoadingKey, false);
      });
    },
    updateDeletion(status) {
      this.showDeletionModal = status;
    },
    handleFileEvent(data, type) {
      const key = `${data.fileType}::${data.fileId}::${type}`;
      if (type === '下载') {
        window.location = `/file/download?fileType=${data.fileType}&fileId=${data.fileId}`;
      } else if (type === '收藏' || type === '已收藏') {
        this.favor(data, key);
      } else if (type === '删除') {
        this.delete(data, key);
      } else if (type === '转储' || type === '再转储') {
        this.transfer(data, key);
      } else if (type === 'X分析') {
        this.analytics(data, key);
      } else if (type === 'devtool') {
        let selectedTab = '';
        if (['cpuprofile'].includes(data.fileType)) {
          selectedTab = 'js_profiler';
        }
        if (['heapsnapshot', 'heapprofile'].includes(data.fileType)) {
          selectedTab = 'heap_profiler';
        }
        const query = `fileType=${data.fileType}&fileId=${data.fileId}&selectedTab=${selectedTab}&fileName=${data.fileName}`;
        const href = `/dashboard/devtools?${query}`;
        window.open(href, '_blank');
      }
    },
    changeFilter(value) {
      this.$router.push({
        path: this.$route.path,
        query: Object.assign({}, this.$route.query, { currentPage: 1, filterType: value })
      });
      this.getActivityList(1, value);
      this.currentPage = 1;
      this.selectedFilterType = value;
    },
    checkCreatingFile() {
      const files = this.files;
      if (files.some(file => file.status === 0 || file.transferring)) {
        clearTimeout(this.checkFileListTimer);
        this.checkFileListTimer = setTimeout(this.getActivityList.bind(this, 1, this.selectedFilterType, false), 1000);
      }
    },
    transfer(data, key) {
      const error = '转储文件失败，请重试！';
      this.$set(this.loadingObject, key, true);
      data.transferring = true;
      axios({
        method: 'POST',
        url: '/api/file_transfer',
        headers: {
          'x-csrf-token': common.getCsrfToken()
        },
        data: {
          fileId: data.fileId,
          fileType: data.fileType
        }
      }).then(data => {
        data = data.data;
        if (!data.ok) {
          common.error.call(this, data.message || `${error}`, data.code, 30);
        }
        this.$set(this.loadingObject, key, false);
        this.getActivityList(this.currentPage, this.selectedFilterType, false);
      }).catch(err => {
        common.error.call(this, `${error} ${err}`, err.code);
        this.$set(this.loadingObject, key, false);
        data.transferring = false;
      });
    },
    analytics(data, key) {
      const error = 'XNPP 分析文件失败，请重试！';
      this.$set(this.loadingObject, key, true);
      axios.get('/api/file_detail', { params: { fileId: data.fileId, fileType: data.fileType } })
        .then(data => {
          data = data.data;
          if (data.ok) {
            data = data.data;
            this.$emit('xnodeAnalytics', data);
            clearTimeout(this.checkFileListTimer);
          } else {
            common.error.call(this, data.message || `${error}`, data.code);
          }
          this.$set(this.loadingObject, key, false);
        })
        .catch(err => {
          common.error.call(this, `${error} ${err}`, err.code);
          this.$set(this.loadingObject, key, false);
        });
    }
  }
};
