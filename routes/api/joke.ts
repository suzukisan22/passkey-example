import { PrismaClient } from '../../generated/client/deno/edge.ts'
import { HandlerContext } from "$fresh/server.ts";

const prisma = new PrismaClient();

export const handler = async (_req: Request, _ctx: HandlerContext): Promise<Response> => {
  const count = await prisma.user.count()
  return new Response(JSON.stringify({count}), {headers: {"Content-Type": "application/json"}});
};
