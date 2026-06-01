<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>Point of Sale</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="pos-page">
      <ion-refresher slot="fixed" @ionRefresh="refreshProducts">
        <ion-refresher-content />
      </ion-refresher>

      <section class="pos-shell">
        <main class="sell-panel">
          <section class="register-head">
            <div>
              <span>Register</span>
              <h1>Checkout</h1>
            </div>
            <ion-badge color="success">{{ availableProducts.length }} items</ion-badge>
          </section>

          <section class="toolbar-row" aria-label="Product tools">
            <ion-searchbar
              v-model="searchTerm"
              class="product-search"
              placeholder="Search name or ID"
              show-clear-button="focus"
            />
            <ion-segment v-model="stockFilter" class="stock-segment">
              <ion-segment-button value="all">
                <ion-label>All</ion-label>
              </ion-segment-button>
              <ion-segment-button value="available">
                <ion-label>Available</ion-label>
              </ion-segment-button>
              <ion-segment-button value="low">
                <ion-label>Low</ion-label>
              </ion-segment-button>
            </ion-segment>
          </section>

          <ion-item v-if="errorMessage" class="state-item" color="danger" lines="none">
            <ion-icon slot="start" :icon="alertCircleOutline" />
            <ion-label>
              <h2>Could not load products</h2>
              <p>{{ errorMessage }}</p>
            </ion-label>
            <ion-button slot="end" fill="clear" color="light" @click="getProducts">Retry</ion-button>
          </ion-item>

          <section v-else-if="isLoading" class="product-grid" aria-label="Loading products">
            <article v-for="index in 6" :key="index" class="product-card">
              <ion-skeleton-text animated class="skeleton-title" />
              <ion-skeleton-text animated class="skeleton-price" />
              <ion-skeleton-text animated class="skeleton-stock" />
            </article>
          </section>

          <section v-else-if="filteredProducts.length === 0" class="empty-state">
            <ion-icon :icon="cubeOutline" />
            <h2>No products found</h2>
            <ion-button fill="clear" @click="clearFilters">Clear filters</ion-button>
          </section>

          <section v-else class="product-grid" aria-label="Products">
            <button
              v-for="product in filteredProducts"
              :key="product.id"
              class="product-card product-button"
              :class="{ 'is-disabled': availableToAdd(product) <= 0 }"
              type="button"
              :disabled="availableToAdd(product) <= 0"
              @click="addToCart(product)"
            >
              <span class="product-id">#{{ product.id }}</span>
              <strong>{{ product.name }}</strong>
              <small v-if="product.description" class="product-description">{{ product.description }}</small>
              <span class="product-price">{{ formatPrice(product.price) }}</span>
              <span class="stock-row">
                <ion-icon :icon="layersOutline" />
                {{ availableToAdd(product) }} left
              </span>
            </button>
          </section>
        </main>

        <aside class="cart-panel" aria-label="Current sale">
          <div class="cart-header">
            <div>
              <span>Ticket</span>
              <h2>{{ cartItemCount }} item{{ cartItemCount === 1 ? '' : 's' }}</h2>
            </div>
            <ion-button fill="clear" size="small" :disabled="cart.length === 0" @click="clearCart">
              Clear
            </ion-button>
          </div>

          <ion-select
            v-model="selectedCustomerId"
            class="customer-select"
            interface="popover"
            label="Customer"
            label-placement="stacked"
          >
            <ion-select-option :value="null">Walk-in</ion-select-option>
            <ion-select-option v-for="customer in customers" :key="customer.id" :value="customer.id">
              {{ customer.name }}
            </ion-select-option>
          </ion-select>

          <div v-if="cart.length === 0" class="cart-empty">
            <ion-icon :icon="cartOutline" />
          </div>

          <div v-else class="cart-list">
            <article v-for="item in cart" :key="item.id" class="cart-item">
              <div>
                <h3>{{ item.name }}</h3>
                <p>{{ formatPrice(item.price) }} each</p>
              </div>
              <div class="quantity-tools">
                <ion-button fill="clear" size="small" @click="decreaseQuantity(item.id)">
                  <ion-icon slot="icon-only" :icon="removeOutline" />
                </ion-button>
                <span>{{ item.quantity }}</span>
                <ion-button
                  fill="clear"
                  size="small"
                  :disabled="availableToAdd(item) <= 0"
                  @click="increaseQuantity(item.id)"
                >
                  <ion-icon slot="icon-only" :icon="addOutline" />
                </ion-button>
              </div>
              <strong>{{ formatPrice(item.price * item.quantity) }}</strong>
            </article>
          </div>

          <div class="totals-box">
            <div>
              <span>Subtotal</span>
              <strong>{{ formatPrice(subtotal) }}</strong>
            </div>
            <div>
              <span>Tax {{ Math.round(taxRate * 100) }}%</span>
              <strong>{{ formatPrice(tax) }}</strong>
            </div>
            <div class="total-row">
              <span>Total</span>
              <strong>{{ formatPrice(total) }}</strong>
            </div>
          </div>

          <section class="payment-box">
            <ion-segment v-model="paymentMethod">
              <ion-segment-button value="cash">
                <ion-label>Cash</ion-label>
              </ion-segment-button>
              <ion-segment-button value="card">
                <ion-label>Card</ion-label>
              </ion-segment-button>
            </ion-segment>

            <label v-if="paymentMethod === 'cash'" class="cash-input">
              <span>Cash received</span>
              <input v-model.number="cashReceived" type="number" min="0" step="0.01">
            </label>

            <div class="change-row">
              <span>{{ paymentMethod === 'cash' ? 'Change due' : 'Card payment' }}</span>
              <strong>{{ paymentMethod === 'cash' ? formatPrice(changeDue) : formatPrice(total) }}</strong>
            </div>
          </section>

          <ion-button
            expand="block"
            class="checkout-button"
            :disabled="!canCheckout || isCheckingOut"
            @click="checkout"
          >
            {{ isCheckingOut ? 'Saving sale' : 'Complete sale' }}
          </ion-button>

          <div v-if="lastSale" class="receipt-box">
            <span>Last receipt</span>
            <strong>{{ lastSale.code }}</strong>
            <p>{{ formatPrice(lastSale.total) }} paid by {{ lastSale.method }}</p>
          </div>
        </aside>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import {
  IonBadge,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import {
  addOutline,
  alertCircleOutline,
  cartOutline,
  cubeOutline,
  layersOutline,
  removeOutline,
} from 'ionicons/icons';
import { supabase } from '@/utils/supabase';

const REGISTER_KEY = 'main-register';

const products = ref([]);
const customers = ref([]);
const cart = ref([]);
const isLoading = ref(true);
const isCheckingOut = ref(false);
const errorMessage = ref('');
const searchTerm = ref('');
const stockFilter = ref('available');
const paymentMethod = ref('cash');
const cashReceived = ref(0);
const selectedCustomerId = ref(null);
const lastSale = ref(null);
const stateLoaded = ref(false);
let stateSaveTimer;
const taxRate = 0.07;

const availableProducts = computed(() => products.value.filter((product) => product.stock > 0));

const filteredProducts = computed(() => {
  const query = searchTerm.value.trim().toLowerCase();

  return products.value.filter((product) => {
    const matchesSearch = !query
      || product.name.toLowerCase().includes(query)
      || product.description?.toLowerCase().includes(query)
      || String(product.id).includes(query);
    const remaining = availableToAdd(product);
    const matchesStock = stockFilter.value === 'all'
      || (stockFilter.value === 'available' && remaining > 0)
      || (stockFilter.value === 'low' && remaining > 0 && product.stock <= 10);

    return matchesSearch && matchesStock;
  });
});

const subtotal = computed(() => cart.value.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0));
const tax = computed(() => subtotal.value * taxRate);
const total = computed(() => subtotal.value + tax.value);
const cartItemCount = computed(() => cart.value.reduce((sum, item) => sum + item.quantity, 0));
const changeDue = computed(() => Math.max(Number(cashReceived.value || 0) - total.value, 0));
const canCheckout = computed(() => cart.value.length > 0
  && (paymentMethod.value === 'card' || Number(cashReceived.value || 0) >= total.value));

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(price || 0));
}

