/*
// Configuration des APIs pour Spring Boot
const API_CONFIG = {
    baseUrl: 'http://localhost:8082/api',
    endpoints: {
        users: '/users',
        products: '/products',
        orders: '/commandes',
        auth: '/auth'
    }
};

// Gestionnaire d'APIs
class ApiService {
    constructor() {
        // Récupère le token d'authentification du sessionStorage
        this.token = sessionStorage.getItem('authToken');
    }

    async request(endpoint, options = {}) {
        const encodedEndpoint = endpoint.replace(/ /g, '%20');
        const url = `${API_CONFIG.baseUrl}${encodedEndpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            },
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const responseText = await response.text();

            // Gestion des réponses non-JSON
            let responseData;
            try {
                responseData = responseText ? JSON.parse(responseText) : null;
            } catch (e) {
                // Si le parsing JSON échoue, traiter comme texte brut
                if (!response.ok) {
                    throw new Error(responseText || `API Error: ${response.status} ${response.statusText}`);
                }
                return responseText;
            }

            if (!response.ok) {
                throw new Error(responseData?.message || `API Error: ${response.status} ${response.statusText}`);
            }

            return responseData;
        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    }

    // Méthodes utilisateur
    async createUser(userData) {
        return await this.request(`${API_CONFIG.endpoints.users}/creerutilisateur`, {
            method: 'POST',
            body: userData
        });
    }

    async updateUser(id, userData) {
        return await this.request(`${API_CONFIG.endpoints.users}/modifierutilisateur/${id}`, {
            method: 'PUT',
            body: userData
        });
    }

    async getUser(id) {
        return await this.request(`${API_CONFIG.endpoints.users}/recupereutilisateur/${id}`);
    }

    async getAllUsers() {
        return await this.request(`${API_CONFIG.endpoints.users}/recupere tous les utilisateur`);
    }

    async deleteUser(id) {
        return await this.request(`${API_CONFIG.endpoints.users}/supprimerutilisateur/${id}`, {
            method: 'DELETE'
        });
    }

    // Méthodes produit
    async createProduct(productData) {
        return await this.request(`${API_CONFIG.endpoints.products}/creerproduit`, {
            method: 'POST',
            body: productData
        });
    }

    async updateProduct(id, productData) {
        return await this.request(`${API_CONFIG.endpoints.products}/mettre à jour un produit/${id}`, {
            method: 'PUT',
            body: productData
        });
    }

    async getProduct(id) {
        return await this.request(`${API_CONFIG.endpoints.products}/obtenirunproduitparsonid/${id}`);
    }

    async getAllProducts() {
        return await this.request(`${API_CONFIG.endpoints.products}/listertoutlesproduit`);
    }

    async deleteProduct(id) {
        return await this.request(`${API_CONFIG.endpoints.products}/supprimerunproduit/${id}`, {
            method: 'DELETE'
        });
    }

    // Méthodes commande
    async createOrder(orderData) {
        return await this.request(`${API_CONFIG.endpoints.orders}`, {
            method: 'POST',
            body: orderData
        });
    }

    async getAllOrders() {
        return await this.request(`${API_CONFIG.endpoints.orders}`);
    }

    async getOrder(reference) {
        return await this.request(`${API_CONFIG.endpoints.orders}/${reference}`);
    }

    async deleteOrder(reference) {
        return await this.request(`${API_CONFIG.endpoints.orders}/${reference}`, {
            method: 'DELETE'
        });
    }

    // Authentification
    async login(credentials) {
        return await this.request(`${API_CONFIG.endpoints.auth}/login`, {
            method: 'POST',
            body: credentials
        });
    }

    setToken(token) {
        this.token = token;
        if (token) {
            sessionStorage.setItem('authToken', token);
        } else {
            sessionStorage.removeItem('authToken');
        }
    }
}

// Contrôleur principal de l'application
class AppController {
    constructor() {
        this.apiService = new ApiService();
        this.currentUser = null;
        this.cart = [];
        this.products = [];
        this.isAdminMode = false;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupDarkMode();
        this.setupNotificationSystem();
        await this.loadInitialData();
    }

    setupNotificationSystem() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '1000';
        document.body.appendChild(container);
    }

    showNotification(message, type = 'success') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        container.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    setupDarkMode() {
        if (!(!window.matchMedia || !window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        }
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            if (event.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        });
    }

    async loadInitialData() {
        try {
            await this.loadProducts();
            await this.loadCart();
            this.checkUserSession();
        } catch (error) {
            console.error('Erreur lors du chargement initial:', error);
        }
    }

    async loadProducts() {
        try {
            this.showLoading('featuredProductsLoading');
            this.showLoading('allProductsLoading');

            this.products = await this.apiService.getAllProducts();

            this.renderFeaturedProducts();
            this.renderAllProducts();

            this.hideLoading('featuredProductsLoading');
            this.hideLoading('allProductsLoading');
        } catch (error) {
            this.hideLoading('featuredProductsLoading');
            this.hideLoading('allProductsLoading');
            this.showNotification('Erreur lors du chargement des produits', 'error');
        }
    }

    async loadCart() {
        try {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            this.cart = cart;
            this.updateCartCount();
        } catch (error) {
            console.error('Erreur lors du chargement du panier:', error);
            this.cart = [];
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    checkUserSession() {
        const token = sessionStorage.getItem('authToken');
        const userData = sessionStorage.getItem('currentUser');

        if (token && userData) {
            this.currentUser = JSON.parse(userData);
            this.apiService.setToken(token);

            if (this.currentUser.role === 'admin') {
                document.getElementById('adminToggle').style.display = 'block';

                // Redirection automatique vers le dashboard pour les admins
                this.enterAdminMode();
            }
        }
    }

    // Active le mode administrateur et redirige vers le dashboard
    enterAdminMode() {
        this.isAdminMode = true;
        showPage('ADMIN');
        showAdminSection('dashboard');
        document.getElementById('adminSidebar').classList.add('active');
        document.getElementById('adminContent').classList.add('shifted');
    }

    setupEventListeners() {
        // Filtres
        document.getElementById('categoryFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('priceFilter')?.addEventListener('input', (e) => {
            document.getElementById('priceValue').textContent = e.target.value + 'FCFA';
            this.applyFilters();
        });
        document.getElementById('sizeFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('searchFilter')?.addEventListener('input', () => this.applyFilters());

        // Formulaires
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('contactForm')?.addEventListener('submit', (e) => this.handleContact(e));
        document.getElementById('addProductForm')?.addEventListener('submit', (e) => this.handleAddProduct(e));
    }

    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) element.style.display = 'block';
    }

    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) element.style.display = 'none';
    }

    showError(message, containerId = null) {
        if (containerId) {
            const container = document.getElementById(containerId);
            if (container) {
                container.textContent = message;
                container.style.display = 'block';
            }
        } else {
            this.showNotification(message, 'error');
        }
    }

    hideError(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.style.display = 'none';
        }
    }

    renderFeaturedProducts() {
        const featuredProducts = this.products.filter(p => p.featured);
        const container = document.getElementById('featuredProducts');
        if (container) {
            container.innerHTML = featuredProducts.map(product => this.createProductCard(product)).join('');
        }
    }

    renderAllProducts() {
        const container = document.getElementById('allProducts');
        if (container) {
            container.innerHTML = this.products.map(product => this.createProductCard(product)).join('');
        }
    }

    createProductCard(product) {
        return `
            <div class="product-card" onclick="showProductModal(${product.id})">
                <div class="product-image">
                    ${product.imageUrl ?
            `<img src="${product.imageUrl}" alt="${product.name}">` :
            `<i class="fas fa-shoe-prints"></i>`
        }
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
                    <p class="product-price">${product.price.toFixed(2)}FCFA</p>
                    <div class="product-actions">
                        <button class="btn btn-small" onclick="event.stopPropagation(); addToCart(${product.id})">
                            <i class="fas fa-cart-plus"></i> Ajouter
                        </button>
                        <button class="btn btn-secondary btn-small" onclick="event.stopPropagation(); showProductModal(${product.id})">
                            Détails
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    applyFilters() {
        const category = document.getElementById('categoryFilter')?.value || '';
        const maxPrice = parseFloat(document.getElementById('priceFilter')?.value || 100000);
        const size = document.getElementById('sizeFilter')?.value || '';
        const search = document.getElementById('searchFilter')?.value.toLowerCase() || '';

        const filtered = this.products.filter(product => {
            const matchCategory = !category || product.category === category;
            const matchPrice = product.price <= maxPrice;
            const matchSize = !size || (product.size && product.size.includes(size));
            const matchSearch = !search || product.name.toLowerCase().includes(search);

            return matchCategory && matchPrice && matchSize && matchSearch;
        });

        const container = document.getElementById('allProducts');
        if (container) {
            container.innerHTML = filtered.map(product => this.createProductCard(product)).join('');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const btn = document.getElementById('loginBtn');
        const originalText = btn.textContent;

        try {
            btn.textContent = 'Connexion...';
            btn.disabled = true;
            this.hideError('loginError');

            const credentials = {
                email: document.getElementById('loginEmail').value,
                password: document.getElementById('loginPassword').value
            };

            const response = await this.apiService.login(credentials);

            // Gestion des réponses texte ou JSON
            if (typeof response === 'string') {
                if (response.includes('Connexion réussie')) {
                    // Récupérer l'utilisateur via une autre API si nécessaire
                    this.showNotification('Connexion réussie !');
                    showPage('home');
                    return;
                }
                throw new Error(response);
            }

            if (response.success) {
                this.currentUser = response.user;
                this.apiService.setToken(response.token);
                sessionStorage.setItem('currentUser', JSON.stringify(response.user));

                if (response.user.role === 'admin') {
                    document.getElementById('adminToggle').style.display = 'block';

                    // Redirection automatique vers le dashboard pour les admins
                    this.enterAdminMode();
                } else {
                    // Redirection vers le catalogue pour les utilisateurs normaux
                    showPage('home');
                    this.renderAllProducts();
                }

                this.showNotification('Connexion réussie !');
            } else {
                throw new Error(response.message || 'Échec de la connexion');
            }
        } catch (error) {
            this.showError(error.message, 'loginError');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const btn = document.getElementById('registerBtn');
        const originalText = btn.textContent;

        try {
            btn.textContent = 'Inscription...';
            btn.disabled = true;
            this.hideError('registerError');

            const userData = {
                firstName: document.getElementById('registerFirstName').value,
                lastName: document.getElementById('registerLastName').value,
                email: document.getElementById('registerEmail').value,
                address: document.getElementById('registerAddress').value,
                phone: document.getElementById('registerPhone').value,
                password: document.getElementById('registerPassword').value
            };

            const response = await this.apiService.createUser(userData);

            // Gestion des réponses texte ou JSON
            if (typeof response === 'string') {
                if (response.includes('Inscription réussie')) {
                    this.showNotification('Inscription réussie !');
                    showPage('home');
                    return;
                }
                throw new Error(response);
            }

            if (response.success) {
                this.currentUser = response.user;
                this.apiService.setToken(response.token);
                sessionStorage.setItem('currentUser', JSON.stringify(response.user));

                this.showNotification('Inscription réussie !');
                showPage('home');
            } else {
                throw new Error(response.message || 'Échec de l\'inscription');
            }
        } catch (error) {
            this.showError(error.message, 'registerError');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

    async handleContact(e) {
        e.preventDefault();
        const btn = document.getElementById('contactBtn');
        const originalText = btn.textContent;

        try {
            btn.textContent = 'Envoi...';
            btn.disabled = true;
            this.hideError('contactError');

            const contactData = {
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                subject: document.getElementById('contactSubject').value,
                message: document.getElementById('contactMessage').value
            };

            // Envoyer le message de contact
            // await this.apiService.sendContact(contactData);

            document.getElementById('contactSuccess').style.display = 'block';
            e.target.reset();

            setTimeout(() => {
                document.getElementById('contactSuccess').style.display = 'none';
            }, 5000);
        } catch (error) {
            this.showError(error.message, 'contactError');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

    async handleAddProduct(e) {
        e.preventDefault();
        const btn = document.getElementById('addProductBtn');
        const originalText = btn.textContent;

        try {
            btn.textContent = 'Ajout...';
            btn.disabled = true;
            this.hideError('addProductError');

            const newProduct = {
                name: document.getElementById('productName').value,
                description: document.getElementById('productDescription').value,
                price: parseFloat(document.getElementById('productPrice').value),
                category: document.getElementById('productCategory').value,
                brand: document.getElementById('productBrand').value,
                color: document.getElementById('productColor').value,
                size: document.getElementById('productSizes').value,
                stock: parseInt(document.getElementById('productStock').value),
                imageUrl: document.getElementById('productImageUrl').value || 'https://via.placeholder.com/300'
            };

            await this.apiService.createProduct(newProduct);

            this.showNotification('Produit ajouté avec succès !');
            closeModal('addProductModal');
            await this.loadProducts();
            e.target.reset();
        } catch (error) {
            this.showError(error.message, 'addProductError');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

    async renderCart() {
        const container = document.getElementById('cartItems');
        const totalElement = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');

        try {
            this.showLoading('cartLoading');

            if (this.cart.length === 0) {
                container.innerHTML = '<p style="text-align: center; padding: 2rem;">Votre panier est vide</p>';
                totalElement.textContent = 'Total: 0FCFA';
                checkoutBtn.disabled = true;
                this.hideLoading('cartLoading');
                return;
            }

            let total = 0;
            container.innerHTML = this.cart.map(item => {
                const product = this.products.find(p => p.id === item.productId);
                if (!product) return '';

                const itemTotal = product.price * item.quantity;
                total += itemTotal;

                return `
                    <div class="cart-item">
                        <div class="cart-item-image">
                            ${product.imageUrl ?
                    `<img src="${product.imageUrl}" alt="${product.name}">` :
                    `<i class="fas fa-shoe-prints"></i>`
                }
                        </div>
                        <div class="cart-item-info">
                            <div class="cart-item-title">${product.name}</div>
                            <div class="cart-item-price">${product.price.toFixed(2)}FCFA</div>
                            <div>Taille: ${item.size}</div>
                        </div>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="updateCartQuantity(${item.productId}, '${item.size}', ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateCartQuantity(${item.productId}, '${item.size}', ${item.quantity + 1})">+</button>
                        </div>
                        <button class="btn btn-small" onclick="removeFromCart(${item.productId}, '${item.size}')">Supprimer</button>
                    </div>
                `;
            }).join('');

            totalElement.textContent = `Total: ${total.toFixed(2)}FCFA`;
            checkoutBtn.disabled = false;

        } catch (error) {
            container.innerHTML = '<div class="error">Erreur lors du chargement du panier</div>';
        } finally {
            this.hideLoading('cartLoading');
        }
    }

    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = totalItems;
        }
        this.saveCart();
    }

    async renderAdminStats() {
        try {
            this.showLoading('dashboardLoading');

            // Récupérer les statistiques
            const stats = {
                totalProducts: this.products.length,
                totalOrders: 0, // À implémenter
                totalUsers: 0,  // À implémenter
                totalRevenue: 0 // À implémenter
            };

            document.getElementById('totalProducts').textContent = stats.totalProducts;
            document.getElementById('totalOrders').textContent = stats.totalOrders;
            document.getElementById('totalUsers').textContent = stats.totalUsers;
            document.getElementById('totalRevenue').textContent = stats.totalRevenue.toFixed(2) + 'FCFA';

            this.hideLoading('dashboardLoading');
        } catch (error) {
            this.hideLoading('dashboardLoading');
            console.error('Erreur lors du chargement des statistiques:', error);
        }
    }

    async renderAdminProducts() {
        try {
            this.showLoading('adminProductsLoading');
            const products = this.products;

            const tableBody = document.querySelector('#productsTable tbody');
            if (tableBody) {
                tableBody.innerHTML = products.map(product => `
                    <tr>
                        <td>${product.id}</td>
                        <td>${product.name}</td>
                        <td>${product.category}</td>
                        <td>${product.brand}</td>
                        <td>${product.price.toFixed(2)}FCFA</td>
                        <td>${product.stock}</td>
                        <td>
                            <button class="action-btn edit" onclick="editProduct(${product.id})">Modifier</button>
                            <button class="action-btn delete" onclick="deleteProduct(${product.id})">Supprimer</button>
                        </td>
                    </tr>
                `).join('');
            }

            this.hideLoading('adminProductsLoading');
        } catch (error) {
            this.hideLoading('adminProductsLoading');
            console.error('Erreur lors du chargement des produits:', error);
        }
    }
}

// Variables globales
let app;

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    app = new AppController();
});

// Fonctions globales pour l'interface
function showPage(pageId) {
    // Vérifie si l'utilisateur est admin et tente d'accéder à la page d'accueil
    if (app.currentUser && app.currentUser.role === 'admin' && pageId === 'home') {
        // Redirige automatiquement vers le dashboard
        app.enterAdminMode();
        return;
    }

    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    const pageElement = document.getElementById(pageId);
    if (pageElement) {
        pageElement.classList.add('active');
    }

    if (pageId === 'cart') {
        app.renderCart();
    } else if (pageId === 'home') {
        app.loadProducts();
    }
}

async function showProductModal(productId) {
    const product = app.products.find(p => p.id === productId);

    if (!product) return;

    const modal = document.getElementById('productModal');
    const content = document.getElementById('productModalContent');

    if (content) {
        content.innerHTML = `
            <div style="text-align: center;">
                <div class="product-image" style="margin-bottom: 1rem; height: 200px;">
                    ${product.imageUrl ?
            `<img src="${product.imageUrl}" alt="${product.name}" style="max-width: 100%; max-height: 100%;">` :
            `<i class="fas fa-shoe-prints"></i>`
        }
                </div>
                <h3>${product.name}</h3>
                <p style="color: var(--primary-dark); margin: 1">${product.description}</p>
                <p style="font-size: 1.5rem; color: var(--primary-dark); font-weight: 700; margin: 1rem 0;">${product.price.toFixed(2)}FCFA</p>
                <div style="margin: 1rem 0;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Taille :</label>
                    <select id="selectedSize" style="padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                        ${product.size.split(',').map(size =>
            `<option value="${size.trim()}">${size.trim()}</option>`
        ).join('')}
                    </select>
                </div>
                <button class="btn" onclick="addToCartWithSize(${product.id})" style="width: 100%;">
                    Ajouter au Panier
                </button>
            </div>
        `;
    }

    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

async function addToCart(productId) {
    const product = app.products.find(p => p.id === productId);

    if (!product || !product.size) return;

    try {
        const defaultSize = product.size.split(',')[0].trim();
        app.cart.push({
            productId: productId,
            size: defaultSize,
            quantity: 1
        });

        app.updateCartCount();
        app.showNotification('Produit ajouté au panier !');
    } catch (error) {
        app.showNotification('Erreur lors de l\'ajout au panier', 'error');
    }
}

async function addToCartWithSize(productId) {
    const selectedSize = document.getElementById('selectedSize')?.value || '';

    try {
        app.cart.push({
            productId: productId,
            size: selectedSize,
            quantity: 1
        });

        app.updateCartCount();
        closeModal('productModal');
        app.showNotification('Produit ajouté au panier !');
    } catch (error) {
        app.showNotification('Erreur lors de l\'ajout au panier', 'error');
    }
}

function updateCartQuantity(productId, size, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId, size);
        return;
    }

    const item = app.cart.find(item =>
        item.productId === productId && item.size === size
    );

    if (item) {
        item.quantity = newQuantity;
        app.updateCartCount();
        app.renderCart();
    }
}

function removeFromCart(productId, size) {
    app.cart = app.cart.filter(item =>
        !(item.productId === productId && item.size === size)
    );
    app.updateCartCount();
    app.renderCart();
    app.showNotification('Produit retiré du panier');
}

async function proceedToCheckout() {
    if (!app.currentUser) {
        app.showNotification('Veuillez vous connecter pour finaliser votre commande', 'error');
        showPage('login');
        return;
    }

    if (app.cart.length === 0) {
        app.showNotification('Votre panier est vide', 'error');
        return;
    }

    try {
        const checkoutBtn = document.getElementById('checkoutBtn');
        checkoutBtn.textContent = 'Traitement...';
        checkoutBtn.disabled = true;

        let total = 0;
        const items = app.cart.map(item => {
            const product = app.products.find(p => p.id === item.productId);
            if (product) {
                const itemTotal = product.price * item.quantity;
                total += itemTotal;
                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: product.price
                };
            }
            return null;
        }).filter(item => item !== null);

        const orderData = {
            reference: `CMD-${Date.now()}`,
            orderDate: new Date().toISOString().split('T')[0],
            status: "En attente",
            totalAmount: total,
            customerId: app.currentUser.id,
            items: items
        };

        const order = await app.apiService.createOrder(orderData);

        // Vider le panier après commande
        app.cart = [];
        app.updateCartCount();

        app.showNotification(`Commande #${order.reference} créée avec succès ! Total: ${total.toFixed(2)}FCFA`);
        showPage('home');
    } catch (error) {
        app.showNotification('Erreur lors de la création de la commande: ' + error.message, 'error');
    } finally {
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.textContent = 'Procéder au Paiement';
            checkoutBtn.disabled = false;
        }
    }
}

function toggleAdmin() {
    if (!app.currentUser || app.currentUser.role !== 'admin') {
        app.showNotification('Accès non autorisé', 'error');
        return;
    }

    app.isAdminMode = !app.isAdminMode;

    if (app.isAdminMode) {
        // Utilise la méthode centralisée pour activer le mode admin
        app.enterAdminMode();
    } else {
        showPage('home');
        document.getElementById('adminSidebar').classList.remove('active');
        document.getElementById('adminContent').classList.remove('shifted');
    }
}

function showAdminSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.add('hidden');
    });

    const sectionElement = document.getElementById('ADMIN' + sectionId.charAt(0).toUpperCase() + sectionId.slice());
    if (sectionElement) {
        sectionElement.classList.remove('hidden');
    }

    document.querySelectorAll('.admin-sidebar a').forEach(link => {
        link.classList.remove('active');
    });

    if (event && event.target) {
        event.target.classList.add('active');
    }

    switch(sectionId) {
        case 'dashboard':
            app.renderAdminStats();
            break;
        case 'products':
            app.renderAdminProducts();
            break;
        case 'orders':
            // À implémenter
            break;
        case 'users':
            // À implémenter
            break;
    }
}

function showAddProductModal() {
    document.getElementById('addProductModal').classList.add('active');
}

async function editProduct(productId) {
    const product = app.products.find(p => p.id === productId);
    if (!product) return;

    // Pré-remplir le formulaire
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productBrand').value = product.brand;
    document.getElementById('productColor').value = product.color;
    document.getElementById('productSizes').value = product.size;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productImageUrl').value = product.imageUrl || '';

    showAddProductModal();
}

async function deleteProduct(productId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        try {
            await app.apiService.deleteProduct(productId);
            app.showNotification('Produit supprimé avec succès !');
            await app.loadProducts();
            await app.renderAdminProducts();
        } catch (error) {
            app.showNotification('Erreur lors de la suppression du produit: ' + error.message, 'error');
        }
    }
}

// Fermeture des modales en cliquant à l'extérieur
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Ajout de styles pour les notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        padding: 15px 20px;
        margin-bottom: 10px;
        border-radius: 5px;
        color: white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        opacity: 0;
        transform: translateX(100%);
        animation: slideIn 0.5s forwards, fadeOut 0.5s forwards 4.5s;
    }

    @keyframes slideIn {
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes fadeOut {
        to { opacity: 0; }
    }

    .notification.success { background-color: #4CAF50; }
    .notification.error { background-color: #f44336; }
    .notification.info { background-color: #2196F3; }
`;
document.head.appendChild(notificationStyles);



// Dark mode support
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
});

// Navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

// Featured Images Generation with Real Online Images
let featuredImagesGenerated = false;

function generateFeaturedImages() {
    if (featuredImagesGenerated) {
        document.getElementById('featuredGallery').style.display = 'grid';
        return;
    }

    const galleryLoading = document.getElementById('galleryLoading');
    const featuredGallery = document.getElementById('featuredGallery');

    galleryLoading.style.display = 'block';
    featuredGallery.style.display = 'none';

    // Real product images from online sources
    const products = [
        {
            title: "Babouches Traditionnelles",
            description: "Artisanat traditionnel marocain",
            imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center"
        },
        {
            title: "Sneakers Modernes",
            description: "Design contemporain et confort",
            imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center"
        },
        {
            title: "Babouches Colorées",
            description: "Couleurs vives et motifs authentiques",
            imageUrl: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=400&h=400&fit=crop&crop=center"
        },
        {
            title: "Talons Élégants",
            description: "Élégance et sophistication",
            imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop&crop=center"
        },
        {
            title: "Babouches Royales",
            description: "Luxe et tradition",
            imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop&crop=center"
        },
        {
            title: "Sneakers Casual",
            description: "Style décontracté moderne",
            imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=400&fit=crop&crop=center"
        },
        {
            title: "Babouches de Mariage",
            description: "Cérémonie et raffinement",
            imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center"
        },
        {
            title: "Chaussures Oxford",
            description: "Classique et professionnel",
            imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center"
        },
        {
            title: "Babouches Artisanales",
            description: "Fait main avec passion",
            imageUrl: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=400&h=400&fit=crop&crop=center"
        },
        {
            title: "Boots Tendance",
            description: "Tendance urbaine",
            imageUrl: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400&h=400&fit=crop&crop=center"
        },
        {
            title: "Sandales Premium",
            description: "Confort et style été",
            imageUrl: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&h=400&fit=crop&crop=center"
        },
        {
            title: "Mocassins Luxe",
            description: "Élégance décontractée",
            imageUrl: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=400&h=400&fit=crop&crop=center"
        }
    ];

    // Create gallery items with animated delay
    products.forEach((product, index) => {
        setTimeout(() => {
            createGalleryItem(product.imageUrl, product.title, product.description, index);

            if (index === products.length - 1) {
                galleryLoading.style.display = 'none';
                featuredGallery.style.display = 'grid';
                featuredImagesGenerated = true;
            }
        }, index * 200);
    });
}



function createGalleryItem(imageUrl, title, description, index) {
    const featuredGallery = document.getElementById('featuredGallery');

    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.style.animationDelay = `${index * 0.1}s`;

    galleryItem.innerHTML = `
        <img src="${imageUrl}" alt="${title}" loading="lazy">
        <div class="gallery-overlay">
            <h3>${title}</h3>
            <p>${description}</p>
        </div>
    `;

    featuredGallery.appendChild(galleryItem);
}

// Auto-generate images on page load
document.addEventListener('DOMContentLoaded', function() {
    // Generate images automatically when page loads
    setTimeout(() => {
        generateFeaturedImages();
    }, 1000);
});

// Modal functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Admin functions
function toggleAdmin() {
    showPage('admin');
}

function showAdminSection(sectionId) {
    // Hide all admin sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Show selected section
    const targetSection = document.getElementById(`admin${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    // Update sidebar active state
    document.querySelectorAll('.admin-sidebar a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Placeholder functions for existing functionality
function showAddProductModal() {
    document.getElementById('addProductModal').classList.add('active');
}

function proceedToCheckout() {
    console.log('Proceeding to checkout...');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('GABEL LA RÉFÉRENCE - Application initialized');

    // Set up event listeners
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Login form submitted');
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Register form submitted');
        });
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Contact form submitted');
        });
    }

    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Add product form submitted');
        });
    }
});


*/

