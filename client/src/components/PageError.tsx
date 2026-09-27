type PageErrorProps = {
    title?: string;
    message: string;
    onRetry?: () => void;
};

export function PageError({
    title = "Something needs attention",
    message,
    onRetry,
}: PageErrorProps) {
    return (
        <main className="page-error" role="alert">
            <div className="page-error-card">
                <span className="page-error-mark">!</span>
                <p className="eyebrow">BookEase</p>
                <h1>{title}</h1>
                <p>{message}</p>
                {onRetry && (
                    <button type="button" onClick={onRetry}>
                        Try again
                    </button>
                )}
            </div>
        </main>
    );
}