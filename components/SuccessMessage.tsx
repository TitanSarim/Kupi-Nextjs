import React from "react";

const SuccessMessage = ({ message }: { message?: string | null }): JSX.Element => {
  if (!message) return <></>;
  return <p className="text-green-500 text-sm mt-3">{message}</p>;
};

export default SuccessMessage;
