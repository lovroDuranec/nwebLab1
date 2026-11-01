
import {auth, requiredScopes } from 'express-oauth2-jwt-bearer';

export const checkJwt = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    tokenSigningAlg: 'RS256'
})

export const requireReadPasses = requiredScopes('read:passes');
export const requireCreatePasses = requiredScopes('create:passes');