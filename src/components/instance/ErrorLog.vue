<style scoped>
.content {
  margin-right: 20px;
  margin-left: 20px;
}

.file-filter {
  text-align: left;
  width: 200px;
}

.error-logs {
  margin-top: 15px;
}

.error-content {
  padding-top: 10px;
  padding-bottom: 10px;
}

.error-pagination {
  margin-top: 15px;
  padding-bottom: 15px;
  text-align: right;
}
</style>

<template>
  <div class="content">
    <Row>
      <!-- get error log files -->
      <Col v-if="fileLoading">
        <Row type="flex" justify="center" style="margin-top:200px;">
          <Col span="1">
            <Spin size="large"></Spin>
          </Col>
        </Row>
      </Col>

      <!-- no error log files -->
      <Col v-if="!fileLoading && errorLogFiles.length === 0">
        <Row class="dashboard-message-tip">
          <Icon type="ios-information-circle-outline" />
          <span>项目下暂无错误日志信息，请查看您的 xagent 是否正确配置了 error_log 错误日志文件路径数组</span>
        </Row>
      </Col>

      <!-- show error logs -->
      <Col v-if="!fileLoading && errorLogFiles.length !== 0">
        <!-- error log files -->
        <Row class="file-filter">
          <Select v-model="selectErrorLog" placeholder="请选择错误日志" @on-change="changeErrorLog">
            <Option
              v-for="item in errorLogFiles"
              :key="item.value"
              :value="item.value"
            >{{ item.label }}</Option>
          </Select>
        </Row>

        <!-- error log content -->
        <Row class="error-logs">
          <Table
            border
            disabled-hover
            stripe
            :loading="loading"
            :columns="errorLogTableColumns"
            :data="errorLogTableContent"
            no-data-text="暂无错误日志信息"
          >
            <template slot-scope="{ row }" slot="time">
              <div>
                <p>
                  <code>{{ row.date}}</code>
                </p>
                <p style="margin-top:5px;">
                  <code>{{ row.time}}</code>
                </p>
              </div>
            </template>
            <template slot-scope="{ row }" slot="type">
              <div>
                <code>{{ row.type}}</code>
              </div>
            </template>
            <template slot-scope="{ row }" slot="error">
              <div class="error-content">
                <p v-for="(line, index) in row.stack" :key="index">
                  <code v-if="index === 0">{{ line }}</code>
                  <code v-else style="margin-left: 15px;">{{ line }}</code>
                </p>
                <div v-if="row.extra.length">
                  <br />
                  <p v-for="(line, index) in row.extra" :key="index">
                    <code>{{ line }}</code>
                  </p>
                </div>
              </div>
            </template>
          </Table>
        </Row>

        <Row v-if="errorLogTableContent.length" class="error-pagination">
          <Page
            :total="errorLogLength"
            :page-size="pageSize"
            :current="currentPage"
            size="small"
            show-elevator
            @on-change="changePage"
          />
        </Row>
      </Col>
    </Row>
  </div>
</template>

<script>
import errorLog from "../../javascript/instance/errorLog";

const processModule = Object.assign(
  {
    props: ["appId", "agentId"],
    data() {
      return {
        fileLoading: false,
        loading: false,
        selectErrorLog: "",
        pageSize: 20,
        currentPage: 1,
        errorLogLength: 0,
        errorLogFiles: [],
        errorLogTableColumns: [
          {
            title: "上报时间",
            slot: "time",
            width: 120,
            align: "center"
          },
          {
            title: "错误类型",
            slot: "type",
            width: 150,
            align: "center"
          },
          {
            title: "详细错误内容",
            slot: "error"
          }
        ],
        errorLogTableContent: []
      };
    }
  },
  errorLog
);
export default processModule;
</script>
