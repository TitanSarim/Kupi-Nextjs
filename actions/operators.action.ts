"use server";
import axios from "axios";
import { db } from "@/db";
import { auth } from "@/auth";
import { Operators, Prisma, TicketSources } from "@prisma/client";
import {
  FilterProps,
  FormData,
  LookupModel,
  OperatorLookupModel,
  OperatorsData,
  OperatorsDataReturn,
  OperatorStatus,
  UpdateFormData,
} from "@/types/operator";
import { sendInvitationEmail } from "@/libs/SendInvitationMail";
import { SortOrderProps } from "@/types/ticket";
import { encryptData } from "@/libs/ServerSideHelpers";
import { revalidatePath } from "next/cache";
import { parseStringPromise } from "xml2js";

export async function getAllOperators(searchParams: {
  source?: string;
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
      source,
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

    const filter: Prisma.OperatorsWhereInput = {};

    if (source) {
      filter.source = source as TicketSources;
    }
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
      if (
        field === "name" ||
        field === "status" ||
        field === "joiningDate" ||
        field === "source" ||
        field === "isLive"
      ) {
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
): Promise<boolean | null | string> {
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
      return "Operator with the same name already exists";
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
      formData.description,
      encryptedData
    );

    if (!invitationEmail) {
      console.error("Error sending invitation email");
      return "Error sending invitation email";
    }

    const operator = await db.operators.create({
      data: {
        name: formData.name,
        description: "",
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
          message: formData.description || "",
          expires: expirationTime,
          sessionToken: encryptedData,
          isActive: true,
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
          message: formData.description || "",
          sessionToken: encryptedData,
          isActive: true,
        },
      });
    }

    if (!operator) {
      return null;
    }
    revalidatePath("/app/bus-operators");
    return true || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function resendInvite(
  operatorId: string
): Promise<boolean | null | string | undefined> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const operator = await db.operators.findUnique({
      where: {
        id: operatorId,
      },
    });

    if (!operator) {
      return null;
    }

    const operatorSession = await db.operatorsSessions.findFirst({
      where: {
        operatorId: operatorId,
      },
    });

    if (!operatorSession) {
      return null;
    }
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 48);
    const secret = process.env.SECURE_AUTH_KEY;

    const dataToEncrypt = {
      email: operatorSession.email,
      name: operator.name,
      expiresAt: expirationTime.toISOString(),
    };
    if (!secret) {
      console.error("SECURE_AUTH_KEY environment variable not set");
      return "SECURE_AUTH_KEY environment variable not set";
    }
    const encryptedData = await encryptData(dataToEncrypt, secret);

    const invitationEmail = await sendInvitationEmail(
      operatorSession.email,
      operator.name,
      operatorSession.message || "",
      encryptedData
    );

    if (!invitationEmail) {
      console.error("Error sending invitation email");
      return "Error sending invitation email";
    }

    return true;
  } catch (error) {
    return null;
  }
}

export async function accountStatus(
  operatorId: string,
  status: string
): Promise<boolean | null | string | undefined> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const operator = await db.operators.findUnique({
      where: {
        id: operatorId,
      },
    });

    if (!operator) {
      return null;
    }

    let results;
    if (status === "SUSPENDED") {
      results = await db.operators.update({
        where: {
          id: operatorId,
        },
        data: {
          status: OperatorStatus.REGISTERED,
          isLive: true,
        },
      });
    } else if (status === "INVITED" || status === "REGISTERED") {
      results = await db.operators.update({
        where: {
          id: operatorId,
        },
        data: {
          status: OperatorStatus.SUSPENDED,
          isLive: false,
        },
      });
    }

    if (!results) {
      return null;
    }
    revalidatePath("/app/bus-operators");
    return true;
  } catch (error) {
    return null;
  }
}

export async function deleteAccount(
  operatorId: string
): Promise<boolean | null | string | undefined> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const operator = await db.operators.delete({
      where: {
        id: operatorId,
      },
    });

    if (!operator) {
      return null;
    }
    revalidatePath("/app/bus-operators");
    return true;
  } catch (error) {
    return null;
  }
}

export async function CheckPrevRequest(email: string): Promise<true | null> {
  try {
    const session = await db.operatorsSessions.findFirst({
      where: {
        email: email,
        isActive: false,
      },
    });

    if (session) {
      return true;
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function SyncBusOperators() {
  try {
    let data =
      '<?xml version="1.0" encoding="utf-8"?>\r\n\r\n<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\r\n  <soap:Body>\r\n    <GetLookup xmlns="http://tempuri.org/">\r\n      <STImpID>KPI</STImpID>\r\n      <STTerm>INTERNET</STTerm>\r\n      <INTrace>0</INTrace>\r\n      <STLookup>Carriers</STLookup>\r\n      <STVersion>0</STVersion>\r\n    </GetLookup>\r\n  </soap:Body>\r\n</soap:Envelope>';

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://129.232.159.230/CarmatestSwitchKPI/Lookup.asmx",
      headers: {
        "Content-Type": "text/xml",
        SOAPAction: '"http://tempuri.org/GetLookup"',
      },
      data: data,
    };
    const response = await axios.request(config);
    const result = await parseStringPromise(response.data);

    const lookupModels =
      result["soap:Envelope"]["soap:Body"][0]["GetLookupResponse"][0][
        "GetLookupResult"
      ][0]["Response"][0]["LookupModel"];

    const jsonResponse = lookupModels.map((model: LookupModel) => ({
      STDescription: model["STDescription"][0],
      STCarrier: model["STCarrier"][0],
    }));

    const allOperators = await db.operators.findMany({
      select: {
        name: true,
      },
    });

    const existingOperatorNames = allOperators.map((operator) => operator.name);

    const newOperators: OperatorLookupModel[] = jsonResponse.filter(
      (operator: OperatorLookupModel) =>
        !existingOperatorNames.includes(operator.STDescription)
    );

    let results;
    if (newOperators.length > 0) {
      results = await db.operators.createMany({
        data: newOperators.map((operator) => ({
          name: operator.STDescription,
          carmaCode: operator.STCarrier,
          status: "REGISTERED",
          description: "",
          source: "CARMA",
        })),
      });
    }

    return true;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateStatus(
  id: string,
  status: boolean
): Promise<true | null> {
  try {
    const session = await auth();

    if (!session || !session.userId) {
      return null;
    }

    const operator = await db.operators.update({
      where: {
        id: id,
      },
      data: {
        isLive: status,
      },
    });

    if (!operator) {
      return null;
    }

    revalidatePath("/app/bus-operators");
    return true;
  } catch (error) {
    console.error(error);
    return null;
  }
}
