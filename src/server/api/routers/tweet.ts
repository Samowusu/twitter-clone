import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
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

      return createdTweet;
    }),

  infiniteFeed: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ ctx, input: { limit = 10, cursor } }) => {
      const currentUserId = ctx.session?.user.id;

      const tweetList = await ctx.prisma.tweet.findMany({
        take: limit + 1,
        cursor: cursor ? cursor : undefined,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: {
          id: true,
          content: true,
          createdAt: true,
          _count: { select: { likes: true } },
          likes:
            currentUserId == null
              ? false
              : { where: { userId: currentUserId } },

          user: {
            select: { name: true, id: true, image: true },
          },
        },
      });

      let nextCursor: typeof cursor | undefined;
      if (tweetList.length > limit) {
        const nextItem = tweetList.pop();
        if (nextItem != null) {
          nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
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
    }),
});
