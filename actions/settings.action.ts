"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import {
  operatorSettingsFormData,
  operatorSettingsReturn,
  SettingsFormData,
} from "../types/settings";
import { Settings } from "@prisma/client";

export async function getAdminSetting(): Promise<Settings[] | null> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const settings = await db.settings.findMany();

    if (!settings) {
      return null;
    }

    return settings;
  } catch (error) {
    console.error("Error getting setting:", error);
    return null;
  }
}

export async function adminSetting(
  formData: SettingsFormData[]
): Promise<true | null> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    for (const setting of formData) {
      const existingSetting = await db.settings.findFirst({
        where: {
          key: setting.key,
        },
      });

      if (existingSetting) {
        await db.settings.update({
          where: {
            id: existingSetting.id,
          },
          data: {
            value: JSON.stringify(setting.value),
          },
        });
      } else {
        await db.settings.create({
          data: {
            key: setting.key,
            value: JSON.stringify(setting.value),
          },
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Error updating setting:", error);
    return null;
  }
}

export async function createOperatorSettings(
  formData: operatorSettingsFormData
): Promise<boolean | null | undefined> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const user = await db.users.findUnique({
      where: {
        id: session.userId,
      },
    });

    if (!user || !user.operatorsId) {
      return null;
    }

    const operatorSettings = await db.operatorSettings.findFirst({
      where: {
        operatorsId: user.operatorsId,
      },
    });

    if (!formData.tickets) {
      return;
    }

    if (!operatorSettings) {
      await db.operatorSettings.create({
        data: {
          operatorsId: user.operatorsId,
          emails: formData.emails,
          numbers: formData.numbers,
          exchangeRate: formData.exchangeRate,
          tickets: formData.tickets,
          closeBooking: String(formData.bookingAt),
          bankName: formData.bankName,
          accountTitle: formData.accountTitle,
          IBAN: formData.ibanNumber,
          swiftCode: formData.swiftNumber,
        },
      });
      await db.operators.update({
        where: {
          id: user.operatorsId,
        },
        data: {
          name: formData.company,
          description: formData.description,
        },
      });
    } else {
      const operatorSettingsData = await db.operatorSettings.findFirst({
        where: {
          operatorsId: user.operatorsId,
        },
      });
      if (operatorSettingsData) {
        await db.operators.update({
          where: {
            id: user.operatorsId,
          },
          data: {
            name: formData.company,
            description: formData.description,
          },
        });
        await db.operatorSettings.update({
          where: {
            id: operatorSettingsData.id,
          },
          data: {
            operatorsId: user.operatorsId,
            emails: formData.emails,
            numbers: formData.numbers,
            exchangeRate: formData.exchangeRate,
            tickets: formData.tickets,
            closeBooking: String(formData.bookingAt),
            bankName: formData.bankName,
            accountTitle: formData.accountTitle,
            IBAN: formData.ibanNumber,
            swiftCode: formData.swiftNumber,
          },
        });
      }
    }

    return true;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getOperatorSettings(): Promise<
  operatorSettingsReturn | null | undefined
> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const user = await db.users.findUnique({
      where: {
        id: session.userId,
      },
    });

    if (!user || !user.operatorsId) {
      return null;
    }

    const operator = await db.operators.findFirst({
      where: {
        id: user.operatorsId,
      },
    });

    const operatorSettings = await db.operatorSettings.findFirst({
      where: {
        operatorsId: user.operatorsId,
      },
    });

    const operatorsData: operatorSettingsReturn = {
      operator: operator || null,
      operatorSettings: operatorSettings || null,
    };

    return operatorsData || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getSelectedOperatorSettings(
  name: string
): Promise<operatorSettingsReturn | null | undefined> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const operator = await db.operators.findFirst({
      where: {
        name: name,
      },
    });

    const operatorSettings = await db.operatorSettings.findFirst({
      where: {
        operatorsId: operator?.id,
      },
    });

    const operatorsData: operatorSettingsReturn = {
      operator: operator || null,
      operatorSettings: operatorSettings || null,
    };

    return operatorsData || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateOperatorSettings(
  formData: operatorSettingsFormData,
  name: string
): Promise<boolean | null | undefined> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const operator = await db.operators.findFirst({
      where: {
        name: name,
      },
    });

    if (!operator) {
      return null;
    }
    const operatorSettings = await db.operatorSettings.findFirst({
      where: {
        operatorsId: operator?.id,
      },
    });
    if (!formData.tickets) {
      return;
    }
    if (!operatorSettings) {
      await db.operatorSettings.create({
        data: {
          operatorsId: operator?.id,
          emails: formData.emails,
          numbers: formData.numbers,
          exchangeRate: formData.exchangeRate,
          tickets: formData.tickets,
          closeBooking: String(formData.bookingAt),
          bankName: formData.bankName,
          accountTitle: formData.accountTitle,
          IBAN: formData.ibanNumber,
          swiftCode: formData.swiftNumber,
        },
      });
      await db.operators.update({
        where: {
          id: operator.id,
        },
        data: {
          name: formData.company,
          description: formData.description,
        },
      });
    } else {
      if (operatorSettings) {
        await db.operators.update({
          where: {
            id: operator.id,
          },
          data: {
            name: formData.company,
            description: formData.description,
          },
        });
        await db.operatorSettings.update({
          where: {
            id: operatorSettings.id,
          },
          data: {
            operatorsId: operator.id,
            emails: formData.emails,
            numbers: formData.numbers,
            exchangeRate: formData.exchangeRate,
            tickets: formData.tickets,
            closeBooking: String(formData.bookingAt),
            bankName: formData.bankName,
            accountTitle: formData.accountTitle,
            IBAN: formData.ibanNumber,
            swiftCode: formData.swiftNumber,
          },
        });
      }
    }

    return true;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function underMaintainance(
  maintainance: boolean,
  formData: SettingsFormData
): Promise<true | null> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const settings = await db.settings.findFirst({
      where: {
        key: "underMaintainance",
      },
    });

    const maintainanceArray = [
      {
        key: "underMaintainance",
        value: maintainance,
      },
      {
        key: formData.key,
        value: formData.value,
      },
    ];

    for (const setting of maintainanceArray) {
      const existingSetting = await db.settings.findFirst({
        where: {
          key: setting.key,
        },
      });
      if (!existingSetting) {
        await db.settings.create({
          data: {
            key: setting.key,
            value: setting.value,
          },
        });
      } else {
        await db.settings.update({
          where: {
            id: existingSetting.id,
          },
          data: {
            value: setting.value,
          },
        });
      }
    }

    return true;
  } catch (error) {
    console.error(error);
    return null;
  }
}
