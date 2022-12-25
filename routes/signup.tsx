import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { PrismaClient } from '../generated/client/deno/edge.ts';
import { Prisma } from '../generated/client/index.d.ts';
import { setCookie } from "https://deno.land/std@0.167.0/http/cookie.ts";
import { create, decode } from "https://deno.land/x/djwt@v2.8/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.3.0/mod.ts";


const prisma = new PrismaClient();

type UserInput = {
  email: string;
  name: string;
  password: string;
  message: string;
}

export const handler: Handlers<UserInput | null> = {
  GET(_, ctx) {
    return ctx.render({
      email: '',
      name: '',
      password: '',
      message: ''
    });
  },
  async POST(req: Request, ctx) {
    const data = await req.formData()
    const email = data.get('email') as string
    const password = data.get('password') as string

    const name = data.get('name') as string
    if (email == null || password == null) {
      return ctx.render({
        email: email,
        name: name,
        password: password,
        message: ''
       });
    }

    const emailDuplicate = await prisma.user.findFirst({where: {email}})
    if (emailDuplicate != null) {
      return ctx.render({
        email: email,
        name: name,
        password: password,
        message: '重複しています'
       });
    }

    const user = {
      email,
      password_digest: await bcrypt.hash(password),
      name: data.get('name')
    } as Prisma.UserCreateInput

    const userResponse = await prisma.user.create({
      data: user
    })

    const key = await crypto.subtle.generateKey(
      { name: "HMAC", hash: "SHA-512" },
      true,
      ["sign", "verify"],
    );

    const dt = new Date
    dt.setDate(dt.getDate() + 10);

    const jwt = await create({ alg: "HS512", typ: "JWT" }, { user_id: userResponse.id, exp: Number(dt) }, key);
    const response = await ctx.render({
      email: '',
      name: '',
      password: '',
      message: ''
    });

    setCookie(response.headers, {
      name: "passkey-example-session",
      value: jwt,
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
    });

    return response;
  }
};

export default function Signup({ data }: PageProps<UserInput>) {

  return (
    <>
      <Head>
        <title>Fresh App</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        {data.message && <p>{data.message}</p>}
        <form method='post'>
          <div>
            <label>
              email: 
              <input type='email' name='email' required class={`px-3 py-2 bg-white rounded border(gray-500 2) disabled:(opacity-50 cursor-not-allowed)`} value={data.email} />
            </label>
          </div>
          <div>
            <label>
              name: 
              <input type='text' name='name' required class={`px-3 py-2 bg-white rounded border(gray-500 2) disabled:(opacity-50 cursor-not-allowed)`} value={data.name} />
            </label>
          </div>
          <div>
            <label>
              password:           
              <input type='password' name='password' required class={`px-3 py-2 bg-white rounded border(gray-500 2) disabled:(opacity-50 cursor-not-allowed)`} value={data.password} />
            </label>
          </div>
          <input type='submit'
            class={`px-3 py-2 bg-white rounded border(gray-500 2) hover:bg-gray-200 active:bg-gray-300 disabled:(opacity-50 cursor-not-allowed)`}
            value='Sign up'
          />
        </form>
      </div>
    </>
  );
}
