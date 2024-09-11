"use server";

import { db } from "@/db";
import { auth } from "@/auth";
import { City } from "@/types/city";


export async function getAllMatchedCity(city: string):Promise<City[] | null>{

    try {

        const session = await auth();

        if(!session || !session.userId ) {
            return null
        }
        
        const cities = await db.cities.findMany({
            where: {
                name: {
                    contains: city, 
                    mode: 'insensitive', 
                }
            }
        });
        
        return cities;

    } catch (error) {
        console.error(error);
        return null
    }
    
}
