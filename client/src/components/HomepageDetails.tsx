import { useEffect, useState } from "react";
import "./HomepageDetails.css";

type BusinessContact = {
    name: string;
    whatsappNumber: string;
    phone: string | null;
    address: string | null;
};

type OpeningHour = {
    id: number;
    dayOfWeek: number;
    isOpen: boolean;
    startTime: string;
    endTime: string;
};

type HomepageDetailsProps = {
    business: BusinessContact;
    hours: OpeningHour[];
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

const questions = [
    {
        question: "How do I book an appointment?",
        answer:
            "Choose a service, select a convenient time, and submit your details. Your booking request will open in WhatsApp for quick confirmation.",
    },
    {
        question: "Can I reschedule my appointment?",
        answer:
            "Yes. Send us a WhatsApp message as early as possible and we will help you find another suitable time.",
    },
    {
        question: "What should I do before my appointment?",
        answer:
            "Arrive on time and let us know about any preferences or concerns when you send your booking request.",
    },
];

export function HomepageDetails({ business, hours }: HomepageDetailsProps) {
    const [openQuestion, setOpenQuestion] = useState<number | null>(null);

    useEffect(() => {
        const revealItems = document.querySelectorAll<HTMLElement>(
            ".detail-reveal"
        );

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("detail-revealed");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );

        revealItems.forEach((item) => observer.observe(item));

        return () => observer.disconnect();
    }, []);

    const whatsappLink = `https://wa.me/${business.whatsappNumber.replace(
        /\D/g,
        ""
    )}`;

    return (
        <>
            <section className="homepage-details detail-reveal" id="visit-us">
                <div className="details-contact-card">
                    <p className="premium-kicker">Come and see us</p>
                    <h2>Your next feel-good appointment is one message away.</h2>
                    <p>
                        Have a question, want to confirm a service, or simply want to know
                        what would suit you best? We are happy to help.
                    </p>
                    <a className="details-whatsapp-button" href={whatsappLink}>
                        Start a WhatsApp chat <span>↗</span>
                    </a>
                </div>

                <div className="details-info-card">
                    <div>
                        <span className="details-label">Location</span>
                        <p>{business.address || "Contact us for our current location."}</p>
                    </div>
                    <div>
                        <span className="details-label">Phone</span>
                        <p>{business.phone || business.whatsappNumber}</p>
                    </div>
                    <div>
                        <span className="details-label">Opening hours</span>
                        <div className="opening-hours-list">
                            {hours.length === 0 ? (
                                <p>Message us for today&apos;s availability.</p>
                            ) : (
                                hours.map((hour) => (
                                    <div className="opening-hours-row" key={hour.id}>
                                        <span>{dayNames[hour.dayOfWeek - 1]}</span>
                                        <span>
                                            {hour.isOpen
                                                ? `${hour.startTime} – ${hour.endTime}`
                                                : "Closed"}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="faq-section detail-reveal" id="faq">
                <div className="faq-heading">
                    <p className="premium-kicker">Good to know</p>
                    <h2>Questions, answered.</h2>
                </div>

                <div className="faq-list">
                    {questions.map((item, index) => {
                        const isOpen = openQuestion === index;

                        return (
                            <div className="faq-item" key={item.question}>
                                <button
                                    type="button"
                                    aria-expanded={isOpen}
                                    onClick={() => setOpenQuestion(isOpen ? null : index)}
                                >
                                    <span>{item.question}</span>
                                    <span className="faq-plus">{isOpen ? "−" : "+"}</span>
                                </button>
                                {isOpen && <p>{item.answer}</p>}
                            </div>
                        );
                    })}
                </div>
            </section>

            <a className="floating-whatsapp" href={whatsappLink} aria-label="Chat with us on WhatsApp">
                <span className="whatsapp-dot">●</span>
                <span>Book on WhatsApp</span>
            </a>
        </>
    );
}