import {getUserRoles} from "$lib/server/account.js";
import {pool} from "../../../../hooks.server.js";
import {redirect} from "@sveltejs/kit";

export const load = async (serverLoadEvent) => {
    const {locals} = serverLoadEvent;
    if (!locals.userInfo)
        throw redirect(303, '/login');

    const roles = await getUserRoles(locals.userInfo.user_id);

    if (!roles.includes('admin'))
        throw redirect(303, '/');

    const { rows } = await serverLoadEvent.locals.pool.query(`
        SELECT archive_parts.part_id, archive_parts.duration_ms, archive_parts.date, winner_users.username as winner_username, loser_users.username as loser_username, winner_users.user_id as winner_user_id, loser_users.user_id as loser_user_id
        FROM archive_parts
        LEFT JOIN users AS winner_users ON archive_parts.winner = winner_users.user_id
        LEFT JOIN users AS loser_users ON archive_parts.loser = loser_users.user_id
        WHERE archive_parts.part_id = $1
    `, [serverLoadEvent.params.partId]);

    return { part: rows[0] }
}

export const actions = {
    // delete: async (serverActionEvent) => {
    //     const {locals} = serverActionEvent;
    //     if (!locals.userInfo)
    //         throw redirect(303, '/login');

    //     const roles = await getUserRoles(locals.userInfo.user_id);

    //     if (!roles.includes('admin'))
    //         throw redirect(303, '/');

    //     await softDeleteUser(serverActionEvent.params.userId);

    //     throw redirect(303, '/admin/users');
    // },
    edit: async ({locals, request, params}) => {
        if (!locals.userInfo)
            throw redirect(303, '/login');

        const roles = await getUserRoles(locals.userInfo.user_id);

        if (!roles.includes('admin'))
            throw redirect(303, '/');

        const data = await request.formData();

        await pool.query({
            text: "UPDATE users SET username = $1 WHERE user_id = $2",
            values: [data.get('username'), params.userId]
        });

        throw redirect(303, '/admin/users');
    }
}