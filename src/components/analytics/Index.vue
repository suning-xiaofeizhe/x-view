<template>
  <div>
    <x-diag v-if="fileType === 'diag'" :data="data"></x-diag>
    <x-gc-trace v-if="fileType === 'gclog'" :data="data"></x-gc-trace>
  </div>
</template>

<script>
import diag from "./Diag";
import gcTrace from "./GcTrace";

export default {
  props: ["data"],
  components: {
    "x-diag": diag,
    "x-gc-trace": gcTrace
  },
  computed: {
    fileType() {
      const data = this.data || {};
      return data.fileType || "";
    }
  }
};
</script>
