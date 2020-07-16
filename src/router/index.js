import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Console from '@/components/Console';
import Detail from '@/components/Detail';
import AdminView from "@/components/AdminView";
Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      // redirect: { path: '/console', query: { type: 'myApps' } }
      name: 'Home',
      component: Home

    },
    {
      path: '/console',
      name: 'Console',
      component: Console
    },
    {
      path: "/admin",
      name: "admin",
      component: AdminView
    },
    {
      path: '/app/:appId/:operation/:agentId?',
      name: 'Detail',
      component: Detail
    }
  ]
});