// nouvelle section pour la gestion des utilisateur

// Configuration des APIs pour Spring Boot
const API_CONFIG = {
    baseUrl: 'http://localhost:8082/api',
    endpoints: {
        users: '/users',
        products: '/products',
        orders: '/commandes',
        auth: '/auth'
    }
};

// Gestionnaire d'APIs
class ApiService {
    constructor() {
        this.token = sessionStorage.getItem('authToken');
    }

    async request(endpoint, options = {}) {
        const encodedEndpoint = endpoint.replace(/ /g, '%20');
        const url = `${API_CONFIG.baseUrl}${encodedEndpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            },
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const responseText = await response.text();

            let responseData;
            try {
                responseData = responseText ? JSON.parse(responseText) : null;
            } catch (e) {
                if (!response.ok) {
                    throw new Error(responseText || `API Error: ${response.status} ${response.statusText}`);
                }
                return responseText;
            }

            if (!response.ok) {
                throw new Error(responseData?.message || `API Error: ${response.status} ${response.statusText}`);
            }

            return responseData;
        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    }

    // Méthodes utilisateur
    async createUser(userData) {
        return await this.request(`${API_CONFIG.endpoints.users}/creerutilisateur`, {
            method: 'POST',
            body: userData
        });
    }

    async login(credentials) {
        return await this.request(`${API_CONFIG.endpoints.auth}/login`, {
            method: 'POST',
            body: credentials
        });
    }

    setToken(token) {
        this.token = token;
        if (token) {
            sessionStorage.setItem('authToken', token);
        } else {
            sessionStorage.removeItem('authToken');
        }
    }

    // Méthodes produit
    async getAllProducts() {
        return await this.request(`${API_CONFIG.endpoints.products}/listertoutlesproduit`);
    }

    // Méthodes commande
    async createOrder(orderData) {
        return await this.request(`${API_CONFIG.endpoints.orders}`, {
            method: 'POST',
            body: orderData
        });
    }
}

// Contrôleur principal de l'application
class AppController {
    constructor() {
        this.apiService = new ApiService();
        this.currentUser = null;
        this.cart = [];
        this.products = [];
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupDarkMode();
        this.setupNotificationSystem();
        await this.loadInitialData();
    }

    setupNotificationSystem() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '1000';
        document.body.appendChild(container);
    }

    showNotification(message, type = 'success') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        container.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    setupDarkMode() {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        }
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            if (event.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        });
    }

    async loadInitialData() {
        try {
            await this.loadProducts();
            await this.loadCart();
            this.checkUserSession();
        } catch (error) {
            console.error('Erreur lors du chargement initial:', error);
        }
    }

    async loadProducts() {
        try {
            this.showLoading('featuredProductsLoading');
            this.showLoading('allProductsLoading');

            this.products = await this.apiService.getAllProducts();

            this.renderFeaturedProducts();
            this.renderAllProducts();

            this.hideLoading('featuredProductsLoading');
            this.hideLoading('allProductsLoading');
        } catch (error) {
            this.hideLoading('featuredProductsLoading');
            this.hideLoading('allProductsLoading');
            this.showNotification('Erreur lors du chargement des produits', 'error');
        }
    }

    async loadCart() {
        try {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            this.cart = cart;
            this.updateCartCount();
        } catch (error) {
            console.error('Erreur lors du chargement du panier:', error);
            this.cart = [];
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    checkUserSession() {
        const token = sessionStorage.getItem('authToken');
        const userData = sessionStorage.getItem('currentUser');

        if (token && userData) {
            this.currentUser = JSON.parse(userData);
            this.apiService.setToken(token);
        }
    }

    setupEventListeners() {
        // Filtres
        document.getElementById('categoryFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('priceFilter')?.addEventListener('input', (e) => {
            document.getElementById('priceValue').textContent = e.target.value + 'FCFA';
            this.applyFilters();
        });
        document.getElementById('sizeFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('searchFilter')?.addEventListener('input', () => this.applyFilters());

        // Formulaires
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('contactForm')?.addEventListener('submit', (e) => this.handleContact(e));
    }

    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) element.style.display = 'block';
    }

    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) element.style.display = 'none';
    }

    showError(message, containerId = null) {
        if (containerId) {
            const container = document.getElementById(containerId);
            if (container) {
                container.textContent = message;
                container.style.display = 'block';
            }
        } else {
            this.showNotification(message, 'error');
        }
    }

    hideError(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.style.display = 'none';
        }
    }

    renderFeaturedProducts() {
        const featuredProducts = this.products.filter(p => p.featured);
        const container = document.getElementById('featuredProducts');
        if (container) {
            container.innerHTML = featuredProducts.map(product => this.createProductCard(product)).join('');
        }
    }

    renderAllProducts() {
        const container = document.getElementById('allProducts');
        if (container) {
            container.innerHTML = this.products.map(product => this.createProductCard(product)).join('');
        }
    }

    createProductCard(product) {
        return `
            <div class="product-card" onclick="showProductModal(${product.id})">
                <div class="product-image">
                    ${product.imageUrl ?
            `<img src="${product.imageUrl}" alt="${product.name}">` :
            `<i class="fas fa-shoe-prints"></i>`
        }
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
                    <p class="product-price">${product.price.toFixed(2)}FCFA</p>
                    <div class="product-actions">
                        <button class="btn btn-small" onclick="event.stopPropagation(); addToCart(${product.id})">
                            <i class="fas fa-cart-plus"></i> Ajouter
                        </button>
                        <button class="btn btn-secondary btn-small" onclick="event.stopPropagation(); showProductModal(${product.id})">
                            Détails
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    applyFilters() {
        const category = document.getElementById('categoryFilter')?.value || '';
        const maxPrice = parseFloat(document.getElementById('priceFilter')?.value || 100000);
        const size = document.getElementById('sizeFilter')?.value || '';
        const search = document.getElementById('searchFilter')?.value.toLowerCase() || '';

        const filtered = this.products.filter(product => {
            const matchCategory = !category || product.category === category;
            const matchPrice = product.price <= maxPrice;
            const matchSize = !size || (product.size && product.size.includes(size));
            const matchSearch = !search || product.name.toLowerCase().includes(search);

            return matchCategory && matchPrice && matchSize && matchSearch;
        });

        const container = document.getElementById('allProducts');
        if (container) {
            container.innerHTML = filtered.map(product => this.createProductCard(product)).join('');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const btn = document.getElementById('loginBtn');
        const originalText = btn.textContent;

        try {
            btn.textContent = 'Connexion...';
            btn.disabled = true;
            this.hideError('loginError');

            const credentials = {
                email: document.getElementById('loginEmail').value,
                password: document.getElementById('loginPassword').value
            };

            const response = await this.apiService.login(credentials);

            if (typeof response === 'string') {
                if (response.includes('Connexion réussie')) {
                    this.showNotification('Connexion réussie !');
                    showPage('home');
                    return;
                }
                throw new Error(response);
            }

            if (response.success) {
                this.currentUser = response.user;
                this.apiService.setToken(response.token);
                sessionStorage.setItem('currentUser', JSON.stringify(response.user));
                this.showNotification('Connexion réussie !');
                showPage('home');
                this.renderAllProducts();
            } else {
                throw new Error(response.message || 'Échec de la connexion');
            }
        } catch (error) {
            this.showError(error.message, 'loginError');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const btn = document.getElementById('registerBtn');
        const originalText = btn.textContent;

        try {
            btn.textContent = 'Inscription...';
            btn.disabled = true;
            this.hideError('registerError');

            const userData = {
                firstName: document.getElementById('registerFirstName').value,
                lastName: document.getElementById('registerLastName').value,
                email: document.getElementById('registerEmail').value,
                address: document.getElementById('registerAddress').value,
                phone: document.getElementById('registerPhone').value,
                password: document.getElementById('registerPassword').value
            };

            const response = await this.apiService.createUser(userData);

            if (typeof response === 'string') {
                if (response.includes('Inscription réussie')) {
                    this.showNotification('Inscription réussie !');
                    showPage('home');
                    return;
                }
                throw new Error(response);
            }

            if (response.success) {
                this.currentUser = response.user;
                this.apiService.setToken(response.token);
                sessionStorage.setItem('currentUser', JSON.stringify(response.user));
                this.showNotification('Inscription réussie !');
                showPage('home');
            } else {
                throw new Error(response.message || 'Échec de l\'inscription');
            }
        } catch (error) {
            this.showError(error.message, 'registerError');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

    async handleContact(e) {
        e.preventDefault();
        const btn = document.getElementById('contactBtn');
        const originalText = btn.textContent;

        try {
            btn.textContent = 'Envoi...';
            btn.disabled = true;
            this.hideError('contactError');

            const contactData = {
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                subject: document.getElementById('contactSubject').value,
                message: document.getElementById('contactMessage').value
            };

            document.getElementById('contactSuccess').style.display = 'block';
            e.target.reset();

            setTimeout(() => {
                document.getElementById('contactSuccess').style.display = 'none';
            }, 5000);
        } catch (error) {
            this.showError(error.message, 'contactError');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

    async renderCart() {
        const container = document.getElementById('cartItems');
        const totalElement = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');

        try {
            this.showLoading('cartLoading');

            if (this.cart.length === 0) {
                container.innerHTML = '<p style="text-align: center; padding: 2rem;">Votre panier est vide</p>';
                totalElement.textContent = 'Total: 0FCFA';
                checkoutBtn.disabled = true;
                this.hideLoading('cartLoading');
                return;
            }

            let total = 0;
            container.innerHTML = this.cart.map(item => {
                const product = this.products.find(p => p.id === item.productId);
                if (!product) return '';

                const itemTotal = product.price * item.quantity;
                total += itemTotal;

                return `
                    <div class="cart-item">
                        <div class="cart-item-image">
                            ${product.imageUrl ?
                    `<img src="${product.imageUrl}" alt="${product.name}">` :
                    `<i class="fas fa-shoe-prints"></i>`
                }
                        </div>
                        <div class="cart-item-info">
                            <div class="cart-item-title">${product.name}</div>
                            <div class="cart-item-price">${product.price.toFixed(2)}FCFA</div>
                            <div>Taille: ${item.size}</div>
                        </div>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="updateCartQuantity(${item.productId}, '${item.size}', ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateCartQuantity(${item.productId}, '${item.size}', ${item.quantity + 1})">+</button>
                        </div>
                        <button class="btn btn-small" onclick="removeFromCart(${item.productId}, '${item.size}')">Supprimer</button>
                    </div>
                `;
            }).join('');

            totalElement.textContent = `Total: ${total.toFixed(2)}FCFA`;
            checkoutBtn.disabled = false;

        } catch (error) {
            container.innerHTML = '<div class="error">Erreur lors du chargement du panier</div>';
        } finally {
            this.hideLoading('cartLoading');
        }
    }

    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = totalItems;
        }
        this.saveCart();
    }
}

// Variables globales
let app;

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    app = new AppController();
});

// Fonctions globales pour l'interface
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    const pageElement = document.getElementById(pageId);
    if (pageElement) {
        pageElement.classList.add('active');
    }

    if (pageId === 'cart') {
        app.renderCart();
    } else if (pageId === 'home') {
        app.loadProducts();
    }
}

async function showProductModal(productId) {
    const product = app.products.find(p => p.id === productId);

    if (!product) return;

    const modal = document.getElementById('productModal');
    const content = document.getElementById('productModalContent');

    if (content) {
        content.innerHTML = `
            <div style="text-align: center;">
                <div class="product-image" style="margin-bottom: 1rem; height: 200px;">
                    ${product.imageUrl ?
            `<img src="${product.imageUrl}" alt="${product.name}" style="max-width: 100%; max-height: 100%;">` :
            `<i class="fas fa-shoe-prints"></i>`
        }
                </div>
                <h3>${product.name}</h3>
                <p style="color: var(--primary-dark); margin: 1">${product.description}</p>
                <p style="font-size: 1.5rem; color: var(--primary-dark); font-weight: 700; margin: 1rem 0;">${product.price.toFixed(2)}FCFA</p>
                <div style="margin: 1rem 0;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Taille :</label>
                    <select id="selectedSize" style="padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                        ${product.size.split(',').map(size =>
            `<option value="${size.trim()}">${size.trim()}</option>`
        ).join('')}
                    </select>
                </div>
                <button class="btn" onclick="addToCartWithSize(${product.id})" style="width: 100%;">
                    Ajouter au Panier
                </button>
            </div>
        `;
    }

    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

async function addToCart(productId) {
    const product = app.products.find(p => p.id === productId);

    if (!product || !product.size) return;

    try {
        const defaultSize = product.size.split(',')[0].trim();
        app.cart.push({
            productId: productId,
            size: defaultSize,
            quantity: 1
        });

        app.updateCartCount();
        app.showNotification('Produit ajouté au panier !');
    } catch (error) {
        app.showNotification('Erreur lors de l\'ajout au panier', 'error');
    }
}

async function addToCartWithSize(productId) {
    const selectedSize = document.getElementById('selectedSize')?.value || '';

    try {
        app.cart.push({
            productId: productId,
            size: selectedSize,
            quantity: 1
        });

        app.updateCartCount();
        closeModal('productModal');
        app.showNotification('Produit ajouté au panier !');
    } catch (error) {
        app.showNotification('Erreur lors de l\'ajout au panier', 'error');
    }
}

function updateCartQuantity(productId, size, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId, size);
        return;
    }

    const item = app.cart.find(item =>
        item.productId === productId && item.size === size
    );

    if (item) {
        item.quantity = newQuantity;
        app.updateCartCount();
        app.renderCart();
    }
}

function removeFromCart(productId, size) {
    app.cart = app.cart.filter(item =>
        !(item.productId === productId && item.size === size)
    );
    app.updateCartCount();
    app.renderCart();
    app.showNotification('Produit retiré du panier');
}

async function proceedToCheckout() {
    if (!app.currentUser) {
        app.showNotification('Veuillez vous connecter pour finaliser votre commande', 'error');
        showPage('login');
        return;
    }

    if (app.cart.length === 0) {
        app.showNotification('Votre panier est vide', 'error');
        return;
    }

    try {
        const checkoutBtn = document.getElementById('checkoutBtn');
        checkoutBtn.textContent = 'Traitement...';
        checkoutBtn.disabled = true;

        let total = 0;
        const items = app.cart.map(item => {
            const product = app.products.find(p => p.id === item.productId);
            if (product) {
                const itemTotal = product.price * item.quantity;
                total += itemTotal;
                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: product.price
                };
            }
            return null;
        }).filter(item => item !== null);

        const orderData = {
            reference: `CMD-${Date.now()}`,
            orderDate: new Date().toISOString().split('T')[0],
            status: "En attente",
            totalAmount: total,
            customerId: app.currentUser.id,
            items: items
        };

        await app.apiService.createOrder(orderData);

        // Vider le panier après commande
        app.cart = [];
        app.updateCartCount();

        app.showNotification(`Commande créée avec succès ! Total: ${total.toFixed(2)}FCFA`);
        showPage('home');
    } catch (error) {
        app.showNotification('Erreur lors de la création de la commande: ' + error.message, 'error');
    } finally {
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.textContent = 'Procéder au Paiement';
            checkoutBtn.disabled = false;
        }
    }
}

// Fermeture des modales en cliquant à l'extérieur
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Ajout de styles pour les notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        padding: 15px 20px;
        margin-bottom: 10px;
        border-radius: 5px;
        color: white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        opacity: 0;
        transform: translateX(100%);
        animation: slideIn 0.5s forwards, fadeOut 0.5s forwards 4.5s;
    }

    @keyframes slideIn {
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes fadeOut {
        to { opacity: 0; }
    }

    .notification.success { background-color: #4CAF50; }
    .notification.error { background-color: #f44336; }
    .notification.info { background-color: #2196F3; }
`;
document.head.appendChild(notificationStyles);
