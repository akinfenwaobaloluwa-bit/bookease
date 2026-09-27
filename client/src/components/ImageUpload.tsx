import { useState, type ChangeEvent } from "react";

type ImageUploadProps = {
    label: string;
    currentUrl?: string | null;
    onUploaded: (url: string) => void;
};

export function ImageUpload({
    label,
    currentUrl,
    onUploaded,
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState("");

    async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) return;

        setIsUploading(true);
        setMessage("");

        try {
            const formData = new FormData();
            formData.append("image", file);

            const response = await fetch(
                "http://localhost:4000/api/uploads/image",
                {
                    method: "POST",
                    credentials: "include",
                    body: formData,
                }
            );
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Image upload failed.");
            }

            onUploaded(result.url);
            setMessage("Image uploaded.");
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Image upload failed."
            );
        } finally {
            setIsUploading(false);
        }
    }

    const previewUrl = currentUrl
        ? currentUrl.startsWith("http")
            ? currentUrl
            : `http://localhost:4000${currentUrl}`
        : "";

    return (
        <div className="image-upload">
            <label>
                {label}
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={uploadImage}
                    disabled={isUploading}
                />
            </label>

            {previewUrl && (
                <img
                    className="image-preview"
                    src={previewUrl}
                    alt={`${label} preview`}
                />
            )}

            {message && <p role="status">{message}</p>}
        </div>
    );
}