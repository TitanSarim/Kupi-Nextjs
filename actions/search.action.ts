"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import { City } from "@/types/city";


export async function getAllMatchedCity():Promise<string[] | null>{

    try {

        const session = await auth();

        if(!session || !session.userId ) {
            return null
        }
        
        const cities = await db.cities.findMany();
        
        return cities.map(city => city.name);

    } catch (error) {
        console.error(error);
        return null
    }
    
}
