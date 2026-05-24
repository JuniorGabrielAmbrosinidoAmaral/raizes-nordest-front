// 1. MOCK DATA
const productsMockDatabase = [
    { id: "p1", name: "Cuscuz Festivo com Carne de Sol", desc: "Flocos de milho no vapor, manteiga de garrafa e carne de sol desfiada.", price: 18.50, fullKitchenOnly: true, seasonalOnly: false },
    { id: "p2", name: "Tapioca de Coalho na Chapa", desc: "Goma de mandioca recheada com queijo coalho crocante tostado na hora.", price: 12.00, fullKitchenOnly: false, seasonalOnly: false },
    { id: "p3", name: "Pamonha Cremosa de Milho Verde", desc: "Pamonha doce artesanal embrulhada na palha. Tradição nordestina.", price: 9.50, fullKitchenOnly: false, seasonalOnly: true },
    { id: "p4", name: "Café Coado no Pano", desc: "Grão regional artesanal torrado e moído, passado individualmente.", price: 4.50, fullKitchenOnly: false, seasonalOnly: false }
];

let applicationCartState = [];

// 2. ELEMENTOS DO DOM
const storeFilter = document.getElementById("storeFilter");
const seasonFilter = document.getElementById("seasonFilter");
const menuViewContainer = document.getElementById("menuView");
const cartListView = document.getElementById("cartListView");
const labelSubtotal = document.getElementById("labelSubtotal");
const labelTotal = document.getElementById("labelTotal");
const checkoutTrigger = document.getElementById("checkoutTrigger");
const paymentLockscreen = document.getElementById("paymentLockscreen");

// 3. RENDERIZAÇÃO DO MENU (REGRAS DE NEGÓCIO)
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

// 4. ATUALIZAÇÃO DA SACOLA
function pushToCart(productId) {
    const selectedProduct = productsMockDatabase.find(p => p.id === productId);
    if (selectedProduct) {
        applicationCartState.push(selectedProduct);
        syncCartView();
    }
}

function pullFromCart(index) {
    applicationCartState.splice(index, 1);
    syncCartView();
}

function syncCartView() {
    if (applicationCartState.length === 0) {
        cartListView.innerHTML = `<p class="cart-empty">Sua sacola está vazia</p>`;
        labelSubtotal.innerText = "R$ 0,00";
        labelTotal.innerText = "R$ 0,00";
        checkoutTrigger.disabled = true;
        return;
    }

    cartListView.innerHTML = "";
    let computedTotal = 0;

    applicationCartState.forEach((product, index) => {
        computedTotal += product.price;
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

    const formattedPriceValue = `R$ ${computedTotal.toFixed(2).replace('.', ',')}`;
    labelSubtotal.innerText = formattedPriceValue;
    labelTotal.innerText = formattedPriceValue;
    checkoutTrigger.disabled = false;
}

// 5. EVENT LISTENERS E DELEGAÇÃO DE EVENTOS
storeFilter.addEventListener("change", applyBusinessRules);
seasonFilter.addEventListener("change", applyBusinessRules);

// Intercepta cliques nos botões dinâmicos do Menu
menuViewContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-add")) {
        const id = e.target.getAttribute("data-id");
        pushToCart(id);
    }
});

// Intercepta cliques nos botões dinâmicos do Carrinho
cartListView.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-remove")) {
        const index = parseInt(e.target.getAttribute("data-index"), 10);
        pullFromCart(index);
    }
});

// Checkout Assíncrono
checkoutTrigger.addEventListener("click", () => {
    if (applicationCartState.length === 0) return;
    paymentLockscreen.style.display = "flex";
    
    setTimeout(() => {
        paymentLockscreen.style.display = "none";
        alert("Sucesso! Pagamento processado e pedido enviado à cozinha.");
        applicationCartState = [];
        syncCartView();
    }, 2800);
});

// 6. CONTROLES DA LGPD
const privacyBanner = document.getElementById("privacyBanner");
const granularDashboard = document.getElementById("granularDashboard");
const trackingAnalytics = document.getElementById("cookieAnalitico");
const trackingMarketing = document.getElementById("cookieMarketing");

document.getElementById("btnManageCookies").addEventListener("click", () => {
    granularDashboard.style.display = granularDashboard.style.display === "grid" ? "none" : "grid";
});

function closePrivacyBanner(gaveFullConsent) {
    trackingAnalytics.checked = gaveFullConsent;
    trackingMarketing.checked = gaveFullConsent;
    console.log(`LGPD: Consentimento total concedido? ${gaveFullConsent}`);
    privacyBanner.style.display = "none";
}

document.getElementById("btnAcceptCookies").addEventListener("click", () => closePrivacyBanner(true));
document.getElementById("btnRejectCookies").addEventListener("click", () => closePrivacyBanner(false));

// INICIALIZAÇÃO
applyBusinessRules();
syncCartView();