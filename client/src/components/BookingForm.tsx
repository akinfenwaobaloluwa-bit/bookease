import { useEffect, useState, type FormEvent } from "react";
import { createWhatsAppBookingLink } from "../lib/whatsapp";

type BookingFormProps = {
    businessId: number;
    businessName: string;
    whatsappNumber: string;
    service: {
        id: number;
        name: string;
    };
};

type AvailabilityResponse = {
    date: string;
    slots: string[];
    message: string;
};

export function BookingForm({
    businessId,
    businessName,
    whatsappNumber,
    service,
}: BookingFormProps) {
    const [form, setForm] = useState({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        bookingDate: "",
        startTime: "",
        note: "",
    });
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [availabilityMessage, setAvailabilityMessage] = useState("");
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [message, setMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    function updateField(
        field: keyof typeof form,
        value: string
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
            ...(field === "bookingDate" ? { startTime: "" } : {}),
        }));
    }

    useEffect(() => {
        if (!form.bookingDate) {
            setAvailableSlots([]);
            setAvailabilityMessage("Select a date to see available times.");
            return;
        }

        let cancelled = false;

        async function loadAvailability() {
            setIsLoadingSlots(true);
            setAvailableSlots([]);
            setAvailabilityMessage("");

            try {
                const params = new URLSearchParams({
                    businessId: String(businessId),
                    serviceId: String(service.id),
                    date: form.bookingDate,
                });

                const response = await fetch(
                    `http://localhost:4000/api/availability?${params.toString()}`
                );
                const result = (await response.json()) as AvailabilityResponse;

                if (!response.ok) {
                    throw new Error(
                        result.message || "Unable to check available times."
                    );
                }

                if (!cancelled) {
                    setAvailableSlots(result.slots);
                    setAvailabilityMessage(result.message);
                }
            } catch (error) {
                if (!cancelled) {
                    setAvailabilityMessage(
                        error instanceof Error
                            ? error.message
                            : "Unable to check available times."
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingSlots(false);
                }
            }
        }

        loadAvailability();

        return () => {
            cancelled = true;
        };
    }, [businessId, form.bookingDate, service.id]);

    async function submitBooking(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true);
        setMessage("");

        if (!form.startTime) {
            setMessage("Please select an available time.");
            setIsSaving(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:4000/api/bookings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...form,
                    businessId,
                    serviceId: service.id,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Booking failed.");
            }

            const whatsappLink = createWhatsAppBookingLink({
                phoneNumber: whatsappNumber,
                businessName,
                serviceName: service.name,
                bookingDate: form.bookingDate,
                startTime: form.startTime,
                customerName: form.customerName,
                customerPhone: form.customerPhone,
                note: form.note,
                bookingId: result.bookingId,
            });

            setMessage("Booking saved. Opening WhatsApp...");
            window.location.href = whatsappLink;
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Booking failed."
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <form onSubmit={submitBooking} className="booking-form">
            <h2>Book {service.name}</h2>

            <label>
                Full name
                <input
                    required
                    value={form.customerName}
                    onChange={(event) =>
                        updateField("customerName", event.target.value)
                    }
                />
            </label>

            <label>
                Phone number
                <input
                    required
                    value={form.customerPhone}
                    onChange={(event) =>
                        updateField("customerPhone", event.target.value)
                    }
                />
            </label>

            <label>
                Email address (optional)
                <input
                    type="email"
                    value={form.customerEmail}
                    onChange={(event) =>
                        updateField("customerEmail", event.target.value)
                    }
                />
            </label>

            <label>
                Preferred date
                <input
                    required
                    type="date"
                    value={form.bookingDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(event) =>
                        updateField("bookingDate", event.target.value)
                    }
                />
            </label>

            <label>
                Available time
                <select
                    required
                    value={form.startTime}
                    disabled={isLoadingSlots || availableSlots.length === 0}
                    onChange={(event) =>
                        updateField("startTime", event.target.value)
                    }
                >
                    <option value="">
                        {isLoadingSlots
                            ? "Checking times..."
                            : "Select an available time"}
                    </option>
                    {availableSlots.map((slot) => (
                        <option value={slot} key={slot}>
                            {slot}
                        </option>
                    ))}
                </select>
            </label>

            {availabilityMessage && (
                <p className="availability-message" role="status">
                    {availabilityMessage}
                </p>
            )}

            <label>
                Extra note (optional)
                <textarea
                    value={form.note}
                    onChange={(event) =>
                        updateField("note", event.target.value)
                    }
                />
            </label>

            <button
                type="submit"
                disabled={
                    isSaving || isLoadingSlots || availableSlots.length === 0
                }
            >
                {isSaving ? "Saving booking..." : "Book through WhatsApp"}
            </button>

            {message && <p role="status">{message}</p>}
        </form>
    );
}