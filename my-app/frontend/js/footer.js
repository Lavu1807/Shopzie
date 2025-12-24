// ===========================
// FOOTER COMPONENT
// ===========================

class Footer {
  constructor() {
    this.init();
  }

  /**
   * Initialize footer
   */
  init() {
    this.render();
    this.attachEventListeners();
  }

  /**
   * Render footer
   */
  render() {
    const footer = `
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <!-- About Section -->
            <div class="footer-section">
              <h4>About ME-SHOPZ</h4>
              <p>
                Your trusted online marketplace for quality products at great prices. 
                Shop from trusted sellers and enjoy seamless shopping experience.
              </p>
              <div class="social-links">
                <a href="#" title="Facebook" class="social-link">f</a>
                <a href="#" title="Twitter" class="social-link">𝕏</a>
                <a href="#" title="Instagram" class="social-link">📷</a>
                <a href="#" title="LinkedIn" class="social-link">in</a>
              </div>
            </div>

            <!-- Quick Links -->
            <div class="footer-section">
              <h4>Quick Links</h4>
              <ul class="footer-links">
                <li><a href="/">Home</a></li>
                <li><a href="/?category=products">Products</a></li>
                <li><a href="#about">About Us</a></li>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>

            <!-- Customer Service -->
            <div class="footer-section">
              <h4>Customer Service</h4>
              <ul class="footer-links">
                <li><a href="#shipping">Shipping Info</a></li>
                <li><a href="#returns">Returns & Refunds</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms & Conditions</a></li>
                <li><a href="#warranty">Warranty Info</a></li>
              </ul>
            </div>

            <!-- Contact Section -->
            <div class="footer-section">
              <h4>Contact Us</h4>
              <div class="contact-info">
                <p>📧 support@me-shopz.com</p>
                <p>📱 +1 (555) 123-4567</p>
                <p>🏢 123 Commerce St, Tech City, TC 12345</p>
                <p>🕐 Mon-Fri 9AM-6PM EST</p>
              </div>
            </div>

            <!-- Newsletter -->
            <div class="footer-section">
              <h4>Newsletter</h4>
              <p>Subscribe to get special offers and updates!</p>
              <div class="newsletter-form">
                <input 
                  type="email" 
                  id="newsletterEmail"
                  placeholder="Enter your email"
                  class="newsletter-input"
                />
                <button class="btn btn-primary btn-sm" id="newsletterBtn">
                  Subscribe
                </button>
              </div>
              <p class="newsletter-message hidden" id="newsletterMessage"></p>
            </div>
          </div>

          <!-- Payment Methods -->
          <div class="footer-divider"></div>
          <div class="footer-payment">
            <p>We Accept:</p>
            <div class="payment-methods">
              <span class="payment-method">💳 Credit Card</span>
              <span class="payment-method">🏦 Bank Transfer</span>
              <span class="payment-method">📱 Mobile Payment</span>
              <span class="payment-method">💰 PayPal</span>
            </div>
          </div>

          <!-- Copyright -->
          <div class="footer-divider"></div>
          <div class="footer-bottom">
            <p>&copy; 2025 ME-SHOPZ. All rights reserved.</p>
            <p>Designed with ❤️ for online shoppers</p>
          </div>
        </div>
      </footer>
    `;

    document.body.insertAdjacentHTML('beforeend', footer);
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Newsletter subscription
    on('#newsletterBtn', 'click', () => this.handleNewsletterSubscription());
    
    on('#newsletterEmail', 'keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleNewsletterSubscription();
      }
    });
  }

  /**
   * Handle newsletter subscription
   */
  async handleNewsletterSubscription() {
    const emailInput = el('#newsletterEmail');
    const email = emailInput?.value?.trim();
    const message = el('#newsletterMessage');

    if (!email) {
      if (message) {
        setHTML(message, 'Please enter your email');
        addClass(message, 'error-text');
        show(message);
      }
      return;
    }

    if (!Validators.email(email)) {
      if (message) {
        setHTML(message, 'Please enter a valid email');
        addClass(message, 'error-text');
        show(message);
      }
      return;
    }

    // Save to localStorage for now (would be API call in production)
    const subscribers = Storage.get('newsletter_subscribers') || [];
    if (!subscribers.includes(email)) {
      subscribers.push(email);
      Storage.set('newsletter_subscribers', subscribers);
    }

    if (message) {
      setHTML(message, '✓ Thank you for subscribing!');
      removeClass(message, 'error-text');
      addClass(message, 'success-text');
      show(message);
    }

    if (emailInput) emailInput.value = '';

    setTimeout(() => {
      if (message) hide(message);
    }, 3000);
  }
}