function availableToAdd(product) {
  const cartItem = cart.value.find((item) => item.id === product.id);
  return Math.max(Number(product.stock || 0) - Number(cartItem?.quantity || 0), 0);
}

function addToCart(product) {
  if (availableToAdd(product) <= 0) return;

  const existing = cart.value.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.value.push({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      stock: Number(product.stock),
      quantity: 1,
    });
  }

  if (paymentMethod.value === 'cash') {
    cashReceived.value = Number(total.value.toFixed(2));
  }
}

function increaseQuantity(id) {
  const product = products.value.find((item) => item.id === id);
  if (product) addToCart(product);
}

function decreaseQuantity(id) {
  const existing = cart.value.find((item) => item.id === id);
  if (!existing) return;

  if (existing.quantity === 1) {
    cart.value = cart.value.filter((item) => item.id !== id);
  } else {
    existing.quantity -= 1;
  }
}

function clearCart() {
  cart.value = [];
  cashReceived.value = 0;
}

function clearFilters() {
  searchTerm.value = '';
  stockFilter.value = 'available';
}

async function checkout() {
  if (!canCheckout.value || isCheckingOut.value) return;

  isCheckingOut.value = true;
  errorMessage.value = '';
  const receiptCode = `POS-${Date.now().toString().slice(-6)}`;
  const saleSubtotal = Number(subtotal.value.toFixed(2));
  const saleTax = Number(tax.value.toFixed(2));
  const saleTotal = Number(total.value.toFixed(2));
  const saleCashReceived = paymentMethod.value === 'cash' ? Number(cashReceived.value || 0) : null;
  const saleChangeDue = paymentMethod.value === 'cash' ? Number(changeDue.value.toFixed(2)) : 0;
  const soldItems = cart.value.map((item) => ({ ...item }));

  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      receipt_code: receiptCode,
      customer_id: selectedCustomerId.value || null,
      subtotal: saleSubtotal,
      tax: saleTax,
      total: saleTotal,
      payment_method: paymentMethod.value,
      cash_received: saleCashReceived,
      change_due: saleChangeDue,
    })
    .select('id, receipt_code, total, payment_method')
    .single();

  if (saleError) {
    console.error('Could not save sale:', saleError);
    errorMessage.value = saleError.message;
    isCheckingOut.value = false;
    return;
  }

  const saleItems = soldItems.map((item) => ({
    sale_id: sale.id,
    product_id: item.id,
    product_name: item.name,
    unit_price: Number(item.price),
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from('sale_items')
    .insert(saleItems);

  if (itemsError) {
    console.error('Could not save sale items:', itemsError);
    errorMessage.value = itemsError.message;
    isCheckingOut.value = false;
    return;
  }

  products.value = products.value.map((product) => {
    const soldItem = soldItems.find((item) => item.id === product.id);
    if (!soldItem) return product;

    const nextStock = Math.max(Number(product.stock) - soldItem.quantity, 0);

    return {
      ...product,
      stock: nextStock,
    };
  });

  const stockUpdates = soldItems.map(async (item) => {
    const product = products.value.find((entry) => entry.id === item.id);
    const nextStock = Number(product?.stock || 0);

    const { error: updateError } = await supabase
      .from('products')
      .update({ stock: nextStock })
      .eq('id', item.id);

    if (updateError) throw updateError;

    const { error: movementError } = await supabase
      .from('inventory_movements')
      .insert({
        product_id: item.id,
        sale_id: sale.id,
        movement_type: 'sale',
        quantity_delta: -item.quantity,
        quantity_after: nextStock,
        note: receiptCode,
      });

    if (movementError) throw movementError;
  });

  try {
    await Promise.all(stockUpdates);
  } catch (stockError) {
    console.error('Could not update inventory:', stockError);
    errorMessage.value = stockError.message;
    isCheckingOut.value = false;
    await getProducts();
    return;
  }

  lastSale.value = {
    code: sale.receipt_code,
    total: Number(sale.total),
    method: sale.payment_method,
  };
  clearCart();
  await savePosState();
  isCheckingOut.value = false;
}

async function getProducts() {
  isLoading.value = true;
  errorMessage.value = '';

  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price, stock, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Could not load products:', error);
    errorMessage.value = error.message;
    products.value = [];
  } else {
    products.value = data || [];
  }

  isLoading.value = false;
}

async function getCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) {
    console.error('Could not load customers:', error);
    return;
  }

  customers.value = data || [];
}

