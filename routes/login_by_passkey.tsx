import { PrismaClient } from '../generated/client/deno/edge.ts';
import { HandlerContext } from "$fresh/server.ts";
import { create } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { setCookie } from "https://deno.land/std@0.167.0/http/cookie.ts";

const prisma = new PrismaClient();

export const handler = { 
  async POST(req: Request, ctx: HandlerContext) {
    const formData = await req.formData();
    const passkey_uuid = formData.get('passkey_uuid') as string
    const credentialId = formData.get('credential_id') as string

    const user = await prisma.user.findFirst({where: {passkey_uuid}, select: {id: true}})
    if (!user) {
      return ctx.render({})
    }

    const passkey = await prisma.passkey.findFirst({where: {userId: user.id, credentialId}})

    if (!passkey) {
      return ctx.render({})
    }

    const key = await crypto.subtle.generateKey(
      { name: "HMAC", hash: "SHA-512" },
      true,
      ["sign", "verify"],
    );

    const dt = new Date
    dt.setDate(dt.getDate() + 10);

    const jwt = await create({ alg: "HS512", typ: "JWT" }, { userId: user.id, exp: Number(dt) }, key);
    const response = new Response("", {
      status: 303,
      headers: { Location: "/" },
    });

    setCookie(response.headers, {
      name: "passkey-example-session",
      value: jwt,
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
    });

    return response;
  }
}
export default function LoginByPasskey() {
  return (
    <>
    </>
  );
}
