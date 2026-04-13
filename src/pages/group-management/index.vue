
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
          <div class="col-3 col-sm-5 col-md-2 mb-3">
            <el-input
              v-model="filter.search"
              placeholder="Bölge Ara..."
              clearable
              prefix-icon="el-icon-search"
            />
          </div>
          <div class="col-12 grid-margin">
            <el-table
              :data="paginatedData"
              border
              style="width: 100%"
              empty-text="Bölge bulunamadı"
            >
              <el-table-column prop="name" label="Bölge Adı" width="180">
                <template v-slot="scope">
                  {{ scope.row.name }} {{ scope.row.surname }}
                </template>
              </el-table-column>
              <el-table-column prop="day" label="Gün">
                <template v-slot="scope">
                  {{ getDayLabel(scope.row.day) }}
                </template>
              </el-table-column>
              <el-table-column fixed="right" label="İşlem" width="95">
                <template v-slot="scope">
                  <el-button
                    type="primary"
                    size="small"
                    icon="el-icon-edit"
                    circle
                    @click="isOpenDialog('edit', scope.row)"
                  ></el-button>
                  <el-button
                    type="danger"
                    size="small"
                    icon="el-icon-delete"
                    circle
                    @click="deleteGroup(scope.row)"
                    :disabled="scope.row.totalOutputWeight > 0"
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
import groups from "@/mock/groups.json";
import { GROUP_DAY_LIST } from "@/util/constants";

export default {
  name: "group-management",
  data() {
    return {
      pageSize: 10,
      currentPage: 1,
      isEditMode: false,
      dialogVisible: false,
      groupList: [...groups],
      selectedRow: null,
      formData: {
        groupName: "",
        groupDay: "",
      },
      filter: {
        search: "",
      },
    };
  },
  computed: {
    getZoneList() {
      return this.groupList;
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
        list = list.filter((item) => item.name.toLowerCase().includes(search));
      }

      return list.sort((a, b) => a.day - b.day);
    },
    getPopupTitle() {
      return this.isEditMode ? "Bölgeyi Düzenle" : "Yeni Bölge Oluştur";
    },
  },
  methods: {
    handlePageChange(page) {
      this.currentPage = page;
    },
    fillForm(row) {
      this.formData.groupName = row.name;
      this.formData.groupDay = row.day;
    },
    resetFormData() {
      this.formData.groupName = "";
      this.formData.groupDay = "";
    },
    closePopup() {
      this.dialogVisible = false;
    },
    deleteGroup(row) {
      this.$confirm(
        `${row.name} bölgeyi silmek istediğinize emin misiniz?`,
        "Onay",
        {
          confirmButtonText: "Evet",
          cancelButtonText: "Hayır",
          type: "warning",
        }
      )
        .then(() => {
          const index = this.groupList.findIndex((g) => g.id === row.id);
          if (index !== -1) {
            this.groupList.splice(index, 1);
            this.$message.success("Bölge başarıyla silindi.");
          }
        })
        .catch(() => {
          this.$message.info("Silme işlemi iptal edildi.");
        });
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
    saveGroup() {
      const name = this.formData.groupName?.trim();
      const day = this.formData.groupDay;

      if (!name || !day) {
        this.$message.error("Lütfen tüm alanları doldurun.");
        return;
      }

      const exists = this.groupList.some((g) => String(g.day) === String(day));
      if (exists) {
        const dayLabel =
          GROUP_DAY_LIST.find((d) => d.value === day)?.label || "";
        this.$message.warning(`${dayLabel} günü için zaten bir bölge atanmış!`);
        return;
      }

      if (this.isEditMode) {
        const index = this.groupList.findIndex(
          (g) => g.id === this.selectedRow.id
        );
        if (index !== -1) {
          this.groupList[index].name = name;
          this.groupList[index].day = day;
        }
        this.$message.success("Bölge başarıyla güncellendi.");
      } else {
        this.groupList.push({
          id: Date.now(),
          name: name,
          day: day,
        });
        this.$message.success("Bölge başarıyla eklendi.");
      }

      this.dialogVisible = false;
    },
  },
};
</script>