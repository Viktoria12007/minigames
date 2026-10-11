import { validateAuthFields } from './validation';

describe('validateAuthFields', () => {
  it('requires a valid email and password when logging in', () => {
    expect(validateAuthFields('login', { email: 'wrong', password: '' })).toEqual({
      email: 'Enter a valid email address.',
      password: 'Password is required.',
    });
  });

  it('validates all registration-specific fields', () => {
    expect(
      validateAuthFields('register', {
        email: 'player@example.com',
        password: 'password',
        username: 'player name',
        confirmPassword: 'different',
      }),
    ).toEqual({
      password: 'Use an uppercase letter, a number, and a special character.',
      username: 'Start with an uppercase English letter; use letters and digits only.',
      confirmPassword: 'Passwords do not match.',
    });
  });

  it('accepts complete registration details', () => {
    expect(
      validateAuthFields('register', {
        email: 'player@example.com',
        password: 'Pass1!',
        username: 'Player1',
        confirmPassword: 'Pass1!',
      }),
    ).toEqual({});
  });
});
