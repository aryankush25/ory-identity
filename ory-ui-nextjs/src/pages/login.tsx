import { GetServerSideProps } from "next";
import { Fragment, useCallback, useMemo } from "react";
import {
  basePathBrowser,
  getUrlForFlow,
  isQuerySet,
  ory,
} from "@/services/ory";
import { LoginFlow, UiNode, UiNodeInputAttributes } from "@ory/client";
import {
  filterNodesByGroups,
  isUiNodeInputAttributes,
} from "@ory/integrations/ui";
import { handleGetFlowError } from "@/services/ory/error";
import { customClsx } from "@/utils/helpers";

interface LoginProps {
  flow: LoginFlow;
}

const Login = ({ flow }: LoginProps) => {
  console.log("#### flow", flow);

  const mapUINode = useCallback((node: UiNode, key: number) => {
    if (isUiNodeInputAttributes(node.attributes)) {
      const attrs = node.attributes as UiNodeInputAttributes;
      const nodeType = attrs.type;

      switch (nodeType) {
        case "button":
        case "submit":
          return (
            <button
              className="w-full px-3 py-2 mb-2 text-sm font-bold text-white bg-blue-500 rounded shadow hover:bg-blue-700 focus:outline-none focus:shadow-outline dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:shadow-outline"
              title="Submit"
              type={attrs.type as "submit" | "reset" | "button" | undefined}
              name={attrs.name}
              value={attrs.value}
            >
              {node.meta.label?.text}
            </button>
          );
        default:
          return (
            <Fragment>
              <input
                className="w-full px-3 py-2 mb-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:focus:shadow-outline"
                title="Input field"
                placeholder={"Enter " + node.meta.label?.text}
                name={attrs.name}
                type={attrs.type}
                autoComplete={
                  attrs.autocomplete || attrs.name === "identifier"
                    ? "username"
                    : ""
                }
                defaultValue={attrs.value}
                required={attrs.required}
                disabled={attrs.disabled}
              />

              {node.messages[0]?.text ? (
                <p className="text-xs italic text-red-500 dark:text-red-400">
                  {node.messages[0].text}
                </p>
              ) : null}
            </Fragment>
          );
      }
    }
  }, []);

  const nodes = useMemo(
    () =>
      filterNodesByGroups({
        nodes: flow.ui.nodes,
        groups: ["default", "password"],
      }),
    [flow.ui.nodes]
  );

  return (
    <div className="flex justify-center items-center h-screen dark:bg-gray-900">
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 dark:bg-gray-800 w-full max-w-md"
        action={flow.ui.action}
        method={flow.ui.method}
      >
        <h1 className="mb-8 dark:text-white text-xl">Login</h1>

        <h1
          className={customClsx(
            "mb-6 text-sm text-white",
            flow.ui.messages?.[0]?.type === "error" && "text-red-500"
          )}
        >
          {flow.ui.messages?.[0]?.text}
        </h1>

        {nodes.map((node, idx) => (
          <div key={idx} className="mb-4">
            {mapUINode(node, idx)}
          </div>
        ))}

        <a
          className="text-sm text-white hover:underline"
          title="Anchor"
          href="/registration"
        >
          Do not have an account? Register!
        </a>
      </form>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<LoginProps> = async ({
  req,
  query,
}) => {
  try {
    const flow = query?.flow as string | undefined;

    if (!isQuerySet(flow)) {
      const initFlowUrl = getUrlForFlow(basePathBrowser, "login");

      return {
        redirect: {
          destination: initFlowUrl,
          permanent: false,
        },
      };
    }

    const loginFlow = await ory.getLoginFlow({
      id: flow,
      cookie: req.headers.cookie,
    });

    return {
      props: {
        flow: loginFlow.data,
      },
    };
  } catch (error) {
    const errorData = handleGetFlowError("login")(error);

    return {
      redirect: {
        destination: errorData ? errorData.redirectTo : "/error",
        permanent: false,
      },
    };
  }
};

export default Login;
