export type AuthMode = 'login' | 'register';

export type AuthFields = {
  email: string;
  password: string;
  username?: string;
  confirmPassword?: string;
};

export type AuthErrors = Partial<Record<keyof AuthFields, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[A-Z][A-Za-z0-9]*$/;
const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[!-~]{6,}$/;

export function validateAuthFields(mode: AuthMode, fields: AuthFields): AuthErrors {
  const errors: AuthErrors = {};
  if (!fields.email.trim()) {
      errors.email = 'Email is required.';
  } else if (!emailPattern.test(fields.email.trim())) {
      errors.email = 'Enter a valid email address.';
  }

  if (!fields.password) {
      errors.password = 'Password is required.';
  } else if (fields.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
  } else if (mode === 'register' && !passwordPattern.test(fields.password)) {
    errors.password = 'Use an uppercase letter, a number, and a special character.';
  }

  if (mode === 'register') {
    const username = fields.username?.trim() ?? '';
    if (!username) {
        errors.username = 'Username is required.';
    } else if (username.length < 2 || username.length > 30) {
      errors.username = 'Username must contain 2–30 characters.';
    } else if (!usernamePattern.test(username)) {
      errors.username = 'Start with an uppercase English letter; use letters and digits only.';
    }

    if (!fields.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password.';
    } else if (fields.confirmPassword !== fields.password) {
        errors.confirmPassword = 'Passwords do not match.';
    }
  }
  return errors;
}
