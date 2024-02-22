// A small function to help us deal with errors coming from fetching a flow.
export function handleGetFlowError(
  flowType: "login" | "registration" | "settings" | "recovery" | "verification"
) {
  return (err: any) => {
    console.error("Error for " + flowType + "flow:", err);

    if (!err) {
      return null;
    }

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

    // We are not able to handle the error? Throw it.
    return null;
  };
}

export const handleError = (error: any): { redirectTo: string } => {
  if (!error.response || error.response?.status === 0) {
    return {
      redirectTo: `/error?error=${encodeURIComponent(
        JSON.stringify(error.response)
      )}`,
    };
  }

  const responseData = error.response?.data || ({} as any);

  switch (error.response?.status) {
    case 400: {
      if (responseData.error?.id == "session_already_available") {
        return {
          redirectTo: "/",
        };
      }

      break;
    }
    // we have no session or the session is invalid
    case 401: {
      console.warn("handleError hook 401: Navigate to /login");

      return {
        redirectTo: "/login",
      };
    }
    case 403: {
      // the user might have a session, but would require 2FA (Two-Factor Authentication)
      if (responseData.error?.id === "session_aal2_required") {
        return {
          redirectTo: "/login?aal2=true",
        };
      }

      if (
        responseData.error?.id === "session_refresh_required" &&
        responseData.redirect_browser_to
      ) {
        console.warn(
          "sdkError 403: Redirect browser to",
          responseData.redirect_browser_to
        );

        return {
          redirectTo: responseData.redirect_browser_to,
        };
      }
      break;
    }
    case 404: {
      console.warn("sdkError 404: Navigate to Error");
      const errorMsg = {
        data: error.response?.data || error,
        status: error.response?.status,
        statusText: error.response?.statusText,
      };

      return {
        redirectTo: `/error?error=${encodeURIComponent(
          JSON.stringify(errorMsg)
        )}`,
      };
    }
    case 410: {
      console.warn("sdkError 410: Navigate to /");

      return {
        redirectTo: "/",
      };
    }
    // we need to parse the response and follow the `redirect_browser_to` URL
    // this could be when the user needs to perform a 2FA challenge
    // or passwordless login
    case 422: {
      if (responseData.redirect_browser_to !== undefined) {
        const currentUrl = new URL(window.location.href);
        const redirect = new URL(responseData.redirect_browser_to);

        // host name has changed, then change location
        if (currentUrl.host !== redirect.host) {
          console.warn("sdkError 422: Host changed redirect");

          return {
            redirectTo: responseData.redirect_browser_to,
          };
        }

        // Path has changed
        if (currentUrl.pathname !== redirect.pathname) {
          console.warn("sdkError 422: Update path");

          return {
            redirectTo: redirect.pathname + redirect.search,
          };
        }

        // for webauthn we need to reload the flow
        console.warn("sdkError 422: Redirect browser to");

        return {
          redirectTo: responseData.redirect_browser_to,
        };
      }
    }
  }

  return {
    redirectTo: "/error",
  };
};
