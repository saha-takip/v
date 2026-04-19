
<template>
  <div>
    <div class="page-header">
      <h3 class="page-title">
        <div>
          <span class="page-title-icon bg-gradient-success text-white mr-2">
            <i class="mdi mdi-routes menu-icon"></i>
          </span>
          Bölge Yönetimi ({{ filteredData.length }})
        </div>
        <el-button
          v-if="paginatedData.length < 6"
          type="success"
          size="medium"
          icon="el-icon-circle-plus"
          @click="isOpenDialog('add')"
          >Bölge Ekle</el-button
        >
      </h3>
    </div>
    <div class="card">
      <div class="card-body">
        <div class="row">
          <div class="col-8 col-sm-5 col-md-4 mb-3">
            <el-input
              v-model="filter.search"
              placeholder="Bölge Ara..."
              clearable
              prefix-icon="el-icon-search"
            />
          </div>
          <div class="col-12 grid-margin">
            <el-table
              v-loading="loading"
              :data="paginatedData"
              border
              style="width: 100%"
              empty-text="Bölge bulunamadı"
            >
              <el-table-column prop="name" label="Bölge Adı" width="180">
                <template v-slot="scope">
                  {{ scope.row.name }}
                </template>
              </el-table-column>
              <el-table-column prop="day" label="Gün">
                <template v-slot="scope">
                  {{ getDayLabel(scope.row.day) }}
                </template>
              </el-table-column>
              <el-table-column fixed="right" label="İşlem" width="55">
                <template v-slot="scope">
                  <el-button
                    type="primary"
                    size="small"
                    icon="el-icon-edit"
                    circle
                    @click="isOpenDialog('edit', scope.row)"
                  ></el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      :title="getPopupTitle"
      :visible.sync="dialogVisible"
      width="37%"
      @close="closePopup"
    >
      <el-form label-position="top" :model="formData" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Bölge Adı">
              <el-input
                v-model="formData.groupName"
                maxlength="24"
                show-word-limit
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Bölge Günü" class="picker-width">
              <el-select
                class="w-full"
                v-model="formData.groupDay"
                filterable
                clearable
                placeholder="Gün seçin"
                :disabled="isEditMode"
              >
                <el-option
                  v-for="item in getGroupDayList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Vazgeç</el-button>
        <el-button type="primary" @click="saveGroup">Kaydet</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { supabase } from "@/supabase";
import { GROUP_DAY_LIST } from "@/util/constants";
import globalMixin from "@/mixins/global.mixin.js";

export default {
  name: "group-management",
  mixins: [globalMixin],
  data() {
    return {
      pageSize: 10,
      currentPage: 1,
      isEditMode: false,
      dialogVisible: false,
      // groupList state'i mixin'den (_zoneList) gelecek
      selectedRow: null,
      formData: {
        groupName: "",
        groupDay: "",
      },
      filter: {
        search: "",
      },
      loading: false,
    };
  },
  mounted() {
    this._fetchZones();
  },
  computed: {
    getZoneList() {
      // mixin'deki _zoneList'i kullanıyoruz.
      // Not: Mixin'deki _zoneList [{label, value, id}] formatında.
      // Buradaki tablo ise orjinal DB formatını [name, day, id] bekleyebilir.
      // Ancak tablo template'inde scope.row.name kullanılmış.
      // Mixin'de label -> name, value -> day eşleşmesini kontrol edelim.
      return this._zoneList.map((z) => ({
        id: z.id,
        name: z.label,
        day: z.value,
      }));
    },
    getDayLabel() {
      return (day) =>
        GROUP_DAY_LIST.find((d) => d.value === Number(day))?.label || "-";
    },
    getGroupDayList() {
      return GROUP_DAY_LIST;
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredData?.slice(start, end);
    },
    filteredData() {
      let list = this.getZoneList || [];

      if (this.filter.search) {
        const search = this.filter.search.toLowerCase();
        list = list.filter(
          (item) =>
            item.name.toLowerCase().includes(search) ||
            this.getDayLabel(item.day).toLowerCase().includes(search)
        );
      }

      return [...list].sort((a, b) => a.day - b.day);
    },
    getPopupTitle() {
      return this.isEditMode ? "Bölgeyi Düzenle" : "Yeni Bölge Oluştur";
    },
  },
  methods: {
    // fetchGroups kaldırıldı, mixin'deki _fetchZones kullanılacak
    handlePageChange(page) {
      this.currentPage = page;
    },
    fillForm(row) {
      this.formData.groupName = row.name;
      this.formData.groupDay = Number(row.day);
    },
    resetFormData() {
      this.formData.groupName = "";
      this.formData.groupDay = "";
    },
    closePopup() {
      this.dialogVisible = false;
    },
    async isOpenDialog(type, row = {}) {
      this.isEditMode = type === "edit";

      if (this.isEditMode) {
        this.selectedRow = row;
        this.fillForm(row);
      } else {
        this.selectedRow = null;
        this.resetFormData();
      }
      this.dialogVisible = true;
    },
    async saveGroup() {
      const name = this.formData.groupName?.trim();
      const day = this.formData.groupDay;
      const tenant_id = localStorage.getItem("tenant_id");

      if (!name || !day) {
        this.$message.error("Lütfen tüm alanları doldurun.");
        return;
      }

      const exists = this.groupList?.some(
        (g) => String(g.day) === String(day) && g.id !== this.selectedRow?.id
      );
      if (exists) {
        const dayLabel =
          GROUP_DAY_LIST.find((d) => d.value === day)?.label || "";
        this.$message.warning(`${dayLabel} günü için zaten bir bölge atanmış!`);
        return;
      }

      if (this.isEditMode) {
        const { data, error } = await supabase
          .from("zones")
          .update({ name: name, day: day })
          .eq("id", this.selectedRow.id)
          .select();

        if (!error && data && data.length > 0) {
          await this._fetchZones();
          this.$message.success("Bölge başarıyla güncellendi.");
        } else {
          console.error(error, data);
          this.$message.error(
            "Güncellenemedi. Lütfen yetkinizi veya bağlantıyı kontrol edin."
          );
        }
      } else {
        const { data, error } = await supabase
          .from("zones")
          .insert([{ name: name, day: day, tenant_id: tenant_id }])
          .select();

        if (!error && data && data.length > 0) {
          await this._fetchZones();
          this.$message.success("Bölge başarıyla eklendi.");
        } else {
          console.error(error, data);
          this.$message.error(
            "Eklenemedi. Lütfen yetkinizi veya bağlantıyı kontrol edin."
          );
        }
      }

      this.dialogVisible = false;
    },
  },
};
</script>