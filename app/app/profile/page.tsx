import Loading from "@/components/Loading";
import React, { Suspense } from "react";
import { getProfile, getProfileImage } from "@/actions/user.actions";
import UserProfile from "@/components/profile/UserProfile";
import ProfileDetails from "@/components/profile/ProfileDetails";

const Profile = async () => {
  const userData = await getProfile();
  let profileImage = await getProfileImage();

  if (!userData) {
    return null;
  }

  if (!profileImage) {
    profileImage = "/img/profile/User-dumy.svg";
  }

  return (
    <div className="bg-page-backgound h-full w-full">
      <Suspense fallback={<Loading />}>
        <div className="w-full relative flex flex-col items-center justify-start">
          <ProfileDetails userData={userData} profileImage={profileImage} />

          <UserProfile userData={userData} />
        </div>
      </Suspense>
    </div>
  );
};

export default Profile;
