<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom" class="app-tab-bar">
        <ion-tab-button tab="tab1" href="/tabs/tab1">
          <ion-icon aria-hidden="true" :icon="storefrontOutline" />
          <ion-label>POS</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/tabs/tab2">
          <ion-icon aria-hidden="true" :icon="cubeOutline" />
          <ion-label>Inventory</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab3" href="/tabs/tab3">
          <ion-icon aria-hidden="true" :icon="barChartOutline" />
          <ion-label>Reports</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup>
import { IonIcon, IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/vue';
import { barChartOutline, cubeOutline, storefrontOutline } from 'ionicons/icons';
</script>

<style scoped>
.app-tab-bar {
  height: 64px;
  padding: 6px 10px max(6px, var(--ion-safe-area-bottom));
  border-top: 1px solid #dfe4e1;
  --background: rgba(255, 255, 255, 0.96);
}

ion-tab-button {
  --color: #69747a;
  --color-selected: #136b4f;
  --ripple-color: #136b4f;
  border-radius: 8px;
  font-weight: 750;
}
</style>
