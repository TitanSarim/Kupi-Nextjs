import { getOperatorSettings } from "@/actions/settings.action";
import OperatorSettings from "@/components/settings/OperatorSettings";
import React from "react";

const Operator = async () => {
  const operatorSettings = await getOperatorSettings();

  return (
    <div className="w-full h-full">
      <OperatorSettings operatorSettings={operatorSettings} />
    </div>
  );
};

export default Operator;
