import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Head from "next/head";
import ErrorPage from "next/error";
import { ssgHelper } from "~/server/api/ssgHelper";
import { api } from "~/utils/api";
import Link from "next/link";
import IconHoverEffect from "~/components/IconHoverEffect";
import { VscArrowLeft } from "react-icons/vsc";
import ProfileImage from "~/components/ProfileImage";
import { getPlural } from "~/config/utils";
import FollowButton from "~/components/FollowButton";
import InfiniteTweetList from "~/components/InfiniteTweetList";

const ProfilePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  id,
}) => {
  const { data: userProfile } = api.profile.getById.useQuery({ id });
  const tweets = api.tweet.infiniteProfileFeed.useInfiniteQuery(
    { userId: id },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const trpcUtils = api.useContext();
  const toggleFollow = api.profile.toggleFollow.useMutation({
    onSuccess: ({ addedFollow }) => {
      const updateData: Parameters<
        typeof trpcUtils.profile.getById.setData
      >[1] = (oldData) => {
        if (oldData == null) return;

        const countModifier = addedFollow ? 1 : -1;
        return {
          ...oldData,
          isFollowing: addedFollow,
          followersCount: oldData.followersCount + countModifier,
        };
      };

      trpcUtils.profile.getById.setData({ id }, updateData);
    },
  });

  if (userProfile == null || userProfile.name == null) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <>
      <Head>
        <title>{`Whisper - ${userProfile?.name}`}</title>
      </Head>
      <header className="sticky top-0 z-10 flex items-center border-b bg-white px-4 py-2">
        <Link href={".."} className="mr-2">
          <IconHoverEffect>
            <VscArrowLeft className="h-6 w-6" />
          </IconHoverEffect>
        </Link>
        <ProfileImage src={userProfile.image} className="flex-shrink-0" />
        <div className="ml-2 flex-grow">
          <h1 className="text-lg font-bold">{userProfile.name}</h1>
          <div className="text-gray-500">
            {userProfile.tweetsCount}{" "}
            {getPlural(userProfile.tweetsCount, "Tweet", "Tweets")}{" "}
            {userProfile.followersCount}{" "}
            {getPlural(userProfile.followersCount, "Follower", "Followers")}{" "}
            {userProfile.followsCount} Following
          </div>
        </div>
        <FollowButton
          onClick={() => toggleFollow.mutate({ userId: id })}
          isFollowing={userProfile.isFollowing}
          userId={id}
          isLoading={toggleFollow.isLoading}
        />
      </header>
      <main>
        <InfiniteTweetList
          tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
          isError={tweets.isError}
          isLoading={tweets.isLoading}
          hasMore={tweets.hasNextPage!}
          fetchNewTweets={tweets.fetchNextPage}
        />
      </main>
    </>
  );
};

//used in conjuction with getStaticProps since i am working with a dynamic route
export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

// useful because i want to generate a static site for the profile page at build time
export async function getStaticProps(
  context: GetStaticPropsContext<{ id: string }>
) {
  const id = context.params?.id;
  if (id == null) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  const ssg = ssgHelper();
  ssg.profile.getById.prefetch({ id });
  return {
    props: {
      id,
      trpcState: ssg.dehydrate(),
    },
  };
}

export default ProfilePage;
