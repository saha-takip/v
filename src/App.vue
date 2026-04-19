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
@import "./assets/scss/style";
</style>
