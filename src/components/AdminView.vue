<template>
  <div class="layout">
    <x-header ref="xheader" active-name="adminView"></x-header>
    <Layout class="content">
      <Content ref="xbody" :style="{background: '#fff',padding: '20px'}">
        <Tabs>
          <TabPane label="全局告警规则">
            <x-alarm style="margin-bottom: 100px;" app-name="全局告警" :global-rule="true"></x-alarm>
          </TabPane>
          <TabPane label="统计">
            <i-circle
              :size="200"
              :trail-width="4"
              :stroke-width="5"
              :percent="100"
              stroke-linecap="square"
              stroke-color="#43a3fb"
            >
              <div class="demo-Circle-custom">
                <h1>{{appCount}}</h1>
                <p>接入应用总数</p>
              </div>
            </i-circle>
            <i-circle
              :size="200"
              :trail-width="4"
              :stroke-width="5"
              :percent="100"
              stroke-linecap="square"
              stroke-color="#43a3fb"
            >
              <div class="demo-Circle-custom">
                <h1>{{instanceCount}}</h1>
                <p>连接实例总数</p>
              </div>
            </i-circle>
            <i-circle
              :size="200"
              :trail-width="4"
              :stroke-width="5"
              :percent="100"
              stroke-linecap="square"
              stroke-color="#43a3fb"
            >
              <div class="demo-Circle-custom">
                <h1>{{userCount}}</h1>
                <p>用户总数</p>
              </div>
            </i-circle>
          </TabPane>
          <TabPane label="应用">
            <Table :data="apps" :columns="appColumns"></Table>
          </TabPane>
          <TabPane label="用户">
            <List>
              <ListItem v-for="user in users" :key="user.id">
                <ListItemMeta :title="user.user_name" :description="user.work_id"></ListItemMeta>
                {{user.apps.join(",")}}
              </ListItem>
            </List>
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  </div>
</template>

<script>
import header from "./Header";
import methods from "../javascript/admin";
import alarm from "./Alarm";
export default {
  components: {
    "x-header": header,
    "x-alarm": alarm
  },
  data() {
    return {
      appCount: 0,
      instanceCount: 0,
      userCount: 0,
      apps: [],
      users: [],
      appColumns: [
        {
          title: "名称",
          key: "name"
        },
        {
          title: "创建时间",
          key: "gm_create"
        },
        {
          title: "拥有者",
          key: "owner"
        },
        {
          title: "实例数",
          key: "count"
        },
        {
          title: "成员",
          key: "members",
          render(h, { row }) {
            return h("div", row.members.length.toString());
          }
        }
      ]
    };
  },
  mounted() {
    this.fetchData();
  },
  methods
};
</script>
<style lang="less" scoped>
.content {
  text-align: left;
  padding: 20px;
}
.demo-Circle-custom {
  & h1 {
    color: #3f414d;
    font-size: 28px;
    font-weight: normal;
  }
  & p {
    color: #657180;
    font-size: 14px;
    margin: 10px 0 15px;
  }
  & span {
    display: block;
    padding-top: 15px;
    color: #657180;
    font-size: 14px;
    &:before {
      content: "";
      display: block;
      width: 50px;
      height: 1px;
      margin: 0 auto;
      background: #e0e3e6;
      position: relative;
      top: -15px;
    }
  }
  & span i {
    font-style: normal;
    color: #3f414d;
  }
}
</style>