// Initialize footer when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.footerInstance = new Footer();
  });
} else {
  window.footerInstance = new Footer();
}

// ===========================
// FOOTER STYLES
// ===========================

const footerStyles = `
<style>
  .footer {
    background-color: var(--dark);
    color: white;
    padding: var(--spacing-2xl) 0;
    margin-top: var(--spacing-2xl);
  }

  .footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-2xl);
  }

  .footer-section h4 {
    color: white;
    margin-bottom: var(--spacing-lg);
    font-size: var(--font-size-lg);
  }

  .footer-section p {
    color: #bdc3c7;
    margin-bottom: var(--spacing-md);
    font-size: var(--font-size-sm);
  }

  .footer-links {
    list-style: none;
  }

  .footer-links li {
    margin-bottom: var(--spacing-md);
  }

  .footer-links a {
    color: #bdc3c7;
    transition: var(--transition);
    font-size: var(--font-size-sm);
  }

  .footer-links a:hover {
    color: var(--primary);
  }

  .social-links {
    display: flex;
    gap: var(--spacing-md);
    margin-top: var(--spacing-lg);
  }

  .social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: rgba(255,255,255,0.1);
    border-radius: 50%;
    color: white;
    font-weight: bold;
    transition: var(--transition);
  }

  .social-link:hover {
    background-color: var(--primary);
    color: white;
  }

  .contact-info {
    font-size: var(--font-size-sm);
  }

  .contact-info p {
    color: #bdc3c7;
    margin-bottom: var(--spacing-sm);
  }

  .newsletter-form {
    display: flex;
    gap: var(--spacing-sm);
    margin: var(--spacing-md) 0;
  }

  .newsletter-input {
    flex: 1;
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: var(--border-radius);
    background-color: rgba(255,255,255,0.1);
    color: white;
    font-size: var(--font-size-sm);
  }

  .newsletter-input::placeholder {
    color: rgba(255,255,255,0.6);
  }

  .newsletter-input:focus {
    outline: none;
    border-color: var(--primary);
    background-color: rgba(255,255,255,0.15);
  }

  .newsletter-message {
    font-size: var(--font-size-sm);
    margin-top: var(--spacing-sm);
  }

  .footer-divider {
    height: 1px;
    background-color: rgba(255,255,255,0.1);
    margin: var(--spacing-lg) 0;
  }

  .footer-payment {
    text-align: center;
    margin-bottom: var(--spacing-lg);
  }

  .footer-payment p {
    margin-bottom: var(--spacing-md);
    color: #bdc3c7;
  }

  .payment-methods {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-lg);
    justify-content: center;
  }

  .payment-method {
    color: #bdc3c7;
    font-size: var(--font-size-sm);
  }

  .footer-bottom {
    text-align: center;
    border-top: 1px solid rgba(255,255,255,0.1);
    padding-top: var(--spacing-lg);
    color: #95a5a6;
    font-size: var(--font-size-sm);
  }

  .footer-bottom p {
    margin-bottom: var(--spacing-sm);
  }

  @media (max-width: 768px) {
    .footer-content {
      grid-template-columns: 1fr;
    }

    .payment-methods {
      flex-direction: column;
    }

    .newsletter-form {
      flex-direction: column;
    }
  }
</style>
`;

// Inject footer styles
if (!el('style[data-footer]')) {
  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-footer', 'true');
  styleEl.textContent = footerStyles.replace(/<style>|<\/style>/g, '');
  document.head.appendChild(styleEl);
}
