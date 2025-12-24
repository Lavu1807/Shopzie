// ===========================
// NAVBAR COMPONENT
// ===========================

class Navbar {
  constructor() {
    this.user = getCurrentUser();
    this.isLoggedIn = isLoggedIn();
    this.init();
  }

  /**
   * Initialize navbar
   */
  init() {
    this.render();
    this.attachEventListeners();
    this.updateUserMenu();
  }

  /**
   * Render navbar
   */
  render() {
    const navbar = `
      <nav class="navbar">
        <div class="container flex-between">
          <!-- Logo -->
          <div class="navbar-brand">
            <a href="/" class="logo">
              <strong>ME-SHOPZ</strong>
            </a>
          </div>

          <!-- Search Bar -->
          <div class="navbar-search">
            <div class="search-box">
              <input 
                type="text" 
                id="searchInput" 
                placeholder="Search products..."
                class="search-input"
              />
              <button class="btn-search" id="searchBtn">
                <i class="icon-search">🔍</i>
              </button>
            </div>
          </div>

          <!-- Right Menu -->
          <div class="navbar-menu">
            <!-- Cart -->
            <a href="/cart.html" class="nav-item">
              <span class="icon">🛒</span>
              <span class="badge" id="cartCount">0</span>
            </a>

            <!-- User Menu -->
            <div class="nav-item dropdown" id="userMenu">
              <button class="dropdown-toggle">
                <span id="userDisplayName">Account</span>
                <span class="arrow">▼</span>
              </button>
              <div class="dropdown-menu">
                <div id="authMenu"></div>
              </div>
            </div>

            <!-- Mobile Menu Toggle -->
            <button class="mobile-menu-toggle" id="mobileMenuToggle">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div class="mobile-menu hidden" id="mobileMenu">
          <div class="mobile-menu-content">
            <input 
              type="text" 
              placeholder="Search products..."
              class="search-input mobile-search"
            />
            <div id="mobileAuthMenu"></div>
          </div>
        </div>
      </nav>

      <!-- Alert Container -->
      <div class="alerts-container"></div>
    `;

    const navContainer = el('nav') || document.body;
    if (navContainer.tagName === 'NAV') {
      navContainer.innerHTML = navbar;
    } else {
      document.body.insertAdjacentHTML('afterbegin', navbar);
    }
  }

  /**
   * Update user menu based on auth state
   */
  updateUserMenu() {
    const authMenu = el('#authMenu');
    const mobileAuthMenu = el('#mobileAuthMenu');

    if (this.isLoggedIn) {
      const user = getCurrentUser();
      const userDisplayName = el('#userDisplayName');
      if (userDisplayName) {
        userDisplayName.textContent = user?.firstName || 'Account';
      }

      const menuHTML = this.getAuthenticatedMenu();
      if (authMenu) authMenu.innerHTML = menuHTML;
      if (mobileAuthMenu) mobileAuthMenu.innerHTML = menuHTML;
    } else {
      const menuHTML = this.getGuestMenu();
      if (authMenu) authMenu.innerHTML = menuHTML;
      if (mobileAuthMenu) mobileAuthMenu.innerHTML = menuHTML;
    }

    this.updateCartCount();
  }

  /**
   * Get authenticated user menu
   */
  getAuthenticatedMenu() {
    const user = getCurrentUser();
    const role = getUserRole();

    let menuHTML = `
      <a href="/profile.html" class="dropdown-item">
        <span>👤</span> Profile
      </a>
      <a href="/orders.html" class="dropdown-item">
        <span>📦</span> My Orders
      </a>
    `;

    if (role === 'shopkeeper') {
      menuHTML += `
        <a href="/dashboard.html" class="dropdown-item">
          <span>📊</span> Dashboard
        </a>
        <a href="/add-product.html" class="dropdown-item">
          <span>➕</span> Add Product
        </a>
      `;
    }

    menuHTML += `
      <a href="/settings.html" class="dropdown-item">
        <span>⚙️</span> Settings
      </a>
      <hr style="margin: 8px 0; border: none; border-top: 1px solid #e0e0e0;">
      <button class="dropdown-item logout-btn" id="logoutBtn">
        <span>🚪</span> Logout
      </button>
    `;

    return menuHTML;
  }

  /**
   * Get guest menu
   */
  getGuestMenu() {
    return `
      <a href="/login.html" class="dropdown-item">
        <span>🔑</span> Login
      </a>
      <a href="/signup.html" class="dropdown-item">
        <span>✏️</span> Sign Up
      </a>
    `;
  }

