import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import FollowingTweets from "~/components/FollowingTweets";
import NewTweetForm from "~/components/NewTweetForm";
import RecentTweets from "~/components/RecentTweets";
import { TABS } from "~/config/utils";
import { api } from "~/utils/api";

export default function Home() {
  const [selectedTabState, setSelectedTabState] =
    useState<(typeof TABS)[number]>("Recent");
  const session = useSession();
  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-white pt-2">
        <h1 className="mb-2 px-4 text-lg font-bold">Home</h1>
        {session.status === "authenticated" && (
          <div className="flex">
            {TABS.map((tab) => {
              return (
                <button
                  key={tab}
                  className={`focus-visible:bg-gray-20 flex-grow p-2 hover:bg-gray-200 ${
                    tab === selectedTabState
                      ? "border-b-4 border-b-blue-500 font-bold"
                      : ""
                  }`}
                  onClick={() => setSelectedTabState(tab)}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        )}
      </header>
      <NewTweetForm />
      {selectedTabState === "Recent" && <RecentTweets />}
      {selectedTabState === "Following" && <FollowingTweets />}
    </>
  );
}
