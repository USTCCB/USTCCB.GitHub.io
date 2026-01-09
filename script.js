document.addEventListener('DOMContentLoaded', () => {
    initSidebar();

    // Determine which page we are on
    if (document.getElementById('messagesContainer')) {
        initChat();
    }
});

/* --- Sidebar & Layout Logic --- */
function initSidebar() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebarElement = document.querySelector('.sidebar') || document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const overlay = document.getElementById('overlay') || createOverlay();

    function createOverlay() {
        const el = document.createElement('div');
        el.className = 'overlay';
        el.id = 'overlay';
        document.body.appendChild(el);
        return el;
    }

    function toggleSidebar() {
        if (!sidebarElement) return;
        sidebarElement.classList.toggle('open');
        overlay.classList.toggle('active');
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', toggleSidebar);
    if (overlay) overlay.addEventListener('click', toggleSidebar);
}

/* --- AI Chat Logic with Multi-Provider Support --- */
function initChat() {
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const messagesContainer = document.getElementById('messagesContainer');

    // Settings Modal Elements
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const saveKeyBtn = document.getElementById('saveKeyBtn');

    // Provider tabs
    const providerTabs = document.querySelectorAll('.provider-tab');
    const providerConfigs = document.querySelectorAll('.provider-config');

    // Load saved configuration
    // [MODIFIED] Default provider changed to 'deepseek'
    let currentProvider = localStorage.getItem('ai_provider') || 'deepseek';
    let apiConfig = {
        gemini: {
            key: localStorage.getItem('gemini_api_key') || '',
            model: localStorage.getItem('gemini_model') || 'gemini-2.5-flash'
        },
        openai: {
            key: localStorage.getItem('openai_api_key') || '',
            model: localStorage.getItem('openai_model') || 'gpt-5.2'
        },
        deepseek: {
            // [MODIFIED] Added default API Key for DeepSeek
            key: localStorage.getItem('deepseek_api_key') || 'sk-baf5f27f7566431290140ed72e3cf3fd',
            model: localStorage.getItem('deepseek_model') || 'deepseek-chat'
        }
    };

    let chatHistory = []; // Stores conversation history

    const SYSTEM_INSTRUCTIONS = {
        gemini: "你是 USTCCB 的 AI 助手 (基于 Gemini 模型)。你的性格友好、热情、像朋友一样。你可以使用 Emoji。请用中文回答。",
        openai: "你是 USTCCB 的 AI 助手 (基于 OpenAI 模型)。你的性格友好、热情、像朋友一样。你可以使用 Emoji。请用中文回答。",
        deepseek: "你是 USTCCB 的 AI 助手 (基于 DeepSeek 模型)。你的性格友好、热情、像朋友一样。你可以使用 Emoji。请用中文回答。"
    };

    // --- Provider Tab Switching ---
    providerTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const provider = tab.dataset.provider;

            // Update tab UI
            providerTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update config panel UI
            providerConfigs.forEach(c => c.classList.remove('active'));
            document.querySelector(`.provider-config[data-provider="${provider}"]`).classList.add('active');
        });
    });

    // --- Settings Modal Logic ---
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            // Load current values
            document.getElementById('geminiApiKey').value = apiConfig.gemini.key;
            document.getElementById('geminiModel').value = apiConfig.gemini.model;
            document.getElementById('openaiApiKey').value = apiConfig.openai.key;
            document.getElementById('openaiModel').value = apiConfig.openai.model;
            document.getElementById('deepseekApiKey').value = apiConfig.deepseek.key;
            document.getElementById('deepseekModel').value = apiConfig.deepseek.model;

            // Show the active provider's tab
            providerTabs.forEach(t => t.classList.remove('active'));
            providerConfigs.forEach(c => c.classList.remove('active'));
            document.querySelector(`.provider-tab[data-provider="${currentProvider}"]`).classList.add('active');
            document.querySelector(`.provider-config[data-provider="${currentProvider}"]`).classList.add('active');

            settingsModal.classList.remove('hidden');
        });
    }

    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
        });
    }

    if (saveKeyBtn) {
        saveKeyBtn.addEventListener('click', () => {
            // Save all configurations
            apiConfig.gemini.key = document.getElementById('geminiApiKey').value.trim();
            apiConfig.gemini.model = document.getElementById('geminiModel').value;
            apiConfig.openai.key = document.getElementById('openaiApiKey').value.trim();
            apiConfig.openai.model = document.getElementById('openaiModel').value;
            apiConfig.deepseek.key = document.getElementById('deepseekApiKey').value.trim();
            apiConfig.deepseek.model = document.getElementById('deepseekModel').value;

            // Determine which provider to use based on active tab
            const activeTab = document.querySelector('.provider-tab.active');
            currentProvider = activeTab.dataset.provider;

            if (!apiConfig[currentProvider].key) {
                alert('请输入有效的 API Key');
                return;
            }

            // Save to localStorage
            localStorage.setItem('ai_provider', currentProvider);
            localStorage.setItem('gemini_api_key', apiConfig.gemini.key);
            localStorage.setItem('gemini_model', apiConfig.gemini.model);
            localStorage.setItem('openai_api_key', apiConfig.openai.key);
            localStorage.setItem('openai_model', apiConfig.openai.model);
            localStorage.setItem('deepseek_api_key', apiConfig.deepseek.key);
            localStorage.setItem('deepseek_model', apiConfig.deepseek.model);

            const providerNames = {
                gemini: 'Google Gemini',
                openai: 'OpenAI',
                deepseek: 'DeepSeek'
            };

            alert(`✅ API Key 已保存！当前使用: ${providerNames[currentProvider]} - ${apiConfig[currentProvider].model}`);
            settingsModal.classList.add('hidden');

            // Update header
            updateChatHeader();

            // Clear demo message and add welcome
            messagesContainer.innerHTML = '';
            appendMessage('ai', `🎉 配置成功！我现在连接到 **${providerNames[currentProvider]}** 的 **${apiConfig[currentProvider].model}** 模型。我们可以开始聊天了！`);
        });
    }

    function updateChatHeader() {
        const header = document.querySelector('.chat-header h2');
        const providerIcons = {
            gemini: '<i class="fa-brands fa-google"></i>',
            openai: '<i class="fa-solid fa-brain"></i>',
            deepseek: '<i class="fa-solid fa-code"></i>'
        };
        const providerNames = {
            gemini: 'Gemini',
            openai: 'OpenAI',
            deepseek: 'DeepSeek'
        };

        if (apiConfig[currentProvider].key) {
            header.innerHTML = `${providerIcons[currentProvider]} ${providerNames[currentProvider]} - ${apiConfig[currentProvider].model} <span class="badge">Live</span>`;
        }
    }

    // Initialize header
    updateChatHeader();

    // --- Chat Logic ---

    // Configure Marked.js
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            highlight: function (code, lang) {
                if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return code;
            },
            langPrefix: 'hljs language-'
        });
    }

    // Auto-resize textarea
    userInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.value === '') this.style.height = 'auto';
    });

    // Send handlers
    sendBtn.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    let isProcessing = false;

    async function handleSendMessage() {
        if (isProcessing) return;

        const text = userInput.value.trim();
        if (!text) return;

        // UI Updates
        appendMessage('user', text);
        userInput.value = '';
        userInput.style.height = 'auto';

        isProcessing = true;
        showTypingIndicator();

        try {
            if (apiConfig[currentProvider].key) {
                // Real AI Call
                await fetchAIResponse(text);
            } else {
                // Demo Mode
                await simulateDemoResponse(text);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            removeTypingIndicator();
            appendMessage('ai', `⚠️ 发生错误: ${error.message || '请检查网络或 API Key'}\\n\\n点击左侧 **设置 API Key** 重新配置。`);
        } finally {
            isProcessing = false;
        }
    }

    // --- Unified API Adapter ---
    async function fetchAIResponse(userText) {
        const provider = currentProvider;

        try {
            let response;
            switch (provider) {
                case 'gemini':
                    response = await callGeminiAPI(userText);
                    break;
                case 'openai':
                    response = await callOpenAIAPI(userText);
                    break;
                case 'deepseek':
                    response = await callDeepSeekAPI(userText);
                    break;
                default:
                    throw new Error('未知的 AI 提供商');
            }

            removeTypingIndicator();
            streamMessage(response);

            // Update history
            chatHistory.push({ role: 'user', content: userText });
            chatHistory.push({ role: 'assistant', content: response });

        } catch (error) {
            throw error;
        }
    }

    // Gemini API
    async function callGeminiAPI(userText) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${apiConfig.gemini.model}:generateContent?key=${apiConfig.gemini.key}`;

        const contents = [
            { role: "user", parts: [{ text: SYSTEM_INSTRUCTIONS.gemini }] },
            ...chatHistory.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            })),
            { role: "user", parts: [{ text: userText }] }
        ];

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: contents })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Gemini API 请求失败');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    // OpenAI API
    async function callOpenAIAPI(userText) {
        const url = 'https://api.openai.com/v1/chat/completions';

        const messages = [
            { role: "system", content: SYSTEM_INSTRUCTIONS.openai },
            ...chatHistory,
            { role: "user", content: userText }
        ];

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiConfig.openai.key}`
            },
            body: JSON.stringify({
                model: apiConfig.openai.model,
                messages: messages,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'OpenAI API 请求失败');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // DeepSeek API
    async function callDeepSeekAPI(userText) {
        const url = 'https://api.deepseek.com/v1/chat/completions';

        const messages = [
            { role: "system", content: SYSTEM_INSTRUCTIONS.deepseek },
            ...chatHistory,
            { role: "user", content: userText }
        ];

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiConfig.deepseek.key}`
            },
            body: JSON.stringify({
                model: apiConfig.deepseek.model,
                messages: messages,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'DeepSeek API 请求失败');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async function simulateDemoResponse(text) {
        // Fake delay
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));

        removeTypingIndicator();

        let response = "我是一个模拟 AI (Demo Mode)。\\n\\n要体验真实的智能对话，请点击左侧 **⚙️ 设置 API Key** 并选择你喜欢的 AI 提供商：\\n\\n- **Google Gemini** - 免费额度充足\\n- **OpenAI GPT-4** - 功能强大\\n- **DeepSeek** - 性价比高，编程能力强";

        text = text.toLowerCase();
        if (text.includes('你好') || text.includes('hello')) response = "你好！👋 这是一个演示模式。请配置 API Key 来解锁我的全部能力！🚀";
        if (text.includes('python')) response = "Python 是一种很棒的语言！\\n```python\\nprint('Hello from Demo Mode!')\\n```\\n\\n配置 DeepSeek API 可以获得更专业的编程帮助！";

        streamMessage(response);
    }

    function appendMessage(sender, htmlContent) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}-message`;
        const avatarIcon = sender === 'ai' ? 'fa-robot' : 'fa-user';

        const displayContent = sender === 'user' ? escapeHtml(htmlContent) : htmlContent;

        msgDiv.innerHTML = `
            <div class="message-avatar"><i class="fa-solid ${avatarIcon}"></i></div>
            <div class="message-content markdown-body">${sender === 'user' ? displayContent : marked.parse(displayContent)}</div>
        `;

        messagesContainer.appendChild(msgDiv);

        // Add copy button to AI messages
        if (sender === 'ai') {
            const contentDiv = msgDiv.querySelector('.message-content');
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            actionsDiv.innerHTML = `
                <button class="action-btn copy-btn"><i class="fa-regular fa-copy"></i>复制</button>
            `;
            contentDiv.appendChild(actionsDiv);

            actionsDiv.querySelector('.copy-btn').addEventListener('click', () => {
                navigator.clipboard.writeText(htmlContent);
                const btn = actionsDiv.querySelector('.copy-btn');
                btn.innerHTML = '<i class="fa-solid fa-check"></i>已复制';
                setTimeout(() => {
                    btn.innerHTML = '<i class="fa-regular fa-copy"></i>复制';
                }, 2000);
            });
        }

        scrollToBottom();
    }

    // Stream effect for AI response
    function streamMessage(fullText) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ai-message`;
        msgDiv.innerHTML = `
            <div class="message-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="message-content markdown-body"></div>
        `;
        messagesContainer.appendChild(msgDiv);

        const contentDiv = msgDiv.querySelector('.message-content');
        let index = 0;
        const speed = fullText.length > 200 ? 3 : 10;

        function type() {
            if (index < fullText.length) {
                contentDiv.innerHTML = marked.parse(fullText.substring(0, index + 1));
                index++;

                const isNearBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 100;
                if (isNearBottom) scrollToBottom();

                if (index % 5 === 0) {
                    setTimeout(type, speed);
                } else {
                    type();
                }
            } else {
                contentDiv.innerHTML = marked.parse(fullText);
                if (typeof hljs !== 'undefined') hljs.highlightAll();

                // Add copy button
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'message-actions';
                actionsDiv.innerHTML = `
                    <button class="action-btn copy-btn"><i class="fa-regular fa-copy"></i>复制</button>
                `;
                contentDiv.appendChild(actionsDiv);

                actionsDiv.querySelector('.copy-btn').addEventListener('click', () => {
                    navigator.clipboard.writeText(fullText);
                    const btn = actionsDiv.querySelector('.copy-btn');
                    btn.innerHTML = '<i class="fa-solid fa-check"></i>已复制';
                    setTimeout(() => {
                        btn.innerHTML = '<i class="fa-regular fa-copy"></i>复制';
                    }, 2000);
                });

                scrollToBottom();
            }
        }
        type();
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator-msg';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="message-content" style="background:transparent; padding: 10px 0;">
                <div class="typing-dots"><span></span><span></span><span></span></div>
            </div>`;
        messagesContainer.appendChild(typingDiv);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const el = document.getElementById('typingIndicator');
        if (el) el.remove();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, function (m) { return map[m]; });
    }
}