async function getPosState() {
  const { data, error } = await supabase
    .from('pos_state')
    .select('customer_id, cart, payment_method, cash_received')
    .eq('register_key', REGISTER_KEY)
    .maybeSingle();

  if (error) {
    console.error('Could not load POS state:', error);
    stateLoaded.value = true;
    return;
  }

  if (data) {
    selectedCustomerId.value = data.customer_id || null;
    paymentMethod.value = data.payment_method || 'cash';
    cashReceived.value = Number(data.cash_received || 0);
    cart.value = Array.isArray(data.cart)
      ? data.cart.filter((item) => products.value.some((product) => product.id === item.id))
      : [];
  }

  stateLoaded.value = true;
}

async function savePosState() {
  if (!stateLoaded.value) return;

  const { error } = await supabase
    .from('pos_state')
    .upsert({
      register_key: REGISTER_KEY,
      customer_id: selectedCustomerId.value || null,
      cart: cart.value,
      payment_method: paymentMethod.value,
      cash_received: Number(cashReceived.value || 0),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'register_key' });

  if (error) {
    console.error('Could not save POS state:', error);
  }
}

function queueSavePosState() {
  if (!stateLoaded.value) return;
  clearTimeout(stateSaveTimer);
  stateSaveTimer = setTimeout(() => {
    savePosState();
  }, 250);
}

