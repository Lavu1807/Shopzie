// ===========================
// VALIDATION UTILITIES
// ===========================

const Validators = {
  /**
   * Validate email format
   */
  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * Validate password strength
   */
  password: (password) => {
    return password && password.length >= 8;
  },

  /**
   * Validate password match
   */
  passwordMatch: (password, confirm) => {
    return password && password === confirm;
  },

  /**
   * Validate phone number
   */
  phone: (phone) => {
    const regex = /^[\d\-\+\(\)\s]{10,}$/;
    return regex.test(phone.replace(/\D/g, ''));
  },

  /**
   * Validate required field
   */
  required: (value) => {
    return value && value.trim().length > 0;
  },

  /**
   * Validate minimum length
   */
  minLength: (value, length) => {
    return value && value.length >= length;
  },

  /**
   * Validate maximum length
   */
  maxLength: (value, length) => {
    return !value || value.length <= length;
  },

  /**
   * Validate number
   */
  number: (value) => {
    return !isNaN(value) && value > 0;
  },

  /**
   * Validate URL
   */
  url: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validate file size (in MB)
   */
  fileSize: (file, maxMB) => {
    return file.size <= maxMB * 1024 * 1024;
  },

  /**
   * Validate file type
   */
  fileType: (file, allowedTypes) => {
    return allowedTypes.includes(file.type);
  },
};

/**
 * Form validation class
 */
class FormValidator {
  constructor(formSelector) {
    this.form = typeof formSelector === 'string' ? el(formSelector) : formSelector;
    this.errors = {};
  }

  /**
   * Add validation rule
   */
  addRule(fieldName, validator, message) {
    if (!this.rules) this.rules = {};
    if (!this.rules[fieldName]) this.rules[fieldName] = [];
    this.rules[fieldName].push({ validator, message });
    return this;
  }

  /**
   * Validate form
   */
  validate() {
    this.errors = {};
    this.clearErrors();

    if (!this.rules) return true;

    for (const [fieldName, rules] of Object.entries(this.rules)) {
      const field = this.form.elements[fieldName];
      if (!field) continue;

      for (const rule of rules) {
        const isValid = rule.validator(field.value);
        if (!isValid) {
          if (!this.errors[fieldName]) this.errors[fieldName] = [];
          this.errors[fieldName].push(rule.message);
        }
      }
    }

    this.showErrors();
    return Object.keys(this.errors).length === 0;
  }

  /**
   * Show validation errors
   */
  showErrors() {
    for (const [fieldName, messages] of Object.entries(this.errors)) {
      const field = this.form.elements[fieldName];
      if (!field) continue;

      const wrapper = field.closest('.form-group');
      if (wrapper) {
        addClass(wrapper, 'has-error');
        const errorDiv = createElement('div', 'error-text');
        errorDiv.textContent = messages[0];
        wrapper.appendChild(errorDiv);
      }
    }
  }

  /**
   * Clear error messages
   */
  clearErrors() {
    const errorElements = this.form.querySelectorAll('.error-text');
    errorElements.forEach(el => el.remove());
    const errorGroups = this.form.querySelectorAll('.has-error');
    errorGroups.forEach(el => removeClass(el, 'has-error'));
  }

  /**
   * Get field errors
   */
  getErrors(fieldName) {
    return this.errors[fieldName] || [];
  }

  /**
   * Get all errors
   */
  getAllErrors() {
    return this.errors;
  }
}

// ===========================
// PASSWORD STRENGTH METER
// ===========================

class PasswordStrengthMeter {
  constructor(inputSelector, displaySelector) {
    this.input = typeof inputSelector === 'string' ? el(inputSelector) : inputSelector;
    this.display = typeof displaySelector === 'string' ? el(displaySelector) : displaySelector;
    
    if (this.input) {
      this.input.addEventListener('input', () => this.updateStrength());
    }
  }

  /**
   * Calculate password strength
   */
  calculateStrength(password) {
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    return Math.min(strength, 5);
  }

  /**
   * Get strength label
   */
  getStrengthLabel(strength) {
    const labels = {
      0: 'Very Weak',
      1: 'Weak',
      2: 'Fair',
      3: 'Good',
      4: 'Strong',
      5: 'Very Strong',
    };
    return labels[strength] || 'Unknown';
  }

