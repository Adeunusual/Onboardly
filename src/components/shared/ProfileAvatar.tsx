// src/components/shared/ProfileAvatar.tsx
"use client";

import Image from "next/image";
import { UserCircle2 } from "lucide-react";
import type { IUser } from "@/types/user.types";

interface ProfileAvatarProps {
  user: Partial<IUser>;
  size?: number; // default 32
}

export default function ProfileAvatar({ user, size = 32 }: ProfileAvatarProps) {
  const userImage = user?.picture;

  if (userImage) {
    return (
      <Image
        src={userImage}
        alt={user?.name || "User Profile"}
        width={size}
        height={size}
        className="rounded-full object-cover border border-slate-300"
      />
    );
  }

  return (
    <UserCircle2
      width={size}
      height={size}
      className="text-slate-400"
      aria-hidden="true"
    />
  );
}
