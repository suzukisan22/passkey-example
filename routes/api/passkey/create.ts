import { PrismaClient } from '../../../generated/client/deno/edge.ts'
import { User, Passkey } from '../../../generated/client/index.d.ts'
import { HandlerContext } from "$fresh/server.ts";
import { decode } from "https://deno.land/x/djwt@v2.8/mod.ts";

const prisma = new PrismaClient();

type JwtPayload = {
  userId: number;
  exp: number
}

type UserResponse = Omit<User, 'password_digest'>;

type CreatePasskeyParams = Omit<Passkey, 'id' | 'userId'>;

export const handler = {
  async POST(req: Request, ctx: HandlerContext) {
    const auth = req.headers.get('Authorization')
    if (!auth) {
      return new Response(JSON.stringify({error: 'bad request'}), {headers: {"Content-Type": "application/json"}});
    }

    const jwt = auth.split(' ')[1];
    if (!jwt) {
      console.log("jwt Noting" )
      return;
    }

    const [_header, payload, _signature] = decode(jwt)
    const castedPayload = payload as JwtPayload;

    const user = await prisma.user.findFirst({where: {id: castedPayload.userId}, select: {id: true, email: true, name: true}}) as UserResponse

    if (!user.id) {
      return new Response(JSON.stringify({error: 'user notfound'}), {headers: {"Content-Type": "application/json"}});
    }

    const json: CreatePasskeyParams = await req.json();

    const passkey = await prisma.passkey.create({
      data: {
        userId: user.id,
        credentialId: json.credentialId,
        publicKey: json.publicKey,
        transports: json.transports
      }
    })

    return new Response(JSON.stringify({count: 0}), {headers: {"Content-Type": "application/json"}});
  }
}
