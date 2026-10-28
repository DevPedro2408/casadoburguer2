/* =========================================================
   CASA DO BURGUER – JavaScript
   Seções:
   1. Configurações
   2. Dados dos produtos
   3. Utilitários
   4. Menu mobile e scroll suave
   5. Cardápio (render + filtros)
   6. Carrinho (estado + render)
   7. Abrir/fechar carrinho e etapas
   8. Formulário, validação e resumo
   9. Mensagem e envio pelo WhatsApp
   ========================================================= */

/* ---------- 1. Configurações ---------- */
// Troque pelo número da hamburgueria: 55 + DDD + número (somente dígitos)
const whatsappNumber = "5598991042408";

const CART_STORAGE_KEY = "casaDoBurguerCart";

// Imagem exibida caso alguma foto não carregue (ou use suas próprias fotos em img/produtos)
const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#fff6e8"/><text x="200" y="175" font-size="100" text-anchor="middle">🍔</text></svg>'
  );

/* ---------- 2. Dados dos produtos ---------- */
// category: hamburgueres | combos | porcoes | bebidas
// Para usar fotos locais, troque o "image" por "img/produtos/nome-da-foto.jpg"
const unsplash = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=700&q=70`;

const products = [
  { id: 1,  category: "hamburgueres", name: "X-Burger",        description: "Pão brioche, blend 150g, queijo prato e molho da casa.", price: 17.9, image: unsplash("1568901346375-23c9450c58cd") },
  { id: 2,  category: "hamburgueres", name: "X-Bacon",         description: "Blend 150g, bacon crocante, cheddar e maionese defumada.", price: 19.9, image: unsplash("1550547660-d9450f859349") },
  { id: 3,  category: "hamburgueres", name: "X-Salada Duplo",  description: "Dois blends, queijo, alface, tomate e cebola roxa.", price: 26.9, image: unsplash("1561758033-d89a9ad46330") },
  { id: 4,  category: "hamburgueres", name: "Smash da Casa",   description: "Dois smashs prensados, cheddar derretido e picles.", price: 29.9, image: unsplash("1572802419224-296b0aeee0d9") },
  { id: 5,  category: "hamburgueres", name: "Chicken Crispy",  description: "Frango empanado crocante, alface e molho especial.", price: 23.9, image: unsplash("1594212699903-ec8a3eca50f5") },
  { id: 6,  category: "combos",       name: "Combo X-Bacon",   description: "X-Bacon + batata pequena + refrigerante lata.", price: 34.9, image: unsplash("1551782450-a2132b4ba21d") },
  { id: 7,  category: "combos",       name: "Combo Duplo",     description: "X-Salada Duplo + batata média + refrigerante lata.", price: 44.9, image: unsplash("1553979459-d2229ba7433b") },
  { id: 8,  category: "porcoes",      name: "Batata P",        description: "Batata frita crocante, porção individual.", price: 12.0, image: unsplash("1573080496219-bb080dd4f877") },
  { id: 9,  category: "porcoes",      name: "Batata G",        description: "Porção grande de batata para dividir.", price: 22.0, image: unsplash("1630384060421-cb20d0e0649d") },
  { id: 10, category: "porcoes",      name: "Onion Rings",     description: "Anéis de cebola empanados e sequinhos.", price: 18.0, image: unsplash("1639024471283-03518883512d") },
  { id: 11, category: "bebidas",      name: "Coca-Cola",       description: "Lata 350ml, bem gelada.", price: 5.0, image: unsplash("1622483767028-3f66f32aef97") },
  { id: 12, category: "bebidas",      name: "Suco de Laranja", description: "Natural, 400ml.", price: 8.0, image: unsplash("1600271886742-f049cd451bba") },
];

/* ---------- 3. Utilitários ---------- */
const $ = (selector) => document.querySelector(selector);

// Formata número como moeda brasileira: 12 -> "R$ 12,00"
const formatPrice = (value) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Troca a imagem por um placeholder caso ela falhe ao carregar
function protectImages(container = document) {
  container.querySelectorAll("img").forEach((img) => {
    const useFallback = () => { if (img.src !== FALLBACK_IMAGE) img.src = FALLBACK_IMAGE; };
    img.addEventListener("error", useFallback, { once: true });
    if (img.complete && img.naturalWidth === 0) useFallback();
  });
}

let toastTimer;
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2000);
}

/* ---------- 4. Menu mobile e scroll suave ---------- */
const menuToggle = $("#menuToggle");
const navMenu = $("#navMenu");

function closeMenu() {
  navMenu.classList.remove("open");
  menuToggle.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("open");
  menuToggle.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

// Scroll suave para qualquer link interno (#secao)
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
    closeMenu();
  });
});

/* ---------- 5. Cardápio ---------- */
const productsGrid = $("#productsGrid");

function renderProducts(category = "todos") {
  const list = category === "todos" ? products : products.filter((p) => p.category === category);

  productsGrid.innerHTML = list.map((product) => `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-bottom">
          <span class="price">${formatPrice(product.price)}</span>
          <button class="add-btn" data-id="${product.id}">+ Adicionar</button>
        </div>
      </div>
    </article>
  `).join("");

  protectImages(productsGrid);
}

// Filtros de categoria
$("#filters").addEventListener("click", (event) => {
  const button = event.target.closest(".filter-btn");
  if (!button) return;
  document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
  button.classList.add("active");
  renderProducts(button.dataset.category);
});

// Botão "Adicionar" (delegação de evento)
productsGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".add-btn");
  if (!button) return;
  addToCart(Number(button.dataset.id));
});

/* ---------- 6. Carrinho ---------- */
// O carrinho é uma lista: [{ id: 2, quantity: 3 }, ...]
let cart = loadCart();

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    if (!Array.isArray(saved)) return [];
    // Mantém apenas itens que ainda existem no cardápio
    return saved.filter((item) => products.some((p) => p.id === item.id) && item.quantity > 0);
  } catch {
    return [];
  }
}

function saveCart() {
  try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); } catch { /* ignora */ }
}

const getProduct = (id) => products.find((p) => p.id === id);
const getTotal = () => cart.reduce((sum, item) => sum + getProduct(item.id).price * item.quantity, 0);
const getCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

function addToCart(id) {
  const existing = cart.find((item) => item.id === id);
  if (existing) existing.quantity++;
  else cart.push({ id, quantity: 1 });
  updateCart();
  showToast(`${getProduct(id).name} adicionado ao carrinho`);
}

function changeQuantity(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) removeFromCart(id);
  else updateCart();
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  updateCart();
}

// Atualiza tudo que depende do carrinho
function updateCart() {
  saveCart();
  renderCartItems();

  const countEl = $("#cartCount");
  countEl.textContent = getCount();
  countEl.classList.remove("bump");
  void countEl.offsetWidth; // reinicia a animação
  countEl.classList.add("bump");

  $("#cartSubtotal").textContent = formatPrice(getTotal());
  $("#cartTotal").textContent = formatPrice(getTotal());
  $("#checkoutBtn").disabled = cart.length === 0;
  $("#checkoutBtn").style.opacity = cart.length === 0 ? "0.5" : "1";
}

function renderCartItems() {
  const container = $("#cartItems");

  if (cart.length === 0) {
    container.innerHTML = `<div class="empty-cart"><span>🍟</span><p>Seu carrinho está vazio.<br>Escolha algo gostoso no cardápio!</p></div>`;
    return;
  }

  container.innerHTML = cart.map((item) => {
    const product = getProduct(item.id);
    return `
      <div class="cart-item">
        <img src="${product.image}" alt="${product.name}">
        <div>
          <h4>${product.name}</h4>
          <span class="item-price">${formatPrice(product.price * item.quantity)}</span>
          <div class="qty">
            <button data-action="decrease" data-id="${item.id}" aria-label="Diminuir quantidade">−</button>
            <span>${item.quantity}</span>
            <button data-action="increase" data-id="${item.id}" aria-label="Aumentar quantidade">+</button>
          </div>
        </div>
        <button class="remove-btn" data-action="remove" data-id="${item.id}" aria-label="Remover ${product.name}">🗑️</button>
      </div>`;
  }).join("");

  protectImages(container);
}

// Botões dentro do carrinho (delegação de evento)
$("#cartItems").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = Number(button.dataset.id);
  if (button.dataset.action === "increase") changeQuantity(id, 1);
  if (button.dataset.action === "decrease") changeQuantity(id, -1);
  if (button.dataset.action === "remove") removeFromCart(id);
});

/* ---------- 7. Abrir/fechar carrinho e etapas ---------- */
const cartPanel = $("#cart");
const overlay = $("#overlay");
const views = { cart: $("#viewCart"), form: $("#viewForm"), summary: $("#viewSummary") };
const viewTitles = { cart: "Seu carrinho", form: "Dados do pedido", summary: "Resumo do pedido" };

function showView(name) {
  Object.entries(views).forEach(([key, el]) => el.classList.toggle("hidden", key !== name));
  $("#cartTitle").textContent = viewTitles[name];
}

function openCart() {
  showView("cart");
  cartPanel.classList.add("open");
  cartPanel.setAttribute("aria-hidden", "false");
  overlay.classList.add("show");
  document.body.classList.add("no-scroll");
  closeMenu();
}

function closeCart() {
  cartPanel.classList.remove("open");
  cartPanel.setAttribute("aria-hidden", "true");
  overlay.classList.remove("show");
  document.body.classList.remove("no-scroll");
}

$("#openCartBtn").addEventListener("click", openCart);
$("#closeCartBtn").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

// "Fazer pedido" da navbar leva ao cardápio (já é um link); aqui só fechamos o menu
$("#checkoutBtn").addEventListener("click", () => {
  if (cart.length === 0) return;
  showView("form");
});
$("#backToCartBtn").addEventListener("click", () => showView("cart"));
$("#backToFormBtn").addEventListener("click", () => showView("form"));

/* ---------- 8. Formulário, validação e resumo ---------- */
const orderForm = $("#orderForm");
const addressFields = $("#addressFields");

const getRadio = (name) => {
  const checked = orderForm.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : "";
};
const getValue = (id) => $(`#${id}`).value.trim();
const isDelivery = () => getRadio("orderType") === "Entrega";

