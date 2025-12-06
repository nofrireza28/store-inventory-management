// Data Storage
let products = [];
let transactions = [];
let editingProductId = null;

// --- NAVIGATION LOGIC ---
const navButtons = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll("section");

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetSection = button.dataset.section;

    navButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    sections.forEach((section) => {
      section.classList.remove("active");
    });

    document.getElementById(targetSection).classList.add("active");

    if (targetSection === "dashboard") {
      updateDashboard();
    }
  });
});

// --- ALERT SYSTEM ---
function showAlert(message, type = "success") {
  const alertBox = document.getElementById("alertBox");
  alertBox.textContent = message;
  alertBox.className = `alert alert-${type} show`;

  setTimeout(() => {
    alertBox.classList.remove("show");
  }, 3000);
}

// --- MODAL SYSTEM ---
const productModal = document.getElementById("productModal");
const transactionModal = document.getElementById("transactionModal");
const openProductBtn = document.getElementById("openProductModalBtn");
const openTransactionBtn = document.getElementById("openTransactionModalBtn");
const closeButtons = document.querySelectorAll(".close-modal, .closeModalBtn");

// Open Product Modal (Add Mode)
openProductBtn.addEventListener("click", () => {
  editingProductId = null;
  document.getElementById("productForm").reset();
  document.getElementById("productModalTitle").textContent =
    "Tambah Produk Baru";
  document.getElementById("submitProductBtn").textContent = "Simpan";
  document.getElementById("submitProductBtn").className = "btn btn-primary";
  productModal.style.display = "block";
});

// Open Transaction Modal
openTransactionBtn.addEventListener("click", () => {
  document.getElementById("transactionForm").reset();
  document.getElementById("transactionTotal").value = "";
  updateTransactionProductOptions();
  transactionModal.style.display = "block";
});

// Close Modals
closeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    productModal.style.display = "none";
    transactionModal.style.display = "none";
  });
});

// Close when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === productModal) productModal.style.display = "none";
  if (e.target === transactionModal) transactionModal.style.display = "none";
});

// --- PRODUCT MANAGEMENT ---
const productForm = document.getElementById("productForm");
const productTableBody = document.getElementById("productTableBody");
const searchProduct = document.getElementById("searchProduct");

productForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("productName").value.trim();
  const category = document.getElementById("productCategory").value;
  const price = parseFloat(document.getElementById("productPrice").value);
  const stock = parseInt(document.getElementById("productStock").value);
  const status = document.querySelector(
    'input[name="productStatus"]:checked'
  ).value;
  const features = Array.from(
    document.querySelectorAll('input[name="features"]:checked')
  ).map((cb) => cb.value);

  // Validation logic simplified inside required attributes, but adding logic checks
  if (price < 0 || stock < 0) {
    showAlert("Harga dan stok tidak boleh negatif!", "error");
    return;
  }

  if (editingProductId !== null) {
    // UPDATE Existing
    const productIndex = products.findIndex((p) => p.id === editingProductId);
    products[productIndex] = {
      ...products[productIndex],
      name,
      category,
      price,
      stock,
      status,
      features,
    };
    showAlert("Produk berhasil diperbarui!", "success");
  } else {
    // ADD New
    const product = {
      id: Date.now(),
      name,
      category,
      price,
      stock,
      status,
      features,
    };
    products.push(product);
    showAlert("Produk berhasil ditambahkan!", "success");
  }

  productForm.reset();
  productModal.style.display = "none"; // Close modal
  renderProducts();
  updateTransactionProductOptions();
  updateDashboard();
});