async function refreshProducts(event) {
  await getProducts();
  event.target.complete();
}

watch([cart, paymentMethod, cashReceived, selectedCustomerId], queueSavePosState, { deep: true });

onMounted(async () => {
  await Promise.all([getProducts(), getCustomers()]);
  await getPosState();
});
</script>

<style scoped>
.pos-page {
  --background: #f3f4f1;
  color: #172026;
}

.pos-shell {
  display: grid;
  gap: 10px;
  padding: 10px;
}

.sell-panel,
.cart-panel {
  min-width: 0;
}

.register-head,
.cart-header {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.register-head {
  padding: 2px 2px 4px;
}

.register-head span,
.cart-header span {
  color: #69747a;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
}

.register-head h1 {
  margin: 1px 0 0;
  color: #11181d;
  font-size: 1.75rem;
  font-weight: 850;
  letter-spacing: 0;
  line-height: 1.05;
}

.toolbar-row {
  display: grid;
  gap: 8px;
  margin-bottom: 8px;
}

.product-search {
  padding: 0;
  --background: #ffffff;
  --border-radius: 8px;
  --box-shadow: none;
}

.stock-segment,
.payment-box ion-segment {
  padding: 4px;
  border-radius: 8px;
  background: #e4e8e5;
}

ion-segment-button {
  --border-radius: 6px;
  --color: #52616a;
  --color-checked: #172026;
  --indicator-color: #ffffff;
  min-height: 38px;
  font-weight: 750;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.product-card {
  display: grid;
  gap: 8px;
  min-height: 126px;
  padding: 12px;
  border: 1px solid #dfe4e1;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(17, 24, 29, 0.05);
}

.product-button {
  width: 100%;
  color: inherit;
  text-align: left;
}

.product-button:not(:disabled):active {
  transform: translateY(1px);
}

.product-button.is-disabled {
  opacity: 0.48;
}

.product-id {
  width: fit-content;
  padding: 3px 7px;
  border-radius: 6px;
  background: #eef1ee;
  color: #617079;
  font-size: 0.75rem;
  font-weight: 800;
}

.product-card strong {
  color: #142029;
  font-size: 1rem;
  line-height: 1.2;
}

.product-description {
  display: -webkit-box;
  overflow: hidden;
  color: #65737b;
  font-size: 0.78rem;
  line-height: 1.25;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.product-price {
  color: #136b4f;
  font-size: 1.16rem;
  font-weight: 850;
}

.stock-row {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  color: #607078;
  font-size: 0.82rem;
  font-weight: 750;
}

.cart-panel {
  align-self: start;
  padding: 14px;
  border: 1px solid #dfe4e1;
  border-radius: 14px 14px 0 0;
  background: #ffffff;
  box-shadow: 0 -10px 28px rgba(17, 24, 29, 0.08);
}

.cart-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.customer-select {
  margin: 8px 0;
  padding: 0 10px;
  border: 1px solid #dfe4e1;
  border-radius: 8px;
  background: #f8faf8;
}

.cart-empty {
  display: grid;
  place-items: center;
  min-height: 96px;
  color: #6a7880;
  text-align: center;
}

.cart-empty ion-icon {
  font-size: 2rem;
}

.cart-list {
  display: grid;
  gap: 8px;
  max-height: 280px;
  overflow: auto;
  padding-right: 4px;
}

.cart-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  padding: 10px;
  border-radius: 8px;
  background: #f4f6f4;
}

.cart-item h3,
.cart-item p {
  margin: 0;
}

.cart-item h3 {
  font-size: 0.95rem;
}

.cart-item p {
  color: #6a7880;
  font-size: 0.8rem;
}

.quantity-tools {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: #ffffff;
}

.quantity-tools span {
  min-width: 24px;
  text-align: center;
  font-weight: 850;
}

.totals-box {
  display: grid;
  gap: 7px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e1e6e2;
}

.totals-box div,
.change-row {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.totals-box span,
.payment-box span {
  color: #66757d;
}

.total-row {
  color: #142029;
  font-size: 1.25rem;
}

.payment-box {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}

.cash-input {
  display: grid;
  gap: 6px;
  font-weight: 750;
}

.cash-input input {
  width: 100%;
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid #cfdbdf;
  border-radius: 8px;
  background: #ffffff;
  color: #172026;
  font: inherit;
}

.checkout-button {
  margin-top: 12px;
  --border-radius: 8px;
  --background: #136b4f;
  min-height: 48px;
  font-weight: 850;
}

.receipt-box {
  display: grid;
  gap: 4px;
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #ecfdf5;
  color: #14532d;
}

.receipt-box span,
.receipt-box p {
  margin: 0;
  color: #317258;
  font-size: 0.82rem;
}

.state-item {
  margin: 12px 0;
  border-radius: 8px;
}

.empty-state {
  display: grid;
  place-items: center;
  min-height: 260px;
  color: #66757d;
  text-align: center;
}

.empty-state ion-icon {
  font-size: 2.4rem;
}

.empty-state h2 {
  margin: 8px 0 4px;
  color: #172026;
}

.skeleton-title {
  width: 72%;
  height: 20px;
}

.skeleton-price {
  width: 44%;
  height: 28px;
}

.skeleton-stock {
  width: 60%;
  height: 18px;
}

@media (min-width: 920px) {
  .pos-shell {
    grid-template-columns: minmax(0, 1fr) minmax(330px, 380px);
    gap: 14px;
    padding: 18px;
  }

  .product-grid {
    grid-template-columns: repeat(auto-fit, minmax(156px, 1fr));
    gap: 10px;
  }

  .cart-panel {
    position: sticky;
    top: 12px;
    border-radius: 8px;
    box-shadow: 0 10px 24px rgba(17, 24, 29, 0.07);
  }

  .toolbar-row {
    grid-template-columns: minmax(280px, 1fr) 340px;
    align-items: center;
  }
}

@media (max-width: 520px) {
  .cart-item {
    grid-template-columns: 1fr;
    align-items: start;
  }
}
</style>
