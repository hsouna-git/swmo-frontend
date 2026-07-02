<script setup>
import { computed, onMounted, ref } from 'vue'
import { AuthService } from './services/AuthService'
import { OrderService } from './services/OrderService'

const authService = new AuthService()
const orderService = new OrderService()

const products = [
  { id: 'product-1', name: 'Café torréfié', description: '250 g de café moulu', price: 6.90 },
  { id: 'product-2', name: 'Thé vert', description: 'Thé vert bio 100 g', price: 4.50 },
  { id: 'product-3', name: 'Chocolat noir', description: 'Tablette 70% cacao', price: 5.20 },
  { id: 'product-4', name: 'Miel artisanal', description: 'Pot 250 g de miel', price: 8.00 }
]

const quantities = ref({})
const orders = ref([])
const isAuthenticated = ref(false)
const username = ref('')
const token = ref('')

const totalItems = computed(() => products.reduce((sum, product) => sum + (quantities.value[product.id] || 0), 0))
const totalPrice = computed(() => products.reduce((sum, product) => sum + (quantities.value[product.id] || 0) * product.price, 0).toFixed(2))

const increase = (productId) => {
  quantities.value[productId] = (quantities.value[productId] || 0) + 1
}

const decrease = (productId) => {
  const current = quantities.value[productId] || 0
  if (current > 0) {
    quantities.value[productId] = current - 1
  }
}

const login = () => {
  authService.login()
}

const logout = () => {
  authService.logout()
}

const fetchOrders = async () => {
  const currentToken = authService.getToken()
  if (!currentToken) return
  orders.value = await orderService.fetchOrders(currentToken)
}

const submitOrder = async () => {
  const currentToken = authService.getToken()
  if (!currentToken) {
    login()
    return
  }

  const items = {}
  for (const product of products) {
    const qty = quantities.value[product.id] || 0
    if (qty > 0) {
      items[product.name] = qty
    }
  }

  if (!Object.keys(items).length) return

  await orderService.submitOrder(currentToken, items)
  quantities.value = {}
  await fetchOrders()
}

const deleteOrder = async (orderId) => {
  const currentToken = authService.getToken()
  if (!currentToken) {
    login()
    return
  }

  await orderService.deleteOrder(currentToken, orderId)
  await fetchOrders()
}

onMounted(async () => {
  const authenticated = await authService.init()
  isAuthenticated.value = authenticated
  if (authenticated) {
    token.value = authService.getToken()
    username.value = authService.username
    await fetchOrders()
  }
})
</script>

<template>
  <div id="app">
    <header class="topbar">
      <div>
        <h1>Mini Order</h1>
        <p>Commandez rapidement et consultez vos commandes.</p>
      </div>
      <div class="user-panel">
        <template v-if="isAuthenticated">
          <span>Connecté en tant que <strong>{{ username }}</strong></span>
          <button class="secondary" @click="logout">Se déconnecter</button>
        </template>
        <template v-else>
          <button @click="login">Se connecter</button>
        </template>
      </div>
    </header>

    <section class="products">
      <h2>Produits</h2>
      <div class="product-grid">
        <article v-for="product in products" :key="product.id" class="product-card">
          <div>
            <h3>{{ product.name }}</h3>
            <p>{{ product.description }}</p>
          </div>
          <div class="product-footer">
            <div class="quantity-controls">
              <button @click="decrease(product.id)">−</button>
              <span>{{ quantities[product.id] || 0 }}</span>
              <button @click="increase(product.id)">+</button>
            </div>
            <div class="product-price">€{{ product.price.toFixed(2) }}</div>
          </div>
        </article>
      </div>
      <div class="order-summary">
        <div>
          <strong>Total articles :</strong> {{ totalItems }}
        </div>
        <div>
          <strong>Montant :</strong> €{{ totalPrice }}
        </div>
        <button class="primary" :disabled="totalItems === 0" @click="submitOrder">
          Commander
        </button>
      </div>
    </section>

    <section class="orders">
      <h2>Vos commandes</h2>
      <template v-if="orders.length">
        <div class="order-list">
          <article v-for="order in orders" :key="order.id" class="order-card">
            <div class="order-header">
              <span>Commande #{{ order.id }}</span>
              <span>{{ new Date(order.createdAt).toLocaleString() }}</span>
              <button class="secondary delete-button" @click="deleteOrder(order.id)">Supprimer</button>
            </div>
            <ul>
              <li v-for="(quantity, name) in order.items" :key="name">
                {{ name }} × {{ quantity }}
              </li>
            </ul>
          </article>
        </div>
      </template>
      <p v-else>Aucune commande enregistrée pour le moment.</p>
    </section>
  </div>
</template>