// Mostra o endereço só quando o pedido for Entrega
orderForm.querySelectorAll('input[name="orderType"]').forEach((radio) => {
  radio.addEventListener("change", () => addressFields.classList.toggle("hidden", !isDelivery()));
});

function setError(fieldId, message) {
  const errorEl = orderForm.querySelector(`[data-error-for="${fieldId}"]`);
  if (errorEl) errorEl.textContent = message;
  const field = errorEl ? errorEl.closest(".field") : null;
  if (field) field.classList.toggle("invalid", Boolean(message));
}

// Retorna true se todos os campos obrigatórios estiverem preenchidos
function validateForm() {
  let valid = true;
  const required = [["customerName", "Informe seu nome."]];

  if (isDelivery()) {
    required.push(["street", "Informe a rua."], ["number", "Informe o número."], ["neighborhood", "Informe o bairro."]);
  }

  // Limpa os erros anteriores
  ["customerName", "street", "number", "neighborhood", "payment"].forEach((id) => setError(id, ""));

  required.forEach(([id, message]) => {
    if (!getValue(id)) { setError(id, message); valid = false; }
  });

  if (!getRadio("payment")) { setError("payment", "Escolha a forma de pagamento."); valid = false; }

  if (!valid) {
    const firstInvalid = orderForm.querySelector(".invalid input, .invalid textarea");
    if (firstInvalid) firstInvalid.focus();
  }
  return valid;
}

