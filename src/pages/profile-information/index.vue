<template>
  <div>
    <div class="page-header">
      <h3 class="page-title">
        <div>
          <span class="page-title-icon bg-gradient-success text-white mr-2">
            <i class="mdi mdi-account-card-details"></i>
          </span>
          Profil ve Kurumsal Bilgiler
        </div>
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
                        logoPreview ||
                        tenantForm.logo_url ||
                        require('@/assets/images/default-logo.jpg')
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
                        iconPreview ||
                        tenantForm.icon_url ||
                        require('@/assets/images/mini-default-logo.jpg')
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

                <div
                  class="d-flex justify-content-center align-items-start mt-2"
                  style="gap: 12px"
                >
                  <div class="text-center">
                    <el-upload
                      action="#"
                      :auto-upload="false"
                      :on-change="(file) => handleFileChange(file, 'logo')"
                      :show-file-list="false"
                      accept="image/png, image/jpeg"
                    >
                      <el-button
                        size="small"
                        type="primary"
                        icon="el-icon-upload"
                      >
                        Ana Logo Seç
                      </el-button>
                    </el-upload>
                    <div class="el-upload__tip mt-1">Ana Logo (PNG/JPG)</div>
                  </div>

                  <div class="text-center">
                    <el-upload
                      action="#"
                      :auto-upload="false"
                      :on-change="(file) => handleFileChange(file, 'icon')"
                      :show-file-list="false"
                      accept="image/png, image/jpeg"
                    >
                      <el-button
                        size="small"
                        type="warning"
                        icon="el-icon-upload"
                      >
                        Mini Logo Seç
                      </el-button>
                    </el-upload>
                    <div class="el-upload__tip mt-1">Mini Logo (PNG/JPG)</div>
                  </div>
                </div>
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
                class="btn-block"
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

              <el-button
                type="success"
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
      userForm: { full_name: "" },
      userAuthEmail: "",
      pendingLogoFile: null,
      pendingIconFile: null,
      logoPreview: null,
      iconPreview: null,
    };
  },
  async mounted() {
    await this.fetchTenantData();
    this.initForms();
    this.userAuthEmail = supabase.auth.user()?.email || "";
  },
  methods: {
    async fetchTenantData() {
      const tenantId = localStorage.getItem("tenant_id");
      if (!tenantId) return;

      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", tenantId)
        .single();

      if (!error && data) {
        this.tenantForm = {
          id: data.id,
          name: data.name && data.name !== "Panel" ? data.name : "",
          logo_url: data.logo_url || "",
          icon_url: data.icon_url || "",
        };
        // Store'u da güncel tutalım
        this.$storeMutations.setTenant(data);
      }
    },
    initForms() {
      const profile = this.$storeState.userProfile || {};
      this.userForm = {
        full_name: profile.full_name || "",
      };
    },

    handleFileChange(file, type) {
      if (type === "logo") {
        this.pendingLogoFile = file.raw;
        this.logoPreview = URL.createObjectURL(file.raw);
      } else {
        this.pendingIconFile = file.raw;
        this.iconPreview = URL.createObjectURL(file.raw);
      }
    },
    async uploadToStorage(path, file) {
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          contentType: file.type,
          upsert: true,
        });
      if (error) throw error;
    },

    async updateTenant() {
      this.savingTenant = true;

      if (!this.tenantForm.id) {
        this.$message.error("Tenant ID bulunamadı, sayfa yenileniyor...");
        this.initForms();
        return;
      }

      try {
        const timestamp = Date.now();
        let finalLogoUrl = this.tenantForm.logo_url;
        let finalIconUrl = this.tenantForm.icon_url;

        // Ana Logo Yükleme
        if (this.pendingLogoFile) {
          const ext = this.pendingLogoFile.name.split(".").pop();
          const logoPath = `branding/${this.tenantForm.id}_logo_${timestamp}.${ext}`;
          await this.uploadToStorage(logoPath, this.pendingLogoFile);

          const { publicURL } = supabase.storage
            .from("avatars")
            .getPublicUrl(logoPath);
          finalLogoUrl = publicURL;
          this.tenantForm.logo_url = publicURL;
        }

        // Mini Logo Yükleme
        if (this.pendingIconFile) {
          const ext = this.pendingIconFile.name.split(".").pop();
          const iconPath = `branding/${this.tenantForm.id}_icon_${timestamp}.${ext}`;
          await this.uploadToStorage(iconPath, this.pendingIconFile);

          const { publicURL } = supabase.storage
            .from("avatars")
            .getPublicUrl(iconPath);
          finalIconUrl = publicURL;
          this.tenantForm.icon_url = publicURL;
        }

        const { error } = await supabase
          .from("tenants")
          .update({
            name: this.tenantForm.name,
            logo_url: finalLogoUrl,
            icon_url: finalIconUrl,
          })
          .eq("id", this.tenantForm.id);

        if (error) throw error;

        // Global store'u ve local storage'ı güncelle
        this.$storeMutations.setTenant({
          name: this.tenantForm.name,
          logo_url: finalLogoUrl,
          icon_url: finalIconUrl,
        });

        // Pending verileri temizle
        this.pendingLogoFile = null;
        this.pendingIconFile = null;
        this.logoPreview = null;
        this.iconPreview = null;

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

        this.$storeMutations.setUserProfile({
          full_name: this.userForm.full_name,
        });

        try {
          const profileStr = localStorage.getItem("userProfile");
          if (profileStr) {
            const profileData = JSON.parse(profileStr);
            profileData.full_name = this.userForm.full_name;
            localStorage.setItem("userProfile", JSON.stringify(profileData));
          }
        } catch (e) {
          console.error("Local storage update error", e);
        }

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