<template>
  <div>
    <Modal style="border-radius:0px" v-model="showModal" width="560" closable>
      <p slot="header" style="color:white;">
        <Icon type="ios-information-circle"></Icon>
        <span>{{ title }}</span>
      </p>
      <div style="margin-top:25px;margin-bottom:15px;text-align:center" v-html="body"></div>
      <div slot="footer">
        <Button type="primary" ghost @click="cancel">取消</Button>
        <Button type="primary" :loading="loading" @click="confirm">确认</Button>
      </div>
    </Modal>
  </div>
</template>>

<script>
export default {
  props: ["show", "loading", "title", "body", "cancel", "confirm"],
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
  }
};
</script>
