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
        <img :src="$storeState.tenant.logo_url || require('@/assets/images/logo.png')" alt="logo" />
      </router-link>
      <router-link class="navbar-brand brand-logo-mini" to="/">
        <img :src="$storeState.tenant.icon_url || require('@/assets/images/mini-logo.png')" alt="logo" />
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
        <div class="header-search">
          <el-autocomplete
            v-model="searchQuery"
            :fetch-suggestions="querySearch"
            placeholder="Ne yapmak istiyorsunuz?"
            @select="handleSelect"
            prefix-icon="el-icon-search"
            class="search-autocomplete"
            style="width: 150%"
            popper-class="search-autocomplete-popper"
            select-when-unmatched
            clearable
          >
            <template slot-scope="{ item }">
              <div
                class="name font-weight-bold"
                style="line-height: normal; margin-top: 5px"
              >
                {{ item.title }}
              </div>
              <span
                class="desc text-muted"
                style="font-size: 11px; line-height: normal"
                >{{ item.keywords }}</span
              >
            </template>
          </el-autocomplete>
        </div>
      </div>
      <b-navbar-nav class="navbar-nav-right ml-auto">
        <b-nav-item class="nav-profile d-none d-lg-flex" v-if="$storeState.userProfile.id">
          <div class="d-flex align-items-center">
            <div class="nav-profile-img" v-if="$storeState.userProfile.avatar_url">
              <img
                :src="$storeState.userProfile.avatar_url"
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
                {{ $storeState.userProfile.full_name }}
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
import { SEARCH_ITEMS } from "@/util/constants";

export default {
  name: "app-header",
  data() {
    return {
      searchQuery: "",
      searchLinks: SEARCH_ITEMS,
    };
  },
  mounted() {
  },
  methods: {
    querySearch(queryString, cb) {
      let links = this.searchLinks;
      let results = queryString
        ? links.filter(this.createFilter(queryString))
        : links;

      let formattedResults = results.map((item) => {
        return { ...item, value: item.title };
      });
      cb(formattedResults);
    },
    createFilter(queryString) {
      return (link) => {
        return (
          link.keywords.toLowerCase().includes(queryString.toLowerCase()) ||
          link.title.toLowerCase().includes(queryString.toLowerCase())
        );
      };
    },
    handleSelect(item) {
      if (!item.link) return;
      if (this.$route.path !== item.link) {
        this.$router.push({ path: item.link });
      }
      this.searchQuery = "";
    },
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