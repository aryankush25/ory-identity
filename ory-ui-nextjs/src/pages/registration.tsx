import { GetServerSideProps } from "next";
import { useCallback } from "react";
import { basePath, getUrlForFlow, isQuerySet, ory } from "@/services/ory";
import { UiNode, UiNodeInputAttributes } from "@ory/client";
import {
  filterNodesByGroups,
  isUiNodeInputAttributes,
} from "@ory/integrations/ui";

interface RegistrationProps {
  flow?: any;
}

const Registration = ({ flow }: RegistrationProps) => {
  const mapUINode = useCallback((node: UiNode, key: number) => {
    if (isUiNodeInputAttributes(node.attributes)) {
      const attrs = node.attributes as UiNodeInputAttributes;
      const nodeType = attrs.type;

      switch (nodeType) {
        case "button":
        case "submit":
          return (
            <button
              className="w-full px-3 py-2 mb-2 text-sm font-bold text-white bg-blue-500 rounded shadow hover:bg-blue-700 focus:outline-none focus:shadow-outline"
              title="Submit"
              type={attrs.type as "submit" | "reset" | "button" | undefined}
              name={attrs.name}
              value={attrs.value}
            >
              Submit
            </button>
          );
        default:
          return (
            <input
              className="w-full px-3 py-2 mb-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
              title="Input field"
              placeholder={"Enter value for " + attrs.name}
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
          );
      }
    }
  }, []);

  return (
    <div>
      <form action={flow.ui.action} method={flow.ui.method}>
        {filterNodesByGroups({
          nodes: flow.ui.nodes,
          groups: ["default", "password"],
        }).map((node, idx) => (
          <div key={idx}> {mapUINode(node, idx)}</div>
        ))}
      </form>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<RegistrationProps> =
  async ({ req, query }) => {
    const flow = query?.flow as string | undefined;

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

      return {
        props: {
          flow: regFlow.data,
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

export default Registration;
