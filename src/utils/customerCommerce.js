const ORDER_STORAGE_KEY = 'customer_orders'
const LAST_ORDER_STORAGE_KEY = 'customer_last_order'
const CHECKOUT_DRAFT_STORAGE_KEY = 'customer_checkout_draft'
const PROFILE_STORAGE_KEY = 'customer_profile'

const hasStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const safeReadJson = (key, fallback) => {
    if (!hasStorage()) return fallback
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    try {
        return JSON.parse(raw)
    } catch {
        return fallback
    }
}

const safeWriteJson = (key, value) => {
    if (!hasStorage()) return
    if (value === null || typeof value === 'undefined') {
        localStorage.removeItem(key)
        return
    }
    localStorage.setItem(key, JSON.stringify(value))
}

export const normalizePhone = (value = '') => String(value).replace(/\D/g, '')

export const formatMoney = (value = 0) => {
    const amount = Number(value || 0)
    return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

export const formatDate = (value, options = {}) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        ...options,
    })
}

export const formatDateTime = (value) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    })
}

export const getProductImages = (product) => {
    if (!product) return []

    let images = product.images ?? product.product_images ?? product.image ?? []

    if (typeof images === 'string') {
        const trimmed = images.trim()
        if (!trimmed) return []

        if (trimmed.startsWith('[')) {
            try {
                images = JSON.parse(trimmed)
            } catch {
                images = trimmed
            }
        }
    }

    if (Array.isArray(images)) {
        return images.filter(Boolean)
    }

    if (typeof images === 'string' && images.trim()) {
        return [images.trim()]
    }

    return []
}

export const getProductImage = (product) => {
    const images = getProductImages(product)
    return images[0] || 'https://via.placeholder.com/900x900?text=No+Image'
}

export const getAccountKey = (user) => {
    if (!user) return 'guest'

    if (user.id || user.id === 0) return `id:${user.id}`

    const mobile = normalizePhone(user.mobile || user.phone || '')
    if (mobile) return `mobile:${mobile}`

    const email = String(user.email || '').trim().toLowerCase()
    if (email) return `email:${email}`

    const name = String(user.name || '').trim().toLowerCase()
    if (name) return `name:${name}`

    return 'guest'
}

export const deliveryOptions = [
    {
        value: 'standard',
        label: 'Standard Delivery',
        description: 'Arrives in 3-5 business days',
        fee: 120,
        eta: '3-5 business days',
        icon: 'fas fa-box',
    },
    {
        value: 'express',
        label: 'Express Delivery',
        description: 'Arrives in 1-2 business days',
        fee: 220,
        eta: '1-2 business days',
        icon: 'fas fa-bolt',
    },
    {
        value: 'same_day',
        label: 'Same Day Delivery',
        description: 'Dhaka city orders placed before 2 PM',
        fee: 350,
        eta: 'Today, before 9 PM',
        icon: 'fas fa-rocket',
    },
]

export const paymentOptions = [
    {
        value: 'cod',
        label: 'Cash on Delivery',
        description: 'Pay when the parcel arrives',
        icon: 'fas fa-money-bill-wave',
    },
    {
        value: 'bkash',
        label: 'bKash / Nagad',
        description: 'Instant mobile wallet payment',
        icon: 'fas fa-mobile-screen-button',
    },
    {
        value: 'card',
        label: 'Card Payment',
        description: 'Debit or credit card payment',
        icon: 'fas fa-credit-card',
    },
]

export const getDeliveryOption = (value) =>
    deliveryOptions.find((option) => option.value === value) || deliveryOptions[0]

export const getPaymentOption = (value) =>
    paymentOptions.find((option) => option.value === value) || paymentOptions[0]

export const getShippingFee = (deliveryMethod, subtotal = 0) => {
    const option = getDeliveryOption(deliveryMethod)
    if (option.value === 'standard' && Number(subtotal || 0) >= 3000) return 0
    return option.fee
}

export const getStatusMeta = (status = 'processing') => {
    const key = String(status).toLowerCase()

    const map = {
        pending: { label: 'Pending', tone: 'warning', icon: 'fas fa-hourglass-half' },
        processing: { label: 'Processing', tone: 'info', icon: 'fas fa-box-open' },
        packed: { label: 'Packed', tone: 'primary', icon: 'fas fa-box' },
        shipped: { label: 'Shipped', tone: 'accent', icon: 'fas fa-truck-fast' },
        delivered: { label: 'Delivered', tone: 'success', icon: 'fas fa-circle-check' },
        cancelled: { label: 'Cancelled', tone: 'danger', icon: 'fas fa-circle-xmark' },
    }

    return map[key] || map.processing
}

