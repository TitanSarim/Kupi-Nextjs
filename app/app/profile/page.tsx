import Loading from "@/components/Loading";
import Image from "next/image";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";
import { getProfile } from "@/actions/user.actions";
import UserProfile from "@/components/UserProfile";
import { useSession } from "next-auth/react";

const Profile = async () => {

  const userData = await getProfile();

  if (!userData) {
    return;
  }

  return (
    <div className="bg-page-backgound h-full w-full">
      <Suspense fallback={<Loading />}>
        <div className="w-full relative flex flex-col items-center justify-start">
          <div className="bg-white w-11/12 mt-12 rounded-md px-8 py-8 shadow-sm">
            {/* profile details */}
            <p className="text-lg text-black font-semibold">Profile</p>
            <div className="w-full flex flex-wrap items-start justify-between mt-6">
              <div className="w-7/12 flex flex-wrap justify-start mt-4">
                <div className="w-4/12 mb-10">
                  <p className="text-sm font-light midGray-text">Name</p>
                  <span className="darkGray-text font-normal capitalize">
                    {userData.name}
                  </span>
                </div>
                <div className="w-4/12 mb-10">
                  <p className="text-sm font-light midGray-text">Surname</p>
                  <span className="darkGray-text font-normal capitalize">
                    {userData.surname}
                  </span>
                </div>
                <div className="w-4/12 mb-10">
                  <p className="text-sm font-light midGray-text">
                    Email Address
                  </p>
                  <span className="darkGray-text font-normal">
                    {userData.email}
                  </span>
                </div>
                <div className="w-4/12 mb-10">
                  <p className="text-sm font-light midGray-text">
                    Phone Number
                  </p>
                  <span className="darkGray-text font-normal">
                    {userData.number}
                  </span>
                </div>
                <div className="w-4/12 mb-10">
                  <p className="text-sm font-light midGray-text">
                    Registration Date
                  </p>
                  <span className="darkGray-text font-normal">
                    {userData.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex justify-center items-center border-2 rounded-full p-3">
                <Image
                  src="/img/profile/User-dumy.svg"
                  alt="user"
                  width={200}
                  height={200}
                />
                <button>
                  <Image
                    src="/img/profile/Camera.svg"
                    alt="Camera"
                    width={50}
                    height={50}
                    className="profile-camera"
                  />
                </button>
              </div>
            </div>
          </div>

          <UserProfile userData={userData} />
        </div>
      </Suspense>
    </div>
  );
};

export default Profile;
