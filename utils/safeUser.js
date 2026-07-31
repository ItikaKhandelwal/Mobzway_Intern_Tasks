function safeUser(user) {
  const value = user && typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete value.passwordHash;
  delete value.__v;
  return value;
}

module.exports = safeUser;
