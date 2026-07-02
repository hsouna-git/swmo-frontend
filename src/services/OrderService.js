import axios from 'axios'

export class OrderService {
  constructor(baseUrl = 'https://swmo-backend-production.up.railway.app') {
    this.baseUrl = baseUrl
  }

  async fetchOrders(token) {
    const response = await axios.get(`${this.baseUrl}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  }

  async submitOrder(token, items) {
    const response = await axios.post(
      `${this.baseUrl}/api/orders`,
      { items },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    )
    return response.data
  }

  async deleteOrder(token, orderId) {
    await axios.delete(`${this.baseUrl}/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  }
}
