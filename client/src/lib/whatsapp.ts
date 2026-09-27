export type WhatsAppBookingDetails = {
    phoneNumber: string;
    businessName: string;
    serviceName: string;
    bookingDate: string;
    startTime: string;
    customerName: string;
    customerPhone: string;
    note?: string;
    bookingId?: number;
};

function formatNigeriaPhoneNumber(phoneNumber: string) {
    const digitsOnly = phoneNumber.replace(/\D/g, "");

    if (digitsOnly.startsWith("0")) {
        return `234${digitsOnly.slice(1)}`;
    }

    if (digitsOnly.startsWith("234")) {
        return digitsOnly;
    }

    return digitsOnly;
}

export function createWhatsAppBookingLink(
    details: WhatsAppBookingDetails
) {
    const message = [
        `Hello ${details.businessName},`,
        "",
        "I would like to request an appointment.",
        "",
        "BOOKING DETAILS",
        `Service: ${details.serviceName}`,
        `Date: ${details.bookingDate}`,
        `Preferred time: ${details.startTime}`,
        "",
        "CUSTOMER DETAILS",
        `Name: ${details.customerName}`,
        `Phone: ${details.customerPhone}`,
        details.note ? `Additional note: ${details.note}` : "",
        "",
        details.bookingId
            ? `Booking reference: BK-${details.bookingId}`
            : "Booking reference: Pending",
        "",
        "Please confirm whether this date and time are available.",
        "",
        "Thank you.",
    ]
        .filter(Boolean)
        .join("\n");

    const cleanPhoneNumber = formatNigeriaPhoneNumber(details.phoneNumber);

    return `https://wa.me/${cleanPhoneNumber}?text=${encodeURIComponent(
        message
    )}`;
}