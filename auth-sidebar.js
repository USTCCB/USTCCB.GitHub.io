/**
 * 共享认证侧边栏模块
 * - 侧边栏不显示登录按钮（干净界面）
 * - 按 Ctrl+Shift+L 打开隐藏的管理员登录弹窗
 * - 已登录时显示用户名 + 退出按钮
 */
(function () {
    const API_BASE = 'https://backend-production-4de2.up.railway.app';

    /* ========== 注入登录弹窗 HTML ========== */
    function injectAuthModal() {
        const modal = document.createElement('div');
        modal.id = 'authModal';
        modal.innerHTML = `
<div id="authModal" style="
    position:fixed;top:0;left:0;width:100%;height:100%;
    background:rgba(0,0,0,0.75);z-index:9999;
    display:none;align-items:center;justify-content:center;
    backdrop-filter:blur(6px);">
  <div style="
      background:var(--card-bg,#1e293b);border:1px solid rgba(255,255,255,0.1);
      border-radius:18px;padding:36px;max-width:420px;width:92%;
      box-shadow:0 20px 60px rgba(0,0,0,0.5);">

    <!-- 标签切换 -->
    <div style="display:flex;gap:0;margin-bottom:28px;background:rgba(0,0,0,0.3);border-radius:10px;padding:4px;">
      <button id="tabLoginBtn" onclick="authSidebar.switchTab('login')" style="
          flex:1;padding:10px;border:none;border-radius:8px;cursor:pointer;
          font-size:0.95rem;font-weight:600;transition:all 0.25s;
          background:var(--primary-color,#8b5cf6);color:white;">
        🔐 登录
      </button>
      <button id="tabRegisterBtn" onclick="authSidebar.switchTab('register')" style="
          flex:1;padding:10px;border:none;border-radius:8px;cursor:pointer;
          font-size:0.95rem;font-weight:600;transition:all 0.25s;
          background:transparent;color:rgba(255,255,255,0.5);">
        📝 注册
      </button>
    </div>

    <!-- 登录表单 -->
    <div id="loginForm">
      <div style="margin-bottom:16px;">
        <label style="display:block;margin-bottom:6px;color:rgba(255,255,255,0.6);font-size:0.875rem;">邮箱</label>
        <input type="email" id="authEmail" placeholder="your@email.com" style="
            width:100%;padding:12px 14px;background:rgba(0,0,0,0.35);
            border:1px solid rgba(255,255,255,0.12);border-radius:9px;
            color:white;font-size:0.95rem;outline:none;box-sizing:border-box;
            transition:border-color 0.2s;"
          onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='rgba(255,255,255,0.12)'">
      </div>
      <div style="margin-bottom:20px;">
        <label style="display:block;margin-bottom:6px;color:rgba(255,255,255,0.6);font-size:0.875rem;">密码</label>
        <input type="password" id="authPassword" placeholder="请输入密码" style="
            width:100%;padding:12px 14px;background:rgba(0,0,0,0.35);
            border:1px solid rgba(255,255,255,0.12);border-radius:9px;
            color:white;font-size:0.95rem;outline:none;box-sizing:border-box;
            transition:border-color 0.2s;"
          onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='rgba(255,255,255,0.12)'">
      </div>
      <div id="loginError" style="color:#f87171;font-size:0.875rem;margin-bottom:14px;display:none;"></div>
      <button onclick="authSidebar.doLogin()" style="
          width:100%;padding:13px;
          background:linear-gradient(135deg,#8b5cf6,#ec4899);
          border:none;border-radius:10px;color:white;
          font-size:1rem;font-weight:600;cursor:pointer;
          box-shadow:0 4px 15px rgba(139,92,246,0.4);transition:all 0.3s;">
        登录
      </button>
    </div>

    <!-- 注册表单 -->
    <div id="registerForm" style="display:none;">
      <div style="margin-bottom:16px;">
        <label style="display:block;margin-bottom:6px;color:rgba(255,255,255,0.6);font-size:0.875rem;">用户名</label>
        <input type="text" id="regUsername" placeholder="用户名（3-50个字符）" style="
            width:100%;padding:12px 14px;background:rgba(0,0,0,0.35);
            border:1px solid rgba(255,255,255,0.12);border-radius:9px;
            color:white;font-size:0.95rem;outline:none;box-sizing:border-box;
            transition:border-color 0.2s;"
          onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='rgba(255,255,255,0.12)'">
      </div>
      <div style="margin-bottom:16px;">
        <label style="display:block;margin-bottom:6px;color:rgba(255,255,255,0.6);font-size:0.875rem;">邮箱</label>
        <input type="email" id="regEmail" placeholder="your@email.com" style="
            width:100%;padding:12px 14px;background:rgba(0,0,0,0.35);
            border:1px solid rgba(255,255,255,0.12);border-radius:9px;
            color:white;font-size:0.95rem;outline:none;box-sizing:border-box;
            transition:border-color 0.2s;"
          onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='rgba(255,255,255,0.12)'">
      </div>
      <div style="margin-bottom:20px;">
        <label style="display:block;margin-bottom:6px;color:rgba(255,255,255,0.6);font-size:0.875rem;">密码（至少6位）</label>
        <input type="password" id="regPassword" placeholder="请输入密码" style="
            width:100%;padding:12px 14px;background:rgba(0,0,0,0.35);
            border:1px solid rgba(255,255,255,0.12);border-radius:9px;
            color:white;font-size:0.95rem;outline:none;box-sizing:border-box;
            transition:border-color 0.2s;"
          onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='rgba(255,255,255,0.12)'">
      </div>
      <div id="regError" style="color:#f87171;font-size:0.875rem;margin-bottom:14px;display:none;"></div>
      <button onclick="authSidebar.doRegister()" style="
          width:100%;padding:13px;
          background:linear-gradient(135deg,#8b5cf6,#ec4899);
          border:none;border-radius:10px;color:white;
          font-size:1rem;font-weight:600;cursor:pointer;
          box-shadow:0 4px 15px rgba(139,92,246,0.4);transition:all 0.3s;">
        注册账号
      </button>
    </div>

    <button onclick="authSidebar.closeModal()" style="
        position:absolute;top:16px;right:16px;
        background:rgba(255,255,255,0.08);border:none;
        color:rgba(255,255,255,0.6);width:34px;height:34px;
        border-radius:50%;cursor:pointer;font-size:1.1rem;
        transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">
      ×
    </button>
  </div>
</div>`;
        // 用于关闭弹窗时定位样式
        const overlay = modal.firstElementChild;
        overlay.style.position = 'fixed';
        document.body.appendChild(overlay);
    }

    /* ========== 渲染侧边栏用户区域 ========== */
    function renderSidebarFooter() {
        const footer = document.querySelector('.sidebar-footer');
        if (!footer) return;

        const token = localStorage.getItem('blog_token');
        const username = localStorage.getItem('blog_username');

        // 保留主题切换按钮（如已存在）
        let themeBtn = footer.querySelector('.theme-toggle');
        if (!themeBtn) {
            themeBtn = document.createElement('button');
            themeBtn.className = 'theme-toggle';
            themeBtn.id = 'themeToggle';
            themeBtn.title = '切换主题';
            themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }

        footer.innerHTML = '';
        footer.appendChild(themeBtn);

        if (token && username) {
            // 已登录状态 — 显示用户名和退出按钮
            const profile = document.createElement('div');
            profile.className = 'user-profile';
            profile.innerHTML = `
                <div class="avatar" style="background:linear-gradient(135deg,#8b5cf6,#ec4899);">
                    <i class="fa-solid fa-user"></i>
                </div>
                <div class="user-info" style="flex:1;min-width:0;">
                    <span class="name" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(username)}</span>
                    <span class="status">已登录</span>
                </div>
                <button id="logoutBtn" title="退出登录" style="
                    background:rgba(239,68,68,0.15);border:none;
                    color:#f87171;padding:5px 9px;border-radius:7px;
                    cursor:pointer;font-size:0.8rem;white-space:nowrap;
                    transition:all 0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.3)'" onmouseout="this.style.background='rgba(239,68,68,0.15)'">
                    退出
                </button>`;
            footer.appendChild(profile);
            footer.querySelector('#logoutBtn').addEventListener('click', (e) => {
                e.stopPropagation();
                authSidebar.logout();
            });
        }
        // 未登录时不显示任何用户区域（访客界面干净）
        // 管理员通过 Ctrl+Shift+L 打开登录弹窗
    }

    function escapeHtml(str) {
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    /* ========== 公开 API ========== */
    window.authSidebar = {
        openModal(tab) {
            const modal = document.getElementById('authModal');
            if (modal) {
                modal.style.display = 'flex';
                this.switchTab(tab || 'login');
                // 关闭背景点击
                modal.onclick = (e) => { if (e.target === modal) this.closeModal(); };
            }
        },
        closeModal() {
            const modal = document.getElementById('authModal');
            if (modal) modal.style.display = 'none';
        },
        switchTab(tab) {
            const loginForm = document.getElementById('loginForm');
            const registerForm = document.getElementById('registerForm');
            const tabLoginBtn = document.getElementById('tabLoginBtn');
            const tabRegisterBtn = document.getElementById('tabRegisterBtn');
            if (tab === 'login') {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
                tabLoginBtn.style.background = 'var(--primary-color,#8b5cf6)';
                tabLoginBtn.style.color = 'white';
                tabRegisterBtn.style.background = 'transparent';
                tabRegisterBtn.style.color = 'rgba(255,255,255,0.5)';
            } else {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
                tabRegisterBtn.style.background = 'var(--primary-color,#8b5cf6)';
                tabRegisterBtn.style.color = 'white';
                tabLoginBtn.style.background = 'transparent';
                tabLoginBtn.style.color = 'rgba(255,255,255,0.5)';
            }
        },
        async doLogin() {
            const email = document.getElementById('authEmail').value.trim();
            const password = document.getElementById('authPassword').value;
            const errEl = document.getElementById('loginError');
            errEl.style.display = 'none';
            if (!email || !password) { errEl.textContent = '请填写邮箱和密码'; errEl.style.display = 'block'; return; }
            try {
                const res = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || '登录失败');
                localStorage.setItem('blog_token', json.data.token);
                localStorage.setItem('blog_username', json.data.user.username);
                this.closeModal();
                renderSidebarFooter();
                // 触发主题初始化（如有）
                if (typeof initTheme === 'function') initTheme();
                showGlobalToast('✅ 登录成功！欢迎 ' + json.data.user.username);
                // 触发页面刷新回调（各页面可定义 onAuthLogin）
                if (typeof window.onAuthLogin === 'function') window.onAuthLogin();
            } catch (e) {
                errEl.textContent = e.message;
                errEl.style.display = 'block';
            }
        },
        async doRegister() {
            const username = document.getElementById('regUsername').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            const errEl = document.getElementById('regError');
            errEl.style.display = 'none';
            if (!username || !email || !password) { errEl.textContent = '请填写所有字段'; errEl.style.display = 'block'; return; }
            try {
                const res = await fetch(`${API_BASE}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || '注册失败');
                localStorage.setItem('blog_token', json.data.token);
                localStorage.setItem('blog_username', json.data.user.username);
                this.closeModal();
                renderSidebarFooter();
                showGlobalToast('🎉 注册成功！欢迎 ' + json.data.user.username);
                if (typeof window.onAuthLogin === 'function') window.onAuthLogin();
            } catch (e) {
                errEl.textContent = e.message;
                errEl.style.display = 'block';
            }
        },
        logout() {
            if (!confirm('确定要退出登录吗？')) return;
            localStorage.removeItem('blog_token');
            localStorage.removeItem('blog_username');
            renderSidebarFooter();
            showGlobalToast('👋 已退出登录', '#f59e0b');
            if (typeof window.onAuthLogout === 'function') window.onAuthLogout();
        }
    };

    function showGlobalToast(msg, color) {
        // 复用页面已有的 showToast，否则自建
        if (typeof window.showToast === 'function') { window.showToast(msg, color); return; }
        let t = document.getElementById('_globalToast');
        if (!t) {
            t = document.createElement('div');
            t.id = '_globalToast';
            t.style.cssText = 'position:fixed;bottom:30px;right:30px;color:white;padding:14px 24px;border-radius:10px;font-size:0.95rem;z-index:99999;transition:opacity 0.3s;';
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.style.background = color || '#10b981';
        t.style.display = 'block';
        t.style.opacity = '1';
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => { t.style.display = 'none'; }, 300); }, 3000);
    }

    /* ========== 初始化 ========== */
    function init() {
        injectAuthModal();
        renderSidebarFooter();

        // Ctrl+Shift+L 打开隐藏的管理员登录弹窗
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                authSidebar.openModal('login');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
