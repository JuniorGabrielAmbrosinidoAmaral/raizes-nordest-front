// 1. DADOS MOCKADOS E ESTADO GLOBAL
const productsMockDatabase = [
    { id: "p1", name: "Cuscuz Festivo com Carne de Sol", desc: "Flocos de milho no vapor, manteiga de garrafa e carne de sol desfiada.", price: 18.50, fullKitchenOnly: true, seasonalOnly: false },
    { id: "p2", name: "Tapioca de Coalho na Chapa", desc: "Goma de mandioca recheada com queijo coalho crocante tostado na hora.", price: 12.00, fullKitchenOnly: false, seasonalOnly: false },
    { id: "p3", name: "Pamonha Cremosa de Milho Verde", desc: "Pamonha doce artesanal embrulhada na palha. Tradição nordestina.", price: 9.50, fullKitchenOnly: false, seasonalOnly: true },
    { id: "p4", name: "Café Coado no Pano", desc: "Grão regional artesanal torrado e moído, passado individualmente.", price: 4.50, fullKitchenOnly: false, seasonalOnly: false }
];

const state = {
    cart: [],
    currentUser: null, // Controla se o usuário está logado
    cartTotal: 0
};

// 2. ELEMENTOS DO DOM
const storeFilter = document.getElementById("storeFilter");
const seasonFilter = document.getElementById("seasonFilter");
const menuViewContainer = document.getElementById("menuView");
const cartListView = document.getElementById("cartListView");
const labelSubtotal = document.getElementById("labelSubtotal");
const labelTotal = document.getElementById("labelTotal");
const pointsPreview = document.getElementById("pointsPreview");
const checkoutTrigger = document.getElementById("checkoutTrigger");
const paymentLockscreen = document.getElementById("paymentLockscreen");

// Elementos de Autenticação
const userArea = document.getElementById("userArea");
const btnLoginClick = document.getElementById("btnLoginClick");
const authModal = document.getElementById("authModal");
const btnCloseAuth = document.getElementById("btnCloseAuth");
const authForm = document.getElementById("authForm");

// 3. RENDERIZAÇÃO DO MENU
function applyBusinessRules() {
    const kitchenType = storeFilter.value;
    const seasonalCalendar = seasonFilter.value;
    menuViewContainer.innerHTML = ""; 

    const currentAvailableProducts = productsMockDatabase.filter(product => {
        if (product.fullKitchenOnly && kitchenType === "reduzida") return false;
        if (product.seasonalOnly && seasonalCalendar !== "junino") return false;
        return true;
    });

    currentAvailableProducts.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";
        card.innerHTML = `
            ${product.seasonalOnly ? '<span class="badge-sazonal">Sazonal</span>' : ''}
            <div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-desc">${product.desc}</p>
            </div>
            <div class="product-footer">
                <span class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</span>
                <button class="btn btn-add" data-id="${product.id}">Adicionar</button>
            </div>
        `;
        menuViewContainer.appendChild(card);
    });
}

// 4. LÓGICA DO CARRINHO E FIDELIDADE
function pushToCart(productId) {
    const product = productsMockDatabase.find(p => p.id === productId);
    if (product) {
        state.cart.push(product);
        syncCartView();
    }
}

function pullFromCart(index) {
    state.cart.splice(index, 1);
    syncCartView();
}

