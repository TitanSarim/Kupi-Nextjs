"use client";
import { Users } from "@prisma/client";
import Image from "next/image";
import UploadImage from "./UploadImage";
import React, { useState } from "react";

type ProfileProps = {
  userData: Users;
  profileImage: string;
};

const ProfileDetails: React.FC<ProfileProps> = ({ userData, profileImage }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialge = () => {
    setDialogOpen(true);
  };
  const handleImageDialog = () => {
    setDialogOpen(false);
  };

  return (
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
            <p className="text-sm font-light midGray-text">Email Address</p>
            <span className="darkGray-text font-normal">{userData.email}</span>
          </div>
          <div className="w-4/12 mb-10">
            <p className="text-sm font-light midGray-text">Phone Number</p>
            <span className="darkGray-text font-normal">{userData.number}</span>
          </div>
          <div className="w-4/12 mb-10">
            <p className="text-sm font-light midGray-text">Registration Date</p>
            <span className="darkGray-text font-normal">
              {userData.createdAt.toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex justify-center items-center border-2 rounded-full p-3">
          <Image
            src={profileImage}
            alt="user"
            width={200}
            height={200}
            className="rounded-full"
          />

          <button onClick={handleOpenDialge}>
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

      <UploadImage
        open={dialogOpen}
        onClose={handleImageDialog}
        userData={userData}
      />
    </div>
  );
};

export default ProfileDetails;