function renderProducts(filter = "") {
  productTableBody.innerHTML = "";

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(filter.toLowerCase()) ||
      product.category.toLowerCase().includes(filter.toLowerCase())
  );

  filteredProducts.forEach((product, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>Rp ${product.price.toLocaleString("id-ID")}</td>
                    <td>${product.stock}</td>
                    <td>
                        <span style="padding: 2px 8px; border-radius: 10px; font-size: 0.8rem; background-color: ${
                          product.status === "Aktif" ? "#d1fae5" : "#fee2e2"
                        }; color: ${
      product.status === "Aktif" ? "#065f46" : "#991b1b"
    };">
                            ${product.status}
                        </span>
                    </td>
                    <td>${product.features.join(", ") || "-"}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-warning btn-small" onclick="editProduct(${
                              product.id
                            })">Edit</button>
                            <button class="btn btn-danger btn-small" onclick="deleteProduct(${
                              product.id
                            })">Hapus</button>
                        </div>
                    </td>
                `;
    productTableBody.appendChild(row);
  });

  if (filteredProducts.length === 0) {
    productTableBody.innerHTML =
      '<tr><td colspan="8" style="text-align:center; padding: 2rem;">Tidak ada data produk</td></tr>';
  }
}

// Trigger Edit Modal
function editProduct(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;

  editingProductId = id;
  document.getElementById("productName").value = product.name;
  document.getElementById("productCategory").value = product.category;
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productStock").value = product.stock;
  document.querySelector(
    `input[name="productStatus"][value="${product.status}"]`
  ).checked = true;

  document.querySelectorAll('input[name="features"]').forEach((cb) => {
    cb.checked = product.features.includes(cb.value);
  });

  // Change Modal UI for Edit Mode
  document.getElementById("productModalTitle").textContent = "Edit Produk";
  document.getElementById("submitProductBtn").textContent = "Update Produk";
  document.getElementById("submitProductBtn").className = "btn btn-warning";

  productModal.style.display = "block";
}

function deleteProduct(id) {
  if (confirm("Yakin ingin menghapus produk ini?")) {
    products = products.filter((p) => p.id !== id);
    renderProducts();
    updateTransactionProductOptions();
    updateDashboard();
    showAlert("Produk berhasil dihapus!", "success");
  }
}

searchProduct.addEventListener("input", (e) => {
  renderProducts(e.target.value);
});

// --- TRANSACTION MANAGEMENT ---
const transactionForm = document.getElementById("transactionForm");
const transactionTableBody = document.getElementById("transactionTableBody");
const searchTransaction = document.getElementById("searchTransaction");
const transactionProduct = document.getElementById("transactionProduct");
const transactionQuantity = document.getElementById("transactionQuantity");
const transactionTotal = document.getElementById("transactionTotal");

function updateTransactionProductOptions() {
  transactionProduct.innerHTML = '<option value="">Pilih Produk</option>';
  products
    .filter((p) => p.status === "Aktif" && p.stock > 0)
    .forEach((product) => {
      const option = document.createElement("option");
      option.value = product.id;
      option.textContent = `${product.name} (Stok: ${product.stock})`;
      transactionProduct.appendChild(option);
    });
}

function calculateTotal() {
  const productId = parseInt(transactionProduct.value);
  const quantity = parseInt(transactionQuantity.value) || 0;

  if (productId && quantity > 0) {
    const product = products.find((p) => p.id === productId);
    if (product) {
      const total = product.price * quantity;
      transactionTotal.value = `Rp ${total.toLocaleString("id-ID")}`;
    }
  } else {
    transactionTotal.value = "";
  }
}

transactionProduct.addEventListener("change", calculateTotal);
transactionQuantity.addEventListener("input", calculateTotal);

transactionForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const productId = parseInt(transactionProduct.value);
  const quantity = parseInt(transactionQuantity.value);
  const customerName = document.getElementById("customerName").value.trim();
  const paymentMethod = document.getElementById("paymentMethod").value;

  // Simple validation
  if (!productId || !quantity || quantity <= 0) return;

  const product = products.find((p) => p.id === productId);
  if (quantity > product.stock) {
    showAlert(`Stok tidak mencukupi! Sisa: ${product.stock}`, "error");
    return;
  }

  const total = product.price * quantity;
  const transaction = {
    id: Date.now(),
    date: new Date().toLocaleString("id-ID"),
    productId: product.id,
    productName: product.name,
    quantity,
    total,
    customerName,
    paymentMethod,
  };

  transactions.push(transaction);
  product.stock -= quantity;

  renderTransactions();
  renderProducts(); // Refresh stock in product table
  updateDashboard();

  transactionForm.reset();
  transactionModal.style.display = "none"; // Close Modal

  showAlert(
    `Transaksi Berhasil! Rp ${total.toLocaleString("id-ID")}`,
    "success"
  );
});

function renderTransactions(filter = "") {
  transactionTableBody.innerHTML = "";

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.productName.toLowerCase().includes(filter.toLowerCase()) ||
      transaction.customerName.toLowerCase().includes(filter.toLowerCase())
  );

  filteredTransactions.forEach((transaction, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${transaction.date}</td>
                    <td>${transaction.productName}</td>
                    <td>${transaction.quantity}</td>
                    <td>Rp ${transaction.total.toLocaleString("id-ID")}</td>
                    <td>${transaction.customerName}</td>
                    <td>${transaction.paymentMethod}</td>
                    <td>
                        <button class="btn btn-danger btn-small" onclick="deleteTransaction(${
                          transaction.id
                        })">Hapus</button>
                    </td>
                `;
    transactionTableBody.appendChild(row);
  });

  if (filteredTransactions.length === 0) {
    transactionTableBody.innerHTML =
      '<tr><td colspan="8" style="text-align:center; padding: 2rem;">Tidak ada data transaksi</td></tr>';
  }
}

function deleteTransaction(id) {
  if (confirm("Yakin ingin menghapus transaksi ini?")) {
    const transaction = transactions.find((t) => t.id === id);
    if (transaction) {
      const product = products.find((p) => p.id === transaction.productId);
      if (product) product.stock += transaction.quantity;
    }

    transactions = transactions.filter((t) => t.id !== id);
    renderTransactions();
    renderProducts();
    updateDashboard();
    showAlert("Transaksi dihapus!", "success");
  }
}

searchTransaction.addEventListener("input", (e) => {
  renderTransactions(e.target.value);
});

// --- DASHBOARD ---
function updateDashboard() {
  document.getElementById("totalProducts").textContent = products.length;
  document.getElementById("totalTransactions").textContent =
    transactions.length;

  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
  document.getElementById(
    "totalRevenue"
  ).textContent = `Rp ${totalRevenue.toLocaleString("id-ID")}`;

  const avgTransaction =
    transactions.length > 0 ? totalRevenue / transactions.length : 0;
  document.getElementById("avgTransaction").textContent = `Rp ${Math.round(
    avgTransaction
  ).toLocaleString("id-ID")}`;
}

// Init Dummy Data (Optional, for demo)
function initDemoData() {
  products.push({
    id: 1,
    name: "Kopi Arabika",
    category: "Minuman",
    price: 25000,
    stock: 50,
    status: "Aktif",
    features: ["Terlaris"],
  });
  renderProducts();
  updateDashboard();
}

// Initialize
initDemoData();
