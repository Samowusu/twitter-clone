import React from "react";
import Button from "./Button";
import { useSession } from "next-auth/react";

type FollowButtonProps = {
  isFollowing?: boolean;
  userId?: string;
  onClick: () => void;
  isLoading?: boolean;
};
function FollowButton({
  isFollowing,
  userId,
  onClick,
  isLoading,
}: FollowButtonProps) {
  const session = useSession();

  if (session.status !== "authenticated" || session.data.user.id === userId) {
    return null;
  }

  return (
    <Button disabled={isLoading} onClick={onClick} small gray={isFollowing}>
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}

export default FollowButton;
