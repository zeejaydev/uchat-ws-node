import { prisma } from "../server";
import { User as UserType } from "@prisma/client";
import bcrypt from "bcryptjs";

const findUserByEmail = async (email: string): Promise<UserType | null> => {
  return await prisma.user.findFirst({
    where: { email: email },
  });
};

const createUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  type: string
) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await prisma.user.create({
    data: {
      email,
      first_name: firstName,
      last_name: lastName,
      password: hashedPassword,
      type: type.toLowerCase() === "agent" ? "AGENT" : "VISITOR",
    },
  });
};

export const User = {
  findUserByEmail,
  createUser,
};
