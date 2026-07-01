import { createBrowserRouter } from "react-router";
import { createElement } from "react";
import { HomePage } from "./components/HomePage";
import { BookingFormPage } from "./components/booking/BookingFormPage";
import { ConfirmationPage } from "./components/booking/ConfirmationPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/book/standard",
    element: createElement(BookingFormPage, { packageKey: "standard" }),
  },
  {
    path: "/book/zillow-showcase",
    element: createElement(BookingFormPage, { packageKey: "zillow_showcase" }),
  },
  {
    path: "/book/luxury",
    element: createElement(BookingFormPage, { packageKey: "luxury" }),
  },
  {
    path: "/confirmation",
    element: createElement(ConfirmationPage),
  },
]);
