<style scoped>
.spin {
  margin-top: 200px;
}
.error {
  text-align: center;
  margin-top: 150px;
}
</style>

<template>
  <div>
    <Drawer :title="title" :closable="false" v-model="status" :width="width">
      <Row type="flex" justify="center">
        <Col v-if="loading" span="1">
          <Spin class="spin"></Spin>
        </Col>
        <Col v-if="!loading" span="24">
          <Col v-if="error" class="error">
            <span>{{ error }}</span>
          </Col>
          <Table v-if="!error" :columns="columns" :data="list">
            <template slot-scope="{ row }" slot="pid">
              <strong>{{ row.pid }}</strong>
            </template>
            <template slot-scope="{ row }" slot="command">
              <span>{{ row.command }}</span>
            </template>
            <template slot-scope="{ row }" slot="action">
              <Button
                type="primary"
                size="small"
                style="margin-right: 5px"
                @click="checkProcess(row)"
              >检查进程</Button>
            </template>
          </Table>
        </Col>
      </Row>
    </Drawer>
  </div>
</template>

<script>
import processList from "../../../javascript/instance/process/processList";

const processListModule = Object.assign(
  {
    data() {
      return {
        status: false,
        columns: [
          {
            title: "PID",
            slot: "pid",
            width: 70
          },
          {
            title: "命令",
            slot: "command"
          },
          {
            title: "操作",
            slot: "action",
            width: 150
          }
        ],
        data: {},
        loading: false,
        error: ""
      };
    },
    props: {
      open: Boolean,
      width: Number,
      agentId: String,
      getAgentProcesses: Function
    }
  },
  processList
);

export default processListModule;
</script>
