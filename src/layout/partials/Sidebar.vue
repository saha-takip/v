<template>
  <section class="app-sidebar">
    <nav class="sidebar sidebar-offcanvas" id="sidebar">
      <ul class="nav">
        <li class="nav-item">
          <router-link class="nav-link" to="/" exact>
            <i class="mdi mdi-home menu-icon"></i>
            <span class="menu-title">Anasayfa</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/musteriler" exact>
            <i class="mdi mdi-account-multiple menu-icon"></i>
            <span class="menu-title">Müşteriler</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/bolge-yonetimi" exact>
            <i class="mdi mdi-routes menu-icon"></i>
            <span class="menu-title">Bölge Yönetimi</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/profil-bilgileri" exact>
            <i class="mdi mdi-account-card-details menu-icon"></i>
            <span class="menu-title">Profil Bilgileri</span>
          </router-link>
        </li>

        <li class="nav-item d-lg-none">
          <a
            class="nav-link text-danger logout-btn"
            href="javascript:void(0);"
            @click="logout"
          >
            <i class="mdi mdi-power menu-icon"></i>
            <span class="menu-title">Çıkış Yap</span>
          </a>
        </li>
      </ul>
    </nav>
  </section>
</template>

<script>
import { supabase } from "@/supabase";

export default {
  name: "sidebar",
  data() {
    return {
      collapses: [{ show: false }, { show: false }, { show: false }],
    };
  },
  methods: {
    collapseAll() {
      var exp_elm = document.getElementsByClassName("show");
      if (exp_elm.length > 0) {
        var elm_id = exp_elm[0].id;
        this.$root.$emit("bv::toggle::collapse", elm_id);
      }
    },
    async logout() {
      await supabase.auth.signOut();
      localStorage.removeItem("userProfile");
      localStorage.removeItem("supabase.auth.token");
      localStorage.removeItem("tenant_id");

      // Store'u da sıfırlayalım (global mutate mixin üzerinden erişilebilir)
      if (this.$storeMutations) {
        this.$storeMutations.setUserProfile({
          id: null,
          full_name: "",
          avatar_url: null,
          role: "",
        });
      }

      this.$router.push({ name: "login" });
    },
  },
  mounted() {
    const body = document.querySelector("body");
    // add class 'hover-open' to sidebar navitem while hover in sidebar-icon-only menu
    document.querySelectorAll(".sidebar .nav-item").forEach(function (el) {
      el.addEventListener("mouseover", function () {
        if (body.classList.contains("sidebar-icon-only")) {
          el.classList.add("hover-open");
        }
      });
      el.addEventListener("mouseout", function () {
        if (body.classList.contains("sidebar-icon-only")) {
          el.classList.remove("hover-open");
        }
      });
    });
  },
  watch: {
    $route() {
      document.querySelector("#sidebar").classList.toggle("active");
    },
  },
};
</script>