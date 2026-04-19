<template>
  <div>
    <div class="page-header">
      <h3 class="page-title">
        <div class="page-header__summary">
          <span class="page-title-icon bg-gradient-success text-white mr-2">
            <i class="mdi mdi-file-document menu-icon"></i>
          </span>
          <div class="page-header__summary-item">
            <span>{{ getCurrentCompany }}</span>
            <span>Hesap Ekstresi ({{ filteredData.length }})</span>
          </div>
        </div>
        <div>
          <el-button
            type="success"
            size="medium"
            icon="el-icon-circle-plus"
            @click="newRecord(0)"
            :disabled="disableAdd"
            >Satış</el-button
          >
          <el-button
            type="success"
            size="medium"
            icon="el-icon-circle-plus"
            @click="newRecord(1)"
            :disabled="disableAdd"
            >Tahsilat</el-button
          >
          <el-button
            type="info"
            size="medium"
            icon="el-icon-printer"
            @click="exportExtract"
            :disabled="!filteredData.length"
            >Dışa Aktar</el-button
          >
        </div>
      </h3>
    </div>
    <div class="card">
      <div class="custom card-body">
        <!-- <h3 class="text-md mb-3">{{ getCurrentCompany }}</h3> -->
        <div class="row">
          <!-- filter start -->
          <div class="col-2 col-sm-4 mb-3 pl-1 ml-3">
            <el-date-picker
              class="w-full"
              v-model="filter.transactionDate"
              type="daterange"
              range-separator="-"
              start-placeholder="İşlem Başlangıç"
              end-placeholder="İşlem Bitiş"
              format="dd/MM/yyyy"
              placeholder=""
              @change="changeDate"
              :disabled="filter.collectionDate"
            >
            </el-date-picker>
          </div>
          <div class="col-2 col-sm-4 mt-3 pl-0">
            <el-radio-group v-model="filter.transactionType" size="small">
              <el-radio :label="0">Satış</el-radio>
              <el-radio :label="1">Tahsilat</el-radio>
              <el-radio :label="null">Tümü</el-radio>
            </el-radio-group>
          </div>
          <div class="col-3 col-sm-4 mt-3 ml-auto">
            <div class="d-flex justify-content-end">
              <h4 class="text-lg">Toplam Borç:</h4>
              <!-- buradaki alan direkt servisten gelmeli, işlem sonraları direkt update olabilir. çünkü filtre yapınca değişiyor-->
              <span class="ml-2" style="font-size: 18px"
                >{{ totalDebt | formatNumber }} ₺</span
              >
            </div>
          </div>
          <!-- filter end -->

          <!-- en son yapılan işlem satışsa art(+), tahsilatsa eksi(-) -->

          <!-- yapılan her satış artı her tahsilat - olarak o müşterinin kalanına eklenecek -->
          <!-- kalan borcu göstemesek daha pratik oluyor. yukarıda bi yerde remaining i gösteririz. işlem sonrası oraya ekler ya oradan düşer. -->
          <div class="col-12 grid-margin">
            <el-table
              ref="mainTable"
              v-loading="loading"
              :data="paginatedData"
              border
              style="width: 100%"
              show-summary
              :summary-method="getSummaries"
              empty-text="Ekstre bulunamadı"
            >
              <el-table-column
                prop="transactionDate"
                label="İşlem Tarihi"
                width="154"
                sortable
              >
                <template v-slot="scope">
                  <template v-if="scope.row.id == 'temp'">
                    <el-date-picker
                      v-model="scope.row.transactionDate"
                      type="date"
                      format="dd.MM.yyyy"
                      placeholder=""
                      style="width: 133px"
                    />
                  </template>
                  <template v-else-if="scope.row.isEditing">
                    <el-date-picker
                      v-model="currentRow.transactionDate"
                      type="date"
                      format="dd.MM.yyyy"
                      placeholder=""
                      style="width: 133px"
                    />
                  </template>
                  <template v-else>
                    {{ scope.row.transactionDate | formatDate }}
                  </template>
                </template>
              </el-table-column>

              <el-table-column
                prop="transactionType"
                label="İşlem Türü"
                width="120"
              >
                <template v-slot="scope">
                  <label
                    v-if="scope.row.transactionType"
                    class="badge badge-gradient-success"
                    >Tahsilat</label
                  >
                  <label v-else class="badge badge-gradient-info">Satış</label>
                </template>
              </el-table-column>

              <el-table-column
                prop="sellAmount"
                label="Satış Tutarı"
                width="130"
              >
                <template v-slot="scope">
                  <template
                    v-if="
                      scope.row.id == 'temp' && scope.row.transactionType === 0
                    "
                  >
                    <price-input
                      v-model="scope.row.sellAmount"
                      :decimals="2"
                      :min="0"
                      size="mini"
                    />
                  </template>
                  <template
                    v-else-if="
                      scope.row.id == 'temp' && scope.row.transactionType === 1
                    "
                    >-</template
                  >
                  <template
                    v-else-if="
                      scope.row.isEditing && scope.row.transactionType === 0
                    "
                  >
                    <price-input
                      v-model="currentRow.sellAmount"
                      :decimals="2"
                      :min="0"
                      size="mini"
                      :placeholder="currentRow.placeholder"
                    />
                  </template>
                  <template v-else>
                    <span v-if="scope.row.transactionType">-</span>
                    <span v-else>{{
                      scope.row.sellAmount | formatNumber
                    }}</span>
                  </template>
                </template>
              </el-table-column>

              <el-table-column
                prop="collectionAmount"
                label="Tahsilat Tutarı"
                width="137"
              >
                <template v-slot="scope">
                  <template
                    v-if="
                      scope.row.id == 'temp' && scope.row.transactionType === 1
                    "
                  >
                    <price-input
                      v-model="scope.row.collectionAmount"
                      :decimals="2"
                      :min="0"
                      size="mini"
                    />
                  </template>
                  <template
                    v-else-if="
                      scope.row.id == 'temp' && scope.row.transactionType === 0
                    "
                    >-</template
                  >
                  <template
                    v-else-if="
                      scope.row.isEditing && scope.row.transactionType === 1
                    "
                  >
                    <price-input
                      v-model="currentRow.collectionAmount"
                      :decimals="2"
                      :min="0"
                      size="mini"
                      :placeholder="currentRow.placeholder"
                    />
                  </template>
                  <template v-else>
                    <span v-if="scope.row.transactionType">{{
                      scope.row.collectionAmount | formatNumber
                    }}</span>
                    <span v-else>-</span>
                  </template>
                </template>
              </el-table-column>

              <el-table-column
                prop="collectionType"
                label="Tahsilat Türü"
                width="145"
              >
                <template v-slot="scope">
                  <template
                    v-if="
                      scope.row.id == 'temp' && scope.row.transactionType === 1
                    "
                  >
                    <el-select
                      v-model="scope.row.collectionType"
                      filterable
                      clearable
                    >
                      <el-option
                        v-for="item in collectionTypeList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      >
                      </el-option>
                    </el-select>
                  </template>
                  <template
                    v-else-if="
                      scope.row.isEditing && scope.row.transactionType === 1
                    "
                  >
                    <el-select
                      v-model="currentRow.collectionType"
                      filterable
                      clearable
                    >
                      <el-option
                        v-for="item in collectionTypeList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      >
                      </el-option>
                    </el-select>
                  </template>
                  <template v-else>
                    {{ getCollectionTypeLabel(scope.row.collectionType) }}
                  </template>
                </template>
              </el-table-column>

              <!-- <el-table-column prop="remaining" label="Kalan Borç">
                <template v-slot="scope">
                  <template v-if="scope.row.id == 'temp' && scope.row.transactionType === 0">
                    {{ (scope.row.sellAmount + getCurrentRemaining) | formatNumber }}
                  </template>
                  <template v-else-if="scope.row.id == 'temp' && scope.row.transactionType === 1">
                    {{ scope.row.collectionAmount ? ((getCurrentRemaining - scope.row.collectionAmount)  | formatNumber ) : getCurrentRemaining | formatNumber}}
                  </template>
                  <template v-else-if="scope.row.isEditing && scope.row.transactionType === 0">
                    {{ (currentRow.sellAmount + getCurrentRemaining) | formatNumber }}
                  </template>
                  <template v-else-if="scope.row.isEditing && scope.row.transactionType === 1">
                    {{ currentRow.collectionAmount ? ((getCurrentRemaining - currentRow.collectionAmount)  | formatNumber ) : getCurrentRemaining | formatNumber}}
                  </template>
                  <template v-else>
                    {{ scope.row.remaining | formatNumber }}
                  </template>
                </template>
              </el-table-column> -->
              <el-table-column 
                prop="note" 
                label="Açıklama"
                :width="windowWidth <= 991 ? '300px' : ''"
              >
                <template v-slot="scope">
                  <template v-if="scope.row.id == 'temp'">
                    <el-input
                      type="textarea"
                      class="no-resize-textarea"
                      v-model="scope.row.note"
                      placeholder="Açıklama girin"
                      :autosize="false"
                    ></el-input>
                  </template>
                  <template v-else-if="scope.row.isEditing">
                    <el-input
                      type="textarea"
                      class="no-resize-textarea"
                      v-model="currentRow.note"
                      placeholder="Açıklama girin"
                      :autosize="false"
                    ></el-input>
                  </template>
                  <template v-else>
                    <div>{{ scope.row.note }}</div>
                  </template>
                  <!-- <el-tooltip v-else class="item" effect="dark" :content="scope.row.note ? scope.row.note : 'Henüz açıklama belirtilmedi'" placement="left">
                    <div class="cursor gap-5">
                      <i class="el-icon-info"></i>
                      <span>Bilgi</span>
                    </div>
                  </el-tooltip> -->
                </template>
              </el-table-column>

              <el-table-column fixed="right" label="İşlem" width="100">
                <template v-slot="scope">
                  <el-button
                    v-if="scope.row.id == 'temp'"
                    type="success"
                    size="small"
                    icon="el-icon-check"
                    circle
                    @click="saveTempRow(scope.row)"
                    :disabled="checkValidation(scope.row)"
                  >
                  </el-button>
                  <el-button
                    v-else-if="scope.row.isEditing"
                    type="success"
                    size="small"
                    icon="el-icon-check"
                    circle
                    @click="saveChanges(scope.row)"
                    :disabled="isEditSaveDisabled"
                  ></el-button>
                  <el-button
                    v-else
                    type="primary"
                    size="small"
                    icon="el-icon-edit"
                    circle
                    @click="editRow(scope.row)"
                  ></el-button>
                  <el-button
                    v-if="scope.row.id == 'temp' || scope.row.isEditing"
                    type="danger"
                    size="small"
                    icon="el-icon-close"
                    circle
                    @click="cancelTempRow(scope.row)"
                  ></el-button>
                  <el-button
                    v-else
                    type="danger"
                    size="small"
                    icon="el-icon-delete"
                    circle
                    @click="open(scope.row)"
                    :disabled="scope.row.totalOutputWeight > 0"
                  ></el-button>
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

    <div id="print-area" style="display: none">
      <table class="print-table">
        <thead>
          <tr>
            <th>Firma</th>
            <th>İşlem Tarihi</th>
            <th>Satış Tutarı</th>
            <th>Tahs. Tarihi</th>
            <th>Tahs. Tutarı</th>
            <th>Önceki Borç</th>
            <th>Güncel Borç</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in getRouteList" :key="row.companyName">
            <td>{{ row.companyName }}</td>
            <td>{{ row.createdDate }}</td>
            <td>{{ row.sellAmount }}</td>
            <td>{{ row.collectionDate }}</td>
            <td>{{ row.collectionAmount }}</td>
            <td>{{ row.remaining | formatNumber }}</td>
            <td>{{ row.currentDebt }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <el-dialog
      :title="getPopupTitle"
      :visible.sync="dialogVisible"
      width="37%"
      @close="closePopup"
    >
      <el-form label-position="top" :model="formData" label-width="100px">
        <h4 class="mb-3"></h4>
        <!-- <el-alert
          v-if="!isEditMode"
          title="Bu ekranda, yeni satış ya da tahsilat işlemi yapabilirsiniz."
          type="info"
          :closable="false"
          show-icon>
        </el-alert> -->
        <hr />
        <!-- <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Ad Soyad">
              <el-input v-model="fullName" disabled> </el-input>
            </el-form-item>
          </el-col>
        </el-row> -->
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="İşlem Tarihi" class="picker-width">
              <el-date-picker
                v-model="filter.transactionDate"
                type="date"
                format="dd.MM.yyyy"
                placeholder=""
              >
              </el-date-picker>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Satış Tutarı">
              <price-input
                v-model="formData.sellAmount"
                :decimals="2"
                :min="0"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Tahsilat Tarihi" class="picker-width">
              <el-date-picker
                v-model="filter.collectionDate"
                type="date"
                format="dd.MM.yyyy"
                placeholder=""
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Tahsil Edilen">
              <price-input
                v-model="formData.collectionAmount"
                :decimals="2"
                :min="0"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Devreden Borç">
              <price-input
                v-model="formData.outstandingDebt"
                :decimals="2"
                :min="0"
                :disabled="!checkOutstandingDebt"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="İşlemden Kalan Borç">
              <price-input :value="calcRemaining" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Not" prop="note">
              <el-input
                type="textarea"
                class="no-resize-textarea"
                v-model="formData.note"
                placeholder="Açıklama girin"
                :autosize="false"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <h4 class="total-debt">
              <div>
                <strong>Toplam Borç:</strong>
                <p
                  v-if="formData.outstandingDebt > 0"
                  class="text-xsmall mb-0 absolute"
                >
                  (Devreden borç dahil edilmiştir.)
                </p>
              </div>
              {{ getTotalDebt | formatNumber }}₺
            </h4>
          </el-col>
        </el-row>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Vazgeç</el-button>
        <el-button type="primary">Kaydet</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { supabase } from "@/supabase";
import { formatNumber } from "@/util/helpers";
import PriceInput from "@/components/forms/PriceInput.vue";
import globalMixin from "@/mixins/global.mixin.js";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import logoImage from "@/assets/images/logo.png";

export default {
  name: "Customers",
  mixins: [globalMixin],
  components: {
    PriceInput,
  },
  data() {
    return {
      pageSize: 9,
      currentPage: 1,
      currentCustomer: {
        id: null,
        currentCompany: "",
      },
      dialogVisible: false,
      filter: {
        transactionType: null,
        transactionDate: "",
        search: "",
        group: "",
        groupForRoute: "",
        visitType: "Tümü",
      },
      tempRow: null,
      disableAdd: false,
      collectionTypeList: [
        { label: "Nakit", value: "NAKİT" },
        { label: "Kredi Kartı", value: "KREDİ KARTI" },
        { label: "Havale/EFT", value: "HAVALE/EFT" },
      ],
      exportTableData: [],
      tempTransactionId: null,
      isEditMode: false,
      currentRow: {},
      transactions: [],
      currentRemaining: 0,
      isTransactionsDetail: false,
      formData: {
        companyName: "",
        fullName: "",
        transactionDate: null,
        sellAmount: 0,
        collectionAmount: 0,
        collectionDate: null,
        remaining: 0,
        note: "",
      },
      loading: false,
      windowWidth: window.innerWidth,
    };
  },
  mounted() {
    window.addEventListener("resize", this.handleResize);
    const { q } = this.$route.query;
    this.currentCustomer.id = q;
    if (q) {
      this.fetchCustomer(q);
      this.fetchTransactions(q);
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  },
  computed: {
    getPopupTitle() {
      return this.isEditMode ? "Hareketi Düzenle" : "Yeni Satış Oluştur";
    },
    getTransactionList() {
      return this.transactions || [];
    },
    getCurrentRemaining() {
      return this.currentRemaining;
    },
    checkOutstandingDebt() {
      return this.isEditMode ? !this.isTransactionsDetail : "";
    },
    paginatedData() {
      const list = this.filteredData || [];
      const fullList = this.tempRow ? [this.tempRow, ...list] : list;

      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;

      return fullList.slice(start, end);
    },
    checkValidation() {
      return (row) =>
        row.transactionType == 0
          ? !row.sellAmount
          : row.collectionAmount == 0 || row.collectionType == null;
    },
    getRouteList() {
      return this.exportTableData.filter((item) => {
        if (this.filter.groupForRoute) {
          if (item.group !== Number(this.filter.groupForRoute)) return false;
        }

        if (this.filter.visitType === 1) {
          if (!(item.remaining > 0)) return false;
        }

        /* if (this.filter.isOutstandingDebt === 1) {
          if (!(item.outstandingDebt > 0)) return false;
        } */

        return true;
      });
    },
    todayGroupNumber() {
      const today = new Date().getDay();
      if (today === 0) {
        return null;
      }
      return today;
    },
    filteredData() {
      /* let list = this.getTransactionList.filter(extract => extract.customerId == this.currentCustomer.id) || []; */
      let list = this.getTransactionList || [];

      // Grup filtresi
      /* if (this.filter.group) {
        list = list.filter(
          item => String(item.customerId) === String(this.filter.group)
        );
      } */

      // İşlem tipi filtresi
      if (
        this.filter.transactionType !== null &&
        this.filter.transactionType !== undefined
      ) {
        list = list.filter(
          (item) =>
            Number(item.transactionType) === Number(this.filter.transactionType)
        );
      }

      // Tarih aralığı filtresi (baş. <= işlem tarihi <= bitiş)
      if (
        this.filter.transactionDate &&
        Array.isArray(this.filter.transactionDate) &&
        this.filter.transactionDate.length === 2
      ) {
        const [rawStart, rawEnd] = this.filter.transactionDate;

        // rawStart / rawEnd Date objesi veya ISO string olabilir
        const startDate = rawStart ? new Date(rawStart) : null;
        const endDate = rawEnd ? new Date(rawEnd) : null;

        if (
          startDate &&
          !isNaN(startDate.getTime()) &&
          endDate &&
          !isNaN(endDate.getTime())
        ) {
          // start günün başı, end günün sonu (kullanıcının local zamanına göre)
          const startTs = new Date(startDate.setHours(0, 0, 0, 0)).getTime();
          const endTs = new Date(endDate.setHours(23, 59, 59, 999)).getTime();

          list = list.filter((item) => {
            if (!item.transactionDate) return false;
            const t = new Date(item.transactionDate);
            if (isNaN(t.getTime())) return false;
            const tTs = t.getTime();
            return tTs >= startTs && tTs <= endTs;
          });
        }
      }

      // Arama filtresi
      if (!this.filter.search) {
        return list;
      }

      const search = this.filter.search.toLowerCase();
      return list.filter((item) =>
        `${item.note}`.toLowerCase().includes(search)
      );
    },
    calcRemaining() {
      return this.formData.sellAmount - this.formData.collectionAmount;
    },
    getTotalDebt() {
      return this.calcRemaining + this.formData.outstandingDebt;
    },
    getCurrentCompany() {
      return this.currentCustomer.currentCompany;
    },
    totalDebt() {
      // Filtreden bağımsız, tüm kayıtlar üzerinden hesaplama
      const all = this.getTransactionList;
      const totalSell = all.reduce(
        (acc, curr) => acc + (Number(curr.sellAmount) || 0),
        0
      );
      const totalCollection = all.reduce(
        (acc, curr) => acc + (Number(curr.collectionAmount) || 0),
        0
      );
      return totalSell - totalCollection;
    },
    isEditSaveDisabled() {
      const type = this.currentRow.__transactionType__;
      if (type === 1) {
        // Tahsilat
        const amount = Number(this.currentRow.collectionAmount);
        if (!amount || amount <= 0) return true;
        if (!this.currentRow.collectionType) return true;
      } else {
        // Satış
        const amount = Number(this.currentRow.sellAmount);
        if (!amount || amount <= 0) return true;
      }
      return false;
    },
  },
  methods: {
    toLocalISOString(date) {
      const d = new Date(date);
      d.setHours(12, 0, 0, 0);
      return d.toISOString();
    },
    handleResize() {
      this.windowWidth = window.innerWidth;
    },
    getCollectionTypeLabel(value) {
      if (!value) return "-";
      const found = this.collectionTypeList.find(
        (item) => item.value === value
      );
      return found ? found.label : value;
    },
    async fetchCustomer(customerId) {
      const { data, error } = await supabase
        .from("customers")
        .select("company_name")
        .eq("id", customerId)
        .single();

      if (!error && data) {
        this.currentCustomer.currentCompany = data.company_name;
      }
    },
    async fetchTransactions(customerId) {
      this.loading = true;
      const tenant_id = localStorage.getItem("tenant_id");
      if (!tenant_id || !customerId) {
        this.loading = false;
        return;
      }

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("customer_id", customerId)
        .eq("tenant_id", tenant_id)
        .order("date", { ascending: false });

      if (error) {
        console.error("fetchTransactions error:", error);
        return;
      }

      this.transactions = (data || []).map((t) => ({
        id: t.id,
        transactionType: t.type === "Satis" ? 0 : 1,
        sellAmount: Number(t.sell_amount || 0),
        collectionAmount: Number(t.collection_amount || 0),
        collectionType:
          t.collection_type && t.collection_type !== "-"
            ? t.collection_type
            : null,
        note: t.description || "",
        transactionDate: t.date,
        isEditing: false,
        // orijinal DB alanları (güncelleme için)
        _raw: t,
      }));

      this.loading = false;
    },
    changeDate(val) {
      this.currentPage = 1;
      this.filter.transactionDate = val.map((d) => {
        const newDate = new Date(d);
        newDate.setHours(12, 0, 0, 0);
        return newDate;
      });
    },
    async exportExtract() {
      const list = this.filteredData;

      const totalSale = list?.reduce((acc, item) => item.sellAmount + acc, 0);
      const totalCollection = list?.reduce(
        (acc, item) => item.collectionAmount + acc,
        0
      );

      const body = [
        [
          { text: "İşlem Tarihi", bold: true },
          { text: "İşlem Türü", bold: true },
          { text: "Satış Tutarı", bold: true },
          { text: "Tahs. Tutarı", bold: true },
          { text: "Tahsilat Türü", bold: true },
        ],
      ];

      list.forEach((extract) => {
        body.push([
          { text: this.$options.filters.formatDate(extract.transactionDate) },
          { text: extract.transactionType ? "Tahsilat" : "Satış" },
          {
            text: extract.transactionType
              ? "-"
              : this.$options.filters.formatNumber(extract.sellAmount),
          },
          {
            text: extract.transactionType
              ? this.$options.filters.formatNumber(extract.collectionAmount)
              : "-",
          },
          { text: extract.transactionType ? extract.collectionType : "-" },
        ]);
      });

      body.push([{ text: " ", colSpan: 5 }, " ", " ", " ", " "]);

      body.push([
        "",
        { text: "Toplam:", alignment: "left", bold: true, fillColor: "#ddd" },
        {
          text: `${this.$options.filters.formatNumber(totalSale)} ₺`,
          bold: true,
        },
        {
          text: `${this.$options.filters.formatNumber(totalCollection)} ₺`,
          bold: true,
        },
        {
          text: `Kalan: ${this.$options.filters.formatNumber(
            totalSale - totalCollection
          )} ₺`,
          bold: true,
          fillColor: "#ddd",
        },
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
            text: `${this.currentCustomer.currentCompany} - Ekstre`,
            style: "zoneName",
          },
          {
            table: {
              headerRows: 1,
              widths: [80, 80, 80, 80, "*"],
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

      let dateBetween;
      if (this.filter.transactionDate?.length) {
        dateBetween = this.filter.transactionDate
          ?.map((date) => this.$options.filters.formatDate(date))
          .join(" - ");
        docDefinition.content.splice(2, 0, {
          text: `[${dateBetween}]`,
          style: "zoneName",
        });
      } else {
        docDefinition.content.splice(2, 0, {
          text: `[${new Date().toLocaleDateString("tr-TR")}]`,
          style: "zoneName",
        });
      }

      pdfMake.createPdf(docDefinition).open();
    },
    handlePageChange(page) {
      this.currentPage = page;
    },

    cancelTempRow(row) {
      this.tempRow = null;
      this.disableAdd = false;
      row.isEditing = false;
    },
    async saveChanges(row) {
      const updatePayload = {};

      // İşlem tarihi güncellemesi
      if (this.currentRow.transactionDate) {
        updatePayload.date = this.toLocalISOString(
          this.currentRow.transactionDate
        );
      }

      if (row.transactionType === 1) {
        // Tahsilat
        if (
          this.currentRow.collectionAmount != null &&
          this.currentRow.collectionAmount !== ""
        ) {
          updatePayload.collection_amount = Number(
            this.currentRow.collectionAmount
          );
        }
        if (
          this.currentRow.collectionType != null &&
          this.currentRow.collectionType !== ""
        ) {
          updatePayload.collection_type = this.currentRow.collectionType;
        }
      } else {
        // Satış
        if (
          this.currentRow.sellAmount != null &&
          this.currentRow.sellAmount !== ""
        ) {
          updatePayload.sell_amount = Number(this.currentRow.sellAmount);
        }
      }

      if (this.currentRow.note != null) {
        updatePayload.description = this.currentRow.note;
      }

      const { error } = await supabase
        .from("transactions")
        .update(updatePayload)
        .eq("id", row.id);

      if (error) {
        console.error("update error:", error);
        this.$notify.error({ title: "Hata", message: "Güncelleme başarısız." });
        return;
      }

      row.isEditing = false;
      this.$notify.success({
        title: "Başarılı",
        message: "İşlem güncellendi.",
      });
      await this.fetchTransactions(this.currentCustomer.id);
    },
    editRow(row) {
      this.getTransactionList.forEach((r) => (r.isEditing = false));
      row.isEditing = true;

      if (row.transactionType === 1) {
        // Tahsilat
        this.currentRow = {
          __transactionType__: 1,
          transactionDate: row.transactionDate,
          collectionAmount: null,
          collectionType: row.collectionType || null,
          placeholder: row.collectionAmount,
          note: row.note,
        };
      } else {
        // Satış
        this.currentRow = {
          __transactionType__: 0,
          transactionDate: row.transactionDate,
          sellAmount: null,
          placeholder: row.sellAmount,
          note: row.note,
        };
      }
    },
    newRecord(type) {
      if (this.tempRow) return;
      this.disableAdd = true;

      this.tempRow = {
        id: "temp",
        companyId: this.currentCustomer.id,
        companyName: "",
        sellAmount: 0,
        fullName: "",
        collectionAmount: 0,
        transactionType: type ? 1 : 0,
        amount: null,
        description: "",
        transactionDate: new Date().toISOString(),
        remaining: null,

        collectionType: null,
        collectionTypeName: "",
      };
    },
    async saveTempRow(row) {
      const tenant_id = localStorage.getItem("tenant_id");
      const customer_id = this.currentCustomer.id;

      if (!tenant_id || !customer_id) {
        this.$notify.error({ title: "Hata", message: "Oturum bilgisi eksik." });
        return;
      }

      let payload;

      if (row.transactionType === 0) {
        // Satış
        payload = {
          type: "Satis",
          sell_amount: Number(row.sellAmount) || 0,
          collection_amount: 0,
          collection_type: "-",
          description: row.note || "",
          tenant_id,
          customer_id,
          date: row.transactionDate
            ? this.toLocalISOString(row.transactionDate)
            : this.toLocalISOString(new Date()),
        };
      } else {
        // Tahsilat
        payload = {
          type: "Tahsilat",
          sell_amount: 0,
          collection_amount: Number(row.collectionAmount) || 0,
          collection_type: row.collectionType || "-",
          description: row.note || "",
          tenant_id,
          customer_id,
          date: row.transactionDate
            ? this.toLocalISOString(row.transactionDate)
            : this.toLocalISOString(new Date()),
        };
      }

      const { error } = await supabase.from("transactions").insert([payload]);

      if (error) {
        console.error("insert error:", error);
        this.$notify.error({ title: "Hata", message: "Kayıt eklenemedi." });
        return;
      }

      this.$notify.success({ title: "Başarılı", message: "İşlem kaydedildi." });
      this.tempRow = null;
      this.disableAdd = false;
      await this.fetchTransactions(customer_id);
    },
    async open(row) {
      try {
        await this.$confirm(
          "Bu işlemi silmek istediğinize emin misiniz?",
          "Onay",
          {
            confirmButtonText: "Evet, Sil",
            cancelButtonText: "Hayır",
            type: "warning",
          }
        );

        const { error } = await supabase
          .from("transactions")
          .delete()
          .eq("id", row.id);

        if (error) {
          console.error("delete error:", error);
          this.$notify.error({ title: "Hata", message: "Silme başarısız." });
          return;
        }

        this.$notify.success({ title: "Başarılı", message: "İşlem silindi." });
        await this.fetchTransactions(this.currentCustomer.id);
      } catch {
        // İptal edildi
      }
    },
    closePopup() {
      this.dialogVisible = false;
    },
    isOpenDialog(type, row = {}, isChild = false) {
      this.isEditMode = type === "edit";
      this.isTransactionsDetail = isChild;

      if (this.isEditMode) {
        this.fillForm(row);
      } else {
        this.resetFormData();
      }
      this.formData.companyName = row.companyName || "";
      this.dialogVisible = true;
    },
    resetFormData() {
      this.formData = {
        companyName: "",
        fullName: "",
        transactionDate: null,
        sellAmount: 0,
        collectionAmount: 0,
        collectionDate: null,
        remaining: 0,
        outstandingDebt: 0,
        note: "",
      };
    },
    fillForm(row) {
      this.formData = {
        ...this.formData,
        ...row,
      };
    },
    getSummaries(param) {
      const { columns } = param;
      const sums = [];

      // Listenin son elemanının remaining değeri
      const totalRemaining = Number(
        this.filteredData[this.filteredData.length - 1]?.remaining || 0
      );

      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "Toplam:";
          return;
        }

        const prop = column?.property;

        const isCalculatable =
          prop &&
          (prop.includes("sellAmount") ||
            prop.includes("collectionAmount") ||
            prop.includes("remaining"));

        if (isCalculatable) {
          // remaining kolonu için reduce yapılmayacak
          if (prop === "remaining") {
            sums[index] = formatNumber(totalRemaining) + " ₺";
            return;
          }

          // Diğer kolonlar normal şekilde toplanır
          const total = this.filteredData.reduce((prev, curr) => {
            const val = Number(curr[prop]);
            return isNaN(val) ? prev : prev + val;
          }, 0);

          sums[index] = formatNumber(total) + " ₺";
        } else {
          sums[index] = "";
        }
      });

      return sums;
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
          column?.property && column.property.includes("remaining");

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
  },
  watch: {
    $route: {
      async handler(value) {
        const q = value.query?.q;
        if (q) {
          this.currentCustomer.id = q;
          await this.fetchCustomer(q);
          await this.fetchTransactions(q);
          return;
        }
        this.currentCustomer.id = null;
        this.transactions = [];
      },
      immediate: true,
      deep: true,
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .badge {
    font-size: 12px;
    width: 100px;
  }
  .w-full {
    width: 100%;
  }
  .el-table__cell.el-table__expanded-cell {
    padding-top: 0 !important;
    padding-bottom: 0 !important;

    .el-table__header-wrapper {
      display: none;
    }
  }
  .transaction-detail {
    padding-left: 662px;
    &.revise {
      padding-left: 482px !important;
    }
    .el-table--border {
      border-right: none;
      border-top: none;
    }
  }
  .total-debt {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 50px;
  }
  .no-resize-textarea {
    min-height: 33px;
    textarea {
      height: 38px !important;
    }
  }
}
</style>