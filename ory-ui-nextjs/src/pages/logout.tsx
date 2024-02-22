import { frontend } from "@/services/ory";
import { handleError } from "@/services/ory/error";
import { GetServerSideProps } from "next";

export default function Logout() {
  return <div>Logging you out..</div>;
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const { return_to } = query;
  try {
    const logoutUrl = await frontend.createBrowserLogoutFlow({
      cookie: req.headers.cookie,
      returnTo: (return_to && return_to.toString()) || "",
    });

    return {
      redirect: {
        destination: logoutUrl.data.logout_url,
        permanent: false,
      },
    };
  } catch (error) {
    console.log("#### error", error);

    return {
      redirect: {
        destination: handleError(error).redirectTo,
        permanent: false,
      },
    };
  }
};
