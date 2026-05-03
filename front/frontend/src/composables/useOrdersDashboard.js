import { computed, onMounted, ref } from 'vue'
import { fetchOrderManagement, fetchOrders, fetchShipmentByOrderId } from '../api/orders'

function normalizeAutoStatus(value) {
  if (!value) return '-'

  const map = {
    Ready: '\uC8FC\uBB38 \uC900\uBE44 \uC911',
    Ordered: '\uC8FC\uBB38 \uC644\uB8CC',
    FAILED: '\uC8FC\uBB38 \uC2E4\uD328',
    Shipping: '\uBC30\uC1A1 \uC911',
    SHIPPING: '\uBC30\uC1A1 \uC911',
    DELIVERED: '\uBC30\uC1A1 \uC644\uB8CC',
  }

  return map[value] || value
}

function normalizeOrderStatus(value) {
  if (!value) return '-'

  const map = {
    CREATED: '\uC0DD\uC131\uB428',
    PAID: '\uACB0\uC81C \uC644\uB8CC',
    FAILED: '\uC8FC\uBB38 \uC2E4\uD328',
    CANCELLED: '\uCDE8\uC18C \uC644\uB8CC',
    CANCELED: '\uCDE8\uC18C \uC644\uB8CC',
  }

  return map[value] || value
}

function normalizeShipmentStatus(value) {
  if (!value) return '-'

  const map = {
    READY: '\uBC30\uC1A1 \uC900\uBE44 \uC911',
    SHIPPING: '\uBC30\uC1A1 \uC911',
    DELIVERED: '\uBC30\uC1A1 \uC644\uB8CC',
  }

  return map[value] || value
}

async function loadShipmentMap(orders) {
  const results = await Promise.allSettled(
    orders.map(async (order) => {
      const shipment = await fetchShipmentByOrderId(order.id)
      return [order.id, shipment]
    }),
  )

  const shipmentMap = new Map()

  for (const result of results) {
    if (result.status === 'fulfilled') {
      const [orderId, shipment] = result.value
      shipmentMap.set(orderId, shipment)
    }
  }

  return shipmentMap
}

function createRowFromOrder(order, shipmentMap) {
  const shipment = shipmentMap.get(order.id) || null
  const shipmentStatus = shipment?.status || ''

  return {
    orderId: order.id,
    createdAt: order.createdAt || '',
    userId: order.userId,
    totalAmount: order.totalAmount ?? 0,
    paymentAmount: order.totalAmount ?? 0,
    status: order.status || '-',
    statusLabel: normalizeOrderStatus(order.status),
    customerName: order.customerName || '-',
    customerPhone: order.customerPhone || '-',
    customerAddress: order.customerAddress || '-',
    customsNumber: order.customsNumber || '-',
    autoOrderStatus: order.autoOrderStatus || '-',
    autoOrderStatusLabel: normalizeAutoStatus(order.autoOrderStatus),
    shipmentId: shipment?.id ?? null,
    shipmentStatus,
    shipmentStatusLabel: normalizeShipmentStatus(shipmentStatus),
    trackingNumber: shipment?.trackingNumber || '',
    courier: shipment?.courier || '',
    overseasMall: order.overseasMall || '-',
    margin: order.margin ?? 0,
    dummyCoupangProductId: order.dummyCoupangProductId ?? null,
    productName: order.productName || '-',
    quantity: order.quantity ?? 0,
    raw: order,
  }
}

function createRowFromManagement(item, orderMap, shipmentMap) {
  const rawOrder = orderMap.get(item.orderId) || null
  const shipment = shipmentMap.get(item.orderId) || null
  const shipmentStatus = shipment?.status || ''

  return {
    orderId: item.orderId,
    createdAt: rawOrder?.createdAt || '',
    userId: rawOrder?.userId ?? null,
    totalAmount: rawOrder?.totalAmount ?? item.paymentAmount ?? 0,
    paymentAmount: item.paymentAmount ?? rawOrder?.totalAmount ?? 0,
    status: rawOrder?.status || '-',
    statusLabel: normalizeOrderStatus(rawOrder?.status),
    customerName: item.customerName || rawOrder?.customerName || '-',
    customerPhone: item.customerPhone || rawOrder?.customerPhone || '-',
    customerAddress: item.customerAddress || rawOrder?.customerAddress || '-',
    customsNumber: item.customsNumber || rawOrder?.customsNumber || '-',
    autoOrderStatus: item.autoOrderStatus || rawOrder?.autoOrderStatus || '-',
    autoOrderStatusLabel: normalizeAutoStatus(item.autoOrderStatus || rawOrder?.autoOrderStatus),
    shipmentId: shipment?.id ?? null,
    shipmentStatus,
    shipmentStatusLabel: normalizeShipmentStatus(shipmentStatus),
    trackingNumber: shipment?.trackingNumber || '',
    courier: shipment?.courier || '',
    overseasMall: item.overseasMall || rawOrder?.overseasMall || '-',
    margin: item.margin ?? rawOrder?.margin ?? 0,
    dummyCoupangProductId:
      item.dummyCoupangProductId ?? rawOrder?.dummyCoupangProductId ?? null,
    productName: item.productName || rawOrder?.productName || '-',
    quantity: item.quantity ?? rawOrder?.quantity ?? 0,
    raw: rawOrder || item,
  }
}

