<template>
  <div>
    <div class="page-header">
      <h3 class="page-title">
        <div>
          <span class="page-title-icon bg-gradient-success text-white mr-2">
            <i class="mdi mdi-account-multiple"></i>
          </span>
          Tüm Müşteriler ({{ filteredData.length }})
        </div>
        <div>
          <el-button
            type="success"
            size="medium"
            icon="el-icon-location-outline"
            @click="openCreateRouteDialog"
            >Rota Oluştur</el-button
          >
          <el-button
            type="success"
            size="medium"
            icon="el-icon-circle-plus"
            @click="isOpenDialog('add')"
            >Müşteri Oluştur</el-button
          >
        </div>
      </h3>
      <!-- liste gruplar halinde gösteribilir group by gibi -->
    </div>
    <div class="card">
      <div class="card-body">
        <div class="row">
          <div class="col-3 col-sm-4 col-md-2 mb-3">
            <el-input
              v-model="filter.search"
              placeholder="Müşteri arayın"
              clearable
              prefix-icon="el-icon-search"
            />
          </div>
          <div class="col-3 col-sm-4 mb-3 pl-0">
            <el-select
              v-model="filter.group"
              filterable
              clearable
              placeholder="Bölge seçin"
              @change="currentPage = 1"
            >
              <el-option
                v-for="item in getZoneList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
          <div class="col-12 grid-margin">
            <el-table
              :data="paginatedData"
              border
              style="width: 100%"
              show-summary
              :summary-method="getSummaries"
              empty-text="Müşteri bulunamadı"
            >
              <!-- <el-table-column prop="id" label="ID" width="180"></el-table-column> -->
              <el-table-column prop="companyName" label="Firma Adı" width="180">
                <template v-slot="scope">{{ scope.row.companyName }}</template>
              </el-table-column>
              <el-table-column prop="name" label="Firma Yetkilisi">
                <template v-slot="scope">
                  {{ scope.row.name }} {{ scope.row.surname }}
                </template>
              </el-table-column>
              <el-table-column
                prop="phone"
                label="Telefon"
                width="115"
              ></el-table-column>
              <el-table-column prop="group" label="Bölge" sortable>
                <template v-slot="scope">
                  {{ getGroupNameList(scope.row.group) }}
                </template>
              </el-table-column>
              <el-table-column prop="totalSale" label="Toplam Satış" sortable>
                <template v-slot="scope">
                  {{ scope.row.totalSale | formatNumber }}
                </template>
              </el-table-column>
              <el-table-column
                prop="totalCollection"
                label="Toplam Tahsilat"
                sortable
                width="150"
              >
                <template v-slot="scope">
                  {{ scope.row.totalCollection | formatNumber }}
                </template>
              </el-table-column>
              <el-table-column prop="totalDebt" label="Toplam Borç" sortable>
                <template v-slot="scope">
                  <label
                    v-if="scope.row.totalDebt > 0"
                    class="badge badge-danger"
                    >{{ scope.row.totalDebt | formatNumber }} ₺</label
                  >
                  <label v-else class="badge badge-gradient-success">
                    <i class="el-icon-success"></i> Ödendi</label
                  >
                </template>
              </el-table-column>
              <el-table-column prop="note" label="Not">
                <template v-slot="scope">
                  <el-tooltip
                    class="item"
                    effect="dark"
                    :content="
                      scope.row.note ? scope.row.note : 'Henüz not belirtilmedi'
                    "
                    placement="left"
                  >
                    <div class="cursor gap-5">
                      <i class="el-icon-info"></i>
                      <span>Bilgi</span>
                    </div>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column fixed="right" label="İşlem" width="190">
                <template v-slot="scope">
                  <div class="process">
                    <el-button
                      v-if="scope.row.isProcess"
                      type="success"
                      size="small"
                      icon="el-icon-notebook-2"
                      @click="handleClick(scope.row)"
                      >Hesap Ekstresi</el-button
                    >
                    <el-button
                      v-if="!scope.row.isProcess"
                      type="danger"
                      size="small"
                      icon="el-icon-delete"
                      circle
                      @click="openDeletePopup(scope.row)"
                      :disabled="scope.row.totalOutputWeight > 0"
                    ></el-button>
                    <el-button
                      type="primary"
                      size="small"
                      icon="el-icon-edit"
                      circle
                      @click="isOpenDialog('edit', scope.row)"
                    ></el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <el-pagination
              background
              layout="prev, pager, next"
              :total="filteredData.length"
              :page-size="pageSize"
              :current-page="currentPage"
              @current-change="handlePageChange"
              style="margin-top: 20px; text-align: center"
            />
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
            <el-form-item label="Firma Adı">
              <el-input v-model="formData.companyName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Yetkili Adı Soyadı">
              <el-input v-model="formData.name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Telefon">
              <el-input v-model="formData.phone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Adres">
              <el-input v-model="formData.address" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item class="mb-0" label="Bölge Seçin">
              <el-select
                class="w-full"
                v-model="formData.group"
                filterable
                clearable
                placeholder="Bölge adı ile ara"
              >
                <el-option
                  v-for="item in getZoneList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Not" prop="note">
              <el-input
                type="textarea"
                class="no-resize-textarea"
                v-model="formData.note"
                :autosize="false"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Vazgeç</el-button>
        <el-button type="primary" @click="saveChanges">Kaydet</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="Müşteri Silme İşlemi"
      :visible.sync="deleteCustomerPopupStatus"
      width="25%"
      @close="closeDeletePopup"
    >
      <p class="mb-0">
        <b>{{ currentCustomer.companyName }}</b> adlı müşterinizi silmek
        istediğinizden emin misiniz?
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteCustomerPopupStatus = false">Vazgeç</el-button>
        <el-button type="danger" @click="deleteCustomer">Evet, Sil</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="Rota oluştur"
      :visible.sync="createRouteDialog"
      width="45%"
      @close="closeRouteDialog"
    >
      <el-form label-position="top" :model="formData" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item class="mb-0" label="Bölge Seçin">
              <el-select
                class="w-full"
                v-model="filter.groupForRoute"
                filterable
                clearable
                placeholder="Bögle adı ile ara"
              >
                <el-option
                  v-for="item in getZoneList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="9">
            <el-form-item class="mb-0" label="İşlem Tipi">
              <el-radio-group v-model="filter.visitType" size="small">
                <el-radio :label="1">Tahsilat</el-radio>
                <el-radio label="Tümü">Tümü</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="8">
            <el-form-item class="mb-0" label="Devredenler Dahil Edilsin Mi?">
              <el-radio-group v-model="filter.isOutstandingDebt" size="small">
                <el-radio :label="1">Evet</el-radio>
                <el-radio :label="0">Hayır</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col> -->
        </el-row>
      </el-form>

      <hr />

      <el-row :gutter="16">
        <el-col :span="13">
          <el-alert
            v-if="filter.groupForRoute"
            title="Seçilen bölgeye ait müşterilerin rotası, aşağıdaki gibidir."
            type="info"
            :closable="false"
            show-icon
            class="mb-4"
          >
          </el-alert>
        </el-col>
      </el-row>

      <el-table
        :data="getRouteList"
        border
        style="width: 100%"
        show-summary
        :summary-method="getSummariesRoute"
        empty-text="Rota için müşteri bulunamadı!"
      >
        <el-table-column prop="companyName" label="Firma Adı" width="250">
        </el-table-column>
        <el-table-column prop="totalDebt" label="Toplam Borç">
          <template v-slot="scope">
            <label
              v-if="scope.row.totalDebt > 0"
              class="badge badge-gradient-info"
              >{{ scope.row.totalDebt | formatNumber }}₺</label
            >
            <label v-else class="badge badge-gradient-success">Ödendi</label>
          </template>
        </el-table-column>
        <el-table-column prop="totalCollection" label="Toplam Tahsilat">
          <template v-slot="scope">
            {{ scope.row.totalCollection | formatNumber }}
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createRouteDialog = false">Vazgeç</el-button>
        <el-button
          type="primary"
          icon="el-icon-printer"
          @click="printRoute"
          :disabled="!getRouteList.length"
          >Çıktı Al</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import customers from "@/mock/customers.json";
