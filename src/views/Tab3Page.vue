<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>Reports</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="reports-page">
      <section class="page-shell">
        <section class="screen-head">
          <div>
            <span>Store</span>
            <h1>Reports</h1>
          </div>
          <ion-button fill="clear" size="small" @click="getProducts">
            <ion-icon slot="icon-only" :icon="refreshOutline" />
          </ion-button>
        </section>

        <ion-item v-if="errorMessage" class="state-item" color="danger" lines="none">
          <ion-icon slot="start" :icon="alertCircleOutline" />
          <ion-label>{{ errorMessage }}</ion-label>
        </ion-item>

        <section class="kpi-grid">
          <article class="kpi-card">
            <span>Catalog value</span>
            <strong>{{ formatPrice(inventoryValue) }}</strong>
          </article>
          <article class="kpi-card">
            <span>Average price</span>
            <strong>{{ formatPrice(averagePrice) }}</strong>
          </article>
          <article class="kpi-card">
            <span>Low stock</span>
            <strong>{{ lowStockProducts.length }}</strong>
          </article>
          <article class="kpi-card">
            <span>Out of stock</span>
            <strong>{{ outOfStockProducts.length }}</strong>
          </article>
        </section>

        <section class="report-grid">
          <article class="report-panel">
            <div class="panel-header">
              <h2>Top inventory value</h2>
              <span>{{ topProducts.length }} items</span>
            </div>
            <div v-if="isLoading" class="report-list">
              <ion-skeleton-text v-for="index in 4" :key="index" animated class="skeleton-line" />
            </div>
            <div v-else class="report-list">
              <div v-for="product in topProducts" :key="product.id" class="report-row">
                <div>
                  <strong>{{ product.name }}</strong>
                  <span>{{ product.stock }} units at {{ formatPrice(product.price) }}</span>
                </div>
                <b>{{ formatPrice(product.price * product.stock) }}</b>
              </div>
            </div>
          </article>

          <article class="report-panel">
            <div class="panel-header">
              <h2>Restock watch</h2>
              <span>{{ lowStockProducts.length + outOfStockProducts.length }} alerts</span>
            </div>
            <div v-if="isLoading" class="report-list">
              <ion-skeleton-text v-for="index in 4" :key="index" animated class="skeleton-line" />
            </div>
            <div v-else-if="restockList.length === 0" class="empty-panel">
              <ion-icon :icon="checkmarkCircleOutline" />
            </div>
            <div v-else class="report-list">
              <div v-for="product in restockList" :key="product.id" class="report-row">
                <div>
                  <strong>{{ product.name }}</strong>
                  <span>#{{ product.id }}</span>
                </div>
                <ion-badge :color="product.stock === 0 ? 'danger' : 'warning'">
                  {{ product.stock }} left
                </ion-badge>
              </div>
            </div>
          </article>
        </section>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import {
  IonBadge,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { alertCircleOutline, checkmarkCircleOutline, refreshOutline } from 'ionicons/icons';
import { supabase } from '@/utils/supabase';

const products = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');

const inventoryValue = computed(() => products.value.reduce(
  (sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0),
  0,
));
const averagePrice = computed(() => {
  if (products.value.length === 0) return 0;

  return products.value.reduce((sum, product) => sum + Number(product.price || 0), 0) / products.value.length;
});
const lowStockProducts = computed(() => products.value.filter((product) => product.stock > 0 && product.stock <= 10));
const outOfStockProducts = computed(() => products.value.filter((product) => product.stock === 0));
const restockList = computed(() => [...outOfStockProducts.value, ...lowStockProducts.value]);
const topProducts = computed(() => [...products.value]
  .sort((a, b) => (Number(b.price) * Number(b.stock)) - (Number(a.price) * Number(a.stock)))
  .slice(0, 5));

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(price || 0));
}

async function getProducts() {
  isLoading.value = true;
  errorMessage.value = '';

  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, stock, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Could not load reports:', error);
    errorMessage.value = error.message;
    products.value = [];
  } else {
    products.value = data || [];
  }

  isLoading.value = false;
}

onMounted(() => {
  getProducts();
});
</script>

<style scoped>
.reports-page {
  --background: #f3f4f1;
  color: #172026;
}

.page-shell {
  display: grid;
  gap: 10px;
  padding: 10px;
}

.screen-head {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 2px 2px 4px;
}

.screen-head span {
  color: #69747a;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
}

.screen-head h1 {
  margin: 1px 0 0;
  color: #11181d;
  font-size: 1.75rem;
  font-weight: 850;
  letter-spacing: 0;
  line-height: 1.05;
}

.kpi-grid,
.report-grid {
  display: grid;
  gap: 8px;
}

.kpi-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.kpi-card,
.report-panel {
  border: 1px solid #dce4e7;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(17, 24, 29, 0.05);
}

.kpi-card {
  display: grid;
  gap: 5px;
  min-height: 82px;
  padding: 11px;
}

.kpi-card span,
.panel-header span,
.report-row span {
  color: #65737b;
  font-size: 0.74rem;
  font-weight: 750;
}

.kpi-card span {
  text-transform: uppercase;
}

.kpi-card strong {
  color: #142029;
  font-size: clamp(1.08rem, 4.4vw, 1.5rem);
  line-height: 1.1;
}

.report-panel {
  padding: 12px;
}

.panel-header,
.report-row {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.panel-header {
  margin-bottom: 10px;
}

.panel-header h2 {
  margin: 0;
  color: #142029;
  font-size: 1.1rem;
}

.report-list {
  display: grid;
  gap: 8px;
}

.report-row {
  min-height: 56px;
  padding: 10px;
  border-radius: 8px;
  background: #f4f6f4;
}

.report-row div {
  display: grid;
  gap: 4px;
}

.report-row strong {
  color: #142029;
}

.report-row b {
  white-space: nowrap;
}

.empty-panel {
  display: grid;
  place-items: center;
  min-height: 120px;
  color: #65737b;
  text-align: center;
}

.empty-panel ion-icon {
  color: #16a34a;
  font-size: 2.1rem;
}

.state-item {
  border-radius: 8px;
}

.skeleton-line {
  width: 100%;
  height: 58px;
  border-radius: 8px;
}

@media (min-width: 920px) {
  .page-shell {
    padding: 18px;
    gap: 14px;
  }

  .kpi-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .report-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .report-row {
    align-items: start;
  }
}
</style>
