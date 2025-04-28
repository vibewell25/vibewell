import type { NextPage } from 'next';
import React, { useState, FormEvent } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const bufferDecode = (arr: number[]) => new Uint8Array(arr);
const bufferEncode = (buf: ArrayBuffer) => {
  const bytes = new Uint8Array(buf);
  let str = '';
  for (let i = 0; i < bytes.byteLength; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const Security: NextPage = () => {
  const [secret, setSecret] = useState<string>('');
  const [qr, setQr] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  const setupTOTP = async () => {
    const res = await fetch('/api/security/totp/setup');
    const data = await res.json();
    setSecret(data.base32);
    setQr(data.otpauthUrl);
  };
  const verifyTOTP = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/security/totp/verify', {
      method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ token })
    });
    const ok = (await res.json()).success;
    setMsg(ok ? 'TOTP verified' : 'Invalid token');
  };

  /* WebAuthn Registration */
  const registerWebAuthn = async () => {
    const opts = await fetch('/api/security/webauthn/register').then(r=>r.json());
    const publicKey: any = {
      ...opts,
      challenge: bufferDecode(opts.challenge),
      user: { ...opts.user, id: bufferDecode(opts.user.id) }
    };
    const cred: any = await navigator.credentials.create({ publicKey });
    const att = cred as any;
    const response = {
      id: att.id,
      rawId: bufferEncode(att.rawId),
      type: att.type,
      response: {
        attestationObject: bufferEncode(att.response.attestationObject),
        clientDataJSON: bufferEncode(att.response.clientDataJSON)
      }
    };
    const r = await fetch('/api/security/webauthn/register', {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(response)
    });
    setMsg((await r.json()).success ? 'WebAuthn registered' : 'Registration failed');
  };

  /* WebAuthn Authentication */
  const authWebAuthn = async () => {
    const opts = await fetch('/api/security/webauthn/authenticate').then(r=>r.json());
    const publicKey: any = {
      ...opts,
      challenge: bufferDecode(opts.challenge),
      allowCredentials: opts.allowCredentials.map((c:any) => ({
        ...c,
        id: bufferDecode(c.id)
      }))
    };
    const assertion: any = await navigator.credentials.get({ publicKey });
    const resp = assertion as any;
    const data = {
      id: resp.id,
      rawId: bufferEncode(resp.rawId),
      type: resp.type,
      response: {
        authenticatorData: bufferEncode(resp.response.authenticatorData),
        clientDataJSON: bufferEncode(resp.response.clientDataJSON),
        signature: bufferEncode(resp.response.signature),
        userHandle: resp.response.userHandle ? bufferEncode(resp.response.userHandle) : undefined
      }
    };
    const r = await fetch('/api/security/webauthn/authenticate', {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)
    });
    setMsg((await r.json()).success ? 'Authentication succeeded' : 'Authentication failed');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Security Settings</h1>
      <Card className="mb-4">
        <h2 className="text-xl font-semibold mb-2">TOTP (Two-Factor)</h2>
        <Button onClick={setupTOTP} className="mb-2">Setup TOTP</Button>
        {qr && (
          <div className="mb-2">
            <img src={qr} alt="QR Code" className="mb-2" />
            <p className="text-sm text-gray-700 break-all">Secret: {secret}</p>
          </div>
        )}
        {qr && (
          <form onSubmit={verifyTOTP} className="flex items-center space-x-2">
            <Input value={token} onChange={e => setToken(e.target.value)} placeholder="Enter code" />
            <Button type="submit">Verify</Button>
          </form>
        )}
      </Card>
      <Card className="mb-4">
        <h2 className="text-xl font-semibold mb-2">WebAuthn</h2>
        <div className="flex space-x-2">
          <Button onClick={registerWebAuthn}>Register Authenticator</Button>
          <Button onClick={authWebAuthn}>Authenticate</Button>
        </div>
      </Card>
      {msg && <p className="mt-4 text-green-600">{msg}</p>}
    </div>
  );
};

export default Security;
