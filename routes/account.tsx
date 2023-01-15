import { Head } from "$fresh/runtime.ts";
import Passkey from "../islands/Passkey.tsx";
import { PrismaClient } from '../generated/client/deno/edge.ts';
import { HandlerContext, PageProps } from "$fresh/server.ts";
import { getCookies } from "https://deno.land/std@0.167.0/http/cookie.ts";
import { decode } from "https://deno.land/x/djwt@v2.8/mod.ts";
import "https://deno.land/x/dotenv/load.ts";

const prisma = new PrismaClient();

type AccountProps = {
  cookie: string;
}

type JwtPayload = {
  userId: number;
  exp: number
}

export const handler = async (req: Request, ctx: HandlerContext): Promise<Response> => {
  const cookie = getCookies(req.headers)['passkey-example-session']
  if (!cookie) {
    return new Response("", {
      status: 303,
      headers: { Location: '/' },
    });
  }

  const [headers, payload, signature] = decode(cookie)

  const date = new Date();
  const payloadJwt = payload as JwtPayload;
  if (payloadJwt['exp'] < Number(date)) {
    // jwtの期限が切れている場合
    return new Response("", {
      status: 303,
      headers: { Location: '/' },
    });
  }

  const userId = await prisma.user.findFirst({where: {id: payloadJwt.userId}});

  if (!userId) {
    // userIdがDBに存在しない場合
    return new Response("", {
      status: 303,
      headers: { Location: '/' },
    });
  }

  return await ctx.render({cookie})
};

export default function Account({ data }: PageProps<AccountProps>) {
  return (
    <>
      <Head>
        <title>Fresh App</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <Passkey cookie={data.cookie} />
      </div>
    </>
  );
}
