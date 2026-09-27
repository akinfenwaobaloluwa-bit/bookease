import { useEffect, useState } from "react";

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

type Booking = {
    id: number;
    businessId: number;
    serviceId: number;
    serviceName: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string | null;
    bookingDate: string;
    startTime: string;
    note: string | null;
    status: BookingStatus;
    createdAt: string;
};

function statusLabel(status: BookingStatus) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export function BookingsManager() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState("");

    async function loadBookings() {
        const response = await fetch(
            "http://localhost:4000/api/owner/bookings",
            {
                credentials: "include",
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to load bookings.");
        }

        setBookings(result);
    }

    useEffect(() => {
        loadBookings()
            .catch((error) => {
                setMessage(
                    error instanceof Error
                        ? error.message
                        : "Unable to load bookings."
                );
            })
            .finally(() => setIsLoading(false));
    }, []);

    async function updateStatus(
        bookingId: number,
        status: BookingStatus
    ) {
        setMessage("");

        try {
            const response = await fetch(
                `http://localhost:4000/api/owner/bookings/${bookingId}/status`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to update booking."
                );
            }

            setMessage("Booking status updated.");
            await loadBookings();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to update booking."
            );
        }
    }

    if (isLoading) {
        return (
            <section className="manager-section">
                Loading bookings...
            </section>
        );
    }

    return (
        <section className="manager-section">
            <div className="section-heading">
                <p className="eyebrow">Owner area</p>
                <h2>Booking requests</h2>
            </div>

            {message && <p role="status">{message}</p>}

            {bookings.length === 0 ? (
                <div className="empty-state">
                    <h3>No bookings yet</h3>
                    <p>New customer requests will appear here.</p>
                </div>
            ) : (
                <div className="booking-list">
                    {bookings.map((booking) => (
                        <article className="booking-card" key={booking.id}>
                            <div className="booking-card-heading">
                                <div>
                                    <p className="eyebrow">
                                        Booking BK-{booking.id}
                                    </p>
                                    <h3>{booking.customerName}</h3>
                                </div>

                                <span
                                    className={`status-badge status-${booking.status}`}
                                >
                                    {statusLabel(booking.status)}
                                </span>
                            </div>

                            <dl className="booking-details">
                                <div>
                                    <dt>Service</dt>
                                    <dd>{booking.serviceName}</dd>
                                </div>

                                <div>
                                    <dt>Requested date</dt>
                                    <dd>{booking.bookingDate}</dd>
                                </div>

                                <div>
                                    <dt>Requested time</dt>
                                    <dd>{booking.startTime}</dd>
                                </div>

                                <div>
                                    <dt>Phone</dt>
                                    <dd>{booking.customerPhone}</dd>
                                </div>

                                {booking.customerEmail && (
                                    <div>
                                        <dt>Email</dt>
                                        <dd>{booking.customerEmail}</dd>
                                    </div>
                                )}

                                {booking.note && (
                                    <div>
                                        <dt>Note</dt>
                                        <dd>{booking.note}</dd>
                                    </div>
                                )}
                            </dl>

                            <div className="booking-actions">
                                <button
                                    type="button"
                                    onClick={() =>
                                        updateStatus(booking.id, "confirmed")
                                    }
                                >
                                    Confirm
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        updateStatus(booking.id, "cancelled")
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        updateStatus(booking.id, "completed")
                                    }
                                >
                                    Mark completed
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
