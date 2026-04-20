<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { supabase } from "@/supabase";

export default {
  name: 'app',
  data() {
    return {
      offlineNotification: null
    };
  },
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
  },
  mounted() {
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
  },
  beforeDestroy() {
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
  },
  methods: {
    updateOnlineStatus() {
      const condition = navigator.onLine ? "online" : "offline";
      if (condition === "offline") {
        this.offlineNotification = this.$message.error({
          message: 'İnternet bağlantınız koptu. Lütfen bağlantınızı kontrol edin!',
          duration: 0,
        });
      } else {
        if (this.offlineNotification) {
          this.offlineNotification.close();
        }
        this.$message.success({
          message: 'Şu an çevrimiçisiniz!',
          duration: 3000,
        });
      }
    }
  }
}
</script>

<style lang="scss">
@import "../node_modules/@mdi/font/css/materialdesignicons.min.css";
@import "./assets/scss/style";
</style>
