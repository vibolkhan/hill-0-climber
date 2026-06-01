<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>Inventory</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="inventory-page">
      <section class="page-shell">
        <section class="screen-head">
          <div>
            <span>Stockroom</span>
            <h1>Inventory</h1>
          </div>
          <ion-button fill="clear" size="small" @click="getProducts">
            <ion-icon slot="icon-only" :icon="refreshOutline" />
          </ion-button>
        </section>

        <form class="add-inventory-panel" @submit.prevent="addInventoryItem">
          <div class="panel-head">
            <div>
              <span>New SKU</span>
              <h2>Add inventory</h2>
            </div>
            <ion-button type="submit" size="small" :disabled="isSavingProduct || !canSaveProduct">
              {{ isSavingProduct ? 'Saving' : 'Add item' }}
            </ion-button>
          </div>

          <div class="inventory-form-grid">
            <label>
              <span>Name</span>
              <input v-model.trim="newProduct.name" type="text" autocomplete="off" required>
            </label>
            <label>
              <span>Price</span>
              <input v-model.number="newProduct.price" type="number" min="0" step="0.01" required>
            </label>
            <label>
              <span>Stock</span>
              <input v-model.number="newProduct.stock" type="number" min="0" step="1" required>
            </label>
            <label>
              <span>Supplier</span>
              <select v-model="newProduct.supplier_id">
                <option :value="null">No supplier</option>
                <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                  {{ supplier.name }}
                </option>
              </select>
            </label>
            <label class="description-field">
              <span>Description</span>
              <input v-model.trim="newProduct.description" type="text" autocomplete="off">
            </label>
          </div>
        </form>

        <section class="summary-grid">
          <article class="summary-card">
            <span>Total SKUs</span>
            <strong>{{ products.length }}</strong>
          </article>
          <article class="summary-card">
            <span>Units on hand</span>
            <strong>{{ totalUnits }}</strong>
          </article>
          <article class="summary-card">
            <span>Inventory value</span>
            <strong>{{ formatPrice(inventoryValue) }}</strong>
          </article>
        </section>

        <section class="inventory-toolbar">
          <ion-searchbar
            v-model="searchTerm"
            class="inventory-search"
            placeholder="Search inventory"
            show-clear-button="focus"
          />
        </section>

        <ion-item v-if="errorMessage" class="state-item" color="danger" lines="none">
          <ion-icon slot="start" :icon="alertCircleOutline" />
          <ion-label>{{ errorMessage }}</ion-label>
        </ion-item>

        <ion-item v-if="successMessage" class="state-item" color="success" lines="none">
          <ion-label>{{ successMessage }}</ion-label>
        </ion-item>

        <section v-else-if="isLoading" class="inventory-list">
          <article v-for="index in 5" :key="index" class="inventory-row">
            <ion-skeleton-text animated class="skeleton-name" />
            <ion-skeleton-text animated class="skeleton-small" />
            <ion-skeleton-text animated class="skeleton-small" />
          </article>
        </section>

        <section v-else class="inventory-list">
          <article v-for="product in filteredProducts" :key="product.id" class="inventory-row">
            <div class="product-cell">
              <span>#{{ product.id }}</span>
              <strong>{{ product.name }}</strong>
              <small v-if="product.description" class="product-description">{{ product.description }}</small>
              <small v-if="product.suppliers?.name">Supplier {{ product.suppliers.name }}</small>
              <small v-if="product.created_at">Added {{ formatDate(product.created_at) }}</small>
            </div>
            <div class="metric-cell">
              <span>Price</span>
              <strong>{{ formatPrice(product.price) }}</strong>
            </div>
            <div class="metric-cell">
              <span>Stock</span>
              <strong>{{ product.stock }}</strong>
            </div>
            <ion-badge :color="badgeColor(product.stock)">
              {{ stockLabel(product.stock) }}
            </ion-badge>
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
  IonSearchbar,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { alertCircleOutline, refreshOutline } from 'ionicons/icons';
import { supabase } from '@/utils/supabase';

const products = ref([]);
const suppliers = ref([]);
const isLoading = ref(true);
const isSavingProduct = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const searchTerm = ref('');
const newProduct = ref(getEmptyProduct());

const filteredProducts = computed(() => {
  const query = searchTerm.value.trim().toLowerCase();

  if (!query) return products.value;

  return products.value.filter((product) => product.name.toLowerCase().includes(query)
    || product.description?.toLowerCase().includes(query)
    || product.suppliers?.name?.toLowerCase().includes(query)
    || String(product.id).includes(query));
});
const totalUnits = computed(() => products.value.reduce((sum, product) => sum + Number(product.stock || 0), 0));
const inventoryValue = computed(() => products.value.reduce(
  (sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0),
  0,
));
const canSaveProduct = computed(() => newProduct.value.name.trim().length > 0
  && Number(newProduct.value.price) >= 0
  && Number(newProduct.value.stock) >= 0);

function getEmptyProduct() {
  return {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    supplier_id: null,
  };
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(price || 0));
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

function stockLabel(stock) {
  if (stock === 0) return 'Out';
  if (stock <= 10) return 'Low';
  return 'Healthy';
}

function badgeColor(stock) {
  if (stock === 0) return 'danger';
  if (stock <= 10) return 'warning';
  return 'success';
}

