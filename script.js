document.addEventListener('DOMContentLoaded', () => {
    initSidebar();

    if (document.body.classList.contains('home-page')) {
        initHomePage();
    }

    if (document.getElementById('messagesContainer')) {
        initChat();
    }
});

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

    function toggleSidebar(forceOpen) {
        if (!sidebarElement) return;

        const shouldOpen = typeof forceOpen === 'boolean'
            ? forceOpen
            : !sidebarElement.classList.contains('open');

        sidebarElement.classList.toggle('open', shouldOpen);
        overlay.classList.toggle('active', shouldOpen);
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => toggleSidebar());
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', () => toggleSidebar(false));
    if (overlay) overlay.addEventListener('click', () => toggleSidebar(false));
}

function initHomePage() {
    const quotes = [
        '明日之我，胸中有丘壑，立马振山河。',
        '你来人间一趟，你要看看太阳。',
        '星光不问赶路人，时光不负有心人。',
        '埋骨何须桑梓地，人生无处不青山。',
        '能够让你后悔的，从来不是你做过的事，而是你想做却没有去做的事。',
        '聚是一团火，散是满天星。'
    ];

    const todoInput = document.getElementById('todoInput');
    const todoAddBtn = document.getElementById('todoAddBtn');
    const todoList = document.getElementById('todoList');
    const quickNote = document.getElementById('quickNote');
    const todoCount = document.getElementById('todoCount');
    const visitCount = document.getElementById('visitCount');
    const dailyQuote = document.getElementById('daily-quote');
    const greetingTitle = document.getElementById('greeting-title');
    const heroClock = document.getElementById('heroClock');
    const heroDate = document.getElementById('heroDate');
    const todayLabel = document.getElementById('todayLabel');
    const focusTimer = document.getElementById('focusTimer');
    const focusModeLabel = document.getElementById('focusModeLabel');
    const focusToggleBtn = document.getElementById('focusToggleBtn');
    const focusResetBtn = document.getElementById('focusResetBtn');

    const todoStorageKey = 'ustccb_home_todos';
    const noteStorageKey = 'ustccb_home_note';
    const visitStorageKey = 'ustccb_home_visits';

    const defaultTodos = ['完善个人网站', '安排今天的学习节奏', '记录一个值得保留的想法'];

    let todos = loadTodos();
    let focusSeconds = 25 * 60;
    let focusInterval = null;
    let focusRunning = false;

    dailyQuote.textContent = quotes[Math.floor(Math.random() * quotes.length)];
    quickNote.value = localStorage.getItem(noteStorageKey) || '';

    const nextVisitCount = Number(localStorage.getItem(visitStorageKey) || '0') + 1;
    localStorage.setItem(visitStorageKey, String(nextVisitCount));
    visitCount.textContent = String(nextVisitCount);

    quickNote.addEventListener('input', () => {
        localStorage.setItem(noteStorageKey, quickNote.value);
    });

    todoAddBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') addTodo();
    });

    focusToggleBtn.addEventListener('click', toggleFocusTimer);
    focusResetBtn.addEventListener('click', resetFocusTimer);

    renderTodos();
    updateClock();
    updateFocusUI();
    setInterval(updateClock, 1000);

    function loadTodos() {
        try {
            const saved = JSON.parse(localStorage.getItem(todoStorageKey) || 'null');
            return Array.isArray(saved) && saved.length ? saved : [...defaultTodos];
        } catch (error) {
            return [...defaultTodos];
        }
    }

    function persistTodos() {
        localStorage.setItem(todoStorageKey, JSON.stringify(todos));
        todoCount.textContent = String(todos.length);
    }

    function renderTodos() {
        todoList.innerHTML = '';

        if (!todos.length) {
            const empty = document.createElement('li');
            empty.className = 'todo-empty';
            empty.textContent = '今天的待办已经清空了，做得不错。';
            todoList.appendChild(empty);
            persistTodos();
            return;
        }

        todos.forEach((todo, index) => {
            const item = document.createElement('li');
            item.className = 'todo-item';
            item.innerHTML = `
                <span>${escapeHtml(todo)}</span>
                <button type="button" data-index="${index}" aria-label="完成待办">
                    <i class="fa-solid fa-check"></i>
                </button>
            `;
            todoList.appendChild(item);
        });

        todoList.querySelectorAll('button').forEach((button) => {
            button.addEventListener('click', () => {
                const index = Number(button.dataset.index);
                todos.splice(index, 1);
                persistTodos();
                renderTodos();
            });
        });

        persistTodos();
    }

    function addTodo() {
        const value = todoInput.value.trim();
        if (!value) return;
        todos.unshift(value);
        todoInput.value = '';
        persistTodos();
        renderTodos();
    }

    function updateClock() {
        const now = new Date();
        const hour = now.getHours();
        let greeting = '你好，欢迎回来';

        if (hour < 6) greeting = '夜深了，记得早点休息';
        else if (hour < 11) greeting = '早安，今天也继续前进';
        else if (hour < 14) greeting = '中午好，别忘了补充能量';
        else if (hour < 19) greeting = '下午好，继续保持节奏';
        else greeting = '晚上好，适合整理和复盘';

        greetingTitle.textContent = greeting;
        heroClock.textContent = now.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
        heroDate.textContent = now.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
        todayLabel.textContent = `${now.getMonth() + 1}/${now.getDate()}`;
    }

    function toggleFocusTimer() {
        focusRunning = !focusRunning;

        if (focusRunning) {
            focusToggleBtn.textContent = '暂停';
            focusModeLabel.textContent = 'Running';
            focusInterval = setInterval(() => {
                if (focusSeconds > 0) {
                    focusSeconds -= 1;
                    updateFocusUI();
                    return;
                }

                clearInterval(focusInterval);
                focusRunning = false;
                focusModeLabel.textContent = 'Done';
                focusToggleBtn.textContent = '重新开始';
            }, 1000);
            return;
        }

        clearInterval(focusInterval);
        focusModeLabel.textContent = 'Paused';
        focusToggleBtn.textContent = '继续';
    }

    function resetFocusTimer() {
        clearInterval(focusInterval);
        focusSeconds = 25 * 60;
        focusRunning = false;
        focusModeLabel.textContent = 'Focus';
        focusToggleBtn.textContent = '开始';
        updateFocusUI();
    }

    function updateFocusUI() {
        const minutes = String(Math.floor(focusSeconds / 60)).padStart(2, '0');
        const seconds = String(focusSeconds % 60).padStart(2, '0');
        focusTimer.textContent = `${minutes}:${seconds}`;
    }
}

