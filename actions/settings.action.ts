"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import { SettingsFormData } from "../types/settings";
import { Settings } from "@prisma/client";


export async function getAdminSetting(): Promise<Settings[] | null> {

    try {
        const session = await auth();

        if(!session || !session.userId ) {
            return null
        }

        const settings = await db.settings.findMany({
            where: {
                operatorsId: session.userId
            }
        })

        if(!settings){
            return null
        }

        return settings


    } catch (error) {
        console.error("Error getting setting:", error);
        return null;
    }
}

export async function adminSetting(formData: SettingsFormData[]): Promise<true | null> {
    try {
  
        const session = await auth();

        if(!session || !session.userId) {
            return null
        }

        for (const setting of formData) {
            const existingSetting = await db.settings.findFirst({
                where: {
                    key: setting.key,
                    operatorsId: session.userId
                }
            });

            if (existingSetting) {
                await db.settings.update({
                    where: {
                        id: existingSetting.id,
                        operatorsId: session.userId,
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
                        operatorsId: session.userId,
                    },
                });
            }
        }
     
        return true

    }catch(error) {
        console.error("Error updating setting:", error);
        return null;
    }

}