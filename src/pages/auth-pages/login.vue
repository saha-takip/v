<template>
  <section class="login">
    <div class="container-scroller">
      <div class="container-fluid page-body-wrapper full-page-wrapper">
        <div class="content-wrapper d-flex align-items-center auth">
          <div class="row w-100 flex-grow">
            <div class="col-sm-6 col-md-6 col-lg-5 col-xl-4 mx-auto">
              <div class="auth-form-light text-center p-5">
                <div class="brand-logo">
                  <img
                    :src="
                      $storeState.tenant.logo_url ||
                      require('@/assets/images/default-logo.jpg')
                    "
                    alt="logo"
                  />
                </div>
                <h4>Saha Takip Programı <sup>®</sup></h4>
                <form class="pt-3" @submit.prevent="login">
                  <div class="form-group">
                    <el-input
                      type="email"
                      v-model="formData.email"
                      id="exampleInputEmail1"
                      placeholder="E-posta Adresi"
                    />
                  </div>
                  <div class="form-group">
                    <el-input
                      type="password"
                      v-model="formData.password"
                      id="exampleInputPassword1"
                      placeholder="Şifre"
                      show-password
                    />
                  </div>
                  <div class="mt-3">
                    <el-button
                      class="login-button"
                      type="success"
                      size="large"
                      :loading="loading"
                      @click="login"
                      >Giriş Yap
                    </el-button>
                  </div>
                  <div
                    class="my-2 d-flex justify-content-end align-items-center"
                  >
                    <a
                      href="javascript:void(0);"
                      class="auth-link text-black"
                      @click="forgotPassword"
                      >Şifremi Unuttum</a
                    >
                  </div>
                  <div class="text-center mt-4 font-weight-light d-none">
                    Don't have an account?
                    <router-link to="/auth-pages/register" class="text-primary"
                      >Create</router-link
                    >
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <!-- content-wrapper ends -->
      </div>
      <!-- page-body-wrapper ends -->
    </div>
    <div class="version-info">Tüm Hakları Saklıdır. &copy; 2025 | version 1.0.0</div>
  </section>
</template>

<script>
import { supabase } from "@/supabase";

export default {
  name: "login",
  data() {
    return {
      formData: {
        email: "",
        password: "",
      },
      loading: false,
    };
  },
  methods: {
    async login() {
      if (!this.formData.email || !this.formData.password) {
        this.$notify.error({
          title: "Hata",
          message: "Lütfen tüm alanları doldurun!",
        });
        return;
      }

      this.loading = true;
      try {
        const { data, error } = await supabase.auth.signIn({
          email: this.formData.email,
          password: this.formData.password,
        });

        if (error) throw error;

        const user = data.user;

        // Fetch user profile and tenant branding immediately
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*, tenants (*)")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        // Save profile and tenant_id to localStorage
        localStorage.setItem("userProfile", JSON.stringify(profile));
        localStorage.setItem("tenant_id", profile.tenant_id);
        localStorage.setItem("last_login_email", this.formData.email);

        // Update global store immediately
        this.$storeMutations.setUserProfile(profile);
        if (profile.tenants) {
          this.$storeMutations.setTenant(profile.tenants);
        }

        this.$router.push({ name: "dashboard" });
      } catch (error) {
        this.$notify.error({
          title: "Giriş Başarısız",
          message: "Bilgilerinizi kontrol edin!",
        });
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async forgotPassword() {
      this.$router.push({ name: "forgot-password" });
    },
  },
  mounted() {
    const savedEmail = localStorage.getItem("last_login_email");
    if (savedEmail) {
      this.formData.email = savedEmail;
    }
  },
};
</script>

<style scoped>
.version-info {
  position: fixed;
  right: 15px;
  bottom: 10px;
  font-size: 12px;
  color: #adb5bd;
  z-index: 999;
  pointer-events: none;
}
@media (max-width: 991px) {
  .version-info {
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    text-align: center;
  }
}
</style>
