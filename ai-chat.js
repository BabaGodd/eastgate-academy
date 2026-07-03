// ============================================
// EASTGATE ACADEMY — AI CHAT ASSISTANT
// Updated with real school data
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

  // ---- Complete Real School Knowledge Base ----
  const SCHOOL_CONTEXT = `You are a friendly, warm and professional AI assistant for Eastgate Academy. Your name is "Eastgate Assistant".

SCHOOL INFORMATION:
- Name: Eastgate Academy
- Location: Near Magna Terris Estates, New Dawhenya, Tema, Greater Accra, Ghana
- Digital Address: GN-0295-0876
- Postal Address: P.O. Box BT 212, Tema
- Founded: February 2023
- Tagline: Nurturing Future Leaders
- Type: Private, co-educational school from Creche to JHS
- Phone: 0303962585
- Email: info@eastgateschool.com
- Website: eastgateacademy.netlify.app

SCHOOL HOURS:
- Monday to Friday: 7:30am - 3:00pm
- Office hours: Monday to Friday 7:30am - 4:00pm
- Saturday: Closed
- Sunday: Closed

LEVELS AND CLASSES:
- Creche
- Pre-Nursery
- Nursery
- Kindergarten: KG 1 and KG 2
- Basic 1, Basic 2, Basic 3
- Basic 4, Basic 5, Basic 6
- Junior High School (JHS 1)

SUBJECTS BY LEVEL:

Creche and Pre-Nursery:
- Pre-Literacy, Pre-Numeracy, Language Development, Creative Play, Music and Movement, Social Skills, Physical Development

Kindergarten (KG 1 and KG 2):
- Language and Literacy, Numeracy, Creative Arts, Physical Development, Psychomotor Skills

Basic 1 to Basic 3:
- English Language, Mathematics, Science, History, Creative Arts, Religious and Moral Education, Ghanaian Language, Physical Education

Basic 4 to Basic 6:
- English Language, Mathematics, Science, History, Creative Arts, Religious and Moral Education, Ghanaian Language, Physical Education, French, Computing

Junior High School:
- English Language, Mathematics, Science, Social Studies, Computing, Career Technology, Creative Arts and Design, Religious and Moral Education, Ghanaian Language, French, Physical and Health Education

STAFF AND LEADERSHIP:
- Mr. Joseph Apana — Director, Administration and Finance
- Mr. Frank Sontim-Buor — Director, Academics and Quality Assurance
- Mr. Andrews Amanor — Head of School
- Ms. Mercy Baani — Assistant Head and KG 1 Teacher
- Ms. Charlotte — Creche and Pre-Nursery Teacher
- Ms. Nadia A. — Nursery Teacher
- Ms. Patience N. — KG 2 Teacher
- Ms. Christabel — Basic 1 Teacher
- Ms. Mary Tetteh — Basic 2 Teacher
- Ms. Shirley — Basic 3 Teacher
- Mr. Ernest Avotri — Basic 4 Teacher
- Ms. Selina — Basic 5 Teacher
- Ms. Kukie — Basic 6 Teacher
- Mr. Maxwell Added — JHS 1 Teacher
- Monsieur Pascal — French Teacher (Part-time)
- Ms. Mabel Agorvor — Secretary and Administrative Assistant
- Mr. Pascal — School Driver
- Ms. Perpetual Etornam — Cateress

ACADEMIC CALENDAR:
- Three terms per academic year
- Term 1: September to December
- Term 2: January to April
- Term 3: April to July
- Long vacation: July to September

ADMISSIONS:
- Children from age 4 can be enrolled starting from Creche or KG 1
- Documents required: Birth certificate, immunization card, passport photo, previous school report if applicable
- No formal entrance exam for Creche, Nursery, KG and Basic levels
- Contact school to schedule a visit before enrollment
- Email info@eastgateschool.com to begin the process
- Enrollment is open throughout the year subject to availability
- Admission and registration forms are available at the school

FEES INFORMATION:
- School fees are paid termly
- Fee structure is available at the school office and on the fees page of the website
- Fees can be paid through the parent portal online
- Fees can also be paid at the school accounts office
- Bank: Zenith Bank — Account Number: 6010322944 — Account Name: Eastgate Academy Ltd
- Mobile Money payments are also accepted
- Installment plans are available for families who need flexibility
- Contact the school accounts office for the current fee structure

PARENT PORTAL:
- Access at: eastgateacademy.netlify.app/login.html
- Parents log in using their child's Student ID as username
- Password is the child's last name
- Parents can view academic results
- Parents can check attendance records
- Parents can pay school fees online
- Parents can read school announcements
- Parents can send and receive messages from teachers
- If you forget your login details contact the school at info@eastgateschool.com

TEACHER PORTAL:
- Teachers log in using their Staff ID
- Teachers use a password assigned by admin
- Teachers can upload assignments, enter results, take attendance and message parents

SECURITY AND FRAUD WARNING:
- Eastgate Academy will NEVER request fees via WhatsApp
- Eastgate Academy will NEVER request fees via phone call or text message
- All payments are made exclusively through the official parent portal or at the school accounts office or Zenith Bank account
- Every payment generates a unique reference number — always save it as proof
- If anyone contacts you requesting payment outside these channels report it immediately
- Call 0303962585 if you receive any suspicious payment requests

TRANSPORT:
- School bus service is available on selected routes
- Transport fees are paid termly
- Contact the school on 0303962585 for route information

CONTACT THE SCHOOL:
- Phone: 0303962585
- Email: info@eastgateschool.com
- Digital Address: GN-0295-0876
- Postal Address: P.O. Box BT 212, Tema
- Visit: Near Magna Terris Estates, New Dawhenya, Tema
- Contact form: eastgateacademy.netlify.app/contact.html
- Office hours: Monday to Friday 7:30am to 4:00pm

RULES FOR YOUR RESPONSES:
- Always be warm, friendly and encouraging
- Keep answers concise and easy to understand
- If you are not sure about something say "Please contact us at info@eastgateschool.com or call 0303962585 for accurate information"
- Never make up fees amounts or specific dates you are not sure about
- Always encourage parents to visit the school or contact directly for sensitive matters
- Respond only in English
- End responses with a helpful follow up offer when appropriate`;

  // Mascot image path
  const MASCOT = `<img src="images/mascot.png" alt="Eastgate Assistant" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" />`;

  // ---- Toggle chat ----
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
        <div class="ea-ai-message-avatar">${MASCOT}</div>
        <div class="ea-ai-message-bubble">
          <p>👋 Hello! I am the Eastgate Academy AI Assistant. I can answer questions about our school, admissions, fees, the parent portal and more. How can I help you today?</p>
        </div>
      </div>
      <div class="ea-ai-quick-btns">
        <button class="ea-ai-quick-btn" data-question="What are the school fees?">School Fees</button>
        <button class="ea-ai-quick-btn" data-question="How do I enroll my child?">Admissions</button>
        <button class="ea-ai-quick-btn" data-question="Where is the school located?">Location</button>
        <button class="ea-ai-quick-btn" data-question="How do I access the parent portal?">Parent Portal</button>
      </div>
    `;

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
    isOpen ? closeChat() : openChat();
  });

  chatClose.addEventListener('click', closeChat);

  chatInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(chatInput.value.trim());
    }
  });

  chatSend.addEventListener('click', function () {
    sendMessage(chatInput.value.trim());
  });

  function addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `ea-ai-message ${isUser ? 'ea-ai-message-user' : 'ea-ai-message-bot'}`;

    if (!isUser) {
      messageDiv.innerHTML = `
        <div class="ea-ai-message-avatar">${MASCOT}</div>
        <div class="ea-ai-message-bubble"><p>${text.replace(/\n/g, '<br>')}</p></div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="ea-ai-message-bubble"><p>${text}</p></div>
      `;
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ea-ai-typing';
    typingDiv.id = 'ea-ai-typing';
    typingDiv.innerHTML = `
      <div class="ea-ai-message-avatar">${MASCOT}</div>
      <div class="ea-ai-typing-dots">
        <span></span><span></span><span></span>
      </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeTyping() {
    const typing = document.getElementById('ea-ai-typing');
    if (typing) typing.remove();
  }

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

    let apiSuccess = false;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-dangerous-direct-browser-calls': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 400,
          system: SCHOOL_CONTEXT,
          messages: conversationHistory
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.content[0].text;

        conversationHistory.push({
          role: 'assistant',
          content: reply
        });

        removeTyping();
        addMessage(reply, false);
        apiSuccess = true;
      }

    } catch (err) {
      console.log('API unavailable, using fallback:', err.message);
    }

    if (!apiSuccess) {
      removeTyping();
      const fallbackReply = getSmartAnswer(text);
      conversationHistory.push({
        role: 'assistant',
        content: fallbackReply
      });
      addMessage(fallbackReply, false);
    }

    chatSend.disabled = false;
    chatInput.disabled = false;
    chatInput.focus();
  }

  // ---- Smart Fallback Answer Engine ----
  function getSmartAnswer(question) {
    const q = question.toLowerCase();

    if (q.includes('fee') || q.includes('cost') || q.includes('how much') || q.includes('price') || q.includes('tuition') || q.includes('pay') || q.includes('ghs') || q.includes('money')) {
      if (q.includes('bank') || q.includes('zenith') || q.includes('account')) {
        return 'You can pay school fees directly to our bank account:\n\n🏦 Bank: Zenith Bank\n💳 Account Number: 6010322944\n📋 Account Name: Eastgate Academy Ltd\n\nAlways keep your payment receipt as proof. You can also pay through the parent portal or at the school office.';
      }
      if (q.includes('installment') || q.includes('part payment') || q.includes('split')) {
        return 'Yes! Eastgate Academy offers flexible installment payment plans for families who need it. Please visit the school accounts office or contact us at info@eastgateschool.com or call 0303962585 to arrange an installment plan before the term begins.';
      }
      if (q.includes('momo') || q.includes('mobile money') || q.includes('mtn') || q.includes('vodafone') || q.includes('airteltigo')) {
        return 'Yes! Eastgate Academy accepts Mobile Money payments. A dedicated school MoMo account is being set up. In the meantime you can pay through the parent portal or directly at the school accounts office. Contact us on 0303962585 for the latest payment options.';
      }
      if (q.includes('late') || q.includes('miss') || q.includes('overdue')) {
        return 'If you are experiencing difficulties paying fees on time please contact the school accounts office as soon as possible on 0303962585 or email info@eastgateschool.com. We always try to work with families first.';
      }
      return 'School fees at Eastgate Academy are paid termly. Payment options include:\n\n🏦 Zenith Bank — Account: 6010322944\n📱 Mobile Money (contact school for details)\n💻 Parent portal online payment\n🏫 Cash at school accounts office\n\nFor the current fee structure visit our Fees page or contact us at info@eastgateschool.com or call 0303962585.';
    }

    if (q.includes('location') || q.includes('where') || q.includes('address') || q.includes('find') || q.includes('directions') || q.includes('map') || q.includes('dawhenya') || q.includes('tema') || q.includes('magna')) {
      return 'Eastgate Academy is located:\n\n📍 Near Magna Terris Estates, New Dawhenya, Tema, Greater Accra, Ghana\n🗺️ Digital Address: GN-0295-0876\n📮 Postal Address: P.O. Box BT 212, Tema\n\nYou can find us on the map on our Contact page at eastgateacademy.netlify.app/contact.html or call us on 0303962585 for specific directions.';
    }

    if (q.includes('enroll') || q.includes('admission') || q.includes('apply') || q.includes('join') || q.includes('register') || q.includes('start') || q.includes('new student')) {
      if (q.includes('age') || q.includes('old') || q.includes('years')) {
        return 'Eastgate Academy welcomes children from age 4 starting in our Creche or KG 1 programme. We offer education all the way through to Junior High School (JHS). If your child is school age they are welcome to apply!';
      }
      if (q.includes('document') || q.includes('requirement') || q.includes('need') || q.includes('bring')) {
        return 'To enroll your child at Eastgate Academy you will need:\n\n📄 Birth certificate\n💉 Immunization card\n📸 Passport photograph\n📋 Previous school report card (if applicable)\n📝 Completed admission/registration form\n\nContact us at info@eastgateschool.com or call 0303962585 to begin the process.';
      }
      if (q.includes('form') || q.includes('registration')) {
        return 'Admission and registration forms are available at the school office. Visit us at Near Magna Terris Estates, New Dawhenya, Tema or contact us on 0303962585 or info@eastgateschool.com to request a form.';
      }
      if (q.includes('exam') || q.includes('test') || q.includes('entrance')) {
        return 'There is no formal entrance exam for Creche, Nursery, Kindergarten or Basic school levels. For JHS please contact the school for more information at info@eastgateschool.com or call 0303962585.';
      }
      if (q.includes('transfer') || q.includes('mid term') || q.includes('change school')) {
        return 'Yes! We accept transfer students throughout the year subject to availability. Please contact us at info@eastgateschool.com or call 0303962585 with your child\'s previous school report card to begin the process.';
      }
      return 'To enroll your child at Eastgate Academy:\n\n1️⃣ Contact us at info@eastgateschool.com or call 0303962585\n2️⃣ Schedule a school visit or tour\n3️⃣ Collect and complete the admission form\n4️⃣ Submit required documents\n\nWe welcome children from Creche all the way to JHS. Enrollment is open throughout the year subject to availability!';
    }

    if (q.includes('portal') || q.includes('login') || q.includes('log in') || q.includes('sign in') || q.includes('account') || q.includes('online')) {
      if (q.includes('forgot') || q.includes('forget') || q.includes('lost') || q.includes('password') || q.includes('reset')) {
        return 'If you have forgotten your login details please contact the school at info@eastgateschool.com or call 0303962585. The admin will reset your access.\n\nRemember:\n• Username: Your child\'s Student ID\n• Password: Your child\'s last name';
      }
      if (q.includes('result') || q.includes('grade') || q.includes('score') || q.includes('mark')) {
        return 'To view your child\'s results log in to the parent portal at eastgateacademy.netlify.app/login.html\n\n• Username: Your child\'s Student ID\n• Password: Your child\'s last name\n\nThen click "Results" in the sidebar.';
      }
      if (q.includes('attendance')) {
        return 'To check your child\'s attendance log in to the parent portal at eastgateacademy.netlify.app/login.html\n\n• Username: Your child\'s Student ID\n• Password: Your child\'s last name\n\nThen click "Attendance" in the sidebar.';
      }
      return 'The Eastgate Academy parent portal is at:\n🌐 eastgateacademy.netlify.app/login.html\n\n• Username: Your child\'s Student ID\n• Password: Your child\'s last name\n\nThrough the portal you can:\n✅ View results\n✅ Check attendance\n✅ Pay fees\n✅ Read announcements\n✅ Message teachers';
    }

    if (q.includes('hour') || q.includes('time') || q.includes('open') || q.includes('close') || q.includes('start') || q.includes('finish') || q.includes('end')) {
      return 'Eastgate Academy is open:\n\n🕐 Monday to Friday: 7:30am - 3:00pm\n🏢 Office hours: 7:30am - 4:00pm\n❌ Saturday: Closed\n❌ Sunday: Closed\n\nStudents are expected to arrive by 7:30am.';
    }

    if (q.includes('subject') || q.includes('curriculum') || q.includes('teach') || q.includes('learn') || q.includes('study') || q.includes('course') || q.includes('french') || q.includes('computing')) {
      if (q.includes('jhs') || q.includes('junior high')) {
        return 'At JHS level Eastgate Academy teaches:\n• English Language\n• Mathematics\n• Science\n• Social Studies\n• Computing\n• Career Technology\n• Creative Arts and Design\n• Religious and Moral Education\n• Ghanaian Language\n• French\n• Physical and Health Education';
      }
      if (q.includes('basic 4') || q.includes('basic 5') || q.includes('basic 6') || q.includes('upper')) {
        return 'At Basic 4 to Basic 6 Eastgate Academy teaches:\n• English Language\n• Mathematics\n• Science\n• History\n• Creative Arts\n• Religious and Moral Education\n• Ghanaian Language\n• Physical Education\n• French\n• Computing\n\nFrench and Computing are introduced from Basic 4!';
      }
      if (q.includes('kg') || q.includes('kindergarten')) {
        return 'At Kindergarten level (KG 1 and KG 2) we focus on:\n• Language and Literacy\n• Numeracy\n• Creative Arts\n• Physical Development\n• Psychomotor Skills\n\nAll through play-based and hands-on activities!';
      }
      if (q.includes('creche') || q.includes('nursery') || q.includes('pre')) {
        return 'At Creche and Pre-Nursery level we focus on:\n• Pre-Literacy\n• Pre-Numeracy\n• Language Development\n• Creative Play\n• Music and Movement\n• Social Skills\n• Physical Development';
      }
      return 'Eastgate Academy offers a complete curriculum from Creche to JHS following the Ghana Education Service standards. Highlights include:\n\n📚 French introduced from Basic 4\n💻 Computing from Basic 4\n🎓 Career Technology at JHS\n🌍 Ghanaian Language at all levels\n\nVisit our Academics page for the full breakdown!';
    }

    if (q.includes('teacher') || q.includes('staff') || q.includes('head') || q.includes('principal') || q.includes('director') || q.includes('who teaches')) {
      return 'Eastgate Academy has a dedicated team of 18 staff members including:\n\n👔 Mr. Joseph Apana — Director, Admin & Finance\n👔 Mr. Frank Sontim-Buor — Director, Academics\n🏫 Mr. Andrews Amanor — Head of School\n👩‍🏫 Ms. Mercy Baani — Assistant Head & KG 1\n\nAnd experienced class teachers from Creche all the way to JHS. Visit our Staff page to meet the full team!';
    }

    if (q.includes('term') || q.includes('holiday') || q.includes('vacation') || q.includes('break') || q.includes('calendar') || q.includes('resum')) {
      return 'Eastgate Academy runs three terms per academic year:\n\n📅 Term 1: September to December\n📅 Term 2: January to April\n📅 Term 3: April to July\n🌴 Long vacation: July to September\n\nFor specific term dates contact us at info@eastgateschool.com or call 0303962585.';
    }

    if (q.includes('transport') || q.includes('bus') || q.includes('pick up') || q.includes('drop') || q.includes('route')) {
      return 'Eastgate Academy offers a school bus service on selected routes in the Tema and New Dawhenya area. Transport fees are paid termly. Please contact us on 0303962585 or email info@eastgateschool.com for current route information and availability.';
    }

    if (q.includes('tour') || q.includes('visit') || q.includes('come') || q.includes('see the school') || q.includes('open house')) {
      return 'We would love to welcome you to Eastgate Academy! 😊\n\nTo schedule a visit:\n📞 Call: 0303962585\n📧 Email: info@eastgateschool.com\n🌐 Contact form: eastgateacademy.netlify.app/contact.html\n\nWe are located near Magna Terris Estates, New Dawhenya, Tema.';
    }

    if (q.includes('whatsapp') || q.includes('fraud') || q.includes('scam') || q.includes('fake') || q.includes('suspicious') || q.includes('someone asking') || q.includes('requested payment')) {
      return '⚠️ IMPORTANT SECURITY NOTICE:\n\nEastgate Academy will NEVER request fees via:\n❌ WhatsApp\n❌ Phone call\n❌ Text message\n\nAll official payments are made through:\n✅ Parent portal only\n✅ School accounts office\n✅ Zenith Bank — Account: 6010322944\n\nIf you receive a suspicious payment request call us immediately on 0303962585. Every official payment has a unique reference number.';
    }

    if (q.includes('contact') || q.includes('email') || q.includes('call') || q.includes('phone') || q.includes('reach') || q.includes('speak') || q.includes('number')) {
      return 'You can reach Eastgate Academy through:\n\n📞 Phone: 0303962585\n📧 Email: info@eastgateschool.com\n📍 Location: Near Magna Terris Estates, New Dawhenya, Tema\n🗺️ Digital Address: GN-0295-0876\n🌐 Website: eastgateacademy.netlify.app/contact.html\n\nOffice hours: Monday to Friday 7:30am to 4:00pm';
    }

    if (q.includes('about') || q.includes('history') || q.includes('founded') || q.includes('established') || q.includes('when') || q.includes('how long') || q.includes('old is')) {
      return 'Eastgate Academy was founded in February 2023 near Magna Terris Estates, New Dawhenya, Tema, Ghana. We are a private co-educational school offering education from Creche all the way to Junior High School.\n\nOur tagline is "Nurturing Future Leaders" and we are committed to providing quality education in a safe, supportive and inspiring environment.';
    }

    if (q.includes('uniform') || q.includes('wear') || q.includes('dress') || q.includes('cloth')) {
      return 'Eastgate Academy has an official school uniform — a white shirt with a red striped tie and red shorts for boys and red skirt for girls. For more details please contact us at info@eastgateschool.com or call 0303962585 or visit the school office.';
    }

    if (q.includes('hello') || q.includes('hi') || q.includes('good morning') || q.includes('good afternoon') || q.includes('hey') || q.includes('greetings')) {
      return 'Hello! Welcome to Eastgate Academy\'s AI Assistant! 😊\n\nI can help you with questions about:\n🏫 Admissions and enrollment\n💰 School fees and payments\n📚 Classes and subjects\n👨‍👩‍👧 Parent portal access\n📍 Location and directions\n\nWhat would you like to know?';
    }

    if (q.includes('thank') || q.includes('thanks') || q.includes('appreciate') || q.includes('helpful')) {
      return 'You\'re very welcome! 😊 It\'s a pleasure helping you. If you have any more questions feel free to ask. We look forward to welcoming you to the Eastgate Academy family! 🏫';
    }

    return 'Thank you for your question! For the most accurate and up to date information please contact us directly:\n\n📞 Phone: 0303962585\n📧 Email: info@eastgateschool.com\n🌐 Website: eastgateacademy.netlify.app/contact.html\n\nOur team is available Monday to Friday from 7:30am to 4:00pm and will be happy to help you! 😊';
  }

});