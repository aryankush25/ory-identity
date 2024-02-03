import Head from "next/head";
import { GetServerSideProps } from "next";
import { Session } from "@ory/client";
import { getUserName, ory } from "@/services/ory";

interface HomeProps {
  session: Session;
}

export default function Home({ session }: HomeProps) {
  console.log("#### session", session);

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {session?.identity ? (
          <p>Hello, {getUserName(session.identity)}</p>
        ) : null}
        <div>
          <p>
            <a href="/logout">Log out</a>
          </p>
        </div>
      </main>
    </>
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
        destination: "/registration",
        permanent: false,
      },
    };
  }
};
