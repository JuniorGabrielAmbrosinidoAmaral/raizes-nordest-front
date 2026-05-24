// 1. DADOS MOCKADOS (Mock Data)
const menuMock = [
    { id: "cuscuz", name: "Cuscuz Recheado", price: 18.50, needsFullKitchen: true, isSeasonal: false },
    { id: "tapioca", name: "Tapioca de Coalho", price: 12.00, needsFullKitchen: false, isSeasonal: false },
    { id: "pamonha", name: "Pamonha de Milho", price: 8.00, needsFullKitchen: false, isSeasonal: true },
    { id: "cafe", name: "Café Coado", price: 4.50, needsFullKitchen: false, isSeasonal: false }
];

let cart = [];

// 2. ELEMENTOS DO DOM
const storeSelect = document.getElementById('storeSelect');
const seasonSelect = document.getElementById('seasonSelect');
const menuContainer = document.getElementById('menuContainer');
const cartContainer = document.getElementById('cartContainer');
const cartTotalValue = document.getElementById('cartTotalValue');

// 3. RENDERIZAÇÃO E REGRAS DE NEGÓCIO
function renderMenu() {
    const isReduzida = storeSelect.value === 'caruaru';
    const isJunino = seasonSelect.value === 'junino';
    
    menuContainer.innerHTML = '';

    const filteredMenu = menuMock.filter(item => {
        if (item.needsFullKitchen && isReduzida) return false;
        if (item.isSeasonal && !isJunino) return false;
        return true;
    });

    filteredMenu.forEach(item => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            ${item.isSeasonal ? '<span class="product-tag">Sazonal</span>' : ''}
            <div style="font-weight: bold; margin-top: 10px;">${item.name}</div>
            <div style="font-size: 16px;">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
            <button class="btn btn-primary" onclick="addToCart('${item.id}')">Adicionar</button>
        `;
        menuContainer.appendChild(card);
    });
}

// 4. LÓGICA DO CARRINHO
window.addToCart = function(id) {
    const product = menuMock.find(p => p.id === id);
    cart.push(product);
    renderCart();
};

function renderCart() {
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="cart-empty">Vazia</p>';
        cartTotalValue.innerText = 'R$ 0,00';
        return;
    }

    cartContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price;
        cartContainer.innerHTML += `
            <div class="cart-item">
                <span>${item.name}</span>
                <span>R$ ${item.price.toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    });

    cartTotalValue.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// 5. EVENTOS DO SISTEMA
storeSelect.addEventListener('change', renderMenu);
seasonSelect.addEventListener('change', renderMenu);

document.getElementById('btnCheckout').addEventListener('click', () => {
    if (cart.length === 0) return alert("Adicione itens à sacola primeiro.");
    
    document.getElementById('gatewayOverlay').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('gatewayOverlay').style.display = 'none';
        alert("Pagamento processado! Pedido enviado para a cozinha.");
        cart = [];
        renderCart();
    }, 2500);
});

// 6. CONTROLE DA LGPD
document.getElementById('btnManageCookies').addEventListener('click', () => {
    const prefs = document.getElementById('cookiePrefs');
    prefs.style.display = prefs.style.display === 'none' ? 'block' : 'none';
});

function closeBanner() {
    document.getElementById('cookieBanner').style.display = 'none';
}

document.getElementById('btnAcceptCookies').addEventListener('click', () => {
    console.log("LGPD: Todos os cookies foram aceitos.");
    closeBanner();
});

document.getElementById('btnRejectCookies').addEventListener('click', () => {
    console.log("LGPD: Cookies de marketing e analíticos foram rejeitados.");
    closeBanner();
});

// Inicia a aplicação
renderMenu();