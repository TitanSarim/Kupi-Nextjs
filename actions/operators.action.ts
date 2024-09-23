"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import { Operators } from "@prisma/client";
import { FormData, OperatorStatus } from "@/types/operator";
import { sendInvitationEmail } from "@/libs/SendInvitationMail";

export async function getAllOperators() {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const operators = await db.operators.findMany();

    return operators;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function AddOperator(
  formData: FormData
): Promise<Operators | null> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const invitationEmail = await sendInvitationEmail(formData.email);

    if (!invitationEmail) {
      console.error("Error sending invitation email");
      return null;
    }

    const operator = await db.operators.create({
      data: {
        name: formData.name,
        description: formData.description || "",
        status: OperatorStatus.INVITED,
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
