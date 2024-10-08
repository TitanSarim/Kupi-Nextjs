import { getAlKupiOperators } from "@/actions/search.action";
import { getOperatorSettings } from "@/actions/settings.action";
import { auth } from "@/auth";
import OperatorSettings from "@/components/settings/OperatorSettings";
import React from "react";

const Operator = async () => {
  const session = (await auth().catch(() => null)) ?? null;

  if (!session) {
    return null;
  }

  const operatorSettings = await getOperatorSettings();
  const operators = await getAlKupiOperators();

  return (
    <div className="w-full h-full">
      <OperatorSettings
        operatorSettings={operatorSettings}
        operators={operators}
        role={session.role}
      />
    </div>
  );
};

export default Operator;