export const getPaymentMeta = (status = 'pending') => {
    const key = String(status).toLowerCase()

    const map = {
        pending: { label: 'Pending', tone: 'warning', icon: 'fas fa-clock' },
        paid: { label: 'Paid', tone: 'success', icon: 'fas fa-circle-check' },
        failed: { label: 'Failed', tone: 'danger', icon: 'fas fa-circle-xmark' },
        refunded: { label: 'Refunded', tone: 'primary', icon: 'fas fa-rotate-left' },
    }

    return map[key] || map.pending
}

export const readStoredOrders = (user = null) => {
    const orders = safeReadJson(ORDER_STORAGE_KEY, [])
    if (!user) return Array.isArray(orders) ? orders : []

    const accountKey = getAccountKey(user)
    return (Array.isArray(orders) ? orders : []).filter((order) => order.account_key === accountKey)
}

export const getLatestStoredOrder = (user = null) => {
    const orders = readStoredOrders(user)
    return orders[0] || null
}

export const findStoredOrder = (orderId, user = null) => {
    if (!orderId) return null

    const search = String(orderId).trim()
    const orders = readStoredOrders(user)
    return (
        orders.find((order) => String(order.id) === search || String(order.order_number) === search) ||
        null
    )
}

export const saveStoredOrder = (order) => {
    const currentOrders = safeReadJson(ORDER_STORAGE_KEY, [])
    const cleanedOrders = Array.isArray(currentOrders) ? currentOrders : []
    const nextOrders = [
        order,
        ...cleanedOrders.filter(
            (item) => String(item.id) !== String(order.id) && String(item.order_number) !== String(order.order_number),
        ),
    ]

    safeWriteJson(ORDER_STORAGE_KEY, nextOrders)
    safeWriteJson(LAST_ORDER_STORAGE_KEY, order)
    return order
}

