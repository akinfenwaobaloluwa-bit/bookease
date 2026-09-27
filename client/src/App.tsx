import { useEffect, useState, type CSSProperties } from "react";
import { BookingForm } from "./components/BookingForm";
import { HomepageDetails } from "./components/HomepageDetails";
import { LoginForm } from "./components/LoginForm";
import { OwnerDashboard } from "./components/OwnerDashboard";
import "./mobile.css";
import "./Homepage.css";
import "./index.css";

type Business = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  whatsappNumber: string;
  phone: string | null;
  address: string | null;
  primaryColor: string;
};

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

type OpeningHour = {
  id: number;
  dayOfWeek: number;
  isOpen: boolean;
  startTime: string;
  endTime: string;
};

type PublicBusinessResponse = {
  business: Business;
  services: Service[];
  hours: OpeningHour[];
};

type AuthState = "checking" | "logged-out" | "logged-in";

const heroImage = "/images/bookease-homepage-hero.jpg";
const serviceFallbackImage = "/images/bookease-service-beauty.jpg";

function imageUrl(value: string | null) {
  if (!value) return "";
  return value.startsWith("http")
    ? value
    : `http://localhost:4000${value}`;
}

function formatPrice(price: number, currency: string) {
  return currency === "NGN"
    ? `₦${price.toLocaleString("en-NG")}`
    : `${currency} ${price.toLocaleString()}`;
}

