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

  // ---- Complete School Knowledge Base ----
  const SCHOOL_CONTEXT = `You are a friendly, warm and professional AI assistant for Eastgate Academy, a premier primary school located in Dawenya, Tema, Ghana. Your name is "Eastgate Assistant".

SCHOOL INFORMATION:
- Name: Eastgate Academy
- Location: Dawenya, Tema, Greater Accra, Ghana
- Founded: 2017
- Tagline: Nurturing Future Leaders
- Type: Private Primary School for children aged 4-12
- Email: eastgateacademy@protonmail.com
- Website: eastgateacademy.netlify.app
- Type of school: Private, co-educational primary school

SCHOOL HOURS:
- Monday to Friday: 7:30am - 3:00pm
- Saturday: Closed
- Sunday: Closed
- Office hours: Monday to Friday 7:30am - 4:00pm

LEVELS AND CLASSES:
- Kindergarten: KG 1 and KG 2 (ages 4-5)
- Lower Primary: Class 1, Class 2, Class 3 (ages 6-8)
- Upper Primary: Class 4, Class 5, Class 6 (ages 9-12)
- Total of 8 class levels

SUBJECTS TAUGHT:
- English Language
- Mathematics
- Integrated Science
- Social Studies
- ICT (Computer Studies)
- Religious and Moral Education
- Creative Arts
- French (upper primary)
- Physical Education

ACADEMIC CALENDAR:
- Three terms per academic year
- Term 1: September to December
- Term 2: January to April
- Term 3: April to July
- Long vacation: July to September

ADMISSIONS:
- Children from age 4 can be enrolled in KG 1
- Documents required: Birth certificate, immunization card, passport photo, previous school report (if applicable)
- No formal entrance exam for KG and lower primary
- Contact school to schedule a visit before enrollment
- Email eastgateacademy@protonmail.com to begin the process
- Enrollment is open throughout the year subject to availability

FEES INFORMATION:
- School fees are paid termly
- Fee structure is available on the fees page of the website
- Fees can be paid through the parent portal online
- Fees can also be paid at the school accounts office
- Payment methods: MTN Mobile Money, Vodafone Cash, AirtelTigo Money, Bank transfer, Cash at school office
- Installment plans are available for families who need flexibility
- Sibling discount of 10% is available for second child enrolled
- Financial aid and scholarships are available for deserving students
- Contact the school accounts office for fee structure details

PARENT PORTAL:
- Access at: eastgateacademy.netlify.app/login.html
- Parents log in using their child's Student ID as username
- Password is the child's last name
- Parents can view academic results on the portal
- Parents can check attendance records
- Parents can pay school fees online
- Parents can read school announcements
- Parents can send and receive messages from teachers
- If you forget your login details contact the school

TEACHER PORTAL:
- Teachers log in using their Staff ID
- Teachers use a password assigned by the admin
- Teachers can upload assignments
- Teachers can enter student results
- Teachers can take attendance
- Teachers can send messages to parents

EXTRACURRICULAR ACTIVITIES:
- Sports: Football, Athletics, Table Tennis
- Clubs: Science Club, Mathematics Club, Debate Club, Art Club
- Annual Sports Day event
- Inter-school competitions
- Cultural and social events throughout the year

FACILITIES:
- Well equipped classrooms
- Computer laboratory
- School library
- Sports field
- Safe and secure school environment

SECURITY AND FRAUD WARNING:
- Eastgate Academy will NEVER request fees via WhatsApp
- Eastgate Academy will NEVER request fees via phone call
- Eastgate Academy will NEVER request fees via text message
- All payments are made exclusively through the official parent portal or at the school accounts office
- Every payment generates a unique reference number — always save it as proof
- If anyone contacts you requesting payment outside these channels report it immediately to the school
- Call the school immediately if you receive any suspicious payment requests

TRANSPORT:
- School bus service is available on selected routes
- Transport fees are paid termly
- Contact the school for route information and availability

CONTACT THE SCHOOL:
- Email: eastgateacademy@protonmail.com
- Website: eastgateacademy.netlify.app/contact.html
- Visit: Dawenya, Tema, Greater Accra, Ghana
- You can also book a tour through the website contact page

RULES FOR YOUR RESPONSES:
- Always be warm, friendly and encouraging
- Keep answers concise and easy to understand
- If you are not sure about something say "Please contact us at eastgateacademy@protonmail.com for accurate information"
- Never make up fees amounts or specific dates you are not sure about
- Always encourage parents to visit the school or contact directly for sensitive matters
- Respond only in English
- End responses with a helpful follow up offer when appropriate`;

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
        <div class="ea-ai-message-avatar"><i class="fas fa-robot"></i></div>
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
        <div class="ea-ai-message-avatar"><i class="fas fa-robot"></i></div>
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
      <div class="ea-ai-message-avatar"><i class="fas fa-robot"></i></div>
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

    // First try Claude API
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

    // If API failed use smart fallback
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

    // FEES
    if (q.includes('fee') || q.includes('cost') || q.includes('how much') || q.includes('price') || q.includes('tuition') || q.includes('pay') || q.includes('ghs') || q.includes('money')) {
      if (q.includes('installment') || q.includes('part payment') || q.includes('split')) {
        return 'Yes! Eastgate Academy offers flexible installment payment plans for families who need it. Please visit the school accounts office or contact us at eastgateacademy@protonmail.com to arrange an installment plan before the term begins.';
      }
      if (q.includes('sibling') || q.includes('discount') || q.includes('two children') || q.includes('second child')) {
        return 'Great news! Eastgate Academy offers a 10% sibling discount for the second child enrolled. Contact us at eastgateacademy@protonmail.com for more details.';
      }
      if (q.includes('scholarship') || q.includes('financial aid') || q.includes('support') || q.includes('afford')) {
        return 'Eastgate Academy offers limited scholarships and financial aid for deserving students. Please contact us at eastgateacademy@protonmail.com to find out more and apply.';
      }
      if (q.includes('late') || q.includes('miss') || q.includes('overdue')) {
        return 'If you are experiencing difficulties paying fees on time please contact the school accounts office as soon as possible. We always try to work with families first before taking any action.';
      }
      return 'School fees at Eastgate Academy are paid termly. We accept MTN Mobile Money, Vodafone Cash, AirtelTigo Money, bank transfer and cash at the school office. For the current fee structure please visit our Fees page or contact us at eastgateacademy@protonmail.com. You can also pay conveniently through the parent portal.';
    }

    // LOCATION
    if (q.includes('location') || q.includes('where') || q.includes('address') || q.includes('find') || q.includes('directions') || q.includes('map') || q.includes('dawenya') || q.includes('tema')) {
      return 'Eastgate Academy is located in Dawenya, Tema, Greater Accra, Ghana. You can find us on the map on our Contact page at eastgateacademy.netlify.app/contact.html. You are also welcome to call us or email eastgateacademy@protonmail.com for specific directions.';
    }

    // ADMISSIONS AND ENROLLMENT
    if (q.includes('enroll') || q.includes('admission') || q.includes('apply') || q.includes('join') || q.includes('register') || q.includes('start') || q.includes('new student')) {
      if (q.includes('age') || q.includes('old') || q.includes('years')) {
        return 'Eastgate Academy accepts children from age 4 into Kindergarten (KG 1). Our school caters for children up to age 12 in Class 6. If your child is between 4 and 12 years old they are welcome to apply!';
      }
      if (q.includes('document') || q.includes('requirement') || q.includes('need') || q.includes('bring')) {
        return 'To enroll your child at Eastgate Academy you will need:\n• Birth certificate\n• Immunization card\n• Passport photograph\n• Previous school report card (if applicable)\n\nContact us at eastgateacademy@protonmail.com to begin the process.';
      }
      if (q.includes('exam') || q.includes('test') || q.includes('entrance')) {
        return 'There is no formal entrance exam for Kindergarten and Lower Primary. For Upper Primary classes please contact the school for more information at eastgateacademy@protonmail.com.';
      }
      if (q.includes('transfer') || q.includes('mid term') || q.includes('change school')) {
        return 'Yes! We accept transfer students throughout the year subject to availability. Please contact us at eastgateacademy@protonmail.com with your child\'s previous school report card to begin the process.';
      }
      if (q.includes('waiting list') || q.includes('full') || q.includes('space') || q.includes('available')) {
        return 'For current availability please contact us directly at eastgateacademy@protonmail.com. We will let you know if there are spaces available in your child\'s class level.';
      }
      return 'To enroll your child at Eastgate Academy:\n1. Email us at eastgateacademy@protonmail.com\n2. Schedule a school visit or tour\n3. Submit the required documents\n4. Complete the enrollment form\n\nWe welcome children from age 4 to 12. Enrollment is open throughout the year subject to availability!';
    }

    // PARENT PORTAL
    if (q.includes('portal') || q.includes('login') || q.includes('log in') || q.includes('sign in') || q.includes('account') || q.includes('online')) {
      if (q.includes('forgot') || q.includes('forget') || q.includes('lost') || q.includes('password') || q.includes('reset')) {
        return 'If you have forgotten your login details please contact the school directly at eastgateacademy@protonmail.com. The school admin will reset your access. Remember your username is your child\'s Student ID and your password is your child\'s last name.';
      }
      if (q.includes('result') || q.includes('grade') || q.includes('score') || q.includes('mark')) {
        return 'To view your child\'s results log in to the parent portal at eastgateacademy.netlify.app/login.html using your child\'s Student ID and their last name as the password. Click on "View Child Results" in the sidebar.';
      }
      if (q.includes('attendance')) {
        return 'You can check your child\'s attendance record through the parent portal at eastgateacademy.netlify.app/login.html. Log in and click "Attendance" in the sidebar to see a full record of days present, absent and late.';
      }
      return 'The Eastgate Academy parent portal is available at eastgateacademy.netlify.app/login.html\n\n• Username: Your child\'s Student ID\n• Password: Your child\'s last name\n\nThrough the portal you can view results, check attendance, pay fees, read announcements and message teachers.';
    }

    // SCHOOL HOURS AND TIMING
    if (q.includes('hour') || q.includes('time') || q.includes('open') || q.includes('close') || q.includes('start') || q.includes('finish') || q.includes('end')) {
      return 'Eastgate Academy is open:\n• Monday to Friday: 7:30am - 3:00pm\n• Office hours: 7:30am - 4:00pm\n• Saturday: Closed\n• Sunday: Closed\n\nStudents are expected to arrive by 7:30am.';
    }

    // SUBJECTS AND CURRICULUM
    if (q.includes('subject') || q.includes('curriculum') || q.includes('teach') || q.includes('learn') || q.includes('study') || q.includes('course')) {
      return 'At Eastgate Academy we teach:\n• English Language\n• Mathematics\n• Integrated Science\n• Social Studies\n• ICT (Computer Studies)\n• Religious and Moral Education\n• Creative Arts\n• French (Upper Primary)\n• Physical Education\n\nWe follow the Ghana Education Service curriculum.';
    }

    // TERMS AND HOLIDAYS
    if (q.includes('term') || q.includes('holiday') || q.includes('vacation') || q.includes('break') || q.includes('calendar') || q.includes('resum')) {
      return 'Eastgate Academy runs three terms per academic year:\n• Term 1: September to December\n• Term 2: January to April\n• Term 3: April to July\n• Long vacation: July to September\n\nFor specific term dates please contact us at eastgateacademy@protonmail.com.';
    }

    // EXTRACURRICULAR
    if (q.includes('sport') || q.includes('activity') || q.includes('club') || q.includes('extra') || q.includes('football') || q.includes('after school')) {
      return 'Eastgate Academy offers a range of extracurricular activities including:\n• Football, Athletics and Table Tennis\n• Science Club and Mathematics Club\n• Debate Club and Art Club\n• Annual Sports Day\n• Inter-school competitions\n• Cultural events throughout the year\n\nAfter school care is also available until 5:30pm for an additional termly fee.';
    }

    // FACILITIES
    if (q.includes('facilit') || q.includes('library') || q.includes('lab') || q.includes('computer') || q.includes('field') || q.includes('classroom') || q.includes('building')) {
      return 'Eastgate Academy\'s facilities include:\n• Well equipped modern classrooms\n• Computer/ICT laboratory\n• School library with books for all levels\n• Sports field\n• Safe and secure school environment\n\nWe invite you to schedule a tour to see our facilities in person!';
    }

    // TRANSPORT
    if (q.includes('transport') || q.includes('bus') || q.includes('pick up') || q.includes('drop') || q.includes('route')) {
      return 'Eastgate Academy offers a school bus service on selected routes in the Tema area. Transport fees are paid termly. Please contact us at eastgateacademy@protonmail.com for current route information and availability.';
    }

    // TOUR
    if (q.includes('tour') || q.includes('visit') || q.includes('come') || q.includes('see the school') || q.includes('open house')) {
      return 'We would love to welcome you to Eastgate Academy! You can:\n• Book a personalised family tour at your convenience\n• Attend our monthly Open House event\n\nTo schedule a visit please email us at eastgateacademy@protonmail.com or fill in the contact form at eastgateacademy.netlify.app/contact.html.';
    }

    // FRAUD AND SECURITY
    if (q.includes('whatsapp') || q.includes('fraud') || q.includes('scam') || q.includes('fake') || q.includes('suspicious') || q.includes('someone') || q.includes('asking') || q.includes('requested')) {
      return '⚠️ IMPORTANT SECURITY NOTICE:\n\nEastgate Academy will NEVER request fees via WhatsApp, phone call or text message.\n\nAll payments are made exclusively through:\n• The official parent portal\n• The school accounts office\n\nIf anyone contacts you requesting payment outside these channels please report it to the school immediately at eastgateacademy@protonmail.com. Every official payment generates a unique reference number.';
    }

    // SAFETY
    if (q.includes('safe') || q.includes('security') || q.includes('protect') || q.includes('bully') || q.includes('welfare')) {
      return 'The safety and welfare of every child is our top priority at Eastgate Academy. Our school has a secure environment with proper supervision throughout the school day. If you have any specific safety concerns please contact us at eastgateacademy@protonmail.com.';
    }

    // CONTACT
    if (q.includes('contact') || q.includes('email') || q.includes('call') || q.includes('phone') || q.includes('reach') || q.includes('speak') || q.includes('talk')) {
      return 'You can reach Eastgate Academy through:\n• Email: eastgateacademy@protonmail.com\n• Contact form: eastgateacademy.netlify.app/contact.html\n• Visit us: Dawenya, Tema, Greater Accra, Ghana\n• Office hours: Monday to Friday 7:30am - 4:00pm';
    }

    // ABOUT THE SCHOOL
    if (q.includes('about') || q.includes('history') || q.includes('founded') || q.includes('established') || q.includes('when') || q.includes('how long') || q.includes('old is')) {
      return 'Eastgate Academy was founded in 2017 in Dawenya, Tema, Ghana. We are a private co-educational primary school dedicated to nurturing future leaders. Our motto is "Nurturing Future Leaders" and we are committed to providing quality education in a safe and inspiring environment.';
    }

    // PRINCIPAL OR HEADMASTER
    if (q.includes('principal') || q.includes('headmaster') || q.includes('head teacher') || q.includes('director') || q.includes('head of school') || q.includes('in charge')) {
      return 'For information about our school leadership please contact us directly at eastgateacademy@protonmail.com or visit the school. We would be happy to introduce you to our team!';
    }

    // UNIFORM
    if (q.includes('uniform') || q.includes('wear') || q.includes('dress') || q.includes('cloth')) {
      return 'Eastgate Academy has an official school uniform. For details about the uniform requirements please contact us at eastgateacademy@protonmail.com or visit the school.';
    }

    // GREETING
    if (q.includes('hello') || q.includes('hi') || q.includes('good morning') || q.includes('good afternoon') || q.includes('hey') || q.includes('greetings')) {
      return 'Hello! Welcome to Eastgate Academy\'s AI Assistant! 😊 I\'m here to help you with any questions about our school. You can ask me about admissions, fees, the parent portal, school hours and much more. What would you like to know?';
    }

    // THANK YOU
    if (q.includes('thank') || q.includes('thanks') || q.includes('appreciate') || q.includes('helpful')) {
      return 'You\'re very welcome! 😊 It\'s a pleasure helping you. If you have any more questions feel free to ask. We look forward to welcoming you to the Eastgate Academy family! 🏫';
    }

    // DEFAULT
    return 'Thank you for your question! For the most accurate and up to date information please contact us directly:\n\n📧 Email: eastgateacademy@protonmail.com\n🌐 Website: eastgateacademy.netlify.app/contact.html\n\nOur team is available Monday to Friday from 7:30am to 4:00pm and will be happy to help you! 😊';
  }

});