export const buildOrderRecord = ({
    user = null,
    cartItems = [],
    form = {},
    deliveryMethod = 'standard',
    paymentMethod = 'cod',
    discount = 0,
} = {}) => {
    const createdAt = new Date().toISOString()
    const orderSeed = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`.toUpperCase()
    const orderNumber = `ORD-${orderSeed}`
    const delivery = getDeliveryOption(deliveryMethod)
    const payment = getPaymentOption(paymentMethod)
    const subtotal = cartItems.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
        0,
    )
    const shippingFee = getShippingFee(deliveryMethod, subtotal)
    const discountValue = Number(discount || 0)
    const total = Math.max(0, subtotal + shippingFee - discountValue)
    const itemCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0)
    const shippingAddress = {
        line1: String(form.addressLine1 || form.address || '').trim(),
        line2: String(form.addressLine2 || '').trim(),
        city: String(form.city || '').trim(),
        state: String(form.state || '').trim(),
        postcode: String(form.postcode || '').trim(),
        country: String(form.country || 'Bangladesh').trim(),
    }

    const addressLabel = [
        shippingAddress.line1,
        shippingAddress.line2,
        shippingAddress.city,
        shippingAddress.state,
        shippingAddress.postcode,
        shippingAddress.country,
    ]
        .filter(Boolean)
        .join(', ')

    return {
        id: orderNumber,
        order_number: orderNumber,
        account_key: getAccountKey(user),
        customer_name: String(form.fullName || user?.name || 'Guest Customer').trim(),
        customer_mobile: normalizePhone(form.mobile || user?.mobile || user?.phone || ''),
        customer_email: String(form.email || user?.email || '').trim(),
        status: 'processing',
        payment_status: payment.value === 'cod' ? 'pending' : 'paid',
        payment_method: payment.value,
        payment_label: payment.label,
        delivery_method: delivery.value,
        delivery_label: delivery.label,
        shipping_fee: shippingFee,
        subtotal,
        discount: discountValue,
        total,
        item_count: itemCount,
        items: cartItems.map((item) => ({
            id: item.id,
            name: item.name,
            price: Number(item.price || 0),
            quantity: Number(item.quantity || 1),
            images: item.images,
            slug: item.slug || null,
        })),
        shipping_address: shippingAddress,
        address_label: addressLabel || 'Address not provided',
        notes: String(form.note || '').trim(),
        created_at: createdAt,
        updated_at: createdAt,
        estimated_delivery: delivery.eta,
        timeline: [
            {
                key: 'placed',
                label: 'Order placed',
                description: 'We have received your order and started processing it.',
                timestamp: createdAt,
            },
            {
                key: 'packed',
                label: 'Packed',
                description: 'Items are being packed and prepared for dispatch.',
                timestamp: null,
            },
            {
                key: 'shipped',
                label: 'Shipped',
                description: 'A courier will pick up the parcel for delivery.',
                timestamp: null,
            },
            {
                key: 'delivered',
                label: 'Delivered',
                description: 'Your order will arrive at the shipping address.',
                timestamp: null,
            },
        ],
    }
}

export const readCheckoutDraft = () => safeReadJson(CHECKOUT_DRAFT_STORAGE_KEY, null)

export const saveCheckoutDraft = (draft) => safeWriteJson(CHECKOUT_DRAFT_STORAGE_KEY, draft)

export const clearCheckoutDraft = () => {
    if (!hasStorage()) return
    localStorage.removeItem(CHECKOUT_DRAFT_STORAGE_KEY)
}

export const readCustomerProfile = () => safeReadJson(PROFILE_STORAGE_KEY, null)

export const saveCustomerProfile = (profile) => safeWriteJson(PROFILE_STORAGE_KEY, profile)

const parseMaybeJson = (value) => {
    if (value === null || typeof value === 'undefined') return null

    if (typeof value === 'object') return value

    if (typeof value !== 'string') return null

    const trimmed = value.trim()
    if (!trimmed) return null

    if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) return null

    try {
        return JSON.parse(trimmed)
    } catch {
        return null
    }
}

const formatAddressParts = (parts = []) =>
    parts
        .map((part) => String(part || '').trim())
        .filter(Boolean)
        .join(', ')

export const buildAddressLabel = (value) => {
    if (!value) return 'Address not provided'

    const parsed = parseMaybeJson(value)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return formatAddressParts([
            parsed.line1,
            parsed.line2,
            parsed.city,
            parsed.state,
            parsed.postcode,
            parsed.country,
        ])
    }

    if (Array.isArray(parsed)) {
        return formatAddressParts(parsed)
    }

    return String(value).trim() || 'Address not provided'
}

export const getEffectiveProductPrice = (product) => {
    const regularPrice = Number(product?.price || 0)
    const discountPrice = Number(product?.discount_price || product?.sale_price || 0)

    if (discountPrice > 0 && discountPrice < regularPrice) {
        return discountPrice
    }

    return regularPrice
}

export const normalizeOrderItem = (item = {}) => {
    const product = item.product || null
    const price = Number(item.price ?? getEffectiveProductPrice(product))
    const quantity = Number(item.quantity || 1)

    return {
        id: item.id ?? item.product_id ?? product?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        product_id: item.product_id ?? product?.id ?? null,
        name: item.product_name || item.name || product?.name || 'Item',
        price,
        quantity,
        total: Number(item.total ?? price * quantity),
        images: item.images ?? product?.images ?? [],
        slug: item.slug ?? product?.slug ?? null,
        product,
    }
}

const deriveDeliveryLabel = (shippingCost = 0) => {
    const value = Number(shippingCost || 0)
    if (value === 0) return 'Standard delivery'
    if (value <= 120) return 'Standard delivery'
    if (value <= 220) return 'Express delivery'
    return 'Same day delivery'
}

export const normalizeOrderRecord = (order = {}) => {
    const rawItems = Array.isArray(order.items) ? order.items : order.items?.data || []
    const items = Array.isArray(rawItems) ? rawItems.map(normalizeOrderItem) : []
    const subtotal = Number(order.subtotal ?? items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0))
    const shippingFee = Number(order.shipping_cost ?? order.shipping_fee ?? 0)
    const discount = Number(order.discount ?? 0)
    const total = Number(order.total ?? Math.max(0, subtotal + shippingFee - discount))
    const status = String(order.order_status ?? order.status ?? 'processing').toLowerCase()
    const paymentMethod = String(order.payment_method ?? 'cod').toLowerCase()

    return {
        id: order.id ?? order.order_number ?? `${Date.now()}`,
        order_number: order.order_number ?? String(order.id ?? '').trim(),
        customer_name: order.customer_name ?? order.user?.name ?? 'Guest Customer',
        customer_email: order.customer_email ?? order.user?.email ?? '',
        customer_phone: order.customer_phone ?? order.user?.mobile ?? '',
        subtotal,
        shipping_fee: shippingFee,
        shipping_cost: shippingFee,
        discount,
        total,
        payment_status: String(order.payment_status ?? 'pending').toLowerCase(),
        payment_method: paymentMethod,
        payment_label: getPaymentOption(paymentMethod).label,
        status,
        order_status: status,
        delivery_label: order.delivery_label ?? deriveDeliveryLabel(shippingFee),
        shipping_address: order.shipping_address ?? '',
        address_label: buildAddressLabel(order.shipping_address),
        items,
        item_count: Number(order.item_count ?? items.reduce((sum, item) => sum + Number(item.quantity || 1), 0)),
        created_at: order.created_at ?? order.createdAt ?? null,
        updated_at: order.updated_at ?? order.updatedAt ?? null,
        estimated_delivery: order.estimated_delivery ?? '3-5 business days',
        timeline: order.timeline ?? [],
    }
}

export const normalizeOrdersList = (payload) => {
    const rawList = Array.isArray(payload)
        ? payload
        : payload?.data || payload?.orders || payload?.items || []

    return (Array.isArray(rawList) ? rawList : []).map(normalizeOrderRecord)
}
