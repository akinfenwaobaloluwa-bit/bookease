import { useEffect, useState, type FormEvent } from "react";
import { ImageUpload } from "./ImageUpload";

type Service = {
    id: number;
    businessId: number;
    name: string;
    description: string | null;
    imageUrl: string | null;
    price: number;
    currency: string;
    durationMinutes: number;
};

type ServiceForm = {
    name: string;
    description: string;
    imageUrl: string;
    price: string;
    durationMinutes: string;
};

const emptyForm: ServiceForm = {
    name: "",
    description: "",
    imageUrl: "",
    price: "",
    durationMinutes: "",
};

export function ServicesManager() {
    const [services, setServices] = useState<Service[]>([]);
    const [form, setForm] = useState<ServiceForm>(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [message, setMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    async function loadServices() {
        const response = await fetch("http://localhost:4000/api/services", {
            credentials: "include",
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to load services.");
        }

        setServices(result);
    }

    useEffect(() => {
        loadServices().catch((error) => {
            setMessage(
                error instanceof Error ? error.message : "Unable to load services."
            );
        });
    }, []);

    function updateField(field: keyof ServiceForm, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function startEditing(service: Service) {
        setEditingId(service.id);
        setForm({
            name: service.name,
            description: service.description || "",
            imageUrl: service.imageUrl || "",
            price: String(service.price),
            durationMinutes: String(service.durationMinutes),
        });
        setMessage("");
    }

    function cancelEditing() {
        setEditingId(null);
        setForm(emptyForm);
    }

    async function submitService(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true);
        setMessage("");

        const payload = {
            name: form.name,
            description: form.description,
            imageUrl: form.imageUrl,
            price: Number(form.price),
            currency: "NGN",
            durationMinutes: Number(form.durationMinutes),
        };

        try {
            const url = editingId
                ? `http://localhost:4000/api/services/${editingId}`
                : "http://localhost:4000/api/services";

            const response = await fetch(url, {
                method: editingId ? "PUT" : "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to save service.");
            }

            setMessage(editingId ? "Service updated." : "Service created.");
            cancelEditing();
            await loadServices();
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Unable to save service."
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function deleteService(serviceId: number) {
        if (!window.confirm("Delete this service?")) return;

        try {
            const response = await fetch(
                `http://localhost:4000/api/services/${serviceId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to delete service.");
            }

            setMessage("Service deleted.");
            await loadServices();
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Unable to delete service."
            );
        }
    }

    return (
        <section className="manager-section">
            <div className="section-heading">
                <p className="eyebrow">Owner area</p>
                <h2>Manage services</h2>
            </div>

            <form onSubmit={submitService} className="service-form">
                <h3>{editingId ? "Edit service" : "Add a service"}</h3>

                <label>
                    Service name
                    <input
                        required
                        value={form.name}
                        onChange={(event) => updateField("name", event.target.value)}
                        placeholder="e.g. Hair Installation"
                    />
                </label>

                <label>
                    Description
                    <textarea
                        value={form.description}
                        onChange={(event) =>
                            updateField("description", event.target.value)
                        }
                        placeholder="Explain what the service includes"
                    />
                </label>

                <ImageUpload
                    label="Service image"
                    currentUrl={form.imageUrl}
                    onUploaded={(url) => updateField("imageUrl", url)}
                />

                <label>
                    Price in naira
                    <input
                        required
                        min="0"
                        type="number"
                        value={form.price}
                        onChange={(event) => updateField("price", event.target.value)}
                    />
                </label>

                <label>
                    Duration in minutes
                    <input
                        required
                        min="1"
                        type="number"
                        value={form.durationMinutes}
                        onChange={(event) =>
                            updateField("durationMinutes", event.target.value)
                        }
                    />
                </label>

                <div className="form-actions">
                    <button disabled={isSaving} type="submit">
                        {isSaving
                            ? "Saving..."
                            : editingId
                                ? "Update service"
                                : "Add service"}
                    </button>

                    {editingId && (
                        <button type="button" onClick={cancelEditing}>
                            Cancel
                        </button>
                    )}
                </div>

                {message && <p role="status">{message}</p>}
            </form>

            <div className="managed-service-list">
                {services.map((service) => (
                    <article className="managed-service-card" key={service.id}>
                        {service.imageUrl && (
                            <img
                                className="managed-service-image"
                                src={`http://localhost:4000${service.imageUrl}`}
                                alt={service.name}
                            />
                        )}

                        <div>
                            <h3>{service.name}</h3>
                            <p>{service.description}</p>
                            <p className="service-meta">
                                ₦{service.price.toLocaleString("en-NG")} · {service.durationMinutes} minutes
                            </p>
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={() => startEditing(service)}>
                                Edit
                            </button>
                            <button type="button" onClick={() => deleteService(service.id)}>
                                Delete
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}