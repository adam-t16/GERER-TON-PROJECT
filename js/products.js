document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  if (!checkAuth()) return;
  
  // DOM elements
  const productsTableBody = document.getElementById('productsTableBody');
  const addProductBtn = document.getElementById('addProductBtn');
  const productForm = document.getElementById('productForm');
  const cancelProductBtn = document.getElementById('cancelProductBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  
  let currentProductId = null;
  
  // Load products
  loadProducts();
  
  // Setup event listeners
  if (addProductBtn) {
    addProductBtn.addEventListener('click', () => {
      document.getElementById('modalTitle').textContent = 'Add New Product';
      document.getElementById('productId').value = '';
      document.getElementById('productForm').reset();
      openModal('productModal');
    });
  }
  
  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveProduct();
    });
  }
  
  if (cancelProductBtn) {
    cancelProductBtn.addEventListener('click', () => {
      closeModal('productModal');
    });
  }
  
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
      if (currentProductId) {
        deleteProduct(currentProductId);
      }
      closeModal('deleteConfirmModal');
    });
  }
  
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
      closeModal('deleteConfirmModal');
    });
  }
  
  // Setup modal close buttons
  setupModalCloseButtons();
  
  // Functions
  function loadProducts() {
    if (!productsTableBody) return;
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    productsTableBody.innerHTML = '';
    
    if (products.length === 0) {
      productsTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">No products found. Add your first product!</td>
        </tr>
      `;
      return;
    }
    
    products.forEach(product => {
      const row = document.createElement('tr');
      
      // Add class for low stock
      if (checkLowStock(product)) {
        row.classList.add('low-stock');
      }
      
      row.innerHTML = `
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${formatCurrency(product.sellingPrice)}</td>
        <td>${formatCurrency(product.purchasePrice)}</td>
        <td>${product.stock} ${checkLowStock(product) ? '⚠️' : ''}</td>
        <td class="action-buttons">
          <button class="btn-primary edit-btn" data-id="${product.id}">Edit</button>
          <button class="btn-danger delete-btn" data-id="${product.id}">Delete</button>
        </td>
      `;
      
      productsTableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
      button.addEventListener('click', () => {
        const productId = button.getAttribute('data-id');
        editProduct(productId);
      });
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', () => {
        const productId = button.getAttribute('data-id');
        confirmDelete(productId);
      });
    });
  }
  
  function saveProduct() {
    const productId = document.getElementById('productId').value;
    const name = document.getElementById('productName').value;
    const sellingPrice = parseFloat(document.getElementById('sellingPrice').value);
    const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);
    const stock = parseInt(document.getElementById('stockQuantity').value);
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    if (productId) {
      // Update existing product
      const index = products.findIndex(p => p.id === productId);
      if (index !== -1) {
        products[index] = {
          ...products[index],
          name,
          sellingPrice,
          purchasePrice,
          stock
        };
      }
    } else {
      // Add new product
      products.push({
        id: generateId(),
        name,
        sellingPrice,
        purchasePrice,
        stock,
        createdAt: new Date().toISOString()
      });
    }
    
    localStorage.setItem('products', JSON.stringify(products));
    closeModal('productModal');
    loadProducts();
  }
  
  function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (product) {
      document.getElementById('modalTitle').textContent = 'Edit Product';
      document.getElementById('productId').value = product.id;
      document.getElementById('productName').value = product.name;
      document.getElementById('sellingPrice').value = product.sellingPrice;
      document.getElementById('purchasePrice').value = product.purchasePrice;
      document.getElementById('stockQuantity').value = product.stock;
      
      openModal('productModal');
    }
  }
  
  function confirmDelete(productId) {
    currentProductId = productId;
    openModal('deleteConfirmModal');
  }
  
  function deleteProduct(productId) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products = products.filter(p => p.id !== productId);
    localStorage.setItem('products', JSON.stringify(products));
    loadProducts();
  }
});