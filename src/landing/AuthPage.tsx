import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Link } from "@/routing/Link";
import { ROUTES, navigate } from "@/routing/router";
import { useAuthStore } from "@/store/authStore";
import { LandingShell } from "./components/LandingShell";
import { auth } from "./content";

type Mode = "signin" | "signup";
type Errors = { email?: string; password?: string };

const MIN_PASSWORD_LENGTH = 6; // Supabase's default minimum

function validate(email: string, password: string, mode: Mode): Errors {
  const errors: Errors = {};
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  else if (mode === "signup" && password.length < MIN_PASSWORD_LENGTH)
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  return errors;
}

/** A sign-in that failed at Google or Supabase comes back with the reason in the address. */
function readReturnError() {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const reason =
    query.get("error_description") ?? hash.get("error_description") ?? query.get("error") ?? hash.get("error");
  return reason ? `Sign-in did not complete: ${reason}` : null;
}

/** Sign in and sign up share one page; the address (/signin or /signup) picks the mode. */
export function AuthPage({ mode }: { mode: Mode }) {
  const copy = mode === "signup" ? auth.signUp : auth.signIn;
  const status = useAuthStatus();
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const signInWithPassword = useAuthStore((state) => state.signInWithPassword);
  const signUpWithPassword = useAuthStore((state) => state.signUpWithPassword);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [problem, setProblem] = useState<string | null>(readReturnError);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<"password" | "google" | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Switching between sign in and sign up keeps what was typed but clears the messages.
  const [shownMode, setShownMode] = useState(mode);
  if (shownMode !== mode) {
    setShownMode(mode);
    setErrors({});
    setProblem(null);
    setNotice(null);
  }

  // Signed in already, or just now: go to the chat app.
  useEffect(() => {
    if (status === "authenticated") navigate(ROUTES.app, { replace: true });
  }, [status]);

  // The reason for a failed return has been read into `problem`; tidy it out of the address.
  useEffect(() => {
    if (window.location.search || window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(email, password, mode);
    setErrors(found);
    setProblem(null);
    setNotice(null);
    if (found.email) return emailRef.current?.focus();
    if (found.password) return passwordRef.current?.focus();

    setBusy("password");
    if (mode === "signup") {
      const result = await signUpWithPassword(email.trim(), password);
      if (result.error) setProblem(result.error);
      else if (result.needsConfirmation) {
        setNotice(auth.confirmSent);
        setPassword("");
      }
    } else {
      const error = await signInWithPassword(email.trim(), password);
      if (error) setProblem(error);
    }
    // On success the auth store reports "authenticated" and the effect above opens the chat app.
    setBusy(null);
  };

  const handleGoogle = async () => {
    setProblem(null);
    setNotice(null);
    setBusy("google");
    try {
      await signInWithGoogle(); // leaves for Google; the return is handled by routeAuthReturn()
    } catch {
      setProblem("Could not start Google sign-in. Try again.");
    }
    setBusy(null);
  };

  return (
    <LandingShell page="auth" title={copy.pageTitle}>
      <section className="auth" id="top">
        <div className="auth-plate">
          <div className="plate" aria-hidden="true" />
          <div className="hero-box">
            <h1>{copy.title}</h1>
            <div className="hero-row">
              <p>{auth.lead}</p>
            </div>
          </div>
        </div>

        <div className="auth-panel">
          <nav className="auth-switch" aria-label="Sign in or sign up">
            <Link to={ROUTES.signIn} aria-current={mode === "signin" ? "page" : undefined}>
              Sign in
            </Link>
            <Link to={ROUTES.signUp} aria-current={mode === "signup" ? "page" : undefined}>
              Sign up
            </Link>
          </nav>

          {problem && (
            <p className="auth-message auth-problem" role="alert">
              {problem}
            </p>
          )}
          {notice && (
            <p className="auth-message" role="status">
              {notice}
            </p>
          )}

          <form className="form" noValidate onSubmit={handleSubmit}>
            <div className={errors.email ? "field has-error" : "field"}>
              <label htmlFor="auth-email">Email</label>
              <input
                ref={emailRef}
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby="auth-email-error"
              />
              <p className="error" id="auth-email-error" aria-live="polite">
                {errors.email}
              </p>
            </div>

            <div className={errors.password ? "field has-error" : "field"}>
              <label htmlFor="auth-password">Password</label>
              <div className="auth-password">
                <input
                  ref={passwordRef}
                  id="auth-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                  minLength={mode === "signup" ? MIN_PASSWORD_LENGTH : undefined}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby="auth-password-help auth-password-error"
                />
                <button
                  className="auth-reveal"
                  type="button"
                  aria-pressed={showPassword}
                  aria-controls="auth-password"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p className="help" id="auth-password-help">
                {mode === "signup" ? auth.passwordHelp : ""}
              </p>
              <p className="error" id="auth-password-error" aria-live="polite">
                {errors.password}
              </p>
            </div>

            <button className="btn btn-coral" type="submit" disabled={busy !== null}>
              {busy === "password" ? copy.busy : copy.submit}
              <ArrowRight className="ic" size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </form>

          <p className="auth-or">
            <span>or</span>
          </p>

          <button className="btn btn-line" type="button" disabled={busy !== null} onClick={handleGoogle}>
            <span className="auth-g" aria-hidden="true">
              G
            </span>
            {auth.google}
          </button>

          <p className="auth-alt">
            {copy.switchPrompt}{" "}
            <Link className="text-link" to={mode === "signup" ? ROUTES.signIn : ROUTES.signUp}>
              {copy.switchLink}
            </Link>
          </p>
        </div>
      </section>
    </LandingShell>
  );
}