function App() {
  const [data, setData] = useState<PublicBusinessResponse | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [ownerMode, setOwnerMode] = useState(false);

  useEffect(() => {
    async function loadBusiness() {
      try {
        const response = await fetch(
          "http://localhost:4000/api/public/businesses/glow-beauty-studio"
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load business.");
        }

        setData(result);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load business."
        );
      } finally {
        setIsLoading(false);
      }
    }

    async function checkSession() {
      try {
        const response = await fetch("http://localhost:4000/api/auth/me", {
          credentials: "include",
        });
        setAuthState(response.ok ? "logged-in" : "logged-out");
      } catch {
        setAuthState("logged-out");
      }
    }

    loadBusiness();
    checkSession();
  }, []);

  if (ownerMode && authState === "checking") {
    return <main className="page-shell">Checking owner session...</main>;
  }

  if (ownerMode && authState === "logged-out") {
    return (
      <main className="page-shell">
        <button type="button" onClick={() => setOwnerMode(false)}>
          Back to public page
        </button>
        <LoginForm onLoggedIn={() => setAuthState("logged-in")} />
      </main>
    );
  }

  if (ownerMode && authState === "logged-in") {
    return (
      <OwnerDashboard
        onLogout={() => {
          setAuthState("logged-out");
          setOwnerMode(false);
        }}
      />
    );
  }

  if (isLoading) {
    return <main className="page-shell">Loading business profile...</main>;
  }

  if (error || !data) {
    return (
      <main className="page-shell">
        <p className="error-message">{error || "Business not found."}</p>
        <button type="button" onClick={() => setOwnerMode(true)}>
          Owner login
        </button>
      </main>
    );
  }

  const { business, services, hours } = data;
  const logo = imageUrl(business.logoUrl);

  return (
    <main
      className="premium-homepage"
      style={{ "--primary-color": business.primaryColor } as CSSProperties}
    >
      <nav className="premium-nav">
        <a className="premium-brand" href="#top" aria-label="Glow Beauty Studio home">
          {logo ? (
            <img src={logo} alt="" />
          ) : (
            <span className="brand-mark">G</span>
          )}
          <span>{business.name}</span>
        </a>

        <div className="premium-nav-links">
          <a href="#services">Services</a>
          <a href="#story">Why us</a>
          <button type="button" onClick={() => setOwnerMode(true)}>
            Owner login
          </button>
        </div>
      </nav>

      <section className="premium-hero" id="top">
        <div className="hero-copy reveal-up">
          <p className="premium-kicker">Beauty, care & confidence</p>
          <h1>Look good.
            <em>Feel unforgettable.</em></h1>
          <p className="hero-description">
            Professional beauty services designed around your style, your time,
            and the version of yourself you want to meet in the mirror.
          </p>

          <div className="hero-actions">
            <a className="primary-cta" href="#services">
              Explore services <span>↗</span>
            </a>
            <a className="text-cta" href={`https://wa.me/${business.whatsappNumber.replace(/\D/g, "")}`}>
              Chat on WhatsApp
            </a>
          </div>

          <div className="hero-proof">
            <div className="avatar-stack" aria-hidden="true">
              <span>G</span><span>R</span><span>A</span>
            </div>
            <p><strong>Loved by our clients</strong>
              Personal care, beautifully delivered.</p>
          </div>
        </div>

        <div className="hero-visual reveal-right">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-image-frame">
            <img src={heroImage} alt={`${business.name} beauty experience`} />
          </div>
          <div className="hero-note">
            <span className="note-icon">✦</span>
            <span><strong>Now booking</strong>
              Your next glow-up</span>
          </div>
          <div className="hero-stamp">EST.
            <strong>2024</strong></div>
        </div>
      </section>

      <section className="trust-strip" id="story">
        <div><strong>01</strong><span>Personal
          attention</span></div>
        <div><strong>02</strong><span>Professional
          results</span></div>
        <div><strong>03</strong><span>Easy WhatsApp
          booking</span></div>
        <div><strong>04</strong><span>Your time
          matters</span></div>
      </section>

      <section className="premium-section services-section" id="services">
        <div className="section-intro reveal-up">
          <div>
            <p className="premium-kicker">Our signature menu</p>
            <h2>Made for your
              <em>main character moment.</em></h2>
          </div>
          <p>Choose a service, pick a time that works for you, and let us take care of the rest.</p>
        </div>

        {services.length === 0 ? (
          <p className="empty-premium">Our service menu is being refreshed. Check back soon.</p>
        ) : (
          <div className="premium-service-grid">
            {services.map((service, index) => {
              const serviceImage = service.imageUrl
                ? imageUrl(service.imageUrl)
                : serviceFallbackImage;

              return (
                <article
                  className="premium-service-card reveal-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                  key={service.id}
                >
                  <div className="service-card-image-wrap">
                    <img src={serviceImage} alt={service.name} />
                    <span className="service-number">0{index + 1}</span>
                  </div>
                  <div className="service-card-content">
                    <div>
                      <h3>{service.name}</h3>
                      <p>{service.description || "A carefully tailored beauty experience."}</p>
                    </div>
                    <div className="service-card-footer">
                      <span>{formatPrice(service.price, service.currency)}</span>
                      <span>{service.durationMinutes} min</span>
                    </div>
                    <button type="button" onClick={() => setSelectedService(service)}>
                      Book this service <span>↗</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="quote-section">
        <span className="quote-mark">“</span>
        <blockquote>
          Beauty is not about becoming someone else. It is about feeling more
          like yourself.
        </blockquote>
        <p>— The Glow Beauty Studio philosophy</p>
      </section>

      <HomepageDetails
        business={business}
        hours={hours}
      />

      {selectedService && (
        <section className="booking-section premium-booking-section">
          <button className="close-booking" type="button" onClick={() => setSelectedService(null)}>
            Close booking
          </button>
          <BookingForm
            businessId={business.id}
            businessName={business.name}
            whatsappNumber={business.whatsappNumber}
            service={selectedService}
          />
        </section>
      )}

      <footer className="premium-footer">
        <div>
          <p className="premium-kicker">Glow Beauty Studio</p>
          <p>Professional beauty services made personal.</p>
        </div>
        <div>
          {business.address && <p>{business.address}</p>}
          {business.phone && <p>{business.phone}</p>}
        </div>
      </footer>
    </main>
  );
}

export default App;