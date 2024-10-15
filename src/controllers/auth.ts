import { Request, Response } from "express";
import { User } from "../models/user";
import bcrypt from "bcryptjs";
import { Token } from "../models/token";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findUserByEmail(email);

  if (!user || !password) {
    return res.status(401).json({ error: "user not found" });
  }
  console.log("pass", password, user.password);
  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    return res.status(401).json({ error: "wrong password" });
  }
  res.status(200).json({
    user: {
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      uid: user.id,
    },
  });
};

export const signUp = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, type } = req.body;
  const user = await User.createUser(
    email,
    password,
    firstName,
    lastName,
    type
  );
  if (user) {
    res.status(201).json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }
};

export const registerForPush = async (req: Request, res: Response) => {
  const { agent, sub } = req.body;
  if (!agent || !sub || !agent.email) {
    res.status(400).json({ error: "bad request" });
  }
  const user = await User.findUserByEmail(agent.email);
  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }
  const token = await Token.associateWPToUser(user.id, sub);
  if (token) {
    res.status(200).json({ success: true });
  } else {
    res.status(500).json({ error: "server error" });
  }
};