function syncCartView() {
    if (state.cart.length === 0) {
        cartListView.innerHTML = `<p class="cart-empty">Sua sacola está vazia</p>`;
        labelSubtotal.innerText = "R$ 0,00";
        labelTotal.innerText = "R$ 0,00";
        pointsPreview.innerHTML = `Faça pedidos para ganhar pontos.`;
        checkoutTrigger.disabled = true;
        state.cartTotal = 0;
        return;
    }

    cartListView.innerHTML = "";
    state.cartTotal = 0;

    state.cart.forEach((product, index) => {
        state.cartTotal += product.price;
        const itemRow = document.createElement("div");
        itemRow.className = "cart-item";
        itemRow.innerHTML = `
            <div class="cart-item-info">
                <h4>${product.name}</h4>
                <button class="btn-remove" data-index="${index}">Remover</button>
            </div>
            <span class="cart-item-price">R$ ${product.price.toFixed(2).replace('.', ',')}</span>
        `;
        cartListView.appendChild(itemRow);
    });

    const formattedPrice = `R$ ${state.cartTotal.toFixed(2).replace('.', ',')}`;
    labelSubtotal.innerText = formattedPrice;
    labelTotal.innerText = formattedPrice;
    
    // Calcula os pontos (1 Ponto por R$ 1)
    const pointsToEarn = Math.floor(state.cartTotal);
    pointsPreview.innerHTML = `Este pedido vai gerar <strong>+${pointsToEarn} pontos</strong>.`;
    
    checkoutTrigger.disabled = false;
}

// 5. GESTÃO DE USUÁRIO E AUTENTICAÇÃO (LGPD)
function openAuthModal() {
    authModal.style.display = "flex";
}

function closeAuthModal() {
    authModal.style.display = "none";
}

function renderUserBadge() {
    if (state.currentUser) {
        userArea.innerHTML = `
            <div class="user-badge">
                <span class="user-name">Olá, ${state.currentUser.name.split(' ')[0]}</span>
                <span class="user-points">⭐ ${state.currentUser.points} Pontos Acumulados</span>
            </div>
        `;
    }
}

// Submissão do Formulário de Cadastro
authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // O atributo 'required' no checkbox do HTML já garante o consentimento LGPD antes do envio
    const nameInput = document.getElementById("userName").value;
    const emailInput = document.getElementById("userEmail").value;
    const phoneInput = document.getElementById("userPhone").value;

    // Mockando a criação do usuário no "Banco de Dados" com 0 pontos iniciais
    state.currentUser = {
        name: nameInput,
        email: emailInput,
        phone: phoneInput,
        points: 0
    };

    console.log("LGPD Audit: Consentimento salvo para o usuário:", state.currentUser.email);
    
    renderUserBadge();
    closeAuthModal();

    // Se houver itens no carrinho, prossegue para o checkout automaticamente
    if (state.cart.length > 0) {
        processCheckout();
    }
});

// 6. EVENTOS GERAIS
storeFilter.addEventListener("change", applyBusinessRules);
seasonFilter.addEventListener("change", applyBusinessRules);

if(btnLoginClick) btnLoginClick.addEventListener("click", openAuthModal);
btnCloseAuth.addEventListener("click", closeAuthModal);

menuViewContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-add")) {
        pushToCart(e.target.getAttribute("data-id"));
    }
});

cartListView.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-remove")) {
        pullFromCart(parseInt(e.target.getAttribute("data-index"), 10));
    }
});

// Fluxo de Checkout Condicional
checkoutTrigger.addEventListener("click", () => {
    if (!state.currentUser) {
        // Se não estiver logado, obriga o cadastro/login primeiro
        openAuthModal();
        return;
    }
    processCheckout();
});

function processCheckout() {
    paymentLockscreen.style.display = "flex";
    
    setTimeout(() => {
        paymentLockscreen.style.display = "none";
        
        // Efetivação dos Pontos de Fidelidade
        const earnedPoints = Math.floor(state.cartTotal);
        state.currentUser.points += earnedPoints;
        
        renderUserBadge(); // Atualiza os pontos no header
        
        alert(`Sucesso! Pagamento processado.\nVocê ganhou ${earnedPoints} pontos de fidelidade!`);
        
        state.cart = [];
        syncCartView();
    }, 2800);
}

// 7. CONTROLES DA LGPD (BANNER DE COOKIES)
const privacyBanner = document.getElementById("privacyBanner");
document.getElementById("btnAcceptCookies").addEventListener("click", () => privacyBanner.style.display = "none");
document.getElementById("btnRejectCookies").addEventListener("click", () => privacyBanner.style.display = "none");

// INICIALIZAÇÃO
applyBusinessRules();
syncCartView();