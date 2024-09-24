"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import { Operators, Prisma } from "@prisma/client";
import {
  FilterProps,
  FormData,
  OperatorsData,
  OperatorStatus,
  UpdateFormData,
} from "@/types/operator";
import { sendInvitationEmail } from "@/libs/SendInvitationMail";
import { SortOrderProps } from "@/types/ticket";

export async function getAllOperators(searchParams: {
  name?: string;
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

    const { name, status, sort, pageIndex = 0, pageSize = 10 } = searchParams;

    const pageSizeNumber = Number(pageSize);
    const pageIndexNumber = Number(pageIndex);

    const skip = pageIndexNumber * pageSizeNumber;
    const take = pageSizeNumber;

    const filter: Prisma.OperatorsWhereInput = {};

    if (name) {
      filter.name = { contains: name, mode: "insensitive" };
    }

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
    });

    const totalCount = await db.operators.count();

    if (!operatorsData) {
      return null;
    }

    return {
      operators: operatorsData,
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

    const invitationEmail = await sendInvitationEmail(
      formData.email,
      formData.name
    );

    if (!invitationEmail) {
      console.error("Error sending invitation email");
      return "Error sending invitation email";
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

export async function UpdateOperatorInvitation(
  formData: UpdateFormData,
  id: string
): Promise<Operators | null | string> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    if (formData.checked === true && formData.email) {
      const invitationEmail = await sendInvitationEmail(
        formData.email,
        formData.name
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

    if (!operator) {
      return null;
    }
    return operator || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
