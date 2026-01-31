import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

function getUser(req){
  const token = req.headers.authorization?.split(" ")[1];
  if(!token) return null;
  return jwt.decode(token);
}

export default async function handler(req, res){
  const { action } = req.query;
  const user = getUser(req);

  // FIRST LOGIN SYNC
  if(action === "sync"){
    const { sub, nickname } = user;
    await sb.from("profiles").upsert({
      id: sub,
      username: nickname,
      approved: false,
      role: "user"
    });
    return res.json({ ok: true });
  }

  // LOAD DATA
  if(action === "data"){
    const pr = await sb.from("pr").select("*");
    const soal = await sb.from("soal").select("*");
    const note = await sb.from("note").select("*").limit(1);
    return res.json({
      pr: pr.data,
      soal: soal.data,
      note: note.data?.[0]?.isi || ""
    });
  }

  // ADMIN DASHBOARD USERS
  if(action === "users"){
    const p = await sb.from("profiles").select("*");
    return res.json(p.data);
  }

  // APPROVE & SET ROLE (MAIN ADMIN)
  if(action === "approve"){
    await sb.from("profiles")
      .update({
        approved: true,
        role: req.body.role
      })
      .eq("id", req.body.id);
    return res.json({ ok: true });
  }

  // AI GEMINI
  if(action === "ai"){
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: req.body.q }] }]
        })
      }
    );
    const j = await r.json();
    return res.json({
      reply: j.candidates?.[0]?.content?.parts?.[0]?.text
    });
  }

  res.status(404).end();
}