function initChat() {
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const messagesContainer = document.getElementById('messagesContainer');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const saveKeyBtn = document.getElementById('saveKeyBtn');
    const clearKeysBtn = document.getElementById('clearKeysBtn');
    const providerTabs = document.querySelectorAll('.provider-tab');
    const providerConfigs = document.querySelectorAll('.provider-config');
    const promptChips = document.querySelectorAll('.prompt-chip');
    const historyList = document.getElementById('historyList');
    const newChatBtn = document.getElementById('newChatBtn');
    const chatStatusBadge = document.getElementById('chatStatusBadge');

    const storageKeys = {
        provider: 'ai_provider',
        sessions: 'ustccb_chat_sessions',
        activeSession: 'ustccb_chat_active_session',
        geminiKey: 'gemini_api_key',
        geminiModel: 'gemini_model',
        openaiKey: 'openai_api_key',
        openaiModel: 'openai_model',
        deepseekKey: 'deepseek_api_key',
        deepseekModel: 'deepseek_model'
    };

    let currentProvider = localStorage.getItem(storageKeys.provider) || 'openai';
    let apiConfig = {
        gemini: {
            key: localStorage.getItem(storageKeys.geminiKey) || '',
            model: localStorage.getItem(storageKeys.geminiModel) || 'gemini-2.5-flash'
        },
        openai: {
            key: localStorage.getItem(storageKeys.openaiKey) || '',
            model: localStorage.getItem(storageKeys.openaiModel) || 'gpt-5.2'
        },
        deepseek: {
            key: localStorage.getItem(storageKeys.deepseekKey) || '',
            model: localStorage.getItem(storageKeys.deepseekModel) || 'deepseek-chat'
        }
    };

    const providerNames = {
        gemini: 'Google Gemini',
        openai: 'OpenAI',
        deepseek: 'DeepSeek'
    };

    const providerIcons = {
        gemini: '<i class="fa-brands fa-google"></i>',
        openai: '<i class="fa-solid fa-brain"></i>',
        deepseek: '<i class="fa-solid fa-code"></i>'
    };

    const systemInstructions = {
        gemini: '你是 USTCCB 的 AI 助手。语气友好、清晰、务实，优先用中文回答。',
        openai: '你是 USTCCB 的 AI 助手。语气友好、清晰、务实，优先用中文回答。',
        deepseek: '你是 USTCCB 的 AI 助手。语气友好、清晰、务实，优先用中文回答。'
    };

    let sessions = loadSessions();
    let activeSessionId = localStorage.getItem(storageKeys.activeSession) || '';
    let chatHistory = [];
    let isProcessing = false;

    if (!sessions.length) {
        createSession();
    } else if (!sessions.some((session) => session.id === activeSessionId)) {
        activeSessionId = sessions[0].id;
    }

    loadActiveSession();
    renderHistory();
    updateChatHeader();
    renderConversation();

    if (typeof marked !== 'undefined') {
        marked.setOptions({
            highlight(code, lang) {
                if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return code;
            },
            langPrefix: 'hljs language-'
        });
    }

    userInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = `${this.scrollHeight}px`;
        if (this.value === '') this.style.height = 'auto';
    });

    sendBtn.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    });

    newChatBtn.addEventListener('click', () => {
        createSession();
        loadActiveSession();
        renderHistory();
        renderConversation();
        userInput.focus();
    });

    promptChips.forEach((chip) => {
        chip.addEventListener('click', () => {
            userInput.value = chip.dataset.prompt || '';
            userInput.dispatchEvent(new Event('input'));
            userInput.focus();
        });
    });

    providerTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const provider = tab.dataset.provider;
            providerTabs.forEach((item) => item.classList.remove('active'));
            providerConfigs.forEach((item) => item.classList.remove('active'));
            tab.classList.add('active');
            document.querySelector(`.provider-config[data-provider="${provider}"]`).classList.add('active');
        });
    });

    settingsBtn.addEventListener('click', () => {
        document.getElementById('geminiApiKey').value = apiConfig.gemini.key;
        document.getElementById('geminiModel').value = apiConfig.gemini.model;
        document.getElementById('openaiApiKey').value = apiConfig.openai.key;
        document.getElementById('openaiModel').value = apiConfig.openai.model;
        document.getElementById('deepseekApiKey').value = apiConfig.deepseek.key;
        document.getElementById('deepseekModel').value = apiConfig.deepseek.model;

        providerTabs.forEach((item) => item.classList.remove('active'));
        providerConfigs.forEach((item) => item.classList.remove('active'));
        document.querySelector(`.provider-tab[data-provider="${currentProvider}"]`).classList.add('active');
        document.querySelector(`.provider-config[data-provider="${currentProvider}"]`).classList.add('active');

        settingsModal.classList.remove('hidden');
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    clearKeysBtn.addEventListener('click', () => {
        [
            storageKeys.geminiKey,
            storageKeys.geminiModel,
            storageKeys.openaiKey,
            storageKeys.openaiModel,
            storageKeys.deepseekKey,
            storageKeys.deepseekModel,
            storageKeys.provider
        ].forEach((key) => localStorage.removeItem(key));

        apiConfig = {
            gemini: { key: '', model: 'gemini-2.5-flash' },
            openai: { key: '', model: 'gpt-5.2' },
            deepseek: { key: '', model: 'deepseek-chat' }
        };
        currentProvider = 'openai';
        updateChatHeader();
        settingsModal.classList.add('hidden');
        appendMessage('ai', '已清空本地保存的 API Key。现在处于演示模式。');
    });

    saveKeyBtn.addEventListener('click', () => {
        apiConfig.gemini.key = document.getElementById('geminiApiKey').value.trim();
        apiConfig.gemini.model = document.getElementById('geminiModel').value;
        apiConfig.openai.key = document.getElementById('openaiApiKey').value.trim();
        apiConfig.openai.model = document.getElementById('openaiModel').value;
        apiConfig.deepseek.key = document.getElementById('deepseekApiKey').value.trim();
        apiConfig.deepseek.model = document.getElementById('deepseekModel').value;

        const activeTab = document.querySelector('.provider-tab.active');
        currentProvider = activeTab.dataset.provider;

        localStorage.setItem(storageKeys.provider, currentProvider);
        localStorage.setItem(storageKeys.geminiKey, apiConfig.gemini.key);
        localStorage.setItem(storageKeys.geminiModel, apiConfig.gemini.model);
        localStorage.setItem(storageKeys.openaiKey, apiConfig.openai.key);
        localStorage.setItem(storageKeys.openaiModel, apiConfig.openai.model);
        localStorage.setItem(storageKeys.deepseekKey, apiConfig.deepseek.key);
        localStorage.setItem(storageKeys.deepseekModel, apiConfig.deepseek.model);

        settingsModal.classList.add('hidden');
        updateChatHeader();
        appendMessage('ai', `配置已保存。当前默认提供商为 **${providerNames[currentProvider]}**，模型为 **${apiConfig[currentProvider].model}**。`);
    });

    async function handleSendMessage() {
        if (isProcessing) return;

        const text = userInput.value.trim();
        if (!text) return;

        appendMessage('user', text);
        userInput.value = '';
        userInput.style.height = 'auto';

        isProcessing = true;
        showTypingIndicator();

        try {
            let response = '';
            if (apiConfig[currentProvider].key) {
                response = await fetchAIResponse(text);
            } else {
                response = await simulateDemoResponse(text);
            }

            removeTypingIndicator();
            await streamMessage(response);

            chatHistory.push({ role: 'user', content: text });
            chatHistory.push({ role: 'assistant', content: response });
            persistSession(text);
            renderHistory();
        } catch (error) {
            console.error('Chat Error:', error);
            removeTypingIndicator();
            appendMessage('ai', `⚠️ 发生错误：${error.message || '请检查网络或 API Key 设置。'}`);
        } finally {
            isProcessing = false;
        }
    }

    async function fetchAIResponse(userText) {
        switch (currentProvider) {
            case 'gemini':
                return callGeminiAPI(userText);
            case 'openai':
                return callOpenAIAPI(userText);
            case 'deepseek':
                return callDeepSeekAPI(userText);
            default:
                throw new Error('未知的 AI 提供商');
        }
    }

    async function callGeminiAPI(userText) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${apiConfig.gemini.model}:generateContent?key=${apiConfig.gemini.key}`;
        const contents = [
            { role: 'user', parts: [{ text: systemInstructions.gemini }] },
            ...chatHistory.map((message) => ({
                role: message.role === 'user' ? 'user' : 'model',
                parts: [{ text: message.content }]
            })),
            { role: 'user', parts: [{ text: userText }] }
        ];

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || 'Gemini API 请求失败');
        }

        return data.candidates?.[0]?.content?.parts?.[0]?.text || '没有收到有效回复。';
    }

    async function callOpenAIAPI(userText) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiConfig.openai.key}`
            },
            body: JSON.stringify({
                model: apiConfig.openai.model,
                messages: [
                    { role: 'system', content: systemInstructions.openai },
                    ...chatHistory,
                    { role: 'user', content: userText }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || 'OpenAI API 请求失败');
        }

        return data.choices?.[0]?.message?.content || '没有收到有效回复。';
    }

    async function callDeepSeekAPI(userText) {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiConfig.deepseek.key}`
            },
            body: JSON.stringify({
                model: apiConfig.deepseek.model,
                messages: [
                    { role: 'system', content: systemInstructions.deepseek },
                    ...chatHistory,
                    { role: 'user', content: userText }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || 'DeepSeek API 请求失败');
        }

        return data.choices?.[0]?.message?.content || '没有收到有效回复。';
    }

    async function simulateDemoResponse(text) {
        await new Promise((resolve) => setTimeout(resolve, 900));

        const normalized = text.toLowerCase();
        if (normalized.includes('你好') || normalized.includes('hello')) {
            return '你好，这里现在是演示模式。配置你自己的 API Key 后，就可以直接在这个页面里进行真实对话。';
        }
        if (normalized.includes('网站')) {
            return '如果你在做个人网站，我建议优先优化三件事：首屏辨识度、内容层级和真正可用的小功能，而不是一味堆动效。';
        }
        if (normalized.includes('python')) {
            return "当然可以，下面给你一个简单示例：\n```python\nfor i in range(3):\n    print('hello', i)\n```\n配置真实模型后，我还能继续帮你改错、解释和扩展。";
        }

        return '当前是演示模式。你可以点左侧“设置 API Key”，选择 OpenAI、Gemini 或 DeepSeek，然后把你自己的密钥保存在本地浏览器中使用。';
    }

    function updateChatHeader() {
        const header = document.querySelector('.chat-header h2');
        const hasKey = Boolean(apiConfig[currentProvider].key);
        const status = hasKey ? 'Live' : 'Demo';

        header.innerHTML = `${providerIcons[currentProvider]} ${providerNames[currentProvider]} - ${apiConfig[currentProvider].model} <span class="badge">${status}</span>`;
        chatStatusBadge.textContent = status;
    }

    function createSession() {
        const session = {
            id: `session_${Date.now()}`,
            title: '新对话',
            updatedAt: new Date().toISOString(),
            messages: []
        };

        sessions.unshift(session);
        activeSessionId = session.id;
        localStorage.setItem(storageKeys.activeSession, activeSessionId);
        saveSessions();
    }

    function loadActiveSession() {
        const session = sessions.find((item) => item.id === activeSessionId);
        chatHistory = session?.messages ? [...session.messages] : [];
        localStorage.setItem(storageKeys.activeSession, activeSessionId);
    }

    function persistSession(latestUserText) {
        const session = sessions.find((item) => item.id === activeSessionId);
        if (!session) return;

        session.messages = [...chatHistory];
        session.updatedAt = new Date().toISOString();
        session.title = chatHistory.find((item) => item.role === 'user')?.content?.slice(0, 18) || latestUserText.slice(0, 18) || '新对话';
        saveSessions();
    }

    function renderHistory() {
        historyList.innerHTML = '';

        if (!sessions.length) {
            const empty = document.createElement('div');
            empty.className = 'empty-history';
            empty.textContent = '还没有会话记录';
            historyList.appendChild(empty);
            return;
        }

        sessions
            .slice()
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .forEach((session) => {
                const item = document.createElement('button');
                item.type = 'button';
                item.className = `history-item ${session.id === activeSessionId ? 'active' : ''}`;
                item.innerHTML = `
                    <i class="fa-regular fa-message"></i>
                    <span>${escapeHtml(session.title)}</span>
                `;
                item.addEventListener('click', () => {
                    activeSessionId = session.id;
                    loadActiveSession();
                    renderHistory();
                    renderConversation();
                });
                historyList.appendChild(item);
            });
    }

    function renderConversation() {
        messagesContainer.innerHTML = '';

        if (!chatHistory.length) {
            appendMessage('ai', [
                '你好，我是部署在 **USTCCB** 站点里的 AI 助手。',
                '',
                '你可以把我当作一个本地优先的聊天工作区：',
                '- 问学习问题',
                '- 让 AI 帮你润色文案',
                '- 让 AI 帮你想网站或项目改进方案',
                '',
                '要开始真实对话，请先点击左侧 **设置 API Key**。'
            ].join('\n'));
            return;
        }

        chatHistory.forEach((message) => {
            appendMessage(message.role === 'assistant' ? 'ai' : 'user', message.content);
        });
    }

    function loadSessions() {
        try {
            const parsed = JSON.parse(localStorage.getItem(storageKeys.sessions) || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function saveSessions() {
        localStorage.setItem(storageKeys.sessions, JSON.stringify(sessions.slice(0, 12)));
    }

    function appendMessage(sender, content) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}-message`;
        const avatarIcon = sender === 'ai' ? 'fa-robot' : 'fa-user';

        msgDiv.innerHTML = `
            <div class="message-avatar"><i class="fa-solid ${avatarIcon}"></i></div>
            <div class="message-content markdown-body">${sender === 'user' ? escapeHtml(content) : renderMarkdown(content)}</div>
        `;

        messagesContainer.appendChild(msgDiv);

        if (sender === 'ai') {
            attachCopyAction(msgDiv.querySelector('.message-content'), content);
        }

        scrollToBottom();
    }

    async function streamMessage(fullText) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message ai-message';
        msgDiv.innerHTML = `
            <div class="message-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="message-content markdown-body"></div>
        `;
        messagesContainer.appendChild(msgDiv);

        const contentDiv = msgDiv.querySelector('.message-content');
        let index = 0;

        await new Promise((resolve) => {
            function type() {
                if (index < fullText.length) {
                    contentDiv.innerHTML = renderMarkdown(fullText.substring(0, index + 1));
                    index += 1;
                    if (index % 4 === 0) {
                        scrollToBottom();
                    }
                    setTimeout(type, fullText.length > 220 ? 4 : 10);
                    return;
                }

                contentDiv.innerHTML = renderMarkdown(fullText);
                attachCopyAction(contentDiv, fullText);
                if (typeof hljs !== 'undefined') hljs.highlightAll();
                scrollToBottom();
                resolve();
            }

            type();
        });
    }

    function attachCopyAction(contentDiv, text) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        actionsDiv.innerHTML = '<button class="action-btn copy-btn"><i class="fa-regular fa-copy"></i>复制</button>';
        contentDiv.appendChild(actionsDiv);

        actionsDiv.querySelector('.copy-btn').addEventListener('click', async () => {
            await navigator.clipboard.writeText(text);
            const btn = actionsDiv.querySelector('.copy-btn');
            btn.innerHTML = '<i class="fa-solid fa-check"></i>已复制';
            setTimeout(() => {
                btn.innerHTML = '<i class="fa-regular fa-copy"></i>复制';
            }, 1800);
        });
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator-msg';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="message-content" style="background:transparent; padding:10px 0;">
                <div class="typing-dots"><span></span><span></span><span></span></div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function renderMarkdown(content) {
    if (typeof marked === 'undefined') {
        return escapeHtml(content).replace(/\n/g, '<br>');
    }
    return marked.parse(content);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, (character) => map[character]);
}