  /**
   * Update cart count
   */
  updateCartCount() {
    const cart = Storage.get('cart') || [];
    const cartCount = el('#cartCount');
    if (cartCount) {
      cartCount.textContent = cart.length;
      if (cart.length > 0) {
        show(cartCount);
      } else {
        hide(cartCount);
      }
    }
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Search
    on('#searchBtn', 'click', () => this.handleSearch());
    on('#searchInput', 'keypress', (e) => {
      if (e.key === 'Enter') this.handleSearch();
    });

    // Mobile menu toggle
    on('#mobileMenuToggle', 'click', () => this.toggleMobileMenu());

    // Dropdown toggle
    const dropdownToggle = el('.dropdown-toggle');
    if (dropdownToggle) {
      on(dropdownToggle, 'click', (e) => {
        e.preventDefault();
        const dropdown = el('.dropdown-menu');
        if (dropdown) toggle(dropdown);
      });
    }

    // Logout
    setTimeout(() => {
      on('#logoutBtn', 'click', () => this.handleLogout());
    }, 100);

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const dropdown = el('.dropdown');
      if (dropdown && !dropdown.contains(e.target)) {
        hide(el('.dropdown-menu'));
      }
    });

    // Cart count update listener
    window.addEventListener('storage', () => {
      this.updateCartCount();
    });
  }

  /**
   * Handle search
   */
  handleSearch() {
    const query = el('#searchInput')?.value?.trim();
    if (query) {
      window.location.href = `/?search=${encodeURIComponent(query)}`;
    }
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu() {
    const menu = el('#mobileMenu');
    if (menu) toggle(menu);
  }

  /**
   * Handle logout
   */
  handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      // Call logout API if available
      apiPost('/auth/logout', {}).then((result) => {
        // Clear local data regardless of API response
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login.html';
      });
    }
  }

  /**
   * Update cart count from external source
   */
  static updateCartCount() {
    const navbar = window.navbarInstance;
    if (navbar) {
      navbar.updateCartCount();
    }
  }
}

// Initialize navbar when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.navbarInstance = new Navbar();
  });
} else {
  window.navbarInstance = new Navbar();
}

// ===========================
// NAVBAR STYLES
// ===========================

const navbarStyles = `
<style>
  .navbar {
    background-color: white;
    border-bottom: 1px solid var(--gray-light);
    box-shadow: var(--box-shadow);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .navbar .container {
    padding: var(--spacing-md);
    height: 70px;
  }

  .navbar-brand {
    flex-shrink: 0;
  }

  .logo {
    font-size: var(--font-size-xl);
    color: var(--primary);
    display: flex;
    align-items: center;
    height: 100%;
  }

  .navbar-search {
    flex: 1;
    margin: 0 var(--spacing-lg);
  }

  .search-box {
    display: flex;
    gap: var(--spacing-sm);
  }

  .search-input {
    flex: 1;
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--gray-light);
    border-radius: var(--border-radius);
    font-size: var(--font-size-sm);
  }

  .btn-search {
    background-color: var(--primary);
    color: white;
    border: none;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius);
    cursor: pointer;
    font-size: 16px;
  }

  .btn-search:hover {
    background-color: var(--primary-dark);
  }

  .navbar-menu {
    display: flex;
    gap: var(--spacing-lg);
    align-items: center;
    flex-shrink: 0;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    color: var(--dark);
    font-weight: 500;
    position: relative;
  }

  .nav-item .icon {
    font-size: 20px;
  }

  .nav-item .badge {
    position: absolute;
    top: -8px;
    right: -12px;
    min-width: 20px;
    height: 20px;
    background-color: var(--danger);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
  }

  .dropdown {
    position: relative;
  }

  .dropdown-toggle {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    color: var(--dark);
    font-weight: 500;
    padding: var(--spacing-sm);
  }

  .dropdown-toggle:hover {
    color: var(--primary);
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: white;
    border: 1px solid var(--gray-light);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow-lg);
    min-width: 200px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
  }

  .dropdown-item {
    padding: var(--spacing-md) var(--spacing-lg);
    color: var(--dark);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    transition: var(--transition);
  }

  .dropdown-item:hover {
    background-color: #f8f9fa;
    color: var(--primary);
  }

  .dropdown-item.logout-btn {
    color: var(--danger);
  }

  .dropdown-item.logout-btn:hover {
    background-color: #f8d7da;
  }

  .mobile-menu-toggle {
    display: none;
    flex-direction: column;
    background: none;
    border: none;
    cursor: pointer;
    gap: 5px;
  }

  .mobile-menu-toggle span {
    width: 25px;
    height: 3px;
    background-color: var(--dark);
    transition: var(--transition);
  }

  .mobile-menu {
    display: none;
    background-color: white;
    border-top: 1px solid var(--gray-light);
  }

  .mobile-menu-content {
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  @media (max-width: 768px) {
    .navbar-search {
      display: none;
    }

    .mobile-menu-toggle {
      display: flex;
    }

    .mobile-menu.hidden {
      display: none;
    }

    .mobile-menu:not(.hidden) {
      display: block;
    }

    .dropdown-menu {
      position: static;
      box-shadow: none;
      border: none;
      background-color: #f8f9fa;
      border-radius: 0;
    }

    .dropdown-item {
      padding: var(--spacing-md) var(--spacing-lg);
    }

    .navbar .container {
      height: auto;
    }
  }
</style>
`;

// Inject navbar styles
if (!el('style[data-navbar]')) {
  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-navbar', 'true');
  styleEl.textContent = navbarStyles.replace(/<style>|<\/style>/g, '');
  document.head.appendChild(styleEl);
}
