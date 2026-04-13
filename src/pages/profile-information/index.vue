<template>
  <div>
    <div class="page-header">
      <h3 class="page-title">
        <span class="page-title-icon bg-gradient-primary text-white mr-2">
          <i class="mdi mdi-account-card-details"></i>
        </span>
        Profil ve Kurumsal Bilgiler
      </h3>
    </div>

    <div class="row">
      <div class="col-md-6 grid-margin stretch-card">
        <div class="card shadow-sm">
          <div class="card-body">
            <h4 class="card-title">Kurumsal Kimlik</h4>
            <p class="card-description">Logo ve Favicon Yönetimi</p>

            <form class="forms-sample" @submit.prevent="updateTenant">
              <div class="form-group text-center">
                <div class="d-flex justify-content-center align-items-end mb-3">
                  <div class="logo-preview-container mr-3">
                    <small class="text-muted d-block mb-1">Ana Logo</small>
                    <img
                      :src="
                        tenantForm.logo_url ||
                        require('@/assets/images/logo.png')
                      "
                      alt="Logo"
                      class="img-thumbnail"
                      style="width: 120px; height: 120px; object-fit: contain"
                    />
                  </div>
                  <div class="logo-preview-container bg-light p-2">
                    <small class="text-muted d-block mb-1"
                      >Favicon / İkon</small
                    >
                    <img
                      :src="
                        tenantForm.icon_url ||
                        require('@/assets/images/logo.png')
                      "
                      alt="Icon"
                      style="
                        width: 48px;
                        height: 48px;
                        object-fit: cover;
                        border-radius: 4px;
                      "
                    />
                  </div>
                </div>

                <el-upload
                  class="upload-demo"
                  action="#"
                  :auto-upload="false"
                  :on-change="handleLogoChange"
                  :show-file-list="false"
                  accept="image/png, image/jpeg"
                >
                  <el-button
                    size="small"
                    type="primary"
                    :loading="uploadingLogo"
                    icon="el-icon-upload"
                  >
                    Yeni Kurumsal Görsel Yükle
                  </el-button>
                  <div slot="tip" class="el-upload__tip">
                    PNG/JPG yüklediğinizde sistem otomatik olarak hem logo hem
                    ikon üretir.
                  </div>
                </el-upload>
              </div>

              <div class="form-group">
                <label for="tenantName">Toptancı / Şirket Adı</label>
                <input
                  type="text"
                  class="form-control form-control-lg"
                  id="tenantName"
                  v-model="tenantForm.name"
                  placeholder="Örn: Furkan Gıda Pazarlama"
                />
              </div>

              <el-button
                type="success"
                :loading="savingTenant"
                @click="updateTenant"
                class="btn-block gradient-btn"
                >Değişiklikleri Kaydet</el-button
              >
            </form>
          </div>
        </div>
      </div>

      <div class="col-md-6 grid-margin stretch-card">
        <div class="card shadow-sm">
          <div class="card-body">
            <h4 class="card-title">Kullanıcı Profili</h4>
            <p class="card-description">Kişisel Bilgileriniz</p>

            <form class="forms-sample" @submit.prevent="updateUser">
              <div class="form-group text-center">
                <div class="avatar-preview-container mb-3 shadow-sm">
                  <img
                    :src="
                      userForm.avatar_url || 'https://via.placeholder.com/150'
                    "
                    alt="Avatar"
                    class="rounded-circle"
                    style="
                      width: 100px;
                      height: 100px;
                      object-fit: cover;
                      border: 3px solid #fff;
                    "
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="fullName">Ad Soyad</label>
                <input
                  type="text"
                  class="form-control"
                  id="fullName"
                  v-model="userForm.full_name"
                />
              </div>

              <div class="form-group">
                <label>E-posta (Salt Okunur)</label>
                <input
                  type="email"
                  class="form-control"
                  :value="userAuthEmail"
                  disabled
                />
              </div>

              <div class="form-group">
                <label>Yetki Seviyesi:</label>
                <span class="badge badge-outline-primary ml-2">{{
                  $storeState.userProfile.role || "Personel"
                }}</span>
              </div>

              <el-button
                type="primary"
                :loading="savingUser"
                @click="updateUser"
                class="btn-block"
                >Profilimi Güncelle</el-button
              >
            </form>
          </div>
        </div>
      </div>
    </div>

    <canvas ref="logoCanvas" style="display: none"></canvas>
    <canvas ref="iconCanvas" style="display: none"></canvas>
  </div>
