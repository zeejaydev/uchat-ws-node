import { Token as TokenModel, Prisma } from "@prisma/client";
import { prisma } from "../server";

const associateWPToUser = async (
  uid: number,
  sub: Prisma.JsonObject
): Promise<TokenModel> => {
  return await prisma.token.create({
    data: {
      wp_token: sub,
      owner_id: uid,
    },
  });
};

const getAgentToken = async (uid: number): Promise<TokenModel | null> => {
  return await prisma.token.findFirst({
    where: {
      owner_id: uid,
    },
  });
};

export const Token = {
  associateWPToUser,
  getAgentToken,
};
