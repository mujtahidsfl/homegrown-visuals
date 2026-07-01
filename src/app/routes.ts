import { createBrowserRouter } from "react-router";
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
        element: createElement(BookingFormPage, { packageKey: "standard" }),
      },
      {
        path: "book/zillow-showcase",
        element: createElement(BookingFormPage, { packageKey: "zillow_showcase" }),
      },
      {
        path: "book/luxury",
        element: createElement(BookingFormPage, { packageKey: "luxury" }),
      },
      {
        path: "confirmation",
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
    ],
  },
]);
