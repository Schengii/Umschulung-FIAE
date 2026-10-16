import { guard } from '../http.js';

/** Liefert den angemeldeten Nutzer. 401, wenn ein Login nötig ist; user = null bei anonymer lokaler Entwicklung. */
export default async function handler(req, res) {
  if (!(await guard(req, res, { methods: ['GET'] }))) return;
  res.json({ user: req.user });
}
