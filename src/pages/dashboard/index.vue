<template>
  <section class="dashboard">
    <!-- <div class="page-header">
      <h3 class="page-title">
        <div>
          <span class="page-title-icon bg-gradient-success text-white mr-2">
            <i class="mdi mdi-home"></i>
          </span>
          Anasayfa
        </div>
      </h3>
    </div> -->
    <div class="row">
      <div class="col-md-6 col-xl-3 stretch-card grid-margin">
        <div class="custom card bg-gradient-info card-img-holder text-white">
          <div class="card-body">
            <img
              src="../../assets/images/dashboard/circle.svg"
              class="card-img-absolute"
              alt="circle-image"
            />
            <h4 class="font-weight-normal mb-3">
              Toplam Alacak
              <i class="mdi mdi-cash-multiple mdi-24px float-right"></i>
            </h4>
            <h2 class="mb-5">{{ formatNumber(totalGlobalBalance) }} ₺</h2>
            <h6 class="card-text">Genel Bakiye</h6>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-xl-3 stretch-card grid-margin">
        <div class="custom card bg-success card-img-holder text-white">
          <div class="card-body">
            <img
              src="../../assets/images/dashboard/circle.svg"
              class="card-img-absolute"
              alt="circle-image"
            />
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="font-weight-normal mb-0">Periyodik Satış</h4>
              <select
                v-model="salesPeriod"
                class="form-control form-control-sm text-white"
                style="
                  width: auto;
                  background: rgba(255, 255, 255, 0.2);
                  border: none;
                  z-index: 999;
                  cursor: pointer;
                "
              >
                <option value="day" class="text-dark">Bugün</option>
                <option value="week" class="text-dark">Bu Hafta</option>
                <option value="month" class="text-dark">Bu Ay</option>
                <option value="year" class="text-dark">Bu Yıl</option>
                <option value="lastYear" class="text-dark">Geçen Yıl</option>
                <option value="last2Years" class="text-dark">Son 2 Yıl</option>
                <option value="last3Years" class="text-dark">Son 3 Yıl</option>
                <option value="allTime" class="text-dark">Tümü</option>
              </select>
            </div>
            <h2 class="mb-5">{{ formatNumber(salesPerformance) }} ₺</h2>
            <h6 class="card-text">Seçilen Periyot Toplamı</h6>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-xl-3 stretch-card grid-margin">
        <div class="custom card bg-gradient-success card-img-holder text-white">
          <div class="card-body">
            <img
              src="../../assets/images/dashboard/circle.svg"
              class="card-img-absolute"
              alt="circle-image"
            />
            <h4 class="font-weight-normal mb-3">
              Tahsilat Oranı
              <i class="mdi mdi-percent mdi-24px float-right"></i>
            </h4>
            <h2 class="mb-5">%{{ collectionRate }}</h2>
            <h6 class="card-text">Toplam Satışın Nakde Dönüşümü</h6>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-xl-3 stretch-card grid-margin">
        <div class="custom card bg-gradient-danger card-img-holder text-white">
          <div class="card-body">
            <img
              src="../../assets/images/dashboard/circle.svg"
              class="card-img-absolute"
              alt="circle-image"
            />
            <h4 class="font-weight-normal mb-3">
              Kritik Limit (20K+)
              <i class="mdi mdi-alert mdi-24px float-right"></i>
            </h4>
            <h2 class="mb-5">{{ criticalReceivablesSummary.count }} Firma</h2>
            <h6 class="card-text">
              Toplam: {{ formatNumber(criticalReceivablesSummary.volume) }} ₺
            </h6>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12 grid-margin">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title">
              Kritik Alacaklar (Borcu 20.000₺ ve Üzeri Olanlar)
            </h4>
            <div class="row align-items-center mb-3">
              <div class="col-12 col-md-4">
                <el-input
                  v-model="filter.search"
                  placeholder="Firma arayın"
                  clearable
                  prefix-icon="el-icon-search"
                />
              </div>
            </div>
            <div class="table-responsive">
              <el-table
                v-loading="loading"
                :data="paginatedCriticalReceivables"
                border
                show-summary
                :summary-method="getSummary"
                style="width: 100%"
                empty-text="Kritik limite ulaşan alacak bulunmuyor."
                @row-click="handleRowClick"
                class="cursor-pointer"
              >
                <el-table-column prop="company_name" label="Firma Adı" sortable>
                </el-table-column>
                <el-table-column prop="phone" label="Telefon" width="170px">
                  <template v-slot="scope">
                    <a :href="`tel:${scope.row.phone}`">{{
                      scope.row.phone
                    }}</a>
                  </template>
                </el-table-column>
                <el-table-column label="Bölge" width="135px">
                  <template v-slot="scope">
                    {{ getGroupNameList(scope.row.zones?.day) }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="Son İşl. Tar."
                  sortable
                  sort-by="lastActionDate"
                  width="120px"
                >
                  <template v-slot="scope">
                    {{ formatDate(scope.row.lastActionDate) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="totalDebt"
                  label="Toplam Borç"
                  sortable
                  width="140px"
                >
                  <template v-slot="scope">
                    <label class="badge badge-danger"
                      >{{ formatNumber(scope.row.totalDebt) }} ₺</label
                    >
                  </template>
                </el-table-column>
                <el-table-column fixed="right" label="İşlem" width="105">
                  <template v-slot="scope">
                    <el-button
                      type="primary"
                      size="small"
                      icon="el-icon-right"
                      plain
                      @click.stop="goToCustomer(scope.row.id)"
                      >Detay</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>

              <el-pagination
                background
                layout="prev, pager, next"
                :total="filteredCriticalReceivables.length"
                :page-size="pageSize"
                :current-page.sync="currentPage"
                @current-change="handlePageChange"
                style="margin-top: 20px; text-align: center"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-5 grid-margin stretch-card">
        <div class="card">
          <!-- <date-picker v-model= "time1" valueType= "format" inline></date-picker> -->
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { supabase } from "@/supabase";
import globalMixin from "@/mixins/global.mixin.js";
import { formatNumber } from "@/util/helpers";

export default {
  name: "dashboard",
  mixins: [globalMixin],
  components: {},
  data() {
    return {
      salesPeriod: "day", // day, week, month, year
      customers: [],
      transactions: [],
      loading: true,
      filter: {
        search: "",
      },
      currentPage: 1,
      pageSize: 5,
    };
  },
  computed: {
    totalGlobalBalance() {
      const totalSales = this.transactions
        .filter((t) => t.type === "Satis")
        .reduce((sum, t) => sum + (Number(t.sell_amount) || 0), 0);

      const totalCollections = this.transactions
        .filter((t) => t.type === "Tahsilat")
        .reduce((sum, t) => sum + (Number(t.collection_amount) || 0), 0);

      return totalSales - totalCollections;
    },
    salesPerformance() {
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      const start = new Date(now);
      let end = new Date(now);

      if (this.salesPeriod === "day") {
        start.setHours(0, 0, 0, 0);
      } else if (this.salesPeriod === "week") {
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Haftanın başı (Pazartesi)
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
      } else if (this.salesPeriod === "month") {
        start.setDate(1); // Ayın 1'i
        start.setHours(0, 0, 0, 0);
      } else if (this.salesPeriod === "year") {
        start.setMonth(0, 1); // Yılın başı (1 Ocak)
        start.setHours(0, 0, 0, 0);
      } else if (this.salesPeriod === "lastYear") {
        start.setFullYear(now.getFullYear() - 1);
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);

        end.setFullYear(now.getFullYear() - 1);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
      } else if (this.salesPeriod === "last2Years") {
        start.setFullYear(now.getFullYear() - 2);
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
      } else if (this.salesPeriod === "last3Years") {
        start.setFullYear(now.getFullYear() - 3);
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
      } else if (this.salesPeriod === "allTime") {
        start.setTime(0); // Epoch
      }

      return this.transactions
        .filter((t) => t.type === "Satis")
        .filter((t) => {
          const tDate = new Date(t.date);
          return tDate >= start && tDate <= end;
        })
        .reduce((sum, t) => sum + (Number(t.sell_amount) || 0), 0);
    },
    collectionRate() {
      const totalSales = this.transactions
        .filter((t) => t.type === "Satis")
        .reduce((sum, t) => sum + (Number(t.sell_amount) || 0), 0);

      const totalCollections = this.transactions
        .filter((t) => t.type === "Tahsilat")
        .reduce((sum, t) => sum + (Number(t.collection_amount) || 0), 0);

      if (totalSales <= 0) return 0;
      return ((totalCollections / totalSales) * 100).toFixed(1);
    },
    customerDebts() {
      return this.customers.map((customer) => {
        const cTrans = this.transactions.filter(
          (t) => t.customr_id === customer.id || t.customer_id === customer.id
        ); // Typo protection

        let sell = 0;
        let coll = 0;
        let lastActionDate = null;

        for (let t of cTrans) {
          if (t.type === "Satis") sell += Number(t.sell_amount) || 0;
          else if (t.type === "Tahsilat")
            coll += Number(t.collection_amount) || 0;

          const tDate = new Date(t.date);
          if (!lastActionDate || tDate > lastActionDate) {
            lastActionDate = tDate;
          }
        }

        return {
          ...customer,
          totalDebt: sell - coll,
          lastActionDate,
        };
      });
    },
    criticalReceivables() {
      return this.customerDebts
        .filter((c) => c.totalDebt >= 20000)
        .sort((a, b) =>
          (a.company_name || "").localeCompare(b.company_name || "", "tr")
        );
    },
    criticalReceivablesSummary() {
      const count = this.criticalReceivables.length;
      const volume = this.criticalReceivables.reduce(
        (sum, c) => sum + c.totalDebt,
        0
      );
      return { count, volume };
    },
    filteredCriticalReceivables() {
      let list = this.criticalReceivables;
      if (this.filter.search) {
        const search = this.filter.search.toLowerCase();
        list = list.filter((item) =>
          `${item.company_name} ${item.company_author || ""}`
            .toLowerCase()
            .includes(search)
        );
      }
      return list;
    },
    paginatedCriticalReceivables() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredCriticalReceivables.slice(start, end);
    },
  },
  async mounted() {
    await this.fetchData();
  },
  methods: {
    handlePageChange(page) {
      this.currentPage = page;
    },
    handleRowClick(row) {
      this.goToCustomer(row.id);
    },
    formatNumber(val) {
      return formatNumber(val);
    },
    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("tr-TR");
    },
    async fetchData() {
      this.loading = true;
      const tenant_id = localStorage.getItem("tenant_id");
      if (!tenant_id) return;

      const { data: customersData } = await supabase
        .from("customers")
        .select(`*, zones (id, name, day)`)
        .eq("tenant_id", tenant_id);

      const { data: transactionsData } = await supabase
        .from("transactions")
        .select("*")
        .eq("tenant_id", tenant_id);

      this.customers = customersData || [];
      this.transactions = transactionsData || [];
      this.loading = false;
    },
    getSummary({ columns }) {
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "Toplam";
          return;
        }
        if (column.property === "totalDebt") {
          const total = this.filteredCriticalReceivables.reduce(
            (sum, item) => sum + (Number(item.totalDebt) || 0),
            0
          );
          sums[index] = `${this.formatNumber(total)} ₺`;
        } else {
          sums[index] = "";
        }
      });
      return sums;
    },
    goToCustomer(customerId) {
      this.$router.push({
        name: "transactions",
        query: { q: customerId },
      });
    },
  },
};
</script>

<style scoped>
</style>