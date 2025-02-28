document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  if (!checkAuth()) return;
  
  // DOM elements
  const salesTableBody = document.getElementById('salesTableBody');
  const addSaleBtn = document.getElementById('addSaleBtn');
  const saleForm = document.getElementById('saleForm');
  const cancelSaleBtn = document.getElementById('cancelSaleBtn');
  const saleProduct = document.getElementById('saleProduct');
  const saleQuantity = document.getElementById('saleQuantity');
  const saleUnitPrice = document.getElementById('saleUnitPrice');
  const saleTotal = document.getElementById('saleTotal');
  
  // Load sales and products
  loadSales();
  loadProductsDropdown();
  
  // Setup event listeners
  if (addSaleBtn) {
    addSaleBtn.addEventListener('click', () => {
      saleForm.reset();
      openModal('saleModal');
    });
  }
  
  if (saleForm) {
    saleForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveSale();
    });
  }
  
  if (cancelSaleBtn) {
    cancelSaleBtn.addEventListener('click', () => {
      closeModal('saleModal');
    });
  }
  
  // Product selection change
  if (saleProduct) {
    saleProduct.addEventListener('change', updateSalePrice);
  }
  
  // Quantity change
  if (saleQuantity) {
    saleQuantity.addEventListener('input', updateSaleTotal);
  }
  
  // Setup modal close buttons
  setupModalCloseButtons();
  
  // Functions
  function loadSales() {
    if (!salesTableBody) return;
    
    const sales = JSON.parse(localStorage.getItem('sales')) || [];
    salesTableBody.innerHTML = '';
    
    if (sales.length === 0) {
      salesTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">No sales recorded yet.</td>
        </tr>
      `;
      return;
    }
    
    sales.forEach(sale => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${sale.id}</td>
        <td>${formatDate(sale.date)}</td>
        <td>${sale.productName}</td>
        <td>${sale.quantity}</td>
        <td>${formatCurrency(sale.unitPrice)}</td>
        <td>${formatCurrency(sale.total)}</td>
      `;
      
      salesTableBody.appendChild(row);
    });
  }
  
  function loadProductsDropdown() {
    if (!saleProduct) return;
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Clear previous options except the first one
    while (saleProduct.options.length > 1) {
      saleProduct.remove(1);
    }
    
    // Add product options
    products.forEach(product => {
      const option = document.createElement('option');
      option.value = product.id;
      option.textContent = `${product.name} (Stock: ${product.stock})`;
      option.disabled = product.stock <= 0;
      saleProduct.appendChild(option);
    });
  }
  
  function updateSalePrice() {
    if (!saleProduct || !saleUnitPrice) return;
    
    const productId = saleProduct.value;
    if (!productId) {
      saleUnitPrice.value = '';
      return;
    }
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (product) {
      saleUnitPrice.value = product.sellingPrice;
      updateSaleTotal();
    }
  }
  
  function updateSaleTotal() {
    if (!saleQuantity || !saleUnitPrice || !saleTotal) return;
    
    const quantity = parseInt(saleQuantity.value) || 0;
    const unitPrice = parseFloat(saleUnitPrice.value) || 0;
    
    saleTotal.value = (quantity * unitPrice).toFixed(2);
  }
  
  function saveSale() {
    const productId = saleProduct.value;
    const quantity = parseInt(saleQuantity.value);
    const unitPrice = parseFloat(saleUnitPrice.value);
    const total = parseFloat(saleTotal.value);
    
    if (!productId || !quantity || quantity <= 0) {
      alert('Please select a product and enter a valid quantity.');
      return;
    }
    
    // Get product details
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      alert('Product not found.');
      return;
    }
    
    const product = products[productIndex];
    
    // Check if enough stock
    if (product.stock < quantity) {
      alert(`Not enough stock. Only ${product.stock} units available.`);
      return;
    }
    
    // Update product stock
    product.stock -= quantity;
    products[productIndex] = product;
    localStorage.setItem('products', JSON.stringify(products));
    
    // Add sale record
    const sales = JSON.parse(localStorage.getItem('sales')) || [];
    sales.push({
      id: generateId(),
      productId,
      productName: product.name,
      quantity,
      unitPrice,
      total,
      date: new Date().toISOString()
    });
    
    localStorage.setItem('sales', JSON.stringify(sales));
    
    // Close modal and refresh
    closeModal('saleModal');
    loadSales();
    loadProductsDropdown();
  }
});