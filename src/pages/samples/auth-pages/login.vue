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
                <h4>Satış Takip Programı <sup>®</sup></h4>
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
                    class="my-2 d-none justify-content-between align-items-center"
                  >
                    <div class="form-check">
                      <label class="form-check-label text-muted">
                        <input type="checkbox" class="form-check-input" />
                        Keep me signed in
                        <i class="input-helper"></i>
                      </label>
                    </div>
                    <a
                      href="javascript:void(0);"
                      class="auth-link text-black d-none"
                      >Forgot password?</a
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

        // Fetch user profile to get tenant_id
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        // Save profile and tenant_id to localStorage
        localStorage.setItem("userProfile", JSON.stringify(profile));
        localStorage.setItem("tenant_id", profile.tenant_id);

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
  },
};
</script>
