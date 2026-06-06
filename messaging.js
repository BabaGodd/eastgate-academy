const form = document.getElementById('ea-message-form');
const messageInput = document.getElementById('ea-message-text');
const senderSelect = document.getElementById('ea-sender-role');
const chatBox = document.getElementById('ea-chat-box');

// Load messages on page load
let messages = JSON.parse(localStorage.getItem('ea-messages')) || [];
renderMessages(messages);

form.addEventListener('submit', function(e) {
  e.preventDefault();
  const text = messageInput.value.trim();
  const sender = senderSelect.value;

  if (!text || !sender) return;

  const newMessage = {
    sender,
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  messages.push(newMessage);
  localStorage.setItem('ea-messages', JSON.stringify(messages));
  renderMessages(messages);

  messageInput.value = '';
});

// Render all messages
function renderMessages(msgs) {
  chatBox.innerHTML = '';
  msgs.forEach(m => {
    const div = document.createElement('div');
    div.className = `ea-message ${m.sender}`;
    div.innerHTML = `<strong>${m.sender.toUpperCase()}</strong><br>${m.text}<br><small>${m.time}</small>`;
    chatBox.appendChild(div);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
}
