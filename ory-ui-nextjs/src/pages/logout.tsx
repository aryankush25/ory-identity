import { ory } from "@/services/ory";
import { GetServerSideProps } from "next";

export default function Logout() {
  return <div>Okay</div>;
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  try {
    const sessionResponse = await ory.toSession({
      cookie: req.headers.cookie,
    });

    const logoutUrl = await ory.createBrowserLogoutFlow({
      cookie: req.headers.cookie,
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
        destination: "/registration",
        permanent: false,
      },
    };
  }
};
