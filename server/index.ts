import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";

import { authRouter } from "./routes/auth";
import { availabilityRouter } from "./routes/availability";
import { bookingRouter } from "./routes/bookings";
import { ownerBookingsRouter } from "./routes/ownerBookings";
import { publicRouter } from "./routes/public";
import { servicesRouter } from "./routes/services";
import { settingsRouter } from "./routes/settings";
import { uploadsRouter } from "./routes/uploads";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.get("/api/health", (_request, response) => {
    response.json({
        ok: true,
        service: "bookease-api",
    });
});

app.use("/api/auth", authRouter);
app.use("/api/availability", availabilityRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/owner/bookings", ownerBookingsRouter);
app.use("/api/public", publicRouter);
app.use("/api/services", servicesRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/uploads", uploadsRouter);

app.listen(port, "0.0.0.0", () => {
    console.log(`BookEase API running on http://localhost:${port}`);
});