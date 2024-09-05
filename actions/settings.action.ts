"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import { Setting, SettingsFormData } from "../types/settings";
import { Settings } from "@prisma/client";


export async function getAdminSetting(key: string): Promise<Settings | null> {

    try {
        const session = await auth();

        if(!session || !session.userId ) {
            return null
        }

        const Setting = await db.settings.findFirst({
            where: {
                key: key,
                operatorsId: session.userId
            }
        })

        if(!Setting){
            return null
        }

        return Setting


    } catch (error) {
        console.error("Error getting setting:", error);
        return null;
    }
}

export async function AdminSetting(formData: SettingsFormData): Promise<true | null> {
    try {
  
        const session = await auth();

        if(!session || !session.userId) {
            return null
        }

        const existingSetting = await db.settings.findFirst({
            where: {
                key: formData.key,
                operatorsId: session.userId
            }
        })

        if(existingSetting){
            await db.settings.update({
                where: {
                    id: existingSetting.id,
                    operatorsId: session.userId,
                },
                data: {
                  value: JSON.stringify(formData.adminSetting),
                },
            });
        }else {
            await db.settings.create({
                data: {
                  key: formData.key,
                  value: JSON.stringify(formData.adminSetting),
                  operatorsId: session.userId,
                },
            });
        }
     
        return true

    }catch(error) {
        console.error("Error updating setting:", error);
        return null;
    }

}