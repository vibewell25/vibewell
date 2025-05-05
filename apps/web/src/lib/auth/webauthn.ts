import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import type { 
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON
from '@simplewebauthn/typescript-types';

interface WebAuthnUser {
  id: string;
  email: string;
  currentChallenge?: string;
  credentials: Array<{
    credentialID: string;
    publicKey: string;
    counter: number;
>;
export class WebAuthnService {
  private static readonly rpName = 'Vibewell';
  private static readonly rpID = process.env.NEXT_PUBLIC_DOMAIN ?? 'localhost';

  public async startRegistration(user: WebAuthnUser): Promise<RegistrationResponseJSON> {


    const options: PublicKeyCredentialCreationOptionsJSON = await fetch('/api/auth/webauthn/generate-registration', {
      method: 'POST',


      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, email: user.email })
).then(res => res.json());

    return await startRegistration(options);
public async verifyRegistration(response: RegistrationResponseJSON): Promise<boolean> {


    const verificationResponse = await fetch('/api/auth/webauthn/verify-registration', {
      method: 'POST',


      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response)
return verificationResponse.ok;
public async startAuthentication(email: string): Promise<AuthenticationResponseJSON> {


    const options: PublicKeyCredentialRequestOptionsJSON = await fetch('/api/auth/webauthn/generate-authentication', {
      method: 'POST',


      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
).then(res => res.json());

    return await startAuthentication(options);
public async verifyAuthentication(response: AuthenticationResponseJSON): Promise<boolean> {


    const verificationResponse = await fetch('/api/auth/webauthn/verify-authentication', {
      method: 'POST',


      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response)
return verificationResponse.ok;
