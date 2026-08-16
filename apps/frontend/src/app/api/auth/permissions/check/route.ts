import { NextResponse } from "next/server";
import { sql, ensureDbInitialized } from "@/lib/db";

export async function GET(request: Request) {
  try {
    await ensureDbInitialized();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const permission = searchParams.get("permission");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Check if the user is a Core Admin
    const userRows = await sql`
      SELECT u.id, u.role, r.name as "roleName"
      FROM "User" u
      LEFT JOIN "UserRole" ur ON u.id = ur."userId"
      LEFT JOIN "Role" r ON ur."roleId" = r.id
      WHERE u.id = ${userId}
      LIMIT 1
    `;

    const user = userRows[0];
    const isCore =
      user &&
      ((user.role && user.role.toLowerCase() === 'core') ||
        ['SUPER_ADMIN', 'ADMIN', 'ORGANIZER'].includes(user.roleName));

    if (isCore) {
      const allPerms = ['create_event', 'edit_event', 'manage_announcements', 'scan_ticket', 'view_analytics'];
      return NextResponse.json({
        success: true,
        hasPermission: true,
        permissions: allPerms,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    if (permission) {
      // Query database for active permission (not expired)
      const rows = await sql`
        SELECT id, "expiresAt"
        FROM "crew_permissions"
        WHERE "userId" = ${userId} 
          AND permission = ${permission} 
          AND "expiresAt" > NOW()
        LIMIT 1
      `;

      const hasPermission = rows.length > 0;
      const expiresAt = hasPermission ? rows[0].expiresAt : null;

      return NextResponse.json({ 
        success: true, 
        hasPermission,
        permissions: hasPermission ? [permission] : [],
        expiresAt
      });
    } else {
      // Query database for all active permissions (not expired)
      const rows = await sql`
        SELECT permission, "expiresAt"
        FROM "crew_permissions"
        WHERE "userId" = ${userId} 
          AND "expiresAt" > NOW()
      `;

      const permissions = rows.map((r: any) => r.permission);

      return NextResponse.json({ 
        success: true, 
        hasPermission: permissions.length > 0,
        permissions
      });
    }
  } catch (error: any) {
    console.error("Permission check error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
