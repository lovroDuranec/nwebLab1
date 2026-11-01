
import {auth, requiredScopes } from 'express-oauth2-jwt-bearer';

export const checkJwt = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${process.env.AUTH_DOMAIN}/`,
})

export const requireReadPasses = requiredScopes('read:passes');
export const requireCreatePasses = requiredScopes('create:passes');