import globalMixin from "@/mixins/global.mixin.js";
import { formatNumber } from "@/util/helpers";
import dataAll from "@/mock/transactions-all.js";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import logoImage from "@/assets/images/logo.png";

export default {
  name: "Customers",
  mixins: [globalMixin],
  data() {
    return {
      isEdit: false,
      pageSize: 10,
      currentPage: 1,
      dialogVisible: false,
      deleteCustomerPopupStatus: false,
      currentCustomer: {},
      createRouteDialog: false,
      customerDetail: {},
      exportTableData: [],
      formData: {
        name: "",
        companyName: "",
        phone: "",
        address: "",
        group: "",
        note: "",
      },
      filter: {
        search: "",
        group: "",
        visitType: "Tümü",
        groupForRoute: "",
      },
    };
  },
  computed: {
    getCustomerList() {
      return customers;
    },
    getTransactionList() {
      return dataAll;
    },
    getPopupTitle() {
      return this.isEdit
        ? "Müşteri Bilgilerini Düzenle"
        : "Yeni Müşteri Oluştur";
    },
    todayGroupNumber() {
      const today = new Date().getDay();
      if (today === 0) {
        return null;
      }
      return today;
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredData?.slice(start, end);
    },
    filteredData() {
      let list = this.getCustomerList || [];

      if (this.filter.search) {
        const search = this.filter.search.toLowerCase();
        list = list.filter((item) =>
          `${item.companyName} ${item.name + item.surname}`
            .toLowerCase()
            .includes(search)
        );
      }

      if (this.filter.group) {
        list = list.filter(
          (item) => String(item.group) === String(this.filter.group)
        );
      }

      return list;
    },
    getRouteList() {
      return this.getCustomerList.filter((item) => {
        if (this.filter.groupForRoute) {
          if (item.group !== Number(this.filter.groupForRoute)) return false;
        }

        if (this.filter.visitType === 1) {
          if (!(item.totalDebt > 0)) return false;
        }

        return true;
      });
    },
    getZoneName() {
      return (
        this.getZoneList.find((zone) => zone.value == this.filter.groupForRoute)
          ?.label || "Tüm Bölgeler"
      );
    },
  },
  methods: {
    openCreateRouteDialog() {
      this.createRouteDialog = true;
      const companyName = this.getCustomerList.companyName;
      this.exportTableData = this.getCustomerList.map((item) => ({
        companyName: companyName,
        sellAmount: this.$options.filters.formatNumber(item.sellAmount),
        totalDebt: this.$options.filters.formatNumber(item.totalDebt),
        totalCollection: this.$options.filters.formatNumber(
          item.totalCollection
        ),
        totalReceivable: this.$options.filters.formatNumber(
          item.totalReceivable
        ),
      }));
      this.filter.groupForRoute = this.todayGroupNumber;
    },
    closeRouteDialog() {
      this.createRouteDialog = false;
    },
    getSummariesRoute(param) {
      const { columns } = param;
      const sums = [];

      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "Toplam";
          return;
        }

        const isCalculatable =
          column?.property &&
          (column.property.includes("totalCollection") ||
            column.property.includes("totalReceivable") ||
            column.property.includes("totalDebt"));

        if (isCalculatable) {
          const values = this.getRouteList?.map((item) =>
            Number(item[column.property])
          );
          const total = values?.reduce((prev, curr) => {
            const value = Number(curr);
            return !isNaN(value) ? prev + value : prev;
          }, 0);

          sums[index] = formatNumber(total) + " ₺";
        } else {
          sums[index] = "";
        }
      });

      return sums;
    },
    async printRoute() {
      const list = this.getRouteList.map((item) => ({
        remaining: item.totalDebt,
        companyName: item.companyName,
        customerId: item.id,
      }));

      const totalDebt = list?.reduce((acc, item) => item.remaining + acc, 0);

      const body = [
        [
          { text: "Firma", bold: true },
          { text: "İşlem Tarihi", bold: true },
          { text: "Satış Tutarı", bold: true },
          { text: "Tahs. Tutarı", bold: true },
          { text: "Güncel Borç(₺)", bold: true },
          { text: "Açıklama", bold: true },
        ],
      ];

      list.forEach((transaction) => {
        // Main Company Row (boş bırakılan alanlar, ziyarette doldurmak için)
        body.push([
          { text: transaction.companyName, margin: [0, 0, 0, 0], bold: true },
          { text: "", margin: [0, 0, 0, 0] },
          { text: "", margin: [0, 0, 0, 0] },
          { text: "", margin: [0, 0, 0, 0] },
          {
            text: this.$options.filters.formatNumber(transaction.remaining),
            margin: [0, 0, 0, 0],
            bold: true,
          },
          { text: "", margin: [0, 0, 0, 0] },
        ]);

        // Geçmiş işlemleri bulup ekle (Mock data kısıtlı olduğu için eşleşmezse ilkini baz al)
        let customerTransactionsData = this.getTransactionList.find(
          (t) =>
            String(t.customerId) === String(transaction.customerId) ||
            t.companyName === transaction.companyName
        );
        if (!customerTransactionsData && this.getTransactionList.length > 0) {
          customerTransactionsData = this.getTransactionList[0]; // Görsel test için
        }

        if (
          customerTransactionsData &&
          customerTransactionsData.transactions &&
          customerTransactionsData.transactions.length > 0
        ) {
          // Son 3 işlemi al (tarihe göre azalan sırala, ilk 3'ü al)
          const sortedTransactions = [...customerTransactionsData.transactions]
            .sort(
              (a, b) =>
                new Date(b.transactionDate) - new Date(a.transactionDate)
            )
            .slice(0, 5);

          // Kronolojik göstermek için tekrar eskiden yeniye sırala
          sortedTransactions.sort(
            (a, b) => new Date(a.transactionDate) - new Date(b.transactionDate)
          );

          sortedTransactions.forEach((t) => {
            const isSell = t.transactionType === 0;
            body.push([
              {
                text: "└ Geçmiş İşlem",
                margin: [0, 2, 0, 2],
                fontSize: 8,
                color: "#777",
                italics: true,
                border: [false, false, false, false],
              },
              {
                text: this.$options.filters.formatDate(t.transactionDate),
                margin: [0, 2, 0, 2],
                fontSize: 9,
                color: "#555",
                border: [false, false, false, false],
              },
              {
                text: isSell
                  ? this.$options.filters.formatNumber(t.sellAmount)
                  : "-",
                margin: [0, 2, 0, 2],
                fontSize: 9,
                color: "#555",
                border: [false, false, false, false],
              },
              {
                text: !isSell
                  ? this.$options.filters.formatNumber(t.collectionAmount)
                  : "-",
                margin: [0, 2, 0, 2],
                fontSize: 9,
                color: "#555",
                border: [false, false, false, false],
              },
              {
                text: "",
                margin: [0, 2, 0, 2],
                border: [false, false, false, false],
              },
              {
                text: t.note || "",
                margin: [0, 2, 0, 2],
                fontSize: 9,
                color: "#555",
                border: [false, false, false, false],
              },
            ]);
          });
        }
      });

      body.push([
        { text: "", colSpan: 3, alignment: "left" },
        "",
        "",
        { text: "Toplam:", bold: true, fillColor: "#ddd" },
        { text: this.$options.filters.formatNumber(totalDebt), bold: true },
        "",
      ]);

      async function toBase64(url) {
        const res = await fetch(url);
        const blob = await res.blob();
        return await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }

      const logo = await toBase64(logoImage);

      const docDefinition = {
        content: [
          {
            image: logo,
            width: 150,
            alignment: "center",
            margin: [0, -20, 0, 0],
          },
          {
            text: `Bölge: ${this.getZoneName} - ${new Date().toLocaleDateString(
              "tr-TR"
            )}`,
            style: "zoneName",
          },
          {
            table: {
              headerRows: 1,
              widths: [100, 55, 55, 55, 70, "*"],
              body,
            },
            layout: {
              fillColor: (rowIndex) => (rowIndex === 0 ? "#CCCCCC" : null),
            },
            fontSize: 10,
          },
        ],
        styles: {
          header: {
            bold: false,
            margin: [-30, 0, -30, 10],
            alignment: "center",
          },
          zoneName: {
            bold: true,
            margin: [0, 0, 0, 10],
            alignment: "left",
          },
        },
      };

      pdfMake.createPdf(docDefinition).open();
    },
    handlePageChange(page) {
      this.currentPage = page;
    },
    isOpenDialog(type, row = {}) {
      this.isEdit = type === "edit";
      this.customerDetail = row;

      if (this.isEdit) {
        this.fillForm(row);
      } else {
        this.resetFormData();
      }
      this.formData.companyName = row.companyName || "";
      this.dialogVisible = true;
    },
    saveChanges() {
      if (this.isEdit) {
        this.$notify.success({
          title: "İşlem Başarılı",
          message: "Müşteri Bilgileri Güncellendi",
        });
      } else {
        this.$notify.success({
          title: "İşlem Başarılı",
          message: "Müşteri Oluşturuldu",
        });
      }
      this.closePopup();
    },
    deleteCustomer() {
      if (this.currentCustomer) {
        this.$notify.success({
          title: "İşlem Başarılı",
          message: "Müşteri Silindi",
        });
        this.closeDeletePopup();
      }
    },
    closePopup() {
      this.dialogVisible = false;
    },
    closeDeletePopup() {
      this.deleteCustomerPopupStatus = false;
    },
    openDeletePopup(row) {
      this.currentCustomer.id = row.name;
      this.currentCustomer.companyName = row.companyName;
      this.deleteCustomerPopupStatus = true;
    },
    fillForm(row) {
      this.formData = {
        ...this.formData,
        ...row,
      };
    },
    resetFormData() {
      this.formData = {
        name: "",
        companyName: "",
        phone: "",
        address: "",
        group: "",
        note: "",
      };
    },
    handleClick(row) {
      this.$router.push({
        name: "transactions",
        query: { q: row.id, cn: row.companyName },
      });
    },
    getSummaries(param) {
      const { columns } = param;
      const sums = [];

      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "Toplam:";
          return;
        }

        const isDebtColumn =
          column?.property &&
          (column.property.includes("totalCollection") ||
            column.property.includes("totalSale") ||
            column.property.includes("totalDebt"));

        if (isDebtColumn) {
          const values = this.filteredData?.map((item) =>
            Number(item[column.property])
          );
          const total = values?.reduce((prev, curr) => {
            const value = Number(curr);
            return !isNaN(value) ? prev + value : prev;
          }, 0);

          sums[index] = formatNumber(total) + " ₺";
        } else {
          sums[index] = "";
        }
      });

      return sums;
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .w-full {
    width: 100%;
  }
  .el-table__row {
    .cell {
      .process {
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }
    }
  }
  .badge {
    font-size: 12px;
    min-width: 100px;
    &-danger {
      background-color: red;
    }
  }
}
</style>