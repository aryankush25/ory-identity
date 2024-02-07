import Head from "next/head";
import { GetServerSideProps } from "next";
import { Session } from "@ory/client";
import { getUserName, ory } from "@/services/ory";
import { handleError } from "@/services/ory/error";
import { CodeBox, gridStyle } from "@ory/elements";
import { customClsx } from "@/utils/helpers";
import Link from "next/link";
import { Fragment } from "react";

interface HomeProps {
  session: Session;
}

export default function Home({ session }: HomeProps) {
  console.log("#### session", session);

  return (
    <Fragment>
      <Head>
        <title>Ory Identity</title>
        <meta name="description" content="Ory Identity" />
      </Head>
      <main
        className={customClsx(
          "max-w-xl m-auto my-6 px-4",
          gridStyle({ gap: 16 })
        )}
      >
        {session?.identity ? (
          <p>Hello, {getUserName(session.identity)}</p>
        ) : null}

        <Link href="/settings" className="hover:text-blue-800 text-blue-400">
          Settings
        </Link>

        <Link href="/logout" className="hover:text-blue-800 text-blue-400">
          Log out
        </Link>

        <CodeBox toggleText="Session Information: ">
          {JSON.stringify(session, null, 2)}
        </CodeBox>
      </main>
    </Fragment>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async ({
  req,
}) => {
  try {
    const sessionResponse = await ory.toSession({
      cookie: req.headers.cookie,
    });

    console.log("#### sessionResponse", sessionResponse);

    return {
      props: {
        session: sessionResponse.data,
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