async function getProducts() {
  isLoading.value = true;
  errorMessage.value = '';

  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price, stock, created_at, suppliers(name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Could not load inventory:', error);
    errorMessage.value = error.message;
    products.value = [];
  } else {
    products.value = data || [];
  }

  isLoading.value = false;
}

async function getSuppliers() {
  const { data, error } = await supabase
    .from('suppliers')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) {
    console.error('Could not load suppliers:', error);
    return;
  }

  suppliers.value = data || [];
}

async function addInventoryItem() {
  if (!canSaveProduct.value || isSavingProduct.value) return;

  isSavingProduct.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  const productPayload = {
    name: newProduct.value.name.trim(),
    description: newProduct.value.description.trim() || null,
    price: Number(newProduct.value.price || 0),
    stock: Math.floor(Number(newProduct.value.stock || 0)),
    supplier_id: newProduct.value.supplier_id || null,
  };

  const { data, error } = await supabase
    .from('products')
    .insert(productPayload)
    .select('id, name, description, price, stock, created_at, suppliers(name)')
    .single();

  if (error) {
    console.error('Could not add inventory item:', error);
    errorMessage.value = error.message;
    isSavingProduct.value = false;
    return;
  }

  if (data) {
    products.value = [data, ...products.value];

    const { error: movementError } = await supabase
      .from('inventory_movements')
      .insert({
        product_id: data.id,
        movement_type: 'restock',
        quantity_delta: productPayload.stock,
        quantity_after: productPayload.stock,
        note: 'Initial inventory add',
      });

    if (movementError) {
      console.error('Could not create inventory movement:', movementError);
    }
  }

  newProduct.value = getEmptyProduct();
  successMessage.value = 'Inventory item added';
  isSavingProduct.value = false;
}

onMounted(() => {
  Promise.all([getProducts(), getSuppliers()]);
});
</script>

<style scoped>
.inventory-page {
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

.add-inventory-panel {
  display: grid;
  gap: 10px;
  padding: 12px;
  border: 1px solid #dce4e7;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(17, 24, 29, 0.05);
}

.panel-head {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.panel-head span,
.add-inventory-panel label span {
  color: #65737b;
  font-size: 0.68rem;
  font-weight: 750;
  text-transform: uppercase;
}

.panel-head h2 {
  margin: 1px 0 0;
  color: #142029;
  font-size: 1.1rem;
}

.inventory-form-grid {
  display: grid;
  gap: 8px;
}

.add-inventory-panel label {
  display: grid;
  gap: 5px;
}

.add-inventory-panel input,
.add-inventory-panel select {
  width: 100%;
  min-height: 42px;
  padding: 0 10px;
  border: 1px solid #cfdbdf;
  border-radius: 8px;
  background: #f8faf8;
  color: #172026;
  font: inherit;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.summary-card,
.inventory-row {
  border: 1px solid #dce4e7;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(17, 24, 29, 0.05);
}

.summary-card {
  display: grid;
  gap: 5px;
  min-height: 82px;
  padding: 11px;
}

.summary-card span,
.metric-cell span {
  color: #65737b;
  font-size: 0.68rem;
  font-weight: 750;
  text-transform: uppercase;
}

.summary-card strong {
  color: #142029;
  font-size: clamp(1rem, 4.2vw, 1.5rem);
  line-height: 1.1;
}

.inventory-toolbar {
  display: grid;
  gap: 8px;
}

.inventory-search {
  padding: 0;
  --background: #ffffff;
  --border-radius: 8px;
  --box-shadow: none;
}

.inventory-list {
  display: grid;
  gap: 8px;
}

.inventory-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 12px;
  align-items: center;
  min-height: 78px;
  padding: 12px;
}

.product-cell,
.metric-cell {
  display: grid;
  gap: 4px;
}

.product-cell span {
  width: fit-content;
  padding: 3px 7px;
  border-radius: 6px;
  background: #eef1ee;
  color: #617079;
  font-size: 0.75rem;
  font-weight: 800;
}

.product-cell strong {
  color: #142029;
  font-size: 1rem;
}

.product-cell small {
  color: #65737b;
}

.product-description {
  max-width: 560px;
  line-height: 1.3;
}

.metric-cell {
  min-width: 68px;
}

.metric-cell strong {
  color: #142029;
  font-size: 1rem;
}

.state-item {
  border-radius: 8px;
}

.skeleton-name {
  width: 42%;
  height: 22px;
}

.skeleton-small {
  width: 90px;
  height: 20px;
}

@media (min-width: 920px) {
  .page-shell {
    padding: 18px;
    gap: 14px;
  }

  .inventory-toolbar {
    max-width: 520px;
  }

  .inventory-form-grid {
    grid-template-columns: minmax(180px, 1.4fr) minmax(100px, 0.6fr) minmax(90px, 0.5fr) minmax(150px, 1fr);
  }

  .description-field {
    grid-column: 1 / -1;
  }

  .inventory-row {
    grid-template-columns: minmax(0, 1fr) auto auto auto;
  }
}

@media (max-width: 640px) {
  .inventory-row {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .inventory-row ion-badge {
    grid-column: 2;
  }

  .metric-cell:first-of-type {
    display: none;
  }
}
</style>
