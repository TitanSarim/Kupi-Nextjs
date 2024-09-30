"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import { Operators, Prisma } from "@prisma/client";
import { randomBytes } from "crypto";
import {
  FilterProps,
  FormData,
  OperatorsData,
  OperatorsDataReturn,
  OperatorStatus,
  UpdateFormData,
} from "@/types/operator";
import { sendInvitationEmail } from "@/libs/SendInvitationMail";
import { SortOrderProps } from "@/types/ticket";
import { encryptData } from "@/libs/ServerSideHelpers";

export async function getAllOperators(searchParams: {
  name?: string;
  email?: string;
  status?: string;
  sort?: string;
  pageIndex?: number;
  pageSize?: number;
}): Promise<OperatorsData | null> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const {
      name,
      email,
      status,
      sort,
      pageIndex = 0,
      pageSize = 10,
    } = searchParams;

    const pageSizeNumber = Number(pageSize);
    const pageIndexNumber = Number(pageIndex);

    const skip = pageIndexNumber * pageSizeNumber;
    const take = pageSizeNumber;

    const filter: FilterProps = {};

    if (name) {
      filter.name = { contains: name, mode: "insensitive" };
    }
    if (email)
      filter.OperatorsSessions = {
        some: {
          email: { contains: email, mode: "insensitive" },
        },
      };
    if (status) {
      filter.status = status as OperatorStatus;
    }

    const sortOrder: SortOrderProps[] = [];
    if (sort) {
      const [field, order] = sort.split("_");
      if (field === "name" || field === "status" || field === "joiningDate") {
        sortOrder.push({ [field]: order === "asc" ? "asc" : "desc" });
      }
    } else {
      sortOrder.push({ joiningDate: "desc" });
    }

    const operatorsData = await db.operators.findMany({
      where: filter,
      orderBy: sortOrder,
      skip,
      take,
      include: {
        OperatorsSessions: true,
      },
    });

    const totalCount = await db.operators.count({ where: filter });

    if (!operatorsData) {
      return null;
    }

    const wrappedOperators: OperatorsDataReturn[] = operatorsData.map(
      (operator) => ({
        operators: operator,
        sessionData: operator.OperatorsSessions,
      })
    );

    return {
      operators: wrappedOperators,
      paginationData: {
        totalCount,
        pageSize,
        pageIndex,
      },
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function AddOperator(
  formData: FormData
): Promise<Operators | null | string> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const existingOperator = await db.operators.findFirst({
      where: {
        OR: [{ name: formData.name }],
      },
    });

    const existingEmail = await db.users.findFirst({
      where: {
        OR: [{ email: formData.email }],
      },
    });

    if (existingOperator) {
      console.error("Operator with the same name already exists");
      return "perator with the same name already exists";
    }
    if (existingEmail) {
      console.error("Operator with the same email already exists");
      return "Operator with the same email already exists";
    }

    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 48);
    const secret = process.env.SECURE_AUTH_KEY;
    if (!secret) {
      console.error("SECURE_AUTH_KEY environment variable not set");
      return "SECURE_AUTH_KEY environment variable not set";
    }
    const dataToEncrypt = {
      email: formData.email,
      name: formData.name,
      expiresAt: expirationTime.toISOString(),
    };
    const encryptedData = await encryptData(dataToEncrypt, secret);

    const invitationEmail = await sendInvitationEmail(
      formData.email,
      formData.name,
      encryptedData
    );

    if (!invitationEmail) {
      console.error("Error sending invitation email");
      return "Error sending invitation email";
    }

    const operator = await db.operators.create({
      data: {
        name: formData.name,
        description: formData.description || "",
        status: OperatorStatus.INVITED,
        source: "KUPI",
      },
    });

    const isSession = await db.operatorsSessions.findFirst({
      where: {
        email: formData.email,
      },
    });

    if (!isSession) {
      await db.operatorsSessions.create({
        data: {
          operatorId: operator.id,
          email: formData.email,
          expires: expirationTime,
          sessionToken: encryptedData,
        },
      });
    } else if (isSession) {
      await db.operatorsSessions.update({
        where: {
          id: isSession?.id,
        },
        data: {
          email: formData.email,
          expires: expirationTime,
          sessionToken: encryptedData,
        },
      });
    }

    if (!operator) {
      return null;
    }
    return operator || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function UpdateOperatorInvitation(
  formData: UpdateFormData,
  id: string,
  sessionId: string
): Promise<Operators | null | string> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 48);
    const secret = process.env.SECURE_AUTH_KEY;
    if (!secret) {
      console.error("SECURE_AUTH_KEY environment variable not set");
      return "SECURE_AUTH_KEY environment variable not set";
    }
    const dataToEncrypt = {
      email: formData.email,
      name: formData.name,
      expiresAt: expirationTime.toISOString(),
    };
    const encryptedData = await encryptData(dataToEncrypt, secret);

    if (formData.checked === true && formData.email) {
      const invitationEmail = await sendInvitationEmail(
        formData.email,
        formData.name,
        encryptedData
      );
      if (!invitationEmail) {
        console.error("Error sending invitation email");
        return "Error sending invitation email";
      }
    }

    const operator = await db.operators.update({
      where: {
        id: id,
      },
      data: {
        name: formData.name,
        description: formData.description || "",
        status: OperatorStatus.INVITED,
      },
    });

    await db.operatorsSessions.update({
      where: {
        id: sessionId,
      },
      data: {
        email: formData.email,
        expires: expirationTime,
        sessionToken: encryptedData,
      },
    });

    if (!operator) {
      return null;
    }
    return operator || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
