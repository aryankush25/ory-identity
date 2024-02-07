import { ory } from "@/services/ory";
import { handleError } from "@/services/ory/error";
import { CodeBox } from "@ory/elements";
import { GetServerSideProps } from "next";
import Link from "next/link";
import React from "react";

interface ErrorProps {
  error: string;
}

const Error: React.FC<ErrorProps> = ({ error }) => {
  return (
    <div className="flex justify-center items-center h-screen flex-col">
      <Link href="/" className="pb-6 hover:text-blue-800 text-blue-400">
        Go to Home
      </Link>

      <h1 className="text-l font-semibold pb-6 px-8 text-center">
        {error
          ? "An error occurred. Please check the error information below and try again."
          : "An error occurred. Please try again."}
      </h1>

      {error ? (
        <CodeBox
          style={{
            overflow: "auto",
            maxWidth: "600px",
          }}
        >
          {error}
        </CodeBox>
      ) : null}
    </div>
  );
};

export default Error;

export const getServerSideProps: GetServerSideProps<ErrorProps> = async ({
  query,
}) => {
  try {
    const id = query.id as string | undefined;
    const err = query.error as string | undefined;

    let error = "";

    if (err) {
      try {
        error = JSON.stringify(
          JSON.parse(decodeURIComponent(String(err))),
          null,
          2
        );
      } catch (error) {
        error = String(err);
      }
    }

    if (id) {
      // Fetch the error information from the Ory API
      const { data } = await ory.getFlowError({ id: String(id) });

      error = JSON.stringify(data, null, 2);
    }

    return {
      props: {
        error,
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: handleError(error).redirectTo,
        permanent: false,
      },
    };
  }
};