export function useOrdersDashboard(mode = 'all') {
  const loading = ref(false)
  const error = ref('')
  const rows = ref([])

  const load = async () => {
    loading.value = true
    error.value = ''

    try {
      const [orders, management] = await Promise.all([fetchOrders(), fetchOrderManagement()])
      const orderMap = new Map(orders.map((order) => [order.id, order]))
      const shipmentMap = await loadShipmentMap(orders)

      if (mode === 'all') {
        rows.value = orders.map((order) => createRowFromOrder(order, shipmentMap))
      } else {
        rows.value = management.map((item) => createRowFromManagement(item, orderMap, shipmentMap))
      }
    } catch (e) {
      error.value =
        e?.response?.data?.message || '\uC8FC\uBB38 \uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.'
      rows.value = []
    } finally {
      loading.value = false
    }
  }

  const filteredRows = computed(() => {
    if (mode === 'auto') {
      return rows.value.filter((row) => row.status !== 'CANCELLED' && row.status !== 'CANCELED')
    }

    if (mode === 'cancel') {
      return rows.value.filter(
        (row) => row.status === 'CANCELLED' || row.status === 'CANCELED',
      )
    }

    return rows.value
  })

  const stats = computed(() => {
    const source = filteredRows.value
    const orderedCount = source.filter((row) => row.autoOrderStatus === 'Ordered').length
    const failedCount = source.filter((row) => row.autoOrderStatus === 'FAILED').length
    const readyCount = source.filter((row) => row.autoOrderStatus === 'Ready').length
    const shippingCount = source.filter((row) => row.shipmentStatus === 'SHIPPING').length
    const cancelCount = source.filter(
      (row) => row.status === 'CANCELLED' || row.status === 'CANCELED',
    ).length

    if (mode === 'auto') {
      return [
        { label: '\uC790\uB3D9 \uC8FC\uBB38 \uC804\uCCB4', value: source.length, tone: 'muted' },
        { label: '\uC790\uB3D9 \uC8FC\uBB38 \uC2E4\uD328', value: failedCount, tone: 'danger' },
        { label: '\uC790\uB3D9 \uC8FC\uBB38 \uC644\uB8CC', value: orderedCount, tone: 'primary' },
        { label: '\uC8FC\uBB38 \uC900\uBE44 \uC911', value: readyCount, tone: 'warning' },
      ]
    }

    if (mode === 'cancel') {
      return [
        { label: '\uCDE8\uC18C/\uD658\uBD88 \uC804\uCCB4', value: source.length, tone: 'muted' },
        { label: '\uCDE8\uC18C \uC644\uB8CC', value: cancelCount, tone: 'primary' },
        { label: '\uC790\uB3D9 \uC8FC\uBB38 \uC2E4\uD328', value: failedCount, tone: 'danger' },
        { label: '\uBC30\uC1A1 \uC911', value: shippingCount, tone: 'warning' },
      ]
    }

    return [
      { label: '\uC804\uCCB4 \uC8FC\uBB38', value: source.length, tone: 'muted' },
      { label: '\uC790\uB3D9 \uC8FC\uBB38 \uC131\uACF5', value: orderedCount, tone: 'primary' },
      { label: '\uC790\uB3D9 \uC8FC\uBB38 \uC2E4\uD328', value: failedCount, tone: 'danger' },
      { label: '\uBC30\uC1A1 \uC911', value: shippingCount, tone: 'warning' },
    ]
  })

  onMounted(load)

  return {
    loading,
    error,
    rows: filteredRows,
    stats,
    reload: load,
  }
}
