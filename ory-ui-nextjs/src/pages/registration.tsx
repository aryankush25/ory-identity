import { basePath, getUrlForFlow, isQuerySet, ory } from "@/services/ory";
import { GetServerSideProps } from "next";

const Registration = () => {
  return <div>Your registration form goes here</div>;
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
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
  } catch (error) {
    console.log("#### error", error);
  }

  // Add your server-side logic here
  return {
    props: {},
  };
};

export default Registration;