</template>

<script>
import { supabase } from "@/supabase";

export default {
  name: "profile-settings",
  data() {
    return {
      savingTenant: false,
      savingUser: false,
      uploadingLogo: false,
      tenantForm: { id: null, name: "", logo_url: "", icon_url: "" },
      userForm: { full_name: "", avatar_url: "" },
      userAuthEmail: "",
    };
  },
  async mounted() {
    this.initForms();
    this.userAuthEmail = supabase.auth.user()?.email || "";
  },
  methods: {
    initForms() {
      const tenant = this.$storeState.tenant || {};
      const profile = this.$storeState.userProfile || {};

      this.tenantForm = {
        id: tenant.id || localStorage.getItem("tenant_id"),
        name: tenant.name || "",
        logo_url: tenant.logo_url || "",
        icon_url: tenant.icon_url || "",
      };

      this.userForm = {
        full_name: profile.full_name || "",
        avatar_url: profile.avatar_url || "",
      };
    },

    async handleLogoChange(file) {
      this.uploadingLogo = true;
      try {
        // 1. Hem büyük logo hem küçük ikon üret
        const logoBlob = await this.processImage(file.raw, 512, "logoCanvas");
        const iconBlob = await this.processImage(file.raw, 64, "iconCanvas");

        // 2. Storage'a yükle (İsimleri benzersiz yapalım)
        const timestamp = Date.now();
        const logoPath = `branding/${this.tenantForm.id}_logo_${timestamp}.png`;
        const iconPath = `branding/${this.tenantForm.id}_icon_${timestamp}.png`;

        await this.uploadToStorage(logoPath, logoBlob);
        await this.uploadToStorage(iconPath, iconBlob);

        // 3. URL'leri al
        this.tenantForm.logo_url = supabase.storage
          .from("avatars")
          .getPublicUrl(logoPath).publicURL;
        this.tenantForm.icon_url = supabase.storage
          .from("avatars")
          .getPublicUrl(iconPath).publicURL;

        this.$message.success(
          "Görseller hazırlandı. Kaydet butonuna basarak onaylayın."
        );
      } catch (err) {
        this.$message.error("Görsel yüklenemedi: " + err.message);
      } finally {
        this.uploadingLogo = false;
      }
    },

    async uploadToStorage(path, blob) {
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { contentType: "image/png" });
      if (error) throw error;
    },

    processImage(file, size, canvasRef) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target.result;
          img.onload = () => {
            const canvas = this.$refs[canvasRef];
            const ctx = canvas.getContext("2d");
            canvas.width = size;
            canvas.height = size;

            // Kare kesim mantığı
            let sX = 0,
              sY = 0,
              sW = img.width,
              sH = img.height;
            if (img.width > img.height) {
              sW = img.height;
              sX = (img.width - img.height) / 2;
            } else {
              sH = img.width;
              sY = (img.height - img.width) / 2;
            }

            ctx.drawImage(img, sX, sY, sW, sH, 0, 0, size, size);
            canvas.toBlob((blob) => resolve(blob), "image/png");
          };
        };
      });
    },

    async updateTenant() {
      this.savingTenant = true;
      try {
        const { error } = await supabase
          .from("tenants")
          .update({
            name: this.tenantForm.name,
            logo_url: this.tenantForm.logo_url,
            icon_url: this.tenantForm.icon_url, // Yeni kolon
          })
          .eq("id", this.tenantForm.id);

        if (error) throw error;

        // Dinamik başlık ve Favicon güncelleme (Anlık yansıma için)
        document.title = `${this.tenantForm.name} | Satış & Tahsilat Takip`;
        const favicon = document.querySelector("link[rel*='icon']");
        if (favicon && this.tenantForm.icon_url)
          favicon.href = this.tenantForm.icon_url;

        this.$message.success("Kurumsal kimlik güncellendi.");
      } catch (err) {
        this.$message.error("Hata: " + err.message);
      } finally {
        this.savingTenant = false;
      }
    },

    async updateUser() {
      this.savingUser = true;
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ full_name: this.userForm.full_name })
          .eq("id", this.$storeState.userProfile.id)
          .select("*");

        if (error) throw error;
        this.$message.success("Profil güncellendi.");
      } finally {
        this.savingUser = false;
      }
    },
  },
};
</script>

<style scoped>
.gradient-btn {
  background: linear-gradient(to right, #da8cff, #9a55ff);
  border: none;
  color: white;
}
.logo-preview-container {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}
</style>