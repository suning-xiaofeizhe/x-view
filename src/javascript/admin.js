'use strict';

import axios from "axios";

export default {
  fetchData() {
    axios.get("/api/admin/summary").then(response => {
      for (let name in response.data.data) {
        this[name] = response.data.data[name];
      }
    });
  }
};
