document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initChat();
});

function initSidebar() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.querySelector('.sidebar'); // Changed ID to class for generality or use specific ID if present
    // Note: In new HTML I used class="sidebar" but didn't give it an ID "sidebar" in all files?
    // In index.html: <nav class="sidebar">. No ID.
    // In ai-chat.html (old): <aside class="sidebar" id="sidebar">.
    // I should fix the selector.
    
    const sidebarElement = document.getElementById('sidebar') || document.querySelector('.sidebar');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn'); // Only in chat
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    function toggleSidebar() {
        if (!sidebarElement) return;
        sidebarElement.classList.toggle('open');
        overlay.classList.toggle('active');
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleSidebar);
    }
    
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', toggleSidebar);
    }
    
    overlay.addEventListener('click', toggleSidebar);
}

function initChat() {
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const messagesContainer = document.getElementById('messagesContainer');

    if (!userInput || !sendBtn || !messagesContainer) return;

    // 配置 Marked (如果存在)
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            highlight: function(code, lang) {
                if (typeof highlight !== 'undefined') {
                    const language = highlight.getLanguage(lang) ? lang : 'plaintext';
                    return highlight.highlight(code, { language }).value;
                }
                return code;
            },
            langPrefix: 'hljs language-'
        });
    }

    // 自动调整输入框高度
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.value === '') this.style.height = 'auto';
    });

    // 发送消息事件
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    let isTyping = false;

    function sendMessage() {
        if (isTyping) return;

        const text = userInput.value.trim();
        if (!text) return;

        appendMessage('user', text);
        userInput.value = '';
        userInput.style.height = 'auto';

        showTypingIndicator();
        isTyping = true;
        
        const delay = Math.floor(Math.random() * 1000) + 1500;
        
        setTimeout(() => {
            removeTypingIndicator();
            const aiResponse = generateResponse(text);
            streamMessage(aiResponse);
        }, delay);
    }

    function appendMessage(sender, htmlContent) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}-message`;
        const avatarIcon = sender === 'ai' ? 'fa-robot' : 'fa-user';
        
        // Escape content for user to prevent XSS (basic)
        const displayContent = sender === 'user' ? escapeHtml(htmlContent) : htmlContent;

        msgDiv.innerHTML = `
            <div class="message-avatar"><i class="fa-solid ${avatarIcon}"></i></div>
            <div class="message-content markdown-body">${displayContent}</div>
        `;

        messagesContainer.appendChild(msgDiv);
        scrollToBottom();
    }

    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"'']/g, function(m) { return map[m]; });
    }

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
        const speed = 15;

        function type() {
            if (index < fullText.length) {
                if (fullText.substring(index).startsWith('```')) {
                    const endCodeBlock = fullText.indexOf('```', index + 3);
                    if (endCodeBlock !== -1) {
                        contentDiv.innerHTML = marked.parse(fullText.substring(0, endCodeBlock + 3));
                        index = endCodeBlock + 3;
                        scrollToBottom();
                        setTimeout(type, speed);
                        return;
                    }
                }
                
                contentDiv.textContent = fullText.substring(0, index + 1);
                index++;
                scrollToBottom();
                setTimeout(type, speed + Math.random() * 20);
            } else {
                contentDiv.innerHTML = marked.parse(fullText);
                if (typeof hljs !== 'undefined') hljs.highlightAll();
                isTyping = false;
                scrollToBottom();
            }
        }
        type();
    }

    function scrollToBottom() {
        window.scrollTo(0, document.body.scrollHeight);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function generateResponse(input) {
        input = input.toLowerCase();
        if (input.includes('python') || input.includes('代码')) {
            return "这是一个 Python 示例：\n\n```python\nprint('Hello World')\n```";
        }
        if (input.includes('你好')) return "你好！很高兴见到你。";
        return "我是一个模拟 AI，这只是一个演示。";
    }

    let typingDiv;
    function showTypingIndicator() {
        typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator-msg';
        typingDiv.innerHTML = `
            <div class="message-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="message-content" style="background:transparent;">
                <div class="typing-dots"><span></span><span></span><span></span></div>
            </div>`;
        messagesContainer.appendChild(typingDiv);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        if (typingDiv) {
            typingDiv.remove();
            typingDiv = null;
        }
    }
}