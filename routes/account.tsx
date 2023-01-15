import { Head } from "$fresh/runtime.ts";
import Passkey from "../islands/Passkey.tsx";
import { HandlerContext, PageProps } from "$fresh/server.ts";
import { getCookies } from "https://deno.land/std@0.167.0/http/cookie.ts";
import "https://deno.land/x/dotenv/load.ts";

type AccountProps = {
  cookie: string;
}

export const handler = async (req: Request, ctx: HandlerContext): Promise<Response> => {
  const cookie = getCookies(req.headers)['passkey-example-session']
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
