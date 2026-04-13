<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { supabase } from "@/supabase";

export default {
  name: 'app',
  async created() {
    const tenant_id = localStorage.getItem('tenant_id');
    const profileStr = localStorage.getItem('userProfile');
    
    if (profileStr) {
      try {
        const profileData = JSON.parse(profileStr);
        this.$storeMutations.setUserProfile(profileData);
      } catch (e) {
        console.error("Profile parsing error", e);
      }
    }

    if (tenant_id) {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenant_id)
        .single();
        
      if (!error && data) {
        this.$storeMutations.setTenant(data);
      }
    }
  }
}
</script>

<style lang="scss">
@import "../node_modules/@mdi/font/css/materialdesignicons.min.css";
@import "../node_modules/flag-icon-css/css/flag-icon.min.css";
@import "../node_modules/font-awesome/css/font-awesome.min.css";
@import "../node_modules/simple-line-icons/css/simple-line-icons.css";
@import "../node_modules/ti-icons/css/themify-icons.css";
@import "../node_modules/sweetalert2/dist/sweetalert2.min.css";
@import "../node_modules/vue-snotify/styles/material.css";
@import "../node_modules/codemirror/lib/codemirror.css";
@import "../node_modules/fullcalendar/dist/fullcalendar.css";
@import "../node_modules/c3/c3.min.css";
@import "../node_modules/chartist/dist/chartist.min.css";
@import "./assets/scss/style";
</style>
