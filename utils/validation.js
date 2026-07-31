const NAME_REGEX = /^[A-Za-z][A-Za-z .'-]{0,49}$/;
const MOBILE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOGIN_ID_REGEX = /^[A-Za-z0-9]{8}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6}$/;

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateUserPayload(payload = {}) {
  const address = payload.address || {};
  const normalized = {
    firstName: clean(payload.firstName),
    lastName: clean(payload.lastName),
    mobile: clean(payload.mobile),
    email: clean(payload.email).toLowerCase(),
    address: {
      street: clean(address.street),
      city: clean(address.city),
      state: clean(address.state),
      country: clean(address.country)
    },
    loginId: clean(payload.loginId),
    password: typeof payload.password === 'string' ? payload.password : ''
  };

  const errors = [];

  if (!NAME_REGEX.test(normalized.firstName)) {
    errors.push('First name is required and may contain letters, spaces, apostrophes, periods, or hyphens.');
  }
  if (!NAME_REGEX.test(normalized.lastName)) {
    errors.push('Last name is required and may contain letters, spaces, apostrophes, periods, or hyphens.');
  }
  if (!MOBILE_REGEX.test(normalized.mobile)) {
    errors.push('Mobile number must contain exactly 10 digits.');
  }
  if (!EMAIL_REGEX.test(normalized.email)) {
    errors.push('Please enter a valid email address.');
  }
  if (!normalized.address.street || !normalized.address.city || !normalized.address.state || !normalized.address.country) {
    errors.push('Street, city, state, and country are required.');
  }
  if (!LOGIN_ID_REGEX.test(normalized.loginId)) {
    errors.push('Login ID must be exactly 8 alphanumeric characters.');
  }
  if (!PASSWORD_REGEX.test(normalized.password)) {
    errors.push('Password must be exactly 6 characters and include at least one uppercase letter, one lowercase letter, and one special character.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalized
  };
}

module.exports = {
  EMAIL_REGEX,
  LOGIN_ID_REGEX,
  MOBILE_REGEX,
  NAME_REGEX,
  PASSWORD_REGEX,
  validateUserPayload
};