// Junta os dados do formulário em um objeto
function getOrderData() {
  const delivery = isDelivery();
  const complement = getValue("complement");
  return {
    name: getValue("customerName"),
    type: getRadio("orderType"),
    delivery,
    street: getValue("street"),
    number: getValue("number"),
    neighborhood: getValue("neighborhood"),
    complement,
    payment: getRadio("payment"),
    notes: getValue("notes"),
  };
}

// Escapa HTML para exibir texto digitado pelo cliente com segurança
const escapeHtml = (text) => text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateForm()) return;
  renderSummary(getOrderData());
  showView("summary");
});

function renderSummary(order) {
  $("#summaryItems").innerHTML = cart.map((item) => {
    const product = getProduct(item.id);
    return `<li><span>${item.quantity}x ${product.name}</span><span>${formatPrice(product.price * item.quantity)}</span></li>`;
  }).join("");
  $("#summaryTotal").textContent = formatPrice(getTotal());

  let html = `<h4>Dados</h4>
    <p><strong>Nome:</strong> ${escapeHtml(order.name)}</p>
    <p><strong>Tipo:</strong> ${order.type}</p>`;

  if (order.delivery) {
    html += `<p><strong>Endereço:</strong> ${escapeHtml(formatAddress(order, ", "))}</p>`;
  }
  html += `<p><strong>Pagamento:</strong> ${order.payment}</p>`;
  if (order.notes) html += `<p><strong>Observação:</strong> ${escapeHtml(order.notes)}</p>`;

  const dataBox = $("#summaryData");
  dataBox.className = "summary-box summary-data";
  dataBox.innerHTML = html;
}

function formatAddress(order, separator) {
  const parts = [`${order.street}, nº ${order.number}`, order.neighborhood];
  if (order.complement) parts.push(order.complement);
  return parts.join(separator);
}

/* ---------- 9. Mensagem e envio pelo WhatsApp ---------- */
function buildWhatsappMessage(order) {
  const lines = [];
  lines.push("🍔 *NOVO PEDIDO*", "");
  lines.push(`*Cliente:* ${order.name}`, "");

  lines.push("*Pedido:*");
  cart.forEach((item) => {
    const product = getProduct(item.id);
    lines.push(`${item.quantity}x ${product.name} — ${formatPrice(product.price * item.quantity)}`);
  });
  lines.push("", `*Total:* ${formatPrice(getTotal())}`, "");

  lines.push(`*Tipo:* ${order.type}`, "");
  if (order.delivery) {
    lines.push("*Endereço:*");
    lines.push(`${order.street}, nº ${order.number}`);
    lines.push(order.neighborhood);
    if (order.complement) lines.push(order.complement);
    lines.push("");
  }

  lines.push(`*Pagamento:* ${order.payment}`, "");
  if (order.notes) lines.push("*Observação:*", order.notes, "");
  lines.push("Obrigado!");

  return lines.join("\n");
}

$("#sendWhatsappBtn").addEventListener("click", () => {
  if (cart.length === 0 || !validateForm()) { showView("form"); return; }

  const message = buildWhatsappMessage(getOrderData());
  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener");
});

/* ---------- Inicialização ---------- */
renderProducts();
updateCart();
protectImages(); // imagens fixas do HTML (hero e sobre)
