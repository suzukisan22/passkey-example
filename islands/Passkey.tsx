import { useEffect, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import {
  decode,
  encode,
} from "https://deno.land/std@0.167.0/encoding/base64url.ts";

type PasskeyProps = {
  cookie: string;
}

export default function Passkey({cookie}:PasskeyProps) {
  const [isAvailablePasskey, setIsAvailablePasskey] = useState(false);

  useEffect(() => {
    (async () => {
      if (!window.PublicKeyCredential ||
        !PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
          return false
        }
      // Check if user verifying platform authenticator is available.
  
      const isAvailablePasskey =  await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      setIsAvailablePasskey(isAvailablePasskey)
    })()
  }, [])

  const createPasskey = async () => {
    // ログイン中のユーザーの情報を持ってくる
    const resp = await fetch('/api/user', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cookie}`
      }
    })

    const responseBody = await resp.json()

    const string_to_buffer = (src: string) => {
      return (new Uint8Array([].map.call(src, function(c) {
        return c.charCodeAt(0)
      }))).buffer;
    }

    const credential = await navigator.credentials.create({  
      publicKey: {  
        challenge: new Uint8Array(16),
        rp: {
          id: location.host == 'localhost:8000' ? 'localhost' : location.host,
          name: "PasskeyExample"
        },
        user: {  
          id: string_to_buffer(responseBody.passkey_uuid),
          name: responseBody.email,
          displayName: responseBody.name
        }, 
        pubKeyCredParams: [{alg: -7, type: "public-key"},{alg: -257, type: "public-key"}],
        excludeCredentials: [{
          id: new Uint8Array(16),
          type: 'public-key',
          transports: ['internal'],
        }],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          requireResidentKey: true,
        }
      }
    });

    if (!credential) { return ;}

    const passkey = credential.id
    const requestData = {
      publicKey: encode(credential.response.getPublicKey()),
      credentialId: passkey,
      transports: credential.response.getTransports()
    }

    const responseCreate = await fetch('/api/passkey/create', {
      method: 'POST',
      body: JSON.stringify(requestData),
      headers: {
        'Authorization': `Bearer ${cookie}`,
        'Content-Type': 'application/json'
      }
    })
  }

  return (
    <div class="flex gap-2 w-full">
      {isAvailablePasskey && 
        <Button onClick={createPasskey}>Passkeyを登録する</Button>}
    </div>
  );
}
