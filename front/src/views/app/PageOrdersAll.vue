<script setup>
import BaseStatCard from '../../components/common/BaseStatCard.vue'
import BaseSectionTitle from '../../components/common/BaseSectionTitle.vue'
import OrderListBlock from '../../components/sidebar/OrderListBlock.vue'
import { useOrdersDashboard } from '../../composables/useOrdersDashboard'
import { updateShipmentStatus } from '../../api/orders'

const { stats, rows, loading, error, reload } = useOrdersDashboard('all')

async function handleShipmentStatusChange(payload) {
  if (!payload.shipmentId) {
    console.warn('shipment create required', {
      request: 'POST /shipping/create',
      body: {
        orderId: payload.orderId,
        trackingNumber: 'TRK-123456',
        courier: 'CJ',
      },
      nextStatus: payload.shipmentStatus,
    })
    return
  }

  try {
    await updateShipmentStatus(payload.shipmentId, payload.shipmentStatus)
    await reload()
  } catch (error) {
    console.error('failed to update shipment status', error)
  }
}
</script>

<template>
  <div>
    <section>
      <BaseSectionTitle>전체 주문 건수</BaseSectionTitle>
      <div class="mt-3 h-px bg-neutral-200" />
      <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BaseStatCard
          v-for="stat in stats"
          :key="stat.label"
          :label="stat.label"
          :value="stat.value"
          :tone="stat.tone"
        />
      </div>
    </section>

    <OrderListBlock
      title="전체 주문 목록"
      summary-label="전체 주문"
      :rows="rows"
      :loading="loading"
      :error="error"
      manageable
      @shipment-status-change="handleShipmentStatusChange"
    />
  </div>
</template>
