import { AxiosError } from "axios";

// A small function to help us deal with errors coming from fetching a flow.
export function handleGetFlowError(
  flowType: "login" | "registration" | "settings" | "recovery" | "verification"
) {
  return async (err: AxiosError) => {
    const errorData = (err.response?.data || {}) as any;

    switch (errorData.error?.id) {
      case "session_inactive":
        return {
          redirectTo: "/login",
        };
      case "session_aal2_required":
        if (errorData.redirect_browser_to) {
          const redirectTo = new URL(errorData.redirect_browser_to);
          // 2FA is enabled and enforced, but user did not perform 2fa yet!

          return {
            redirectTo: redirectTo.toString(),
          };
        }

        return {
          redirectTo: "/login?aal=aal2",
        };
      case "session_already_available":
        // User is already signed in, let's redirect them home!

        return {
          redirectTo: "/",
        };
      case "session_refresh_required":
        // We need to re-authenticate to perform this action

        return {
          redirectTo: errorData.redirect_browser_to,
        };
      case "self_service_flow_return_to_forbidden":
        // The flow expired, let's request a new one.

        return {
          redirectTo: "/" + flowType,
          msg: "The return_to address is not allowed.",
        };
      case "self_service_flow_expired":
        // The flow expired, let's request a new one.

        return {
          redirectTo: "/" + flowType,
          msg: "Your interaction expired, please fill out the form again.",
        };
      case "security_csrf_violation":
        // A CSRF violation occurred. Best to just refresh the flow!

        return {
          redirectTo: "/" + flowType,
          msg: "A security violation was detected, please fill out the form again.",
        };
      case "security_identity_mismatch":
        // The requested item was intended for someone else. Let's request a new flow...

        return {
          redirectTo: "/" + flowType,
        };
      case "browser_location_change_required":
        // Ory Kratos asked us to point the user to this URL.

        return {
          redirectTo: errorData.redirect_browser_to,
        };
    }

    switch (err.response?.status) {
      case 410:
        // The flow expired, let's request a new one.

        return {
          redirectTo: "/" + flowType,
        };
    }

    // We are not able to handle the error? Return it.
    return Promise.reject(err);
  };
}
