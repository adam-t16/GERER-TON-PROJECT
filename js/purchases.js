document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  if (!checkAuth()) return;
  
  // DOM elements
  const purchasesTableBody = document.getElementById('purchasesTableBody');
  const addPurchaseBtn = document.getElementById('addPurchaseBtn');
  const purchaseForm = document.getElementById('purchaseForm');
  const cancelPurchaseBtn = document.getElementById('cancelPurchaseBtn');
  const purchaseProduct = document.getElementById('purchaseProduct');
  const purchaseQuantity = document.getElementById('purchaseQuantity');
  const purchaseUnitPrice = document.getElementById('purchaseUnitPrice');
  const purchaseTotal = document.getElementById('purchaseTotal');
  
  // Load purchases and products
  loadPurchases();
  loadProductsDropdown();
  
  // Setup event listeners
  if (addPurchaseBtn) {
    addPurchaseBtn.addEventListener('click', () => {
      purchaseForm.reset();
      openModal('purchaseModal');
    });
  }
  
  if (purchaseForm) {
    purchaseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      savePurchase();
    });
  }
  
  if (cancelPurchaseBtn) {
    cancelPurchaseBtn.addEventListener('click', () => {
      closeModal('purchaseModal');
    });
  }
  
  // Product selection change
  if (purchaseProduct) {
    purchaseProduct.addEventListener('change', updatePurchasePrice);
  }
  
  // Quantity change
  if (purchaseQuantity) {
    purchaseQuantity.addEventListener('input', updatePurchaseTotal);
  }
  
  // Setup modal close buttons
  setupModalCloseButtons();
  
  // Functions
  function loadPurchases() {
    if (!purchasesTableBody) return;
    
    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    purchasesTableBody.innerHTML = '';
    
    if (purchases.length === 0) {
      purchasesTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">No purchases recorded yet.</td>
        </tr>
      `;
      return;
    }
    
    purchases.forEach(purchase => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${purchase.id}</td>
        <td>${formatDate(purchase.date)}</td>
        <td>${purchase.productName}</td>
        <td>${purchase.quantity}</td>
        <td>${formatCurrency(purchase.unitPrice)}</td>
        <td>${formatCurrency(purchase.total)}</td>
      `;
      
      purchasesTableBody.appendChild(row);
    });
  }
  
  function loadProductsDropdown() {
    if (!purchaseProduct) return;
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Clear previous options except the first one
    while (purchaseProduct.options.length > 1) {
      purchaseProduct.remove(1);
    }
    
    // Add product options
    products.forEach(product => {
      const option = document.createElement('option');
      option.value = product.id;
      option.textContent = `${product.name} (Stock: ${product.stock})`;
      purchaseProduct.appendChild(option);
    });
  }
  
  function updatePurchasePrice() {
    if (!purchaseProduct || !purchaseUnitPrice) return;
    
    const productId = purchaseProduct.value;
    if (!productId) {
      purchaseUnitPrice.value = '';
      return;
    }
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (product) {
      purchaseUnitPrice.value = product.purchasePrice;
      updatePurchaseTotal();
    }
  }
  
  function updatePurchaseTotal() {
    if (!purchaseQuantity || !purchaseUnitPrice || !purchaseTotal) return;
    
    const quantity = parseInt(purchaseQuantity.value) || 0;
    const unitPrice = parseFloat(purchaseUnitPrice.value) || 0;
    
    purchaseTotal.value = (quantity * unitPrice).toFixed(2);
  }
  
  function savePurchase() {
    const productId = purchaseProduct.value;
    const quantity = parseInt(purchaseQuantity.value);
    const unitPrice = parseFloat(purchaseUnitPrice.value);
    const total = parseFloat(purchaseTotal.value);
    
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
    
    // Update product stock
    product.stock += quantity;
    products[productIndex] = product;
    localStorage.setItem('products', JSON.stringify(products));
    
    // Add purchase record
    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    purchases.push({
      id: generateId(),
      productId,
      productName: product.name,
      quantity,
      unitPrice,
      total,
      date: new Date().toISOString()
    });
    
    localStorage.setItem('purchases', JSON.stringify(purchases));
    
    // Close modal and refresh
    closeModal('purchaseModal');
    loadPurchases();
    loadProductsDropdown();
  }
});