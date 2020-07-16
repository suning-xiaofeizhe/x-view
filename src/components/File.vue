<style scoped>
.upload {
  margin-left: 20px;
  margin-top: -4px;
}
.alert {
  color: #ed4014;
}
.show-files {
  margin-left: 20px;
  margin-top: 10px;
  margin-right: 20px;
  margin-bottom: 20px;
}
.pagination {
  margin-right: 20px;
  margin-bottom: 20px;
  text-align: right;
}
.file-filter {
  margin-top: -10px;
  margin-right: 20px;
  margin-left: 20px;
  text-align: left;
  width: 150px;
}
</style>

<template>
  <div>
    <Row class="info-bar">
      <Col class="info-content">
        {{ appName }}
        > 性能文件
        <Button
          class="upload"
          type="primary"
          icon="md-cloud-upload"
          size="small"
          @click="showUploadModal"
        >上传文件</Button>
      </Col>
    </Row>
    <Row class="info-divider"></Row>
    <Row class="file-filter">
      <Select v-model="selectedFilterType" placeholder="请选择过滤类型" @on-change="changeFilter">
        <Option v-for="item in filterType" :key="item.value" :value="item.value">{{ item.label }}</Option>
      </Select>
    </Row>
    <Row class="show-files">
      <Table no-data-text="暂无文件" :columns="title" :data="files" :loading="filesLoading"></Table>
    </Row>
    <Row v-if="files.length" class="pagination">
      <Page
        :total="fileCount"
        :page-size="pageSize"
        :current="currentPage"
        size="small"
        show-elevator
        @on-change="changePage"
      />
    </Row>

    <!-- show upload modal -->
    <Modal style="border-radius:0px" v-model="showUploadActivityModal" width="500" closable>
      <p slot="header" style="color:white;">
        <Icon type="ios-information-circle"></Icon>
        <span>上传文件</span>
      </p>
      <div style="margin-top:15px;margin-bottom:15px;">
        <Row class="upload-file" type="flex" justify="center">
          <Col span="4" style="margin-top:7px;font-size:13px;">文件类型</Col>
          <Col span="12">
            <Select v-model="selectedType" placeholder="请选择文件类型">
              <Option
                v-for="item in activityType"
                :key="item.value"
                :value="item.value"
              >{{ item.label }}</Option>
            </Select>
          </Col>
        </Row>
        <br />
        <!-- upload normal activity -->
        <Row v-if="selectedType !== 'core'" type="flex" justify="center">
          <Col span="4" style="margin-top:7px;font-size:13px;">选择文件</Col>
          <Col span="6">
            <Upload :before-upload="handleUpload" action>
              <Button type="primary" icon="md-cloud-upload">选择文件</Button>
            </Upload>
          </Col>
          <Col span="6" style="margin-top:7px;" v-html="fileName" />
        </Row>
        <!-- upload core file -->
        <div v-if="selectedType === 'core'">
          <Row type="flex" justify="center">
            <Col span="4" style="margin-top:7px;font-size:13px;">核心转储</Col>
            <Col span="6">
              <Upload :before-upload="handleCoreFileUpload" action>
                <Button type="primary" icon="md-cloud-upload">选择文件</Button>
              </Upload>
            </Col>
            <Col span="6" style="margin-top:7px;" v-html="coreFileName" />
          </Row>
          <Row style="margin-top:10px" type="flex" justify="center">
            <Col span="4" style="margin-top:7px;font-size:13px;">执行文件</Col>
            <Col span="6">
              <Upload :before-upload="handleExecutableFileUpload" action>
                <Button type="primary" icon="md-cloud-upload">选择文件</Button>
              </Upload>
            </Col>
            <Col span="6" style="margin-top:7px;" v-html="executableFileName" />
          </Row>
        </div>
      </div>
      <div slot="footer">
        <Button type="primary" ghost @click="cancelUpload">取消</Button>
        <Button
          v-if="selectedType !== 'core'"
          type="primary"
          :loading="uploading"
          @click="submitUploadActivity"
        >上传</Button>
        <Button
          v-if="selectedType === 'core'"
          type="primary"
          :loading="coreUploading"
          @click="submitUploadCoredump"
        >上传</Button>
      </div>
    </Modal>

    <!-- show deletion confirm modal -->
    <x-normal-modal
      :show="showDeletionModal"
      :loading="false"
      title="删除文件"
      :body="`确定删除文件 <span style='font-weight:bold'>${deleteData && (deleteData.file || deleteData.coreFile)}</span>?`"
      :cancel="function() { showDeletionModal = false; }"
      :confirm="submitDeletion"
      @modalStatusChanged="updateDeletion"
    ></x-normal-modal>
  </div>
