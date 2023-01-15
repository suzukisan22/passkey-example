import { Head } from "$fresh/runtime.ts";
import LoginPasskeyForm from '../islands/LoginPasskeyForm.tsx';
import { HandlerContext } from "$fresh/server.ts";
import { getCookies } from "https://deno.land/std@0.167.0/http/cookie.ts";
import { decode } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { PrismaClient } from '../generated/client/deno/edge.ts';

const prisma = new PrismaClient();

type JwtPayload = {
  userId: number;
  exp: number
}

export const handler = async (req: Request, ctx: HandlerContext): Promise<Response> => {
  const cookie = getCookies(req.headers)['passkey-example-session']
  if (!cookie) {
    return ctx.render({})
  }

  const [headers, payload, signature] = decode(cookie)

  const date = new Date();
  const payloadJwt = payload as JwtPayload;
  if (payloadJwt['exp'] < Number(date)) {
    // jwtの期限が切れている場合
    return ctx.render({})
  }

  const userId = await prisma.user.findFirst({where: {id: payloadJwt.userId}});

  if (!userId) {
    // userIdがDBに存在しない場合
    return ctx.render({})
  }

  return new Response("", {
    status: 303,
    headers: { Location: '/' },
  });
};

export default function Login() {
  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
          <LoginPasskeyForm />
          <form>
            <div>
              <input type='text' name='email' class={`px-3 py-2 bg-white rounded border(gray-500 2) disabled:(opacity-50 cursor-not-allowed)`} autocomplete="username webauthn" />
            </div>
            <div>
              <input type='password' class={`px-3 py-2 bg-white rounded border(gray-500 2) disabled:(opacity-50 cursor-not-allowed)`} name='password' />
            </div>
            <input type='submit' value='emailでログイン'/>
          </form>
        
      </div>
    </>
  );
}
