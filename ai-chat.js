// ============================================
// EASTGATE ACADEMY — AI CHAT ASSISTANT
// ============================================

document.addEventListener('DOMContentLoaded', function () {

  const chatBtn = document.getElementById('ea-ai-chat-btn');
  const chatWindow = document.getElementById('ea-ai-chat-window');
  const chatClose = document.getElementById('ea-ai-chat-close');
  const chatInput = document.getElementById('ea-ai-chat-input');
  const chatSend = document.getElementById('ea-ai-chat-send');
  const chatMessages = document.getElementById('ea-ai-chat-messages');
  const openIcon = document.querySelector('.ea-ai-icon-open');
  const closeIcon = document.querySelector('.ea-ai-icon-close');

  if (!chatBtn) return;

  let conversationHistory = [];
  let isOpen = false;

  // ---- School knowledge base ----
  const SCHOOL_CONTEXT = `You are a friendly and helpful AI assistant for Eastgate Academy, a premier primary school located in Dawenya, Tema, Ghana. Keep all answers short, warm and helpful.

SCHOOL INFORMATION:
- Name: Eastgate Academy
- Location: Dawenya, Tema, Greater Accra, Ghana
- Founded: 2017
- Tagline: Nurturing Future Leaders
- Type: Primary School for children aged 5-12
- Email: eastgateacademy@protonmail.com
- Website: eastgateacademy.netlify.app

SCHOOL HOURS:
- Monday to Friday: 7:30am - 3:00pm
- Saturday and Sunday: Closed

LEVELS OFFERED:
- Kindergarten: KG 1 and KG 2
- Lower Primary: Class 1, 2 and 3
- Upper Primary: Class 4, 5 and 6

PARENT PORTAL:
- Parents log in at eastgateacademy.netlify.app/login.html
- Username is the child's Student ID
- Password is the child's last name
- Parents can view results, attendance, pay fees and read announcements

ADMISSIONS:
- Contact the school directly to begin enrollment
- Email eastgateacademy@protonmail.com to schedule a tour
- Visit the admissions page on the website for full requirements

SECURITY WARNING:
- Eastgate Academy will NEVER ask for fees via WhatsApp, phone call or text message
- All payments are made exclusively through the official parent portal
- Report any suspicious payment requests immediately

IMPORTANT RULES:
- If you don't know something say "Please contact us at eastgateacademy@protonmail.com"
- Never make up information
- Keep answers short and friendly
- Always respond in English`;

  // ---- Toggle chat window ----
  function openChat() {
    isOpen = true;
    conversationHistory = [];
    chatWindow.style.display = 'flex';
    chatWindow.style.flexDirection = 'column';
    openIcon.style.display = 'none';
    closeIcon.style.display = 'inline';
    chatBtn.style.animation = 'none';
    resetMessages();
    setTimeout(() => chatInput.focus(), 300);
  }

  function closeChat() {
    isOpen = false;
    conversationHistory = [];
    chatWindow.style.display = 'none';
    openIcon.style.display = 'inline';
    closeIcon.style.display = 'none';
    chatBtn.style.animation = 'aiBounce 2s infinite';
  }

  function resetMessages() {
    chatMessages.innerHTML = `
      <div class="ea-ai-message ea-ai-message-bot">
        <div class="ea-ai-message-avatar"><i class="fas fa-robot"></i></div>
        <div class="ea-ai-message-bubble">
          <p>👋 Hello! I'm the Eastgate Academy AI Assistant. I can help you with information about our school, admissions, fees and more. How can I help you today?</p>
        </div>
      </div>
      <div class="ea-ai-quick-btns">
        <button class="ea-ai-quick-btn" data-question="What are the school fees?">School Fees</button>
        <button class="ea-ai-quick-btn" data-question="How do I enroll my child?">Admissions</button>
        <button class="ea-ai-quick-btn" data-question="Where is the school located?">Location</button>
        <button class="ea-ai-quick-btn" data-question="How do I access the parent portal?">Parent Portal</button>
      </div>
    `;

    // Reattach quick button listeners
    document.querySelectorAll('.ea-ai-quick-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const question = this.getAttribute('data-question');
        const quickBtns = document.querySelector('.ea-ai-quick-btns');
        if (quickBtns) quickBtns.remove();
        sendMessage(question);
      });
    });
  }

  chatBtn.addEventListener('click', function () {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  });

  chatClose.addEventListener('click', closeChat);

  // ---- Send on Enter key ----
  chatInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(chatInput.value.trim());
    }
  });

  // ---- Send button ----
  chatSend.addEventListener('click', function () {
    sendMessage(chatInput.value.trim());
  });

  // ---- Add message to chat ----
  function addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `ea-ai-message ${isUser ? 'ea-ai-message-user' : 'ea-ai-message-bot'}`;

    if (!isUser) {
      messageDiv.innerHTML = `
        <div class="ea-ai-message-avatar"><i class="fas fa-robot"></i></div>
        <div class="ea-ai-message-bubble"><p>${text}</p></div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="ea-ai-message-bubble"><p>${text}</p></div>
      `;
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // ---- Show typing indicator ----
  function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ea-ai-typing';
    typingDiv.id = 'ea-ai-typing';
    typingDiv.innerHTML = `
      <div class="ea-ai-message-avatar"><i class="fas fa-robot"></i></div>
      <div class="ea-ai-typing-dots">
        <span></span><span></span><span></span>
      </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // ---- Remove typing indicator ----
  function removeTyping() {
    const typing = document.getElementById('ea-ai-typing');
    if (typing) typing.remove();
  }

  // ---- Send message ----
  async function sendMessage(text) {
    if (!text) return;

    chatInput.value = '';
    addMessage(text, true);

    conversationHistory.push({
      role: 'user',
      content: text
    });

    showTyping();
    chatSend.disabled = true;
    chatInput.disabled = true;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-dangerous-direct-browser-calls': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 300,
          system: SCHOOL_CONTEXT,
          messages: conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error('API error');
      }

      const data = await response.json();
      const reply = data.content[0].text;

      conversationHistory.push({
        role: 'assistant',
        content: reply
      });

      removeTyping();
      addMessage(reply, false);

    } catch (err) {
      console.error('AI Chat error:', err);
      removeTyping();

      // Fallback — answer from knowledge base directly
      const fallbackReply = getFallbackAnswer(text);
      addMessage(fallbackReply, false);
    }

    chatSend.disabled = false;
    chatInput.disabled = false;
    chatInput.focus();
  }

  // ---- Fallback answers if API fails ----
  function getFallbackAnswer(question) {
    const q = question.toLowerCase();

    if (q.includes('fee') || q.includes('cost') || q.includes('pay') || q.includes('price')) {
      return 'For the latest school fees please contact us at eastgateacademy@protonmail.com or visit the Fees page on our website. All payments are made securely through the parent portal only.';
    }

    if (q.includes('location') || q.includes('where') || q.includes('address') || q.includes('find')) {
      return 'Eastgate Academy is located in Dawenya, Tema, Greater Accra, Ghana. Visit our Contact page for directions and Google Maps.';
    }

    if (q.includes('enroll') || q.includes('admission') || q.includes('apply') || q.includes('join')) {
      return 'To enroll your child at Eastgate Academy please email us at eastgateacademy@protonmail.com or visit our Admissions page for full requirements.';
    }

    if (q.includes('portal') || q.includes('login') || q.includes('password') || q.includes('access')) {
      return 'Parents can access the portal at eastgateacademy.netlify.app/login.html. Use your child\'s Student ID as the username and your child\'s last name as the password.';
    }

    if (q.includes('hour') || q.includes('time') || q.includes('open') || q.includes('close')) {
      return 'Eastgate Academy is open Monday to Friday from 7:30am to 3:00pm. We are closed on Saturdays and Sundays.';
    }

    if (q.includes('whatsapp') || q.includes('fraud') || q.includes('scam') || q.includes('payment')) {
      return '⚠️ Important: Eastgate Academy will NEVER request fees via WhatsApp, phone call or text message. All payments are made exclusively through the official parent portal. Report any suspicious requests immediately.';
    }

    if (q.includes('class') || q.includes('level') || q.includes('grade') || q.includes('kg')) {
      return 'Eastgate Academy offers Kindergarten (KG 1-2), Lower Primary (Class 1-3) and Upper Primary (Class 4-6) for children aged 5-12.';
    }

    if (q.includes('contact') || q.includes('email') || q.includes('call') || q.includes('phone')) {
      return 'You can reach us at eastgateacademy@protonmail.com or visit our Contact page at eastgateacademy.netlify.app/contact.html.';
    }

    return 'Thank you for your question! For the most accurate answer please contact us at eastgateacademy@protonmail.com or visit our website at eastgateacademy.netlify.app. 😊';
  }

});