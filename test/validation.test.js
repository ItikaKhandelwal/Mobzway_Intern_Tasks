const test = require('node:test');
const assert = require('node:assert/strict');
const { validateUserPayload } = require('../utils/validation');

const validPayload = {
  firstName: 'Jatin',
  lastName: 'Agrawal',
  mobile: '9876543210',
  email: 'jatin@example.com',
  address: {
    street: '1 Main Road',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India'
  },
  loginId: 'Jatin123',
  password: 'Abc@12'
};

test('accepts a valid assignment payload', () => {
  const result = validateUserPayload(validPayload);
  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, []);
});

test('rejects invalid mobile, email, login ID, and password', () => {
  const result = validateUserPayload({
    ...validPayload,
    mobile: '123',
    email: 'not-an-email',
    loginId: 'short',
    password: 'abcdef'
  });
  assert.equal(result.isValid, false);
  assert.equal(result.errors.length, 4);
});
