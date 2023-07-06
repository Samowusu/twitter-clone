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
});
