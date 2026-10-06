export function displayName(value) {
  const name = (value ?? '').normalize('NFC').trim();
  if (!name) return 'YOUR NAME';
  if ([...name].length > 120 || /[\p{Cc}\p{Cf}]/u.test(name)) {
    throw new Error('PUBLIC_DISPLAY_NAME must contain at most 120 characters and no control characters.');
  }
  return name;
}
