import React from "react";

const ErrorMessage = ({ message }: { message?: string | null }): JSX.Element => {
  if (!message) return <></>; 
  return <p className="text-red-500 text-sm mt-3">{message}</p>;
};

export default ErrorMessage;
