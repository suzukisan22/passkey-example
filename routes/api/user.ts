import { PrismaClient } from '../../generated/client/deno/edge.ts'
import { User } from '../../generated/client/index.d.ts'
import { HandlerContext } from "$fresh/server.ts";
import { decode } from "https://deno.land/x/djwt@v2.8/mod.ts";

const prisma = new PrismaClient();

type JwtPayload = {
  userId: number;
  exp: number
}

type UserResponse = Omit<User, 'password_digest'>;

export const handler = {
  async POST(req: Request, ctx: HandlerContext) {
    const auth = req.headers.get('Authorization')
    console.log(auth)
    if (!auth) {
      return new Response(JSON.stringify({error: 'bad request'}), {headers: {"Content-Type": "application/json"}});
    }

    const jwt = auth.split(' ')[1];
    console.log("jwt:" + jwt )
    if (!jwt) {
      console.log("jwt Noting" )
      return;
    }

    const [_header, payload, _signature] = decode(jwt)
    const castedPayload = payload as JwtPayload;

    const user = await prisma.user.findFirst({where: {id: castedPayload.userId}, select: {id: true, email: true, name: true, passkey_uuid: true}}) as UserResponse

    return new Response(JSON.stringify({...user}), {headers: {"Content-Type": "application/json"}});
  }
}
