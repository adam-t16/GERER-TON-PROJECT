document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  if (!checkAuth()) return;
  
  // DOM elements
  const totalSalesElement = document.getElementById('totalSales');
  const totalPurchasesElement = document.getElementById('totalPurchases');
  const totalProfitElement = document.getElementById('totalProfit');
  const totalProductsElement = document.getElementById('totalProducts');
  const lowStockList = document.getElementById('lowStockList');
  const deleteSalesBtn = document.getElementById('deleteSalesBtn');
  const deletePurchasesBtn = document.getElementById('deletePurchasesBtn');
  const deleteAllFinanceBtn = document.getElementById('deleteAllFinanceBtn');
  // Load dashboard data
  loadDashboardStats();
  loadLowStockAlerts();
  initCharts();
  if (deleteSalesBtn) {
    deleteSalesBtn.addEventListener('click', () => {
      if (confirm("Voulez-vous vraiment supprimer toutes les ventes ?")) {
        localStorage.removeItem('sales');
        loadDashboardStats();
        initCharts();
        alert("Toutes les ventes ont été supprimées.");
      }
    });
  }

  if (deletePurchasesBtn) {
    deletePurchasesBtn.addEventListener('click', () => {
      if (confirm("Voulez-vous vraiment supprimer tous les achats ?")) {
        localStorage.removeItem('purchases');
        loadDashboardStats();
        initCharts();
        alert("Tous les achats ont été supprimés.");
      }
    });
  }

  if (deleteAllFinanceBtn) {
    deleteAllFinanceBtn.addEventListener('click', () => {
      if (confirm("Voulez-vous réinitialiser toutes les données financières (ventes, achats) ?")) {
        localStorage.removeItem('sales');
        localStorage.removeItem('purchases');
        loadDashboardStats();
        initCharts();
        alert("Toutes les données financières ont été réinitialisées.");
      }
    });
  }
  // Functions
  function loadDashboardStats() {
    // Get data from localStorage
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const sales = JSON.parse(localStorage.getItem('sales')) || [];
    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    
    // Calculate totals
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
    const totalProfit = totalSales - totalPurchases;
    const totalProducts = products.length;
    
    // Update UI
    if (totalSalesElement) totalSalesElement.textContent = formatCurrency(totalSales);
    if (totalPurchasesElement) totalPurchasesElement.textContent = formatCurrency(totalPurchases);
    
    if (totalProfitElement) {
      totalProfitElement.textContent = formatCurrency(totalProfit);
      
      // Add color based on profit/loss
      if (totalProfit > 0) {
        totalProfitElement.classList.add('profit-positive');
        totalProfitElement.classList.remove('profit-negative');
      } else {
        totalProfitElement.classList.add('profit-negative');
        totalProfitElement.classList.remove('profit-positive');
      }
    }
    
    if (totalProductsElement) totalProductsElement.textContent = totalProducts;
  }
  
  function loadLowStockAlerts() {
    if (!lowStockList) return;
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const lowStockProducts = products.filter(product => checkLowStock(product));
    
    lowStockList.innerHTML = '';
    
    if (lowStockProducts.length === 0) {
      lowStockList.innerHTML = '<p>No products with low stock.</p>';
      return;
    }
    
    lowStockProducts.forEach(product => {
      const item = document.createElement('div');
      item.className = 'low-stock-item';
      item.innerHTML = `
        <span class="low-stock-name">${product.name}</span>
        <span class="low-stock-quantity">Stock: ${product.stock}</span>
      `;
      
      lowStockList.appendChild(item);
    });
  }
  
  function initCharts() {
    initSalesVsPurchasesChart();
    initTopProductsChart();
  }
  
  function initSalesVsPurchasesChart() {
    const ctx = document.getElementById('salesVsPurchasesChart');
    if (!ctx) return;
    
    // Get data from localStorage
    const sales = JSON.parse(localStorage.getItem('sales')) || [];
    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    
    // Group by month
    const monthlyData = getMonthlyData(sales, purchases);
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: monthlyData.labels,
        datasets: [
          {
            label: 'Sales',
            data: monthlyData.salesData,
            borderColor: '#4361ee',
            backgroundColor: 'rgba(67, 97, 238, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Purchases',
            data: monthlyData.purchasesData,
            borderColor: '#4cc9f0',
            backgroundColor: 'rgba(76, 201, 240, 0.1)',
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + formatCurrency(context.raw);
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatCurrency(value).replace(/\s+/g, ' ');
              }
            }
          }
        }
      }
    });
  }
  
  function initTopProductsChart() {
    const ctx = document.getElementById('topProductsChart');
    if (!ctx) return;
    
    // Get data from localStorage
    const sales = JSON.parse(localStorage.getItem('sales')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Calculate total sales by product
    const productSales = {};
    sales.forEach(sale => {
      if (!productSales[sale.productId]) {
        productSales[sale.productId] = 0;
      }
      productSales[sale.productId] += sale.total;
    });
    
    // Sort products by sales
    const topProducts = Object.keys(productSales)
      .map(productId => {
        const product = products.find(p => p.id === productId);
        return {
          name: product ? product.name : 'Unknown Product',
          sales: productSales[productId]
        };
      })
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5); // Get top 5
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topProducts.map(p => p.name),
        datasets: [
          {
            label: 'Sales Amount',
            data: topProducts.map(p => p.sales),
            backgroundColor: [
              '#4361ee',
              '#3f37c9',
              '#4895ef',
              '#4cc9f0',
              '#f72585'
            ]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return 'Sales: ' + formatCurrency(context.raw);
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatCurrency(value).replace(/\s+/g, ' ');
              }
            }
          }
        }
      }
    });
  }
  
  function getMonthlyData(sales, purchases) {
    // Get last 6 months
    const months = [];
    const salesData = [];
    const purchasesData = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const monthYear = date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      });
      
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();
      
      // Calculate sales for this month
      const monthlySales = sales
        .filter(sale => sale.date >= monthStart && sale.date <= monthEnd)
        .reduce((sum, sale) => sum + sale.total, 0);
      
      // Calculate purchases for this month
      const monthlyPurchases = purchases
        .filter(purchase => purchase.date >= monthStart && purchase.date <= monthEnd)
        .reduce((sum, purchase) => sum + purchase.total, 0);
      
      months.push(monthYear);
      salesData.push(monthlySales);
      purchasesData.push(monthlyPurchases);
    }
    
    return {
      labels: months,
      salesData,
      purchasesData
    };
  }
});
