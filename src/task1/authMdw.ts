import dotenv from 'dotenv'
import {auth, requiredScopes } from 'express-oauth2-jwt-bearer';
dotenv.config()
const domain = process.env.AUTH0_DOMAIN;
const audience = process.env.AUTH0_AUDIENCE;
if (!domain || !audience) {
  throw new Error(`Missing env: AUTH0_DOMAIN=${domain}, AUTH0_AUDIENCE=${audience}`);
}
export const checkJwt = auth({
  audience,
  issuerBaseURL: `https://${domain}/`,
  tokenSigningAlg: 'RS256',
});

export const requireReadPasses = requiredScopes('read:passes');
export const requireCreatePasses = requiredScopes('create:passes');