</template>

<script>
import file from "../javascript/file";
import normalModal from "./common/NormalModal";
const fileModule = Object.assign(
  {
    data() {
      return {
        appId: "",
        showUploadActivityModal: false,
        selectedType: "",
        activityType: [
          { value: "cpuprofile", label: "CPU 采样" },
          { value: "heapprofile", label: "Heap 采样" },
          { value: "gclog", label: "GC 追踪" },
          { value: "heapsnapshot", label: "堆快照" },
          { value: "diag", label: "诊断报告" },
          { value: "core", label: "核心转储" },
          { value: "trend", label: "进程趋势" }
        ],
        fileName: "未选择文件",
        file: null,
        uploading: false,
        coreFileName: "未选择文件",
        coreFile: null,
        executableFileName: "未选择文件",
        executableFile: null,
        coreUploading: false,
        fileCount: 0,
        pageSize: 10,
        currentPage: 1,
        filesLoading: false,
        title: [
          {
            title: "类型",
            key: "fileType",
            align: "center",
            width: 150,
            render: (h, params) => {
              let icon = "";
              let title = "";
              let size = "35px";
              switch (params.row.fileType) {
                case "cpuprofile":
                  icon = "ios-bookmarks";
                  title = "CPU 采样";
                  size = "30px";
                  break;
                case "heapprofile":
                  icon = "md-camera";
                  title = "Heap 采样";
                  size = "30px";
                  break;
                case "gclog":
                  icon = "ios-speedometer";
                  title = "GC 追踪";
                  break;
                case "heapsnapshot":
                  icon = "ios-folder-open";
                  title = "堆快照";
                  size = "30px";
                  break;
                case "diag":
                  icon = "md-medkit";
                  title = "诊断报告";
                  size = "30px";
                  break;
                case "core":
                  icon = "ios-print";
                  title = "核心转储";
                  break;
                case "trend":
                  icon = "logo-chrome";
                  title = "进程趋势";
                  size = "30px";
                  break;
                default:
                  break;
              }
              return [
                h(
                  "Row",
                  { style: { marginTop: "12px", marginBottom: "10px" } },
                  [
                    h("Icon", {
                      props: { type: icon },
                      style: {
                        fontSize: size,
                        color: "#2d8cf0",
                        marginBottom: "5px"
                      }
                    }),
                    h("div", title)
                  ]
                )
              ];
            }
          },
          {
            title: "文件",
            key: "fileType",
            width: 450,
            render: (h, params) => {
              // file title
              const file = title => {
                return h(
                  "div",
                  { style: { fontWeight: "bold", fontSize: "14px" } },
                  title
                );
              };
              let fileTitle;
              if (params.row.fileType === "core") {
                fileTitle = file(params.row.coreFile);
              } else {
                fileTitle = file(params.row.file);
              }

              // creat info
              let createInfo;
              if (params.row.fileType === "core") {
                if (params.row.executableStatus === 0) {
                  createInfo = [
                    h(
                      "a",
                      {
                        attrs: {
                          href: `/file/download?fileType=executable&fileId=${params.row.fileId}`
                        }
                      },
                      "可执行文件"
                    ),
                    h("span", " 由 "),
                    h(
                      "span",
                      { style: { fontWeight: "bold" } },
                      params.row.name
                    ),
                    h("span", " ["),
                    h("span", params.row.workId),
                    h("span", "]")
                  ];
                } else {
                  createInfo = [
                    h(
                      "a",
                      { attrs: { href: "javscript:;" } },
                      params.row.executableFile
                    ),
                    h("span", " 由 "),
                    h("span", { style: { fontWeight: "bold" } }, "操作系统")
                  ];
                }
              } else {
                createInfo = [
                  h("span", "由 "),
                  h("span", { style: { fontWeight: "bold" } }, params.row.name),
                  h("span", " ["),
                  h("span", params.row.workId),
                  h("span", "]")
                ];
              }

              return [
                h(
                  "Row",
                  { style: { marginTop: "13px", marginBottom: "10px" } },
                  [
                    fileTitle,
                    h("div", { style: { marginTop: "3px" } }, createInfo),
                    h("div", [
                      h("span", "于 "),
                      h(
                        "span",
                        { style: { fontWeight: "bold" } },
                        params.row.time
                      ),
                      h("span", " 创建在实例 "),
                      h(
                        "span",
                        { style: { fontWeight: "bold" } },
                        params.row.agent
                      )
                    ])
                  ]
                )
              ];
            }
          },
          {
            title: "操作",
            // width: 550,
            key: "fileType",
            render: (h, params) => {
              const create = (type, icon, title, disabled) => {
                const colors = {
                  success: "#19be6b",
                  primary: "#2d8cf0",
                  disabled: "#c5c8ce",
                  warning: "#ff9900"
                };
                const titleColor = disabled ? colors.disabled : colors[type];
                const key = `${params.row.fileType}::${params.row.fileId}::${title}`;
                const loading = this.loadingObject[key];
                return h(
                  // "Col",
                  // { props: { span: 2 }, style: { textAlign: "center" } },
                  "div",
                  { style: { textAlign: "center", width: "50px" } },
                  [
                    h("Button", {
                      props: {
                        type,
                        shape: "circle",
                        icon,
                        disabled,
                        loading
                      },
                      style: {
                        width: "30px",
                        height: "30px",
                        // marginLeft: "3px",
                        marginTop: "3px"
                      },
                      on: {
                        click: this.handleFileEvent.bind(
                          this,
                          params.row,
                          title
                        )
                      }
                    }),
                    h(
                      "div",
                      { style: { marginTop: "5px", color: titleColor } },
                      title
                    )
                  ]
                );
              };

              const line = type => {
                const colors = {
                  success: "#19be6b",
                  primary: "#2d8cf0",
                  disabled: "#c5c8ce",
                  warning: "#ff9900"
                };
                return h(
                  "div",
                  { style: { marginTop: "9px", color: colors[type] } },
                  "——"
                );
              };

              const devtools = ["cpuprofile", "heapprofile", "heapsnapshot"];
              const xnode = [
                // "cpuprofile",
                "gclog",
                // "heapsnapshot",
                "diag"
                // "core"
              ];

              let list = [];
              if (
                params.row.agent === "console" ||
                params.row.fileType === "trend"
              ) {
                list = [
                  create("success", "ios-clipboard", "已生成"),
                  line("primary")
                ];
                if (xnode.includes(params.row.fileType)) {
                  list.push(create("primary", "md-search", "X分析"));
                  list.push(line("primary"));
                }
                if (devtools.includes(params.row.fileType)) {
                  list.push(create("primary", "md-search", "devtool"));
                  list.push(line("primary"));
                }
                list.push(create("primary", "md-cloud-download", "下载"));
                if (params.row.favor === 1) {
                  list.push(line("warning"));
                  list.push(create("warning", "md-star", "已收藏"));
                } else {
                  list.push(line("default"));
                  list.push(create("default", "md-star", "收藏"));
                }
              } else {
                if (params.row.status === 0) {
                  const key = `${params.row.fileType}::${params.row.fileId}::生成中`;
                  this.loadingObject[key] = true;
                  list = [
                    create("success", "ios-clipboard", "生成中", true),
                    line("disabled"),
                    create("success", "md-cloud-upload", "转储", true),
                    line("disabled")
                  ];
                  if (xnode.includes(params.row.fileType)) {
                    list.push(create("primary", "md-search", "X分析", true));
                    list.push(line("disabled"));
                  }
                  if (devtools.includes(params.row.fileType)) {
                    list.push(create("primary", "md-search", "devtool", true));
                    list.push(line("disabled"));
                  }
                  list.push(
                    create("primary", "md-cloud-download", "下载", true)
                  );
                  list.push(line("disabled"));
                  list.push(create("default", "md-star", "收藏", true));
                }
                if (params.row.status === 1) {
                  list = [
                    create("success", "ios-clipboard", "已生成"),
                    line("success")
                  ];
                  if (params.row.transferring) {
                    const key = `${params.row.fileType}::${params.row.fileId}::转储中`;
                    this.loadingObject[key] = true;
                    list.push(create("success", "md-cloud-upload", "转储中"));
                    list.push(line("disabled"));
                  } else {
                    list.push(create("success", "md-cloud-upload", "转储"));
                    list.push(line("disabled"));
                  }
                  if (xnode.includes(params.row.fileType)) {
                    list.push(create("primary", "md-search", "X分析", true));
                    list.push(line("disabled"));
                  }
                  if (devtools.includes(params.row.fileType)) {
                    list.push(create("primary", "md-search", "devtool", true));
                    list.push(line("disabled"));
                  }
                  list.push(
                    create("primary", "md-cloud-download", "下载", true)
                  );
                  list.push(line("disabled"));
                  list.push(create("default", "md-star", "收藏", true));
                }
                if (params.row.status === 2) {
                  list = [
                    create("success", "ios-clipboard", "已生成"),
                    line("success"),
                    create("success", "md-cloud-upload", "再转储"),
                    line("primary")
                  ];
                  if (xnode.includes(params.row.fileType)) {
                    list.push(create("primary", "md-search", "X分析"));
                    list.push(line("primary"));
                  }
                  if (devtools.includes(params.row.fileType)) {
                    list.push(create("primary", "md-search", "devtool"));
                    list.push(line("primary"));
                  }
                  list.push(create("primary", "md-cloud-download", "下载"));
                  if (params.row.favor === 1) {
                    list.push(line("warning"));
                    list.push(create("warning", "md-star", "已收藏"));
                  } else {
                    list.push(line("default"));
                    list.push(create("default", "md-star", "收藏"));
                  }
                }
              }
              return [
                // h("Row", { props: { type: "flex", justify: "start" } }, list)
                h("div", { style: { display: "flex" } }, list)
              ];
            }
          },
          // {
          //   title: "记录",
          //   key: "fileType",
          //   render: (h, params) => {
          //     return [];
          //   }
          // },
          {
            title: "删除",
            key: "fileType",
            align: "center",
            width: 150,
            render: (h, params) => {
              const key = `${params.row.fileType}::${params.row.fileId}::删除`;
              const loading = this.loadingObject[key];
              return [
                h("Row", [
                  h("Col", { style: { textAlign: "center" } }, [
                    h("Button", {
                      props: {
                        type: "error",
                        shape: "circle",
                        icon: "md-trash",
                        loading
                      },
                      style: {
                        width: "30px",
                        height: "30px",
                        marginTop: "3px"
                      },
                      on: {
                        click: this.handleFileEvent.bind(
                          this,
                          params.row,
                          "删除"
                        )
                      }
                    }),
                    h("div", { style: { marginTop: "5px" } }, "删除")
                  ])
                ])
              ];
            }
          }
        ],
        files: [],
        loadingObject: {},
        deleteLoadingKey: "",
        deleteData: null,
        showDeletionModal: false,
        selectedFilterType: "all",
        filterType: [
          { value: "all", label: "全部" },
          { value: "cpuprofile", label: "CPU 采样" },
          { value: "heapprofile", label: "Heap 采样" },
          { value: "gclog", label: "GC 追踪" },
          { value: "heapsnapshot", label: "堆快照" },
          { value: "diag", label: "诊断报告" },
          { value: "core", label: "核心转储" },
          { value: "trend", label: "进程趋势" },
          { value: "favor", label: "收藏" }
        ],
        checkFileListTimer: null
      };
    },
    props: ["appName"],
    components: {
      "x-normal-modal": normalModal
    },
    created() {
      this.appId = this.$route.params.appId;
      this.currentPage = Number(this.$route.query.currentPage) || 1;
      this.selectedFilterType = this.$route.query.filterType || "all";
      this.getActivityList(this.currentPage, this.selectedFilterType);
    },
    beforeDestroy() {
      this.checkFileListTimer && clearTimeout(this.checkFileListTimer);
    }
  },
  file
);
export default fileModule;
</script>
