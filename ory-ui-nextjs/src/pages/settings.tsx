import { SettingsFlow, UpdateSettingsFlowBody } from "@ory/client";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import {
  basePathBrowser,
  getUrlForFlow,
  isQuerySet,
  ory,
} from "@/services/ory";
import { handleGetFlowError } from "@/services/ory/error";

interface SettingsProps {
  flow: SettingsFlow;
}

const Settings: NextPage<SettingsProps> = ({ flow }) => {
  console.log("#### flow", flow);

  // const onSubmit = (values: UpdateSettingsFlowBody) =>
  //   router
  //     // On submission, add the flow ID to the URL but do not navigate. This prevents the user loosing
  //     // his data when she/he reloads the page.
  //     .push(`/settings?flow=${flow?.id}`, undefined, { shallow: true })
  //     .then(() =>
  //       ory
  //         .updateSettingsFlow({
  //           flow: String(flow?.id),
  //           updateSettingsFlowBody: values,
  //         })
  //         .then(({ data }) => {
  //           // The settings have been saved and the flow was updated. Let's show it to the user!
  //           setFlow(data);

  //           // continue_with is a list of actions that the user might need to take before the settings update is complete.
  //           // It could, for example, contain a link to the verification form.
  //           if (data.continue_with) {
  //             for (const item of data.continue_with) {
  //               switch (item.action) {
  //                 case "show_verification_ui":
  //                   router.push("/verification?flow=" + item.flow.id);
  //                   return;
  //               }
  //             }
  //           }

  //           if (data.return_to) {
  //             window.location.href = data.return_to;
  //             return;
  //           }
  //         })
  //     );

  return (
    <>
      <Head>
        <title>
          Profile Management and Security Settings - Ory NextJS Integration
          Example
        </title>
        <meta name="description" content="NextJS + React + Vercel + Ory" />
      </Head>
      <div>
        <Link href="/" passHref>
          <div>Go back</div>
        </Link>
      </div>
    </>
  );
};

export default Settings;

export const getServerSideProps: GetServerSideProps<SettingsProps> = async ({
  query,
  req,
}) => {
  try {
    const flow = query?.flow as string | undefined;

    if (!isQuerySet(flow)) {
      const initFlowUrl = getUrlForFlow(basePathBrowser, "settings");

      return {
        redirect: {
          destination: initFlowUrl,
          permanent: false,
        },
      };
    }

    const settingsFlow = await ory.getSettingsFlow({
      id: flow,
      cookie: req.headers.cookie,
    });

    return {
      props: {
        flow: settingsFlow.data,
      },
    };
  } catch (error) {
    const errorData = handleGetFlowError("settings")(error);

    return {
      redirect: {
        destination: errorData
          ? errorData.redirectTo
          : "/error?flow=settings&json=" + JSON.stringify(errorData),
        permanent: false,
      },
    };
  }
};
