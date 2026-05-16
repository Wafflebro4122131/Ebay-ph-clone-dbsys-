import { useState } from 'react';

function AuthForm({ mode, onSwitchMode, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === 'signup';

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const module = await import('../services/auth.js');
      const action = isSignup ? module.signup : module.login;
      const payload = isSignup
        ? { firstName, lastName, email, password, phone }
        : { email, password };
      const user = await action(payload);
      onSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-panel">
      <div className="auth-card">
        <div className="auth-heading">
          <h2>{isSignup ? 'Create your account' : 'Sign in to your account'}</h2>
          <p>{isSignup ? 'Join the marketplace and start selling.' : 'Access your listings and orders.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && (
            <div className="auth-name-row">
              <label>
                First name
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </label>
              <label>
                Last name
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </label>
            </div>
          )}

          <label>
            Email address
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          {isSignup && (
            <label>
              Phone number
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
          )}

          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          {error && <div className="auth-error">{error}</div>}
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Working…' : isSignup ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="auth-switch">
          <span>{isSignup ? 'Already have an account?' : "Don't have an account?"}</span>
          <button type="button" className="link-button" onClick={onSwitchMode}>
            {isSignup ? 'Sign in' : 'Create account'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
