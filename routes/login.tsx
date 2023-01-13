import { Head } from "$fresh/runtime.ts";
import LoginPasskeyForm from '../islands/LoginPasskeyForm.tsx';
import { HandlerContext, PageProps } from "$fresh/server.ts";

export const handler = async (req: Request, ctx: HandlerContext): Promise<Response> => {
  return await ctx.render({})
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
