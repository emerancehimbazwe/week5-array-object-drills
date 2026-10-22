import { orders } from "./data.js";

const ORIGINAL = JSON.stringify(orders);

// Helper: calculate the total price of one order
const orderTotal = ({ items }) =>
  items.reduce((sum, { price, qty }) => sum + price * qty, 0);

// Station 1 — Warm-up

// Q1. Array of all order IDs
const orderIds = orders.map(({ id }) => id);
console.log("Q1:", orderIds);

// Q2. Array of customer names (duplicates allowed)
const customerNames = orders.map(({ customer }) => customer.name);
console.log("Q2:", customerNames);

// Q3. All delivered orders
const deliveredOrders = orders.filter(
  ({ status }) => status === "delivered"
);
console.log("Q3:", deliveredOrders);

// Q4. All orders from Gasabo
const gasaboOrders = orders.filter(
  ({ customer }) => customer.district === "Gasabo"
);
console.log("Q4:", gasaboOrders);

// Q5. Find the order with ID 106
const order106 = orders.find(({ id }) => id === 106);
console.log("Q5:", order106);

// Q6. Does any order have a rating of 3 or lower?
const hasLowRating = orders.some(
  ({ rating }) => rating !== null && rating <= 3
);
console.log("Q6:", hasLowRating);

// Q7. Are all pending orders unrated?
const allPendingUnrated = orders
  .filter(({ status }) => status === "pending")
  .every(({ rating }) => rating === null);
console.log("Q7:", allPendingUnrated);

// Q8. Unique customer names
const uniqueNames = [...new Set(customerNames)];
console.log("Q8:", uniqueNames);

// Check immutability after Station 1
console.log(
  "Station 1 unchanged:",
  JSON.stringify(orders) === ORIGINAL
);

// Station 2 — Calculations with reduce

// Q9. Add a total to every order
const ordersWithTotal = orders.map((order) => ({
  ...order,
  total: orderTotal(order)
}));
console.log("Q9:", ordersWithTotal);

// Q10. Total revenue from delivered orders only
const deliveredRevenue = orders
  .filter(({ status }) => status === "delivered")
  .reduce((sum, order) => sum + orderTotal(order), 0);
console.log("Q10:", deliveredRevenue);

// Q11. Average rating, ignoring null ratings, rounded to 1 decimal
const ratedOrders = orders.filter(({ rating }) => rating !== null);
const averageRating = Number(
  (
    ratedOrders.reduce((sum, { rating }) => sum + rating, 0) /
    ratedOrders.length
  ).toFixed(1)
);
console.log("Q11:", averageRating);

// Q12. Total quantity of Brochettes sold
const brochetteQuantity = orders
  .flatMap(({ items }) => items)
  .filter(({ name }) => name === "Brochette")
  .reduce((sum, { qty }) => sum + qty, 0);
console.log("Q12:", brochetteQuantity);

// Q13. The single most expensive order
const mostExpensiveOrder = ordersWithTotal.reduce(
  (highest, order) =>
    order.total > highest.total ? order : highest
);
console.log("Q13:", mostExpensiveOrder);

// Q14. Number of orders per status
const ordersByStatus = orders.reduce((counts, { status }) => {
  counts[status] = (counts[status] || 0) + 1;
  return counts;
}, {});
console.log("Q14:", ordersByStatus);

// Check immutability after Station 2
console.log(
  "Station 2 unchanged:",
  JSON.stringify(orders) === ORIGINAL
);

// Station 3 — Grouping & Ranking

// Q15. Revenue per district from delivered orders
const revenueByDistrict = orders
  .filter(({ status }) => status === "delivered")
  .reduce((revenue, order) => {
    const district = order.customer.district;
    revenue[district] =
      (revenue[district] || 0) + orderTotal(order);
    return revenue;
  }, {});
console.log("Q15:", revenueByDistrict);

// Q16. Group orders by date and calculate count and revenue
const ordersByDate = Object.groupBy(orders, ({ date }) => date);

const dailySummary = Object.entries(ordersByDate).map(
  ([date, dayOrders]) => ({
    date,
    count: dayOrders.length,
    revenue: dayOrders.reduce(
      (sum, order) => sum + orderTotal(order), 0
    )
  })
);
console.log("Q16:", dailySummary);

// Q17. Top 3 best-selling items by quantity
const itemQuantities = orders
  .flatMap(({ items }) => items)
  .reduce((totals, { name, qty }) => {
    totals[name] = (totals[name] || 0) + qty;
    return totals;
  }, {});

const topThreeItems = Object.entries(itemQuantities)
  .map(([name, qty]) => ({ name, qty }))
  .toSorted((a, b) => b.qty - a.qty || a.name.localeCompare(b.name))
  .slice(0, 3);
console.log("Q17:", topThreeItems);

// Q18. Each customer's order count and total spent, sorted by spent
const customerSummary = Object.values(
  orders.reduce((customers, order) => {
    const name = order.customer.name;

    if (!customers[name]) {
      customers[name] = { name, orders: 0, spent: 0 };
    }

    customers[name].orders += 1;
    customers[name].spent += orderTotal(order);

    return customers;
  }, {})
).toSorted((a, b) => b.spent - a.spent);

console.log("Q18:", customerSummary);

// Q19. Menu price list, using one price per unique menu item
const menuPrices = Object.fromEntries(
  Object.entries(
    orders
      .flatMap(({ items }) => items)
      .reduce((menu, { name, price }) => {
        if (!(name in menu)) {
          menu[name] = price;
        }
        return menu;
      }, {})
  )
);
console.log("Q19:", menuPrices);

// Check immutability after Station 3
console.log(
  "Station 3 unchanged:",
  JSON.stringify(orders) === ORIGINAL
);

// Station 4 — Immutable Updates

// Q20. Change a pending order to delivered
const markDelivered = (orders, id) =>
  orders.map((order) =>
    order.id === id && order.status === "pending"
      ? { ...order, status: "delivered" }
      : order
  );

console.log("Q20:", markDelivered(orders, 105));

// Q21. Rate an order only if it is delivered
const rateOrder = (orders, id, rating) =>
  orders.map((order) =>
    order.id === id && order.status === "delivered"
      ? { ...order, rating }
      : order
  );

console.log("Q21:", rateOrder(orders, 101, 5));

// Q22. Change an order's district
const changeDistrict = (orders, id, district) =>
  orders.map((order) =>
    order.id === id
      ? {
          ...order,
          customer: { ...order.customer, district }
        }
      : order
  );

console.log("Q22:", changeDistrict(orders, 101, "Kicukiro"));

// Q23. Add an item to an order
const addItem = (orders, id, item) =>
  orders.map((order) =>
    order.id === id
      ? { ...order, items: [...order.items, item] }
      : order
  );

console.log(
  "Q23:",
  addItem(orders, 101, { name: "Water", price: 500, qty: 1 })
);

// Q24. Remove cancelled orders
const removeCancelled = (orders) =>
  orders.filter(({ status }) => status !== "cancelled");

console.log("Q24:", removeCancelled(orders));

// Q25. Apply a discount to every item price
const applyDiscount = (orders, percent) =>
  orders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({
      ...item,
      price: Math.round(item.price * (1 - percent / 100))
    }))
  }));

console.log("Q25:", applyDiscount(orders, 10));

// Check immutability after Station 4
console.log(
  "Station 4 unchanged:",
  JSON.stringify(orders) === ORIGINAL
);