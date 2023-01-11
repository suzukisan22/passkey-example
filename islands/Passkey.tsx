import { useEffect, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import {
  decode,
  encode,
} from "https://deno.land/std@0.167.0/encoding/base64url.ts";

type PasskeyProps = {
  cookie: string;
}

export default function Passkey({cookie}: PasskeyProps) {
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
    const resp = await fetch('http://localhost:8000/api/user', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cookie}`
      }
    })

    const responseBody = await resp.json()

    const credential = await navigator.credentials.create({  
      publicKey: {  
        challenge: new Uint8Array(16),
        rp: {  
          name: "PasskeyExample"
        },
        user: {  
          id: decode(encode(responseBody.email)),
          name: responseBody.email,
          displayName: responseBody.email
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
    console.log(passkey)
    console.log(encode(credential.rawId))
    console.log(credential.response.getTransports())
    console.log(encode(credential.response.getPublicKey()))
    console.log(encode(credential.response.attestationObject))
    console.log(encode(credential.response.clientDataJSON))
    const requestData = {
      publicKey: encode(credential.response.getPublicKey()),
      credentialId: passkey,
      transports: credential.response.getTransports()
    }

    const responseCreate = await fetch('http://localhost:8000/api/passkey/create', {
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
