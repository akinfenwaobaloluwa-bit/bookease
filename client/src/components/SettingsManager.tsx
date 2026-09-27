import { useEffect, useState } from "react";
import { ImageUpload } from "./ImageUpload";

type BusinessSettings = {
    id: number;
    name: string;
    description: string | null;
    logoUrl: string | null;
    whatsappNumber: string;
    phone: string | null;
    address: string | null;
    primaryColor: string;
};

type OpeningHour = {
    id: number;
    dayOfWeek: number;
    isOpen: boolean;
    startTime: string;
    endTime: string;
};

const dayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

export function SettingsManager() {
    const [business, setBusiness] = useState<BusinessSettings | null>(null);
    const [hours, setHours] = useState<OpeningHour[]>([]);
    const [message, setMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function loadSettings() {
            try {
                const response = await fetch(
                    "http://localhost:4000/api/settings/business",
                    { credentials: "include" }
                );
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || "Unable to load settings.");
                }

                setBusiness(result.business);
                setHours(result.hours);
            } catch (error) {
                setMessage(
                    error instanceof Error ? error.message : "Unable to load settings."
                );
            }
        }

        loadSettings();
    }, []);

    function updateBusiness(field: keyof BusinessSettings, value: string) {
        setBusiness((current) =>
            current ? { ...current, [field]: value } : current
        );
    }

    function updateHour(
        hourId: number,
        field: keyof OpeningHour,
        value: string | boolean
    ) {
        setHours((current) =>
            current.map((hour) =>
                hour.id === hourId ? { ...hour, [field]: value } : hour
            )
        );
    }

    async function saveBusiness() {
        if (!business) return;

        setIsSaving(true);
        setMessage("");

        try {
            const response = await fetch(
                "http://localhost:4000/api/settings/business",
                {
                    method: "PUT",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: business.name,
                        description: business.description || "",
                        logoUrl: business.logoUrl || "",
                        whatsappNumber: business.whatsappNumber,
                        phone: business.phone || "",
                        address: business.address || "",
                        primaryColor: business.primaryColor,
                    }),
                }
            );
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to save settings.");
            }

            setMessage("Business settings saved.");
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Unable to save settings."
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function saveHour(hour: OpeningHour) {
        setMessage("");

        try {
            const response = await fetch(
                `http://localhost:4000/api/settings/hours/${hour.id}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        dayOfWeek: hour.dayOfWeek,
                        isOpen: hour.isOpen,
                        startTime: hour.startTime,
                        endTime: hour.endTime,
                    }),
                }
            );
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to save opening hours.");
            }

            setMessage(`${dayNames[hour.dayOfWeek - 1]} hours saved.`);
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to save opening hours."
            );
        }
    }

    if (!business) {
        return (
            <section className="manager-section">
                <p>{message || "Loading settings..."}</p>
            </section>
        );
    }

    return (
        <section className="manager-section">
            <div className="section-heading">
                <p className="eyebrow">Owner area</p>
                <h2>Business settings</h2>
            </div>

            <div className="settings-form">
                <ImageUpload
                    label="Business logo"
                    currentUrl={business.logoUrl}
                    onUploaded={(url) => updateBusiness("logoUrl", url)}
                />

                <label>
                    Business name
                    <input
                        value={business.name}
                        onChange={(event) => updateBusiness("name", event.target.value)}
                    />
                </label>

                <label>
                    Description
                    <textarea
                        value={business.description || ""}
                        onChange={(event) =>
                            updateBusiness("description", event.target.value)
                        }
                    />
                </label>

                <label>
                    WhatsApp number
                    <input
                        value={business.whatsappNumber}
                        onChange={(event) =>
                            updateBusiness("whatsappNumber", event.target.value)
                        }
                    />
                </label>

                <label>
                    Phone
                    <input
                        value={business.phone || ""}
                        onChange={(event) => updateBusiness("phone", event.target.value)}
                    />
                </label>

                <label>
                    Address
                    <input
                        value={business.address || ""}
                        onChange={(event) =>
                            updateBusiness("address", event.target.value)
                        }
                    />
                </label>

                <label>
                    Primary color
                    <input
                        type="color"
                        value={business.primaryColor}
                        onChange={(event) =>
                            updateBusiness("primaryColor", event.target.value)
                        }
                    />
                </label>

                <button disabled={isSaving} type="button" onClick={saveBusiness}>
                    {isSaving ? "Saving..." : "Save business settings"}
                </button>
            </div>

            <div className="hours-list">
                <h3>Opening hours</h3>

                {hours.map((hour) => (
                    <div className="hours-row" key={hour.id}>
                        <strong>{dayNames[hour.dayOfWeek - 1]}</strong>

                        <label>
                            <input
                                type="checkbox"
                                checked={hour.isOpen}
                                onChange={(event) =>
                                    updateHour(hour.id, "isOpen", event.target.checked)
                                }
                            />
                            Open
                        </label>

                        <input
                            type="time"
                            value={hour.startTime}
                            disabled={!hour.isOpen}
                            onChange={(event) =>
                                updateHour(hour.id, "startTime", event.target.value)
                            }
                        />

                        <span>to</span>

                        <input
                            type="time"
                            value={hour.endTime}
                            disabled={!hour.isOpen}
                            onChange={(event) =>
                                updateHour(hour.id, "endTime", event.target.value)
                            }
                        />

                        <button type="button" onClick={() => saveHour(hour)}>
                            Save
                        </button>
                    </div>
                ))}
            </div>

            {message && <p role="status">{message}</p>}
        </section>
    );
}