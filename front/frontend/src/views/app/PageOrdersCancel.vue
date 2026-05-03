<script setup>
import BaseStatCard from '../../components/common/BaseStatCard.vue'
import BaseSectionTitle from '../../components/common/BaseSectionTitle.vue'
import OrderListBlock from '../../components/sidebar/OrderListBlock.vue'
import { useOrdersDashboard } from '../../composables/useOrdersDashboard'

const { stats, rows, loading, error } = useOrdersDashboard('cancel')
</script>

<template>
  <div>
    <section>
      <BaseSectionTitle>취소/환불 건수</BaseSectionTitle>
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
      title="취소/환불 주문 목록"
      summary-label="취소/환불"
      :rows="rows"
      :loading="loading"
      :error="error"
    />
  </div>
</template>