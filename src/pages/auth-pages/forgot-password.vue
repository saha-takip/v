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
                <h4>Şifremi Unuttum</h4>
                <p class="card-description">
                  {{
                    step === 1
                      ? "Şifre sıfırlama kodu almak için e-posta adresinizi giriniz."
                      : "E-postanıza gönderilen 6 haneli kodu giriniz."
                  }}
                </p>

                <form class="pt-3" @submit.prevent="handleSubmit">
                  <!-- Adım 1: Email Girişi -->
                  <div v-if="step === 1" class="form-group">
                    <el-input
                      type="email"
                      v-model="email"
                      placeholder="E-posta Adresi"
                      prefix-icon="el-icon-message"
                    />
                  </div>

                  <!-- Adım 2: OTP Girişi -->
                  <div v-if="step === 2" class="form-group">
                    <el-input
                      type="text"
                      v-model="otp"
                      placeholder="6 Haneli Kod"
                      prefix-icon="el-icon-key"
                      maxlength="6"
                      @input="handleOtpInput"
                    />
                  </div>

                  <div class="mt-3">
                    <el-button
                      class="btn-block"
                      type="success"
                      size="large"
                      :loading="loading"
                      @click="handleSubmit"
                    >
                      {{ step === 1 ? "Kod Gönder" : "Kodu Doğrula" }}
                    </el-button>
                  </div>

                  <div
                    class="text-center mt-4 font-weight-light text-small d-flex flex-column"
                  >
                    <p class="mb-2 card-description">
                      {{ step === 2 ? "Kod gelmedi mi?" : "" }}
                    </p>
                    <div class="d-flex gap-5 justify-content-center">
                      <a
                        v-if="step === 2"
                        href="javascript:void(0);"
                        @click="sendEmail"
                        class="text-primary text-small font-weight-bold"
                        >Tekrar Gönder</a
                      >
                      <router-link
                        to="/auth/login"
                        class="text-primary text-small font-weight-bold"
                        >Giriş Ekranına Dön</router-link
                      >
                    </div>
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
  name: "forgot-password",
  data() {
    return {
      step: 1,
      email: "",
      otp: "",
      loading: false,
    };
  },
  methods: {
    handleOtpInput(val) {
      this.otp = val.replace(/\D/g, "");
    },
    async handleSubmit() {
      if (this.step === 1) {
        await this.sendEmail();
      } else {
        await this.verifyOtp();
      }
    },
    async sendEmail() {
      if (!this.email) {
        this.$message.warning("Lütfen e-posta adresinizi giriniz.");
        return;
      }

      this.loading = true;
      try {
        const { data: exists, error: rpcError } = await supabase.rpc(
          "check_user_exists",
          { email_input: this.email }
        );

        if (rpcError || !exists) {
          this.$message.error(
            "Girdiğiniz e-posta adresi sistemde kayıtlı değil."
          );
          this.loading = false;
          return;
        }

        const { error } = await supabase.auth.api.resetPasswordForEmail(
          this.email,
          {
            redirectTo:
              window.location.origin +
              (process.env.NODE_ENV === "production" ? "/frontend" : "") +
              "/auth/sifre-sifirlama",
          }
        );

        if (error) throw error;

        this.$message.success("Şifre sıfırlama kodu e-postanıza gönderildi.");
        this.step = 2;
      } catch (error) {
        this.$notify.error({
          title: "Hata",
          message: error.message || "Kod gönderilirken bir hata oluştu.",
        });
      } finally {
        this.loading = false;
      }
    },
    async verifyOtp() {
      if (this.otp.length !== 6) {
        this.$message.warning("Lütfen 6 haneli kodu giriniz.");
        return;
      }

      this.loading = true;
      try {
        const { error } = await supabase.auth.verifyOTP({
          email: this.email,
          token: this.otp,
          type: "recovery",
        });

        if (error) throw error;

        this.$message.success(
          "Kod doğrulandı! Şimdi yeni şifrenizi belirleyebilirsiniz."
        );

        // Supabase verifyOTP başarılı olursa otomatik session kurar.
        // Artık /auth/sifre-sifirlama sayfasına gidip şifre güncelleyebiliriz.
        this.$router.push({ name: "reset-password" });
      } catch (error) {
        this.$notify.error({
          title: "Doğrulama Hatası",
          message: "Girdiğiniz kod hatalı veya süresi dolmuş olabilir.",
        });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.btn-block {
  width: 100%;
}
</style>
