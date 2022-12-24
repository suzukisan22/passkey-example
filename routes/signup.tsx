import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { PrismaClient } from '../generated/client/deno/edge.ts';
import { Prisma } from '../generated/client/index.d.ts';
import * as bcrypt from "https://deno.land/x/bcrypt@v0.3.0/mod.ts";

const prisma = new PrismaClient();

type UserInput = {
  email: string;
  name: string;
  password: string;
}

export const handler: Handlers<UserInput | null> = {
  GET(_, ctx) {
    return ctx.render({
      email: '',
      name: '',
      password: ''
    });
  },
  async POST(req: Request, ctx) {
    const data = await req.formData()
    console.log('data')
    console.log(data)
    // const data1 = await fetch('http://localhost:8000/api/test', {method: 'POST', body: JSON.stringify({
    //   email: data.get('email'),
    //   password: data.get('password')
    // })})
    // console.log(data1)
    const email = data.get('email') as string
    const password = data.get('password') as string
    const name = data.get('name') as string
    if (email == null || password == null) {
      return ctx.render({
        email: email,
        name: name,
        password: password
      });
    };

    const user = {
      email,
      password_digest: await bcrypt.hash(password),
      name: data.get('name')
    } as Prisma.UserCreateInput

    await prisma.user.create({
      data: user
    })
    return ctx.render({
      email: '',
      name: '',
      password: ''
    });
  }
};

export default function Signup({ data }: PageProps<UserInput>) {

  return (
    <>
      <Head>
        <title>Fresh App</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
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
              <input type='text' name='name' required class={`px-3 py-2 bg-white rounded border(gray-500 2) disabled:(opacity-50 cursor-not-allowed)`} value={data.email} />
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
