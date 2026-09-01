import { createBrowserRouter, Navigate } from "react-router";
import { createElement } from "react";
import { HomePage } from "./components/HomePage";
import { BookingFormPage } from "./components/booking/BookingFormPage";
import { ConfirmationPage } from "./components/booking/ConfirmationPage";
import { PrivacyPolicyPage } from "./components/PrivacyPolicyPage";
import { TermsOfServicePage } from "./components/TermsOfServicePage";
import { PortfolioPage } from "./components/PortfolioPage";
import { PricingPage } from "./components/PricingPage";
import { AboutPage } from "./components/AboutPage";
import { AppShell } from "./components/AppShell";
import { CalendarTestPage } from "./components/CalendarTestPage";
import { packageServicesRoute, usesBookingOrchestrator } from "./booking/submission";

const packageBookingElement = (packageKey: "standard" | "zillow_showcase" | "luxury") =>
  usesBookingOrchestrator
    ? createElement(Navigate, { to: packageServicesRoute(packageKey), replace: true })
    : createElement(BookingFormPage, { packageKey });

export const router = createBrowserRouter([
  {
    path: "/",
    element: createElement(AppShell),
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: "book/standard",
        element: packageBookingElement("standard"),
      },
      {
        path: "book/zillow-showcase",
        element: packageBookingElement("zillow_showcase"),
      },
      {
        path: "book/luxury",
        element: packageBookingElement("luxury"),
      },
      {
        path: "confirmation",
        element: createElement(ConfirmationPage),
      },
      {
        path: "booking-confirmed",
        element: createElement(ConfirmationPage),
      },
      {
        path: "privacy-policy",
        element: createElement(PrivacyPolicyPage),
      },
      {
        path: "terms-of-service",
        element: createElement(TermsOfServicePage),
      },
      {
        path: "portfolio",
        element: createElement(PortfolioPage),
      },
      {
        path: "services",
        element: createElement(PricingPage),
      },
      {
        path: "pricing",
        element: createElement(PricingPage),
      },
      {
        path: "about",
        element: createElement(AboutPage),
      },
      {
        path: "calendar-test",
        element: createElement(CalendarTestPage),
      },
      {
        path: "faq",
        element: createElement(Navigate, { to: "/#faq", replace: true }),
      },
    ],
  },
]);
