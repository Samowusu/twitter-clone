import React, {
  useState,
  useLayoutEffect,
  useRef,
  useCallback,
  FormEvent,
} from "react";
import ProfileImage from "./ProfileImage";
import Button from "./Button";
import { useSession } from "next-auth/react";
import { updateTextAreaSize } from "~/config/utils";
import { api } from "~/utils/api";

function NewTweetForm() {
  const session = useSession();
  const [tweetValueState, setTweetValueState] = useState("");
  const inputRef = useCallback(
    (textArea: HTMLTextAreaElement) => {
      updateTextAreaSize(textArea);
    },
    [tweetValueState]
  );

  const createTweet = api.tweet.create.useMutation({
    onSuccess: (newTweet) => {
      console.log(newTweet);
      setTweetValueState("");
    },
  });

  const handleCreateTweet = (e: FormEvent) => {
    e.preventDefault();
    createTweet.mutate({ tweet: tweetValueState });
  };

  if (session.status !== "authenticated") return null;
  return (
    <form
      onSubmit={handleCreateTweet}
      className="flex flex-col gap-2 border-b px-4 py-2"
    >
      <div className="flex gap-4">
        <ProfileImage src={session.data.user.image} />
        <textarea
          name=""
          id=""
          ref={inputRef}
          value={tweetValueState}
          onChange={(e) => setTweetValueState(e.target.value)}
          className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none"
          placeholder="What's happening?"
        ></textarea>
      </div>
      <Button className="self-end">Tweet</Button>
    </form>
  );
}

export default NewTweetForm;
