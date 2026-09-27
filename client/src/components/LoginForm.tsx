import { useState, type FormEvent } from "react";
import "./LoginForm.css";

type LoginFormProps = {
    onLoggedIn: () => void;
};

export function LoginForm({ onLoggedIn }: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true);
        setMessage("");

        try {
            const response = await fetch("http://localhost:4000/api/auth/login", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to log in.");
            }

            onLoggedIn();
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Unable to log in."
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <main className="animated-login-page">
            <section className="animated-login-card" aria-label="Owner login">
                <div className="login-character-panel">
                    <div className="login-sparkle sparkle-one">✦</div>
                    <div className="login-sparkle sparkle-two">✧</div>

                    <div className="assistant-bubble">
                        {isPasswordFocused
                            ? "Your password is safe with me!"
                            : "Welcome back to BookEase!"}
                    </div>

                    <div
                        className={`booking-assistant ${isPasswordFocused ? "assistant-looking-away" : ""
                            }`}
                        aria-hidden="true"
                    >
                        <div className="assistant-hand assistant-hand-left" />
                        <div className="assistant-hand assistant-hand-right" />
                        <div className="assistant-body">
                            <div className="assistant-face">
                                <span className="assistant-eye assistant-eye-left" />
                                <span className="assistant-eye assistant-eye-right" />
                                <span className="assistant-smile" />
                            </div>
                            <div className="assistant-badge">B</div>
                        </div>
                        <div className="assistant-shadow" />
                    </div>

                    <div className="login-character-copy">
                        <p className="eyebrow">BookEase owner area</p>
                        <h1>Run your bookings beautifully.</h1>
                        <p>
                            Manage your services, customer requests, and opening hours from
                            one calm workspace.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="animated-login-form">
                    <p className="eyebrow">Owner access</p>
                    <h2>Welcome back</h2>
                    <p className="login-form-intro">
                        Log in to continue to your BookEase dashboard.
                    </p>

                    <label htmlFor="owner-email">Email address</label>
                    <input
                        id="owner-email"
                        required
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                    />

                    <label htmlFor="owner-password">Password</label>
                    <input
                        id="owner-password"
                        required
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                    />

                    <button disabled={isSaving} type="submit">
                        {isSaving ? "Logging in..." : "Log in to dashboard"}
                    </button>

                    {message && (
                        <p className="login-error" role="alert">
                            {message}
                        </p>
                    )}
                </form>
            </section>
        </main>
    );
}