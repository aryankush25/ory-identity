import { basePath, getUrlForFlow, isQuerySet, ory } from "@/services/ory";
import { GetServerSideProps } from "next";

interface RegistrationProps {
  flow?: any;
  error?: any;
}

const Registration = () => {
  return <div>Your registration form goes here</div>;
};

export const getServerSideProps: GetServerSideProps<RegistrationProps> =
  async ({ req, query }) => {
    const flow = query?.flow as string | undefined;

    console.log("#### flow", flow);
    console.log("#### req.headers.cookie", req.headers.cookie);

    if (!isQuerySet(flow)) {
      const initFlowUrl = getUrlForFlow(basePath, "registration");

      return {
        redirect: {
          destination: initFlowUrl,
          permanent: false,
        },
      };
    }

    try {
      const regFlow = await ory.getRegistrationFlow({
        id: flow,
        cookie: req.headers.cookie,
      });
      console.log("#### regFlow", regFlow);

      // Add your server-side logic here
      return {
        props: {
          flow: regFlow.data,
        },
      };
    } catch (error) {
      console.log("#### error", error);

      return {
        props: {
          error,
        },
      };
    }
  };

export default Registration;
