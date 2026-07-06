// ============================================
// EASTGATE ACADEMY — ONLINE ADMISSION FORM
// ============================================

// Initialize EmailJS
emailjs.init('e-n28wP7yr8BsYe2p');

document.addEventListener('DOMContentLoaded', function () {

  const form = document.getElementById('ea-admission-form');
  const submitBtn = document.getElementById('adm-submit-btn');
  const submitText = document.getElementById('adm-submit-text');
  const errorMsg = document.getElementById('adm-error');
  const errorText = document.getElementById('adm-error-text');
  const successMsg = document.getElementById('adm-success');
  const refNumber = document.getElementById('adm-ref-number');

  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';

    // Get values
    const childName = document.getElementById('adm-child-name').value.trim();
    const dob = document.getElementById('adm-dob').value;
    const gender = document.getElementById('adm-gender').value;
    const classApplying = document.getElementById('adm-class').value;
    const prevSchool = document.getElementById('adm-prev-school').value.trim();
    const parentName = document.getElementById('adm-parent-name').value.trim();
    const relationship = document.getElementById('adm-relationship').value;
    const phone = document.getElementById('adm-phone').value.trim();
    const email = document.getElementById('adm-email').value.trim();
    const address = document.getElementById('adm-address').value.trim();
    const heardFrom = document.getElementById('adm-heard-from').value;
    const additional = document.getElementById('adm-additional').value.trim();
    const declaration = document.getElementById('adm-declaration').checked;

    // Validation
    if (!childName) { showError('Please enter the child\'s full name.'); return; }
    if (!dob) { showError('Please enter the child\'s date of birth.'); return; }
    if (!gender) { showError('Please select the child\'s gender.'); return; }
    if (!classApplying) { showError('Please select the class applying for.'); return; }
    if (!parentName) { showError('Please enter the parent or guardian\'s full name.'); return; }
    if (!relationship) { showError('Please select your relationship to the child.'); return; }
    if (!phone) { showError('Please enter a phone number.'); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('Please enter a valid email address.'); return; }
    if (!declaration) { showError('Please tick the declaration checkbox to confirm your information is accurate.'); return; }

    // Show loading
    submitBtn.disabled = true;
    submitText.textContent = 'Submitting...';

    // Generate reference number
    const ref = 'EA-ADM-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 90000 + 10000);
    const submittedDate = new Date().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    try {
      // ---- Step 1: Save to Supabase ----
      const { error } = await supabaseClient
        .from('admissions')
        .insert({
          child_full_name: childName,
          date_of_birth: dob,
          gender: gender,
          class_applying_for: classApplying,
          previous_school: prevSchool || null,
          parent_name: parentName,
          relationship: relationship,
          phone: phone,
          email: email,
          home_address: address || null,
          heard_from: heardFrom || null,
          additional_info: additional || null,
          status: 'Pending'
        });

      if (error) {
        console.error('Supabase error:', error);
        showError('Something went wrong. Please try again or call us on 0303962585.');
        submitBtn.disabled = false;
        submitText.textContent = 'Submit Application';
        return;
      }

      // ---- Step 2: Send email via EmailJS ----
      await emailjs.send(
        'service_ucii8l5',
        'template_31hp5lh',
        {
          child_name: childName,
          dob: dob,
          gender: gender,
          class_applying: classApplying,
          prev_school: prevSchool || 'None',
          parent_name: parentName,
          relationship: relationship,
          phone: phone,
          email: email,
          address: address || 'Not provided',
          heard_from: heardFrom || 'Not specified',
          additional: additional || 'None',
          ref_number: ref,
          submitted_date: submittedDate
        }
      );

      // ---- Success ----
      form.reset();
      refNumber.textContent = '📋 Reference Number: ' + ref;
      successMsg.style.display = 'block';
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (err) {
      console.error('Submission error:', err);
      showError('Something went wrong. Please try again or call us on 0303962585.');
    }

    submitBtn.disabled = false;
    submitText.textContent = 'Submit Application';
  });

  function showError(message) {
    errorText.textContent = message;
    errorMsg.style.display = 'flex';
    errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

});