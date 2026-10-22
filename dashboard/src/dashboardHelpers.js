
import { orders as defaultOrders } from '../../data.js'

// Calculate the total price of one order.
export const orderTotal = ({ items }) =>
  items.reduce((sum, { price, qty }) => sum + price * qty, 0)

// Find the item sold in the largest quantity.
export function getBestSellingItem(orders = defaultOrders) {
  const quantities = orders
    .flatMap(({ items }) => items)
    .reduce((totals, { name, qty }) => ({
      ...totals,
      [name]: (totals[name] || 0) + qty,
    }), {})

  const [name, quantity] = Object.entries(quantities)
    .toSorted((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]

  return { name, quantity }
}

// Calculate delivered revenue for each district.
export function getDeliveredRevenueByDistrict(orders = defaultOrders) {
  const revenue = orders
    .filter(({ status }) => status === 'delivered')
    .reduce((totals, order) => ({
      ...totals,
      [order.customer.district]:
        (totals[order.customer.district] || 0) + orderTotal(order),
    }), {})

  return Object.entries(revenue)
    .map(([district, revenue]) => ({ district, revenue }))
    .toSorted((a, b) => b.revenue - a.revenue)
}
