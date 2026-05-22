// ============================================================================
// Catch-all des routes d'authentification — /api/auth/*
// ----------------------------------------------------------------------------
// Le segment `[...all]` capture TOUTES les sous-routes d'auth :
//   /api/auth/sign-in, /api/auth/sign-up, /api/auth/callback/github, etc.
//
// better-auth fournit un helper qui transforme la config `auth` (cf. lib/auth)
// en handlers Next-compatibles. On se contente de réexporter GET et POST.
// ============================================================================

import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

const { GET, POST } = toNextJsHandler(auth);
export { GET, POST };
