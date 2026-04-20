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
                <h4>Şifre Yenileme</h4>
                <h6 class="font-weight-light">
                  Kod doğrulandı. Şimdi yeni şifrenizi belirleyebilirsiniz.
                </h6>
                <form class="pt-3" @submit.prevent="handleReset">
                  <div class="form-group">
                    <el-input
                      type="password"
                      v-model="formData.password"
                      placeholder="Yeni Şifre"
                      show-password
                    />
                  </div>
                  <div class="form-group">
                    <el-input
                      type="password"
                      v-model="formData.confirmPassword"
                      placeholder="Şifre Tekrar"
                      show-password
                    />
                  </div>
                  <div class="mt-3">
                    <el-button
                      class="login-button"
                      type="success"
                      size="large"
                      :loading="loading"
                      @click="handleReset"
                      >Şifreyi Güncelle
                    </el-button>
                  </div>
                  <div class="text-center mt-4 font-weight-light">
                    Vazgeçtiniz mi?
                    <router-link to="/auth/giris" class="text-primary"
                      >Giriş Yap</router-link
                    >
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { supabase } from "@/supabase";

export default {
  name: "reset-password",
  data() {
    return {
      formData: {
        password: "",
        confirmPassword: "",
      },
      loading: false,
    };
  },
  methods: {
    async handleReset() {
      if (!this.formData.password || !this.formData.confirmPassword) {
        this.$notify.error({
          title: "Hata",
          message: "Lütfen tüm alanları doldurun!",
        });
        return;
      }

      if (this.formData.password !== this.formData.confirmPassword) {
        this.$notify.error({
          title: "Hata",
          message: "Şifreler uyuşmuyor!",
        });
        return;
      }

      if (this.formData.password.length < 6) {
        this.$notify.error({
          title: "Hata",
          message: "Şifre en az 6 karakter olmalıdır!",
        });
        return;
      }

      this.loading = true;
      try {
        const { error } = await supabase.auth.update({
          password: this.formData.password,
        });

        if (error) throw error;

        this.$notify.success({
          title: "Başarılı",
          message:
            "Şifreniz başarıyla güncellendi. Giriş ekranına yönlendiriliyorsunuz...",
        });

        await supabase.auth.signOut();

        setTimeout(() => {
          this.$router.push({ name: "login" });
        }, 1500);
      } catch (error) {
        this.$notify.error({
          title: "Hata",
          message: error.message || "Şifre güncellenirken bir hata oluştu.",
        });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.login-button {
  width: 100%;
}
</style>
