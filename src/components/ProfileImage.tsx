import Image from "next/image";
import React from "react";

type ProfileImageProps = {
  src?: string | null;
  className?: string;
};
function ProfileImage({ src, className }: ProfileImageProps) {
  return (
    <div
      className={`relative h-12 w-12 overflow-hidden rounded-full ${className}`}
    >
      {src == null ? null : (
        <Image src={src} alt="Profile image" quality={100} fill />
      )}
    </div>
  );
}

export default ProfileImage;