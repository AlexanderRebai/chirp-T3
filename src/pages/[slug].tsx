import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import relativeTime from "dayjs/plugin/relativeTime";


dayjs.extend(relativeTime);


export const ProfileFeed = (props : {userId: string}) => {

  const {data, isLoading} = api.posts.getPostsByUserId.useQuery({
    userId: props.userId
  })

  if (isLoading) return <LoadingPage />

  if (!data || data.length === 0) return <div>{`User has no posts yet!`}</div>

  return <div>
    {data.map(fullPost => <PostView {...fullPost} key={fullPost.post.id}/>)}
  </div>


}

const ProfilePage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.profile.getUserByUserId.useQuery({
    id,
  });

  if (!data) return <div>404 - Not found</div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36 border-slate-400 bg-slate-600">
          <Image
            src={data.profileImageUrl}
            alt={`${data.username || "user"}'s profile image`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="h-[64px]"/>
        <div className="p-4 text-2xl font-bold">{`@${data.username ?? "user"}`}</div>
        <div className="w-full border-b border-slate-400" />
        <ProfileFeed userId={id}/>
      </PageLayout>
    </>
  );
};

import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import SuperJSON from "superjson";
import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import dayjs from "dayjs";
import { PostView } from "~/components/postView";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, currentUserId: null },
    transformer: SuperJSON,
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("No slug!");

  const id = slug.replace("@", "");

  await ssg.profile.getUserByUserId.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
