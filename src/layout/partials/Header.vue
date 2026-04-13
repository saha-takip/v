<template>
  <b-navbar
    id="template-header"
    class="navbar default-layout-navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row"
    toggleable="lg"
  >
    <div
      class="text-center navbar-brand-wrapper d-flex align-items-top justify-content-center"
    >
      <router-link class="navbar-brand brand-logo" to="/">
        <img src="@/assets/images/logo.png" alt="logo" />
      </router-link>
      <router-link class="navbar-brand brand-logo-mini" to="/">
        <img src="@/assets/images/mini-logo.png" alt="logo" />
      </router-link>
    </div>
    <div class="navbar-menu-wrapper d-flex align-items-center ml-auto ml-lg-0">
      <button
        class="navbar-toggler navbar-toggler align-self-center d-lg-block"
        type="button"
        @click="toggleSidebar()"
      >
        <span class="mdi mdi-menu"></span>
      </button>
      <div class="search-field d-none d-md-block">
        <form action="#">
          <div class="d-flex align-items-center input-group">
            <div class="input-group-prepend bg-transparent">
              <i class="input-group-text border-0 mdi mdi-magnify"></i>
            </div>
            <input
              type="text"
              class="form-control bg-transparent"
              style="width: 250px"
              placeholder="Ne yapmak istiyorsunuz?"
            />
          </div>
        </form>
      </div>
      <b-navbar-nav class="navbar-nav-right ml-auto">
        <b-nav-item class="nav-profile d-none d-lg-flex" v-if="profile">
          <div class="d-flex align-items-center">
            <div class="nav-profile-img" v-if="profile.avatar_url">
              <img
                :src="profile.avatar_url"
                alt="image"
                style="
                  width: 32px;
                  height: 32px;
                  border-radius: 50%;
                  object-fit: cover;
                "
              />
            </div>
            <div class="nav-profile-text ml-2">
              <p class="mb-0 text-black font-weight-bold">
                {{ profile.full_name }}
              </p>
            </div>
          </div>
        </b-nav-item>
        <b-nav-item
          class="nav-logout d-none d-lg-flex ml-3"
          @click="logout"
          style="border-left: 1px solid #ebedf2; padding-left: 15px"
        >
          <i class="mdi mdi-power mr-2 text-danger"></i>
          <span class="font-weight-bold text-danger">Çıkış Yap</span>
        </b-nav-item>
      </b-navbar-nav>
      <button
        class="navbar-toggler navbar-toggler-right align-self-center"
        type="button"
        @click="toggleMobileSidebar()"
      >
        <span class="mdi mdi-menu"></span>
      </button>
    </div>
  </b-navbar>
</template>

<script>
import { supabase } from "@/supabase";

export default {
  name: "app-header",
  data() {
    return {
      profile: null,
    };
  },
  mounted() {
    const profileData = localStorage.getItem("userProfile");
    if (profileData) {
      try {
        this.profile = JSON.parse(profileData);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Profile parsing error", e);
      }
    }
  },
  methods: {
    toggleSidebar: () => {
      document.querySelector("body").classList.toggle("sidebar-icon-only");
    },
    toggleMobileSidebar: () => {
      document.querySelector("#sidebar").classList.toggle("active");
    },
    async logout(event) {
      event.preventDefault();
      await supabase.auth.signOut();
      localStorage.removeItem("userProfile");
      localStorage.removeItem("tenant_id");
      this.$router.push({ name: "login" });
    },
  },
};
</script>

<style scoped>
</style>