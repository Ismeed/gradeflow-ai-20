// Global Application Orchestration & Session Manager

const GFApp = {
  // Session Utilities
  getCurrentUser() {
    const session = localStorage.getItem("gf_session");
    return session ? JSON.parse(session) : null;
  },

  login(email, password, role) {
    const users = GFDb.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    
    if (user) {
      localStorage.setItem("gf_session", JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, message: "Invalid email, password, or role credentials." };
  },

  logout() {
    localStorage.removeItem("gf_session");
    window.location.href = "/auth/login.html";
  },

  registerStudent(name, email, regNo, department) {
    const users = GFDb.getUsers();
    
    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: "Email already registered." };
    }

    const newUser = {
      id: "std-" + Date.now(),
      name,
      email,
      role: "student",
      department,
      regNo
    };

    users.push(newUser);
    localStorage.setItem("gf_users", JSON.stringify(users));
    
    // Log them in immediately
    localStorage.setItem("gf_session", JSON.stringify(newUser));
    return { success: true, user: newUser };
  },

  // Role Guarding Page Access
  guardPage(allowedRoles) {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = "/auth/login.html";
      return false;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to correct dashboard based on role
      window.location.href = `/${user.role}/dashboard.html`;
      return false;
    }
    return true;
  },

  // Dynamic Sidebar Injector to eliminate code duplication
  injectSidebar(activePageId) {
    const container = document.getElementById("sidebar-container");
    if (!container) return;

    const user = this.getCurrentUser();
    if (!user) return;

    let menuItems = [];

    if (user.role === "student") {
      menuItems = [
        { id: "dashboard", label: "Dashboard", url: "/student/dashboard.html", icon: `<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>` },
        { id: "submit", label: "Submit Project", url: "/student/submit.html", icon: `<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>` },
        { id: "results", label: "Grading Report", url: "/student/results.html", icon: `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>` }
      ];
    } else if (user.role === "supervisor") {
      menuItems = [
        { id: "dashboard", label: "My Assigments", url: "/supervisor/dashboard.html", icon: `<svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>` }
      ];
    } else if (user.role === "admin") {
      menuItems = [
        { id: "dashboard", label: "Overview", url: "/admin/dashboard.html", icon: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>` },
        { id: "analytics", label: "Grading Analytics", url: "/admin/analytics.html", icon: `<svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>` }
      ];
    }

    const logoHtml = `
      <div class="brand-section">
        <div class="brand-logo">GF</div>
        <div class="brand-name">GradeFlow</div>
      </div>
    `;

    const menuHtml = `
      <nav class="nav-menu">
        ${menuItems.map(item => `
          <a href="${item.url}" class="nav-item ${item.id === activePageId ? 'active' : ''}">
            ${item.icon}
            <span>${item.label}</span>
          </a>
        `).join('')}
        
        <a href="#" id="logout-btn" class="nav-item" style="margin-top: auto; color: var(--danger);">
          <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span>Logout</span>
        </a>
      </nav>
    `;

    const userProfileHtml = `
      <div class="user-profile-section">
        <div class="avatar">${user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
        <div class="user-info">
          <span class="user-name">${user.name}</span>
          <span class="user-role">${user.role}</span>
        </div>
      </div>
    `;

    container.innerHTML = logoHtml + menuHtml + userProfileHtml;

    // Attach logout action
    document.getElementById("logout-btn").addEventListener("click", (e) => {
      e.preventDefault();
      this.logout();
    });
  },

  // Dynamic Topbar injector with title and actions
  injectTopbar(pageTitle) {
    const container = document.getElementById("topbar-container");
    if (!container) return;

    const user = this.getCurrentUser();
    const notifications = GFDb.getNotifications().filter(n => n.userId === user.id);

    container.innerHTML = `
      <h2 class="page-title">${pageTitle}</h2>
      <div class="header-actions">
        <!-- Dark/Light Toggle -->
        <button id="theme-btn" class="theme-toggle-btn" title="Toggle Theme">
          <svg id="theme-icon" style="width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2;" viewBox="0 0 24 24">
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/>
          </svg>
        </button>

        <!-- Notifications -->
        <div class="notification-bell" id="notification-bell-btn">
          <svg style="width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2;" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          ${notifications.length > 0 ? `<div class="notification-badge"></div>` : ''}
        </div>
      </div>
    `;

    // Bind Theme Button
    document.getElementById("theme-btn").addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("gf_theme", nextTheme);
      this.updateThemeIcon(nextTheme);
    });

    // Bind Notification Center
    document.getElementById("notification-bell-btn").addEventListener("click", () => {
      this.showNotificationsModal(notifications);
    });
  },

  updateThemeIcon(theme) {
    const icon = document.getElementById("theme-icon");
    if (!icon) return;
    if (theme === "dark") {
      icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
    } else {
      icon.innerHTML = `<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/>`;
    }
  },

  initTheme() {
    const savedTheme = localStorage.getItem("gf_theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    this.updateThemeIcon(savedTheme);
  },

  showNotificationsModal(notifications) {
    const user = this.getCurrentUser();
    
    // Create/Reuse Modal Overlay
    let overlay = document.getElementById("notification-modal-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "notification-modal-overlay";
      overlay.className = "modal-overlay";
      document.body.appendChild(overlay);
    }

    const itemsHtml = notifications.length > 0 
      ? notifications.map(n => `
          <div class="notification-item">
            <div>${n.message}</div>
            <div class="notification-time">${n.createdAt}</div>
          </div>
        `).join('')
      : `<div style="text-align: center; color: var(--text-secondary); padding: 24px;">No unread notifications</div>`;

    overlay.innerHTML = `
      <div class="modal-content">
        <h3 class="modal-title">Notification Center</h3>
        <div class="notification-panel">
          ${itemsHtml}
        </div>
        <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;">
          <button class="btn btn-secondary" id="close-not-btn">Close</button>
          ${notifications.length > 0 ? `<button class="btn btn-primary" id="clear-not-btn">Clear All</button>` : ''}
        </div>
      </div>
    `;

    overlay.classList.add("active");

    document.getElementById("close-not-btn").addEventListener("click", () => {
      overlay.classList.remove("active");
    });

    if (notifications.length > 0) {
      document.getElementById("clear-not-btn").addEventListener("click", () => {
        GFDb.clearNotifications(user.id);
        overlay.classList.remove("active");
        this.injectTopbar(document.title); // Refresh badge status
      });
    }
  }
};

// Initialize Theme on module load
GFApp.initTheme();
