import { GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

const ProfilePage: NextPage = () => {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username: "test",
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>404 - Not found</div>;

  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <main className="flex h-screen justify-center">
        <div>{data.username}</div>
      </main>
    </>
  );
};

import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from "~/server/api/root";
import {prisma } from "~/server/db";
import SuperJSON from "superjson";

export const getServerSideProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: {prisma, currentUserId: null},
    transformer: SuperJSON, 
  });


};


export default ProfilePage;