  /**
   * Get strength color
   */
  getStrengthColor(strength) {
    const colors = {
      0: '#e74c3c',
      1: '#e67e22',
      2: '#f39c12',
      3: '#f1c40f',
      4: '#27ae60',
      5: '#16a085',
    };
    return colors[strength] || '#95a5a6';
  }

  /**
   * Update strength display
   */
  updateStrength() {
    const password = this.input.value;
    const strength = this.calculateStrength(password);
    const label = this.getStrengthLabel(strength);
    const color = this.getStrengthColor(strength);

    if (this.display) {
      this.display.innerHTML = `
        <div style="margin-top: 8px;">
          <div style="background-color: #e0e0e0; height: 6px; border-radius: 3px; overflow: hidden;">
            <div style="
              background-color: ${color};
              height: 100%;
              width: ${(strength / 5) * 100}%;
              transition: width 0.3s ease;
            "></div>
          </div>
          <small style="color: ${color}; font-weight: 600; margin-top: 4px; display: block;">
            ${label}
          </small>
        </div>
      `;
    }
  }
}

// ===========================
// IMAGE UPLOAD HANDLER
// ===========================

class ImageUploadHandler {
  constructor(inputSelector, previewSelector, maxSize = 5) {
    this.input = typeof inputSelector === 'string' ? el(inputSelector) : inputSelector;
    this.preview = typeof previewSelector === 'string' ? el(previewSelector) : previewSelector;
    this.maxSize = maxSize; // in MB
    this.allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (this.input) {
      this.input.addEventListener('change', (e) => this.handleFileSelect(e));
    }
  }

  /**
   * Handle file selection
   */
  handleFileSelect(event) {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validate file type
    if (!this.allowedTypes.includes(file.type)) {
      showAlert('Please select a valid image format (JPEG, PNG, WebP)', 'danger');
      this.input.value = '';
      return;
    }

    // Validate file size
    if (!Validators.fileSize(file, this.maxSize)) {
      showAlert(`Image size must be less than ${this.maxSize}MB`, 'danger');
      this.input.value = '';
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (this.preview) {
        this.preview.innerHTML = `
          <div style="position: relative; display: inline-block;">
            <img src="${e.target.result}" style="max-width: 200px; border-radius: 8px;" />
            <button type="button" class="btn btn-sm btn-danger" 
              onclick="this.parentElement.parentElement.innerHTML=''; 
              document.querySelector('${this.input.id ? '#' : '.'}${this.input.id || this.input.className.split(' ')[0]}').value='';"
              style="position: absolute; top: 5px; right: 5px;">
              Remove
            </button>
          </div>
        `;
      }
    };
    reader.readAsDataURL(file);
  }

  /**
   * Get file
   */
  getFile() {
    return this.input.files[0];
  }

  /**
   * Clear preview
   */
  clear() {
    if (this.preview) this.preview.innerHTML = '';
    if (this.input) this.input.value = '';
  }
}

// ===========================
// DYNAMIC SELECT HANDLER
// ===========================

class DynamicSelect {
  constructor(selectSelector, options = []) {
    this.select = typeof selectSelector === 'string' ? el(selectSelector) : selectSelector;
    this.setOptions(options);
  }

  /**
   * Set options
   */
  setOptions(options) {
    if (!this.select) return;
    
    this.select.innerHTML = '<option value="">Select...</option>';
    options.forEach(option => {
      const optionEl = document.createElement('option');
      optionEl.value = option.value || option.id;
      optionEl.textContent = option.label || option.name;
      this.select.appendChild(optionEl);
    });
  }

  /**
   * Add option
   */
  addOption(value, label) {
    if (!this.select) return;
    
    const optionEl = document.createElement('option');
    optionEl.value = value;
    optionEl.textContent = label;
    this.select.appendChild(optionEl);
  }

  /**
   * Get selected value
   */
  getValue() {
    return this.select?.value || null;
  }

  /**
   * Set selected value
   */
  setValue(value) {
    if (this.select) this.select.value = value;
  }

  /**
   * Clear
   */
  clear() {
    this.setOptions([]);
  }
}
