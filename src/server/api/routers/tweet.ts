import { Prisma } from "@prisma/client";
import { inferAsyncReturnType } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  createTRPCContext,
} from "~/server/api/trpc";

export const tweetRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ tweet: z.string() }))
    .mutation(async ({ ctx, input: { tweet } }) => {
      const createdTweet = await ctx.prisma.tweet.create({
        data: {
          content: tweet,
          userId: ctx.session.user.id,
        },
      });

      // Revalidation
      void ctx.revalidateSSG?.(`/profiles/${ctx.session.user.id}`);

      return createdTweet;
    }),

  infiniteFeed: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z.string().optional(),
        onlyFollowing: z.boolean().optional(),
      })
    )
    .query(
      async ({ ctx, input: { limit = 10, cursor, onlyFollowing = false } }) => {
        const currentUserId = ctx.session?.user.id;
        const fetchTweetsClause =
          currentUserId == null || !onlyFollowing
            ? undefined
            : {
                user: {
                  followers: { some: { id: currentUserId } },
                },
              };
        return await getInfiniteTweets({
          ctx,
          cursor,
          limit,
          whereClause: fetchTweetsClause,
        });
      }
    ),

  toggleLike: protectedProcedure
    .input(z.object({ tweetId: z.string() }))
    .mutation(async ({ ctx, input: { tweetId } }) => {
      const data = { tweetId, userId: ctx.session.user.id };

      const existingLike = await ctx.prisma.like.findUnique({
        where: { userId_tweetId: data },
      });

      if (existingLike == null) {
        await ctx.prisma.like.create({ data });
        return { addedLike: true };
      } else {
        await ctx.prisma.like.delete({ where: { userId_tweetId: data } });
        return { addedLike: false };
      }
    }),

  infiniteProfileFeed: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().optional(),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input: { limit = 10, userId, cursor }, ctx }) => {
      return await getInfiniteTweets({
        limit,
        ctx,
        cursor,
        whereClause: { userId },
      });
    }),
});

type InfinteTweetsParams = {
  whereClause?: Prisma.TweetWhereInput;
  limit: number;
  cursor: string | undefined;
  ctx: inferAsyncReturnType<typeof createTRPCContext>;
};
async function getInfiniteTweets({
  whereClause,
  limit,
  cursor,
  ctx,
}: InfinteTweetsParams) {
  const currentUserId = ctx.session?.user.id;

  const tweetList = await ctx.prisma.tweet.findMany({
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    where: whereClause,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      content: true,
      createdAt: true,
      _count: { select: { likes: true } },
      likes:
        currentUserId == null ? false : { where: { userId: currentUserId } },

      user: {
        select: { name: true, id: true, image: true },
      },
    },
  });

  let nextCursor: typeof cursor | undefined;
  if (tweetList.length > limit) {
    const nextItem = tweetList.pop();
    if (nextItem != null) {
      nextCursor = nextItem.id;
    }
  }

  const tweets = tweetList.map((tweet: any) => {
    return {
      id: tweet.id,
      content: tweet.content,
      createdAt: tweet.createdAt,
      likeCount: tweet._count.likes,
      user: tweet.user,
      likedByMe: tweet.likes?.length > 0,
    };
  });

  return { tweets, nextCursor };
}
