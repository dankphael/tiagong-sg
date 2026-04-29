// Get avatar emoji based on gender and role
export function getAvatar(gender, role) {
  if (gender === 'male' && role === 'mentor') {
    return '👨‍🏫';
  }
  if (gender === 'female' && role === 'mentor') {
    return '👩‍🏫';
  }
  if (gender === 'male' && role === 'mentee') {
    return '👨‍🎓';
  }
  if (gender === 'female' && role === 'mentee') {
    return '👩‍🎓';
  }
  // Fallback for missing gender
  return role === 'mentor' ? '🧑‍🏫' : '🧑‍🎓';
}
