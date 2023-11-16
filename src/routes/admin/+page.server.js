import {checkIfAdmin} from "$lib/server/account.js";
import {redirect} from "@sveltejs/kit";

export const load = async (serverLoadEvent) => {
    if(!await checkIfAdmin(serverLoadEvent))
        throw redirect(308, '/');
}