import { useEffect, useState } from "preact/hooks";
import {
  encode,
} from "https://deno.land/std@0.167.0/encoding/base64url.ts";

export default function LoginPasskeyForm() {
  const [credentialId, setCredentialId] = useState('')
  const [userPasskeyUuid, setUserPasskeyUuid] = useState('')

  useEffect(() => {
    (async () => {
      const passkey = await navigator.credentials.get({
        publicKey: {
          challenge: new ArrayBuffer(32)
        }
      })

      console.log(passkey)

      if(!passkey) { return ;}
      
      const bufferToString = (arrayBuffer) =>  {
        let binaryString = "";
        const bytes = new Uint8Array(arrayBuffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binaryString += String.fromCharCode(bytes[i]);
        }
        return binaryString
      }

      const user:string = bufferToString(passkey.response.userHandle)
      setCredentialId(passkey.id)
      setUserPasskeyUuid(user)
    })()
  }, [])

  return (
    <form method="post" action="/login_by_passkey">
      <input type="hidden" name='passkey_uuid' value={userPasskeyUuid} />
      <input type="hidden" name='credential_id' value={credentialId} />
      <input type='submit'
        class={`px-3 py-2 bg-white rounded border(gray-500 2) hover:bg-gray-200 active:bg-gray-300 disabled:(opacity-50 cursor-not-allowed)`}
        value='passkeyでログイン' />
    </form>
  );
}
