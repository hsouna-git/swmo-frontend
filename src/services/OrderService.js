import axios from 'axios'

export class OrderService {
  constructor(baseUrl = 'http://localhost:9099') {
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
