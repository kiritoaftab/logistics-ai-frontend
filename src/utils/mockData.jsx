// utils/mockData.js
export const MOCK_RESPONSES = {
  inventory: {
    summary: "Based on your warehouse data, I found 156 SKUs with total on-hand inventory of 42,850 units. Here's a detailed breakdown by category and location.",
    data: [
      { category: "Electronics", skus: 45, units: 15200, value: "$456,000" },
      { category: "Clothing", skus: 78, units: 18450, value: "$276,750" },
      { category: "Accessories", skus: 33, units: 9200, value: "$138,000" },
    ],
    chart: {
      type: "bar",
      title: "Inventory by Category",
      data: [15200, 18450, 9200],
      labels: ["Electronics", "Clothing", "Accessories"]
    },
    metrics: {
      totalSKUs: 156,
      totalUnits: 42850,
      totalValue: "$870,750",
      utilization: "78%"
    },
    insights: [
      "Clothing category has highest turnover rate",
      "Zone A is near capacity - consider redistribution",
      "5 SKUs are below reorder threshold",
    ],
    sql: "SELECT category, COUNT(*) as skus, SUM(on_hand) as units, SUM(value) as value FROM inventory GROUP BY category ORDER BY units DESC",
    followUps: [
      "Show low stock items",
      "Inventory value by warehouse",
      "Expiring items in next 30 days",
    ]
  },
  
  orders: {
    summary: "Currently processing 247 orders across different stages. 189 are ready for shipping, 42 in picking, and 16 in packing.",
    data: [
      { status: "Pending", count: 32, value: "$12,800" },
      { status: "Picking", count: 42, value: "$16,800" },
      { status: "Packing", count: 16, value: "$6,400" },
      { status: "Ready to Ship", count: 157, value: "$62,800" },
    ],
    chart: {
      type: "pie",
      title: "Order Status Distribution",
      data: [32, 42, 16, 157],
      labels: ["Pending", "Picking", "Packing", "Ready to Ship"]
    },
    metrics: {
      totalOrders: 247,
      avgProcessingTime: "4.2h",
      onTimeDelivery: "94%",
      backlog: "3.5h"
    },
    insights: [
      "Peak order time: 2-4 PM daily",
      "Picking bottleneck in Zone B",
      "3 orders exceed SLA by 2h",
    ],
    sql: "SELECT status, COUNT(*) as count, SUM(total_value) as value FROM orders GROUP BY status",
    followUps: [
      "Show delayed orders",
      "Picking efficiency by zone",
      "Order forecast for next week",
    ]
  },
  
  putaway: {
    summary: "There are 23 pending putaway tasks totaling 4,500 units. Average wait time is 2.3 hours.",
    data: [
      { zone: "A", tasks: 8, units: 1600, waitTime: "1.5h" },
      { zone: "B", tasks: 10, units: 2000, waitTime: "2.8h" },
      { zone: "C", tasks: 5, units: 900, waitTime: "2.1h" },
    ],
    chart: {
      type: "bar",
      title: "Pending Putaway by Zone",
      data: [8, 10, 5],
      labels: ["Zone A", "Zone B", "Zone C"]
    },
    metrics: {
      totalTasks: 23,
      totalUnits: 4500,
      avgWaitTime: "2.3h",
      oldestTask: "5.2h"
    },
    recommendations: [
      "Assign 2 additional workers to Zone B",
      "Prioritize 3 urgent ASNs from Adittya",
      "Consolidate small tasks in Zone C",
    ],
    sql: "SELECT zone, COUNT(*) as tasks, SUM(quantity) as units, AVG(wait_time) as avg_wait FROM putaway_tasks WHERE status = 'PENDING' GROUP BY zone",
    followUps: [
      "Assign urgent tasks",
      "Show ASN details for pending",
      "Worker productivity by zone",
    ]
  },
  
  performance: {
    summary: "Warehouse performance metrics for the last 7 days show 94% efficiency with 3 critical areas needing attention.",
    metrics: {
      productivity: { current: 94, target: 98, trend: "+2.3%" },
      accuracy: { current: 99.2, target: 99.5, trend: "+0.1%" },
      throughput: { current: 1250, target: 1500, trend: "-3.5%" },
      utilization: { current: 82, target: 85, trend: "+1.2%" }
    },
    bottlenecks: [
      { area: "Receiving Dock", impact: "High", description: "Peak hour congestion causing 15min delays" },
      { area: "Picking Zone B", impact: "Medium", description: "Inefficient routing increasing travel time" },
    ],
    recommendations: [
      "Implement wave picking in Zone B",
      "Add 2 receiving docks during peak hours",
      "Schedule maintenance for Packing Station 3",
    ],
    chart: {
      type: "line",
      title: "Daily Throughput Trend",
      data: [1180, 1220, 1250, 1230, 1280, 1240, 1250],
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    },
    sql: "SELECT date, throughput, efficiency, accuracy FROM daily_metrics ORDER BY date DESC LIMIT 7",
    followUps: [
      "Detailed productivity report",
      "Compare with last month",
      "Identify top performers",
    ]
  },
  
  default: {
    summary: "I've analyzed your query and found relevant information from your warehouse database. Here's what I discovered based on the current operational data.",
    data: [
      { metric: "Total SKUs", value: 1250 },
      { metric: "Active Orders", value: 247 },
      { metric: "Pending Tasks", value: 89 },
      { metric: "Utilization", value: "82%" },
    ],
    insights: [
      "System is operating within normal parameters",
      "No critical issues detected",
      "3 optimization opportunities identified",
    ],
    sql: "SELECT * FROM warehouse_metrics WHERE timestamp > NOW() - INTERVAL '1 hour'",
    followUps: [
      "Show me trends",
      "Compare with yesterday",
      "Export this data",
    ]
  }
};

export function getMockResponse(query) {
  const q = query.toLowerCase();
  if (q.includes("inventory") || q.includes("stock")) return MOCK_RESPONSES.inventory;
  if (q.includes("order") || q.includes("sale")) return MOCK_RESPONSES.orders;
  if (q.includes("putaway") || q.includes("pending")) return MOCK_RESPONSES.putaway;
  if (q.includes("perform") || q.includes("metric") || q.includes("kpi")) return MOCK_RESPONSES.performance;
  return MOCK_RESPONSES.default;
}