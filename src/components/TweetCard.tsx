import React from "react";
import { Tweet } from "./InfiniteTweetList";
import Link from "next/link";
import ProfileImage from "./ProfileImage";
import { dateTimeFormatter } from "~/config/utils";
import LikeButton from "./LikeButton";

function TweetCard({
  id,
  user,
  content,
  createdAt,
  likeCount,
  likedByMe,
}: Tweet) {
  return (
    <li className="flex gap-4 border-b p-4">
      <Link href={`/profiles/${user.id}`}>
        <ProfileImage src={user.image} />
      </Link>
      <div className="flex flex-grow flex-col">
        <div className="flex gap-1">
          <Link
            href={`/profiles/${user.id}`}
            className="font-bold outline-none hover:underline focus-visible:underline"
          >
            {user.name}
          </Link>
          <span className="text-gray-500">-</span>
          <span className="text-gray-500">
            {dateTimeFormatter.format(createdAt)}
          </span>
        </div>
        <p className="whitespace-pre-wrap">{content}</p>
        <LikeButton likedByMe={likedByMe} likeCount={likeCount} />
      </div>
    </li>
  );
}

export default TweetCard;
