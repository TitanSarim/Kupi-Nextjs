import { getAlKupiOperators } from "@/actions/search.action";
import {
  getOperatorSettings,
  getSelectedOperatorSettings,
} from "@/actions/settings.action";
import { auth } from "@/auth";
import OperatorSettings from "@/components/settings/OperatorSettings";
import { SettingsQuery } from "@/types/settings";
import React from "react";

const Operator = async ({
  searchParams,
}: {
  searchParams: SettingsQuery["searchParams"];
}) => {
  const session = (await auth().catch(() => null)) ?? null;

  if (!session) {
    return null;
  }

  const operator = await getSelectedOperatorSettings(searchParams);
  const operatorSettings = await getOperatorSettings();
  const operators = await getAlKupiOperators();

  return (
    <div className="w-full h-full">
      <OperatorSettings
        operatorSettings={operatorSettings}
        operators={operators}
        operator={operator}
        role={session.role}
      />
    </div>
  );
};

export default Operator;
