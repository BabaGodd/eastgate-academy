// ============================================
// EASTGATE ACADEMY — CONTACT FORM
// Saves to Supabase + Sends email via EmailJS
// ============================================

// Initialize EmailJS
emailjs.init('e-n28wP7yr8BsYe2p');

document.addEventListener('DOMContentLoaded', function () {

  const form = document.getElementById('ea-contact-form');
  const submitBtn = document.getElementById('ea-form-submit-btn');
  const submitText = document.getElementById('ea-submit-text');
  const successMsg = document.getElementById('ea-form-success');
  const errorMsg = document.getElementById('ea-form-error-msg');
  const errorText = document.getElementById('ea-form-error-text');

  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('ea-name').value.trim();
    const email = document.getElementById('ea-email').value.trim();
    const phone = document.getElementById('ea-phone').value.trim();
    const subject = document.getElementById('ea-subject').value;
    const message = document.getElementById('ea-message').value.trim();

    // Hide previous messages
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';

    // Validation
    if (!name) {
      showError('Please enter your full name.');
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('Please enter a valid email address.');
      return;
    }

    if (!subject) {
      showError('Please select a subject.');
      return;
    }

    if (!message || message.length < 10) {
      showError('Please enter a message of at least 10 characters.');
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitText.textContent = 'Sending...';
    submitBtn.style.opacity = '0.8';

    try {

      // ---- Step 1: Save to Supabase ----
      const { error: supabaseError } = await supabaseClient
        .from('contacts')
        .insert({
          full_name: name,
          email: email,
          phone: phone || null,
          subject: subject,
          message: message,
          created_at: new Date().toISOString()
        });

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        // Continue even if Supabase fails — still send email
      }

      // ---- Step 2: Send email via EmailJS ----
      await emailjs.send(
        'service_ucii8l5',
        'template_t6yvbug',
        {
          name: name,
          email: email,
          phone: phone || 'Not provided',
          subject: subject,
          message: message,
          time: new Date().toLocaleString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      );

      // ---- Success ----
      successMsg.style.display = 'flex';
      form.reset();

      // Scroll to success message
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (err) {
      console.error('Contact form error:', err);
      showError('Something went wrong. Please try again or call us on 0244 512 123.');
    }

    // Reset button
    submitBtn.disabled = false;
    submitText.textContent = 'Send Message';
    submitBtn.style.opacity = '1';
  });

  function showError(message) {
    errorText.textContent = message;
    errorMsg.style.display = 'flex';
    errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

});