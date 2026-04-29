// Build a Gmail compose URL with a pre-filled introduction message
// Opens Gmail directly in the browser when clicked
export function buildIntroEmailUrl(currentUser, otherUser) {
  const otherFirstName = otherUser.firstName || otherUser.first_name || 'there';
  const otherRole = otherUser.role;
  const dialect = otherUser.languageInterest || otherUser.dialect_group || 'Chinese dialects';
  const senderName = (currentUser && (currentUser.firstName || currentUser.first_name)) || 'a fellow learner';

  let pitch;
  if (otherRole === 'mentor') {
    pitch = `I noticed you're a ${dialect} mentor on the platform — I'd love to learn from you and pick up some tips to improve my ${dialect}.`;
  } else if (otherRole === 'mentee') {
    pitch = `I see you're learning ${dialect} — happy to share what I know and practice together.`;
  } else {
    pitch = `I see we share an interest in ${dialect} — would love to chat and learn together.`;
  }

  const subject = `Hi ${otherFirstName} — connecting via tiagong.sg`;
  const body = `Hi ${otherFirstName},

I'm ${senderName} — we just connected on tiagong.sg!

${pitch}

Looking forward to chatting and growing the dialect community together.

Best,
${senderName}`;

  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: otherUser.email,
    su: subject,
    body: body,
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
}
