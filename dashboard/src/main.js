
import './style.css'
import { orders } from '../../data.js'
import {
  orderTotal,
  getBestSellingItem,
  getDeliveredRevenueByDistrict,
} from './dashboardHelpers.js'

const deliveredOrders = orders.filter(
  order => order.status === 'delivered'
)

const ratedOrders = deliveredOrders.filter(
  order => order.rating !== null && order.rating !== undefined
)

const totalRevenue = deliveredOrders.reduce(
  (sum, order) => sum + orderTotal(order),
  0
)

const averageRating = ratedOrders.length
  ? ratedOrders.reduce((sum, order) => sum + order.rating, 0) / ratedOrders.length
  : 0

const bestSellingItem = getBestSellingItem(orders)
const districtRevenue = getDeliveredRevenueByDistrict(orders)

const statusClasses = {
  delivered: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
}

let activeFilter = 'all'

document.querySelector('#app').innerHTML = `
  <main class="min-h-screen bg-slate-100 px-4 py-8 text-slate-800 md:px-8">
    <div class="mx-auto max-w-7xl">
      <header class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p class="text-sm font-bold tracking-[0.2em] text-teal-700">KIGALI EATS</p>
          <h1 class="mt-2 text-3xl font-bold md:text-4xl">Orders Dashboard</h1>
          <p class="mt-2 text-slate-500">A simple overview of restaurant performance.</p>
        </div>
        <span class="w-fit rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold">
          October 2026
        </span>
      </header>

      <section class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article class="rounded-2xl bg-white p-6 shadow-sm">
          <p class="text-sm text-slate-500">Delivered revenue</p>
          <h2 class="mt-3 text-2xl font-bold">${totalRevenue.toLocaleString()} RWF</h2>
          <p class="mt-2 text-sm text-teal-700">Revenue from delivered orders</p>
        </article>

        <article class="rounded-2xl bg-white p-6 shadow-sm">
          <p class="text-sm text-slate-500">Delivered orders</p>
          <h2 class="mt-3 text-2xl font-bold">${deliveredOrders.length}</h2>
          <p class="mt-2 text-sm text-teal-700">Successfully delivered</p>
        </article>

        <article class="rounded-2xl bg-white p-6 shadow-sm">
          <p class="text-sm text-slate-500">Average rating</p>
          <h2 class="mt-3 text-2xl font-bold">${averageRating.toFixed(1)} / 5</h2>
          <p class="mt-2 text-sm text-teal-700">Customer satisfaction</p>
        </article>

        <article class="rounded-2xl bg-white p-6 shadow-sm">
          <p class="text-sm text-slate-500">Best-selling item</p>
          <h2 class="mt-3 text-2xl font-bold">${bestSellingItem.name}</h2>
          <p class="mt-2 text-sm text-teal-700">${bestSellingItem.quantity} items sold</p>
        </article>
      </section>

      <section class="mb-8 rounded-2xl bg-white p-6 shadow-sm">
        <h2 class="text-xl font-bold">Revenue by district</h2>
        <p class="mb-6 mt-1 text-sm text-slate-500">Delivered orders only</p>
        <div id="districtChart" class="space-y-5"></div>
      </section>

      <section class="rounded-2xl bg-white p-6 shadow-sm">
        <div class="mb-6">
          <h2 class="text-xl font-bold">Orders</h2>
          <p class="mt-1 text-sm text-slate-500">Filter orders by delivery status.</p>
        </div>

        <div class="mb-6 flex flex-wrap gap-2">
          <button data-filter="all" class="filter-btn rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white">All</button>
          <button data-filter="delivered" class="filter-btn rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Delivered</button>
          <button data-filter="pending" class="filter-btn rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Pending</button>
          <button data-filter="cancelled" class="filter-btn rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Cancelled</button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-4 py-3">Order</th>
                <th class="px-4 py-3">Customer</th>
                <th class="px-4 py-3">District</th>
                <th class="px-4 py-3">Total</th>
                <th class="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody id="ordersTable"></tbody>
          </table>
        </div>
        <p id="orderCount" class="mt-4 text-sm text-slate-500"></p>
      </section>

      <footer class="py-8 text-center text-sm text-slate-500">
        Kigali Eats · Week 5 JavaScript Workshop
      </footer>
    </div>
  </main>
`

function renderDistrictChart() {
  const maxRevenue = Math.max(...districtRevenue.map(district => district.revenue), 1)

  document.querySelector('#districtChart').innerHTML = districtRevenue.map(
    ({ district, revenue }) => `
      <div>
        <div class="mb-2 flex justify-between gap-4 text-sm">
          <span class="font-semibold">${district}</span>
          <span class="text-slate-600">${revenue.toLocaleString()} RWF</span>
        </div>
        <div class="h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            class="h-full rounded-full bg-teal-600"
            style="width: ${(revenue / maxRevenue) * 100}%"
          ></div>
        </div>
      </div>
    `
  ).join('')
}

function renderOrders() {
  const filteredOrders = activeFilter === 'all'
    ? orders
    : orders.filter(({ status }) => status === activeFilter)

  // innerHTML is used here because the displayed order data is our own workshop dataset.
  document.querySelector('#ordersTable').innerHTML = filteredOrders.map(
    ({ id, customer, status, ...order }) => `
      <tr class="border-b border-slate-100 hover:bg-slate-50">
        <td class="px-4 py-4 font-semibold">#${id}</td>
        <td class="px-4 py-4">${customer.name}</td>
        <td class="px-4 py-4">${customer.district}</td>
        <td class="px-4 py-4 font-medium">${orderTotal({ id, customer, status, ...order }).toLocaleString()} RWF</td>
        <td class="px-4 py-4">
          <span class="rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses[status] ?? 'bg-slate-100 text-slate-700'}">
            ${status}
          </span>
        </td>
      </tr>
    `
  ).join('')

  document.querySelector('#orderCount').textContent =
    `Showing ${filteredOrders.length} of ${orders.length} orders`

  document.querySelectorAll('.filter-btn').forEach(button => {
    const selected = button.dataset.filter === activeFilter

    button.className = selected
      ? 'filter-btn rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white'
      : 'filter-btn rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700'
  })
}

document.querySelectorAll('.filter-btn').forEach(button => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter
    renderOrders()
  })
})

renderDistrictChart()
renderOrders()
