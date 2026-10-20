const env = import.meta.env || {};

const EMAIL_CONFIG = {
  serviceId: env.VITE_EMAILJS_SERVICE_ID || typeof __emailjs_service_id !== 'undefined' ? __emailjs_service_id : '',
  templateId: env.VITE_EMAILJS_TEMPLATE_ID || typeof __emailjs_template_id !== 'undefined' ? __emailjs_template_id : '',
  publicKey: env.VITE_EMAILJS_PUBLIC_KEY || typeof __emailjs_public_key !== 'undefined' ? __emailjs_public_key : '',
  webhookUrl: env.VITE_EMAIL_WEBHOOK_URL || typeof __email_webhook_url !== 'undefined' ? __email_webhook_url : '',
};

export const isEmailServiceConfigured = () => !!(EMAIL_CONFIG.webhookUrl || (EMAIL_CONFIG.serviceId && EMAIL_CONFIG.templateId && EMAIL_CONFIG.publicKey));

export const sendEmail = async ({ to, subject, templateParams = {} }) => {
  if (!to) return { success: false, error: 'No recipient email provided' };

  const payload = {
    to_email: to,
    subject,
    ...templateParams,
  };

  if (EMAIL_CONFIG.webhookUrl) {
    try {
      const response = await fetch(EMAIL_CONFIG.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Webhook failed');
      return { success: true };
    } catch (error) {
      console.error('Webhook email error:', error);
      return { success: false, error: error.message };
    }
  }

  if (typeof emailjs !== 'undefined' && EMAIL_CONFIG.serviceId) {
    try {
      await emailjs.send(EMAIL_CONFIG.serviceId, EMAIL_CONFIG.templateId, payload, EMAIL_CONFIG.publicKey);
      return { success: true };
    } catch (error) {
      console.error('EmailJS error:', error);
      return { success: false, error: error.text || error.message };
    }
  }

  return { success: false, error: 'No email service configured' };
};

export const sendWelcomeEmail = async (alumnus) => {
  return sendEmail({
    to: alumnus.email,
    subject: 'Welcome to SHT Alumni Network!',
    templateParams: {
      name: alumnus.fullName,
      program: alumnus.program,
      year: alumnus.year,
    },
  });
};

export const sendMembershipInvitation = async (alumnus) => {
  return sendEmail({
    to: alumnus.email,
    subject: 'Activate your SHT Alumni Membership - $5/month',
    templateParams: {
      name: alumnus.fullName,
      email: alumnus.email,
      program: alumnus.program,
      year: alumnus.year,
      amount: '$5',
      paymentUrl: typeof window !== 'undefined' ? `${window.location.origin}/?view=payments` : '',
      message: 'Your alumni registration was received. To activate your membership and receive your membership number, please complete the $5/month membership payment.',
    },
  });
};

export const sendMembershipCard = async (alumnus, membershipNumber) => {
  return sendEmail({
    to: alumnus.email,
    subject: `Welcome aboard! Membership No. ${membershipNumber}`,
    templateParams: {
      name: alumnus.fullName,
      email: alumnus.email,
      program: alumnus.program,
      year: alumnus.year,
      membershipNumber,
      amount: '$5',
      message: `Thank you! Your membership payment was received. Your official membership number is ${membershipNumber}.`,
    },
  });
};

export const sendAdminNotification = async (alumnus, adminEmail) => {
  return sendEmail({
    to: adminEmail,
    subject: 'New Alumni Registration Alert',
    templateParams: {
      name: alumnus.fullName,
      email: alumnus.email,
      program: alumnus.program,
      year: alumnus.year,
      employment: alumnus.employment || 'N/A',
      location: alumnus.location || 'N/A',
    },
  });
};

export const sendDeletionConfirmation = async (alumnus, adminEmail) => {
  return sendEmail({
    to: adminEmail,
    subject: 'Alumni Record Deleted',
    templateParams: {
      name: alumnus.fullName,
      email: alumnus.email,
      program: alumnus.program,
    },
  });
};
