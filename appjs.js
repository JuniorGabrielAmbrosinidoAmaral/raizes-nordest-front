/**
 * Raízes do Nordeste - Engenharia Core Front-End
 * Gerenciamento de Estado de Dados Mockados e Regras Omnichannel
 */

(function () {
    'use strict';

    // 1. MOCK DATA - Base Canônica de Dados dos Produtos
    const menuMock = [
        { 
            id: "cz-carne-sol", 
            name: "Cuscuz com Carne de Sol", 
            desc: "Legítimo cuscuz de milho na prensa flocado, umedecido com manteiga de garrafa e generosas lascas de carne de sol sertaneja.", 
            price: 18.50, 
            requiresFullKitchen: true, 
            isSeasonal: false 
        },
        { 
            id: "tp-queijo-coalho", 
            name: "Tapioca de Queijo Coalho", 
            desc: "Goma de mandioca fina recheada com queijo coalho artesanal tostado na chapa de ferro.", 
            price: 12.00, 
            requiresFullKitchen: false, 
            isSeasonal: false 
        },
        { 
            id: "pm-milho-junina", 
            name: "Pamonha Doce de Milho Verde", 
            desc: "Pamonha tradicional da colheita junina, cozida na palha, extremamente cremosa.", 
            price: 9.50, 
            requiresFullKitchen: false, 
            isSeasonal: true 
        },
        { 
            id: "cf-filtro-pano", 
            name: "Café Coado na Caneca", 
            desc: "Grãos regionais selecionados, torra média, passado no coador de pano no momento do pedido.", 
            price: 4.50, 
            requiresFullKitchen: false, 
            isSeasonal: false 
        }
    ];

    // 2. ESTADO GLOBAL DA APLICAÇÃO (Single Source of Truth)
    const state = {
        cart: [],
        currentStore: 'recife-boaviagem',
        currentSeason: 'regular'
    };

    // 3. SELETORES DE INTERFACE
    const storeSelect = document.getElementById('storeSelect');
    const seasonSelect = document.getElementById('seasonSelect');
    const menuContainer = document.getElementById('menuContainer');
    const cartContainer = document.getElementById('cartContainer');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTotal = document.getElementById('cartTotal');
    const btnCheckout = document.getElementById('btnCheckout');
    const gatewayOverlay = document.getElementById('gatewayOverlay');
    const cookieBanner = document.getElementById('cookieBanner');
    const cookiePrefs = document.getElementById('cookiePrefs');

    // 4. MOTOR DE FILTRAGEM E RENDERIZAÇÃO REATIVO
    function dispatchRenderMenu() {
        state.currentStore = storeSelect.value;
        state.currentSeason = seasonSelect.value;

        menuContainer.innerHTML = '';

        // Processamento das Regras de Negócio do Ecossistema
        const runtimeMenu = menuMock.filter(item => {
            // Regra 1: Restrição de Infraestrutura Física da Unidade (Cozinha Completa vs Reduzida)
            if (item.requiresFullKitchen && state.currentStore === 'caruaru-shopping') {
                return false;
            }
            // Regra 2: Restrição Cronológica/Sazonal (Janela Junina)
            if (item.isSeasonal && state.currentSeason !== 'junino') {
                return false;
            }
            return true;
        });

        // Mutação Controlada da View
        if (runtimeMenu.length === 0) {
            menuContainer.innerHTML = '<p class="cart-empty">Nenhum produto compatível com a operação desta cozinha.</p>';
            return;
        }

        runtimeMenu.forEach(item => {
            const card = document.createElement('article');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="card-header">
                    <span class="product-tag ${item.isSeasonal ? 'tag-sazonal' : 'tag-comum'}">
                        ${item.isSeasonal ? 'Sazonal' : 'Tradicional'}
                    </span>
                    <h3 class="product-name">${item.name}</h3>
                    <p class="product-desc">${item.desc}</p>
                </div>
                <div class="product-footer">
                    <span class="product-price">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                    <button class="btn btn-add" data-id="${item.id}">Adicionar</button>
                </div>
            `;
            menuContainer.appendChild(card);
        });
    }

    // 5. ENGENHARIA DA SACOLA DE COMPRAS
    function updateCartUI() {
        cartContainer.innerHTML = '';
        
        if (state.cart.length === 0) {
            cartContainer.innerHTML = '<p class="cart-empty">Sua sacola está vazia</p>';
            cartSubtotal.innerText = 'R$ 0,00';
            cartTotal.innerText = 'R$ 0,00';
            btnCheckout.disabled = true;
            return;
        }

        let totalAccumulator = 0;

        state.cart.forEach((item, index) => {
            totalAccumulator += item.price;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div>
                    <p class="cart-item-name">${item.name}</p>
                    <button class="btn-remove" data-index="${index}">Remover</button>
                </div>
                <span class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
            `;
            cartContainer.appendChild(itemElement);
        });

        const formattedTotal = `R$ ${totalAccumulator.toFixed(2).replace('.', ',')}`;
        cartSubtotal.innerText = formattedTotal;
        cartTotal.innerText = formattedTotal;
        btnCheckout.disabled = false;
    }

    // 6. EVENT DELEGATION (Otimização de Performance de Eventos)
    menuContainer.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('btn-add')) {
            const productId = e.target.getAttribute('data-id');
            const targetProduct = menuMock.find(p => p.id === productId);
            if (targetProduct) {
                state.cart.push(targetProduct);
                updateCartUI();
            }
        }
    });

    cartContainer.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('btn-remove')) {
            const index = parseInt(e.target.getAttribute('data-index'), 10);
            state.cart.splice(index, 1);
            updateCartUI();
        }
    });

    // 7. FLUXO ASSÍNCRONO: CHECKOUT DESACOPLADO TIPO TOTEM
    btnCheckout.addEventListener('click', function() {
        if (state.cart.length === 0) return;

        gatewayOverlay.style.display = 'flex';
        gatewayOverlay.setAttribute('aria-hidden', 'false');
        // Gatilho para animação de fade-in estável
        setTimeout(() => gatewayOverlay.classList.add('active'), 10);

        // Simulação controlada de Timeout (Handshake assíncrono com API do Gateway)
        setTimeout(() => {
            gatewayOverlay.classList.remove('active');
            setTimeout(() => {
                gatewayOverlay.style.display = 'none';
                gatewayOverlay.setAttribute('aria-hidden', 'true');
                alert("Pagamento Validado com Sucesso via Terminal Externo!\nPedido enviado diretamente para o Painel da Cozinha (KDS).");
                state.cart = [];
                updateCartUI();
            }, 300);
        }, 3500);
    });

    // 8. INTERFACES DE PRIVACIDADE (Sustentabilidade Digital LGPD)
    document.getElementById('btnManageCookies').addEventListener('click', function() {
        const isHidden = cookiePrefs.getAttribute('aria-hidden') === 'true';
        cookiePrefs.style.display = isHidden ? 'grid' : 'none';
        cookiePrefs.setAttribute('aria-hidden', isHidden ? 'false' : 'true');
    });

    function terminateCookieBanner() {
        cookieBanner.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        cookieBanner.style.opacity = '0';
        cookieBanner.style.transform = 'translate(-50%, 20px)';
        setTimeout(() => cookieBanner.style.display = 'none', 300);
    }

    document.getElementById('btnAcceptCookies').addEventListener('click', function() {
        document.getElementById('chkAnalytics').checked = true;
        document.getElementById('chkMarketing').checked = true;
        console.log("LGPD Auditing: Consentimento explícito concedido para todas as finalidades.");
        terminateCookieBanner();
    });

    document.getElementById('btnRejectCookies').addEventListener('click', function() {
        document.getElementById('chkAnalytics').checked = false;
        document.getElementById('chkMarketing').checked = false;
        console.log("LGPD Auditing: Consentimento limitado estritamente aos cookies de infraestrutura necessários.");
        terminateCookieBanner();
    });

    // 9. ESCUTAS DE CONTROLE DE SIMULAÇÃO
    storeSelect.addEventListener('change', dispatchRenderMenu);
    seasonSelect.addEventListener('change', dispatchRenderMenu);

    // Bootstrap Inicial da SPA
    dispatchRenderMenu();
    updateCartUI();

})();