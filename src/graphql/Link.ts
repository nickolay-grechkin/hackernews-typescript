import {arg, enumType, extendType, idArg, inputObjectType, intArg, list, nonNull, objectType, stringArg} from "nexus";
import {Prisma} from "@prisma/client";

export const LinkOrderByInput = inputObjectType({
    name: "LinkOrderByInput",
    definition(t) {
        t.field("description", { type: Sort });
        t.field("url", { type: Sort });
        t.field("createdAt", { type: Sort });
    },
});

export const Feed = objectType({
    name: "Feed",
    definition(t) {
        t.nonNull.list.nonNull.field("links", { type: Link }); // 1
        t.nonNull.int("count"); // 2
        t.id("id");  // 3
    },
});

export const Sort = enumType({
    name: "Sort",
    members: ["asc", "desc"],
});

const Link = objectType({
    name: "Link",
    definition(t) {
        t.nonNull.int("id");
        t.nonNull.string("description");
        t.nonNull.string("url");
        t.nonNull.dateTime("createdAt");
        t.field("postedBy", {
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .postedBy();
            },
        });
        t.nonNull.list.nonNull.field("voters", {
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .voters();
            }
        })
    },
});

const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.field("feed", {
            type: "Feed",
            args: {
                filter: stringArg(),
                skip: intArg(),
                take: intArg(),
                orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }),
            },
            async resolve(parent, args, context, info) {
                const where = args.filter
                    ? {
                            OR: [
                                { description: { contains: args.filter } },
                                { url: { contains: args.filter } },
                            ],
                      }
                    : {};
                const links = await context.prisma.link.findMany({
                    where,
                    skip: args?.skip as number | undefined,
                    take: args?.take as number | undefined,
                    orderBy: args?.orderBy as
                        | Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput>
                        | undefined,
                });

                const count = await context.prisma.link.count({ where });
                const id = `main-feed:${JSON.stringify(args)}`;

                return {
                    links,
                    count,
                    id
                };
            },
        });
        t.field("link", {
            type: "Link",
            args: {
                id: nonNull(idArg())
            },

            resolve(parent, args, context) {
                const { id } = args;

                return context.prisma.link.findUnique({
                    where: {
                        id: Number(id)
                    }
                });
            },
        });
    },
});

const LinkMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("post", {
            type: "Link",
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
            },

            resolve(parent, args, context) {
                const { description, url } = args;
                const { userId } = context;

                if (!userId) {
                    throw new Error("Cannot post without logging in.");
                }

                return context.prisma.link.create({
                    data: {
                        description,
                        url,
                        postedBy: { connect: { id: userId } },
                    },
                });
            },
        });

        t.field("update", {
            type: "Link",
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
                id: nonNull(idArg())
            },

            resolve(parent, args, context) {
                const { description, url, id } = args;

                return context.prisma.link.update({
                    where: {
                        id: Number(id)
                    },
                    data: {
                        description,
                        url
                    }
                })
            }
        })

        t.field("delete", {
            type: "Link",
            args: {
                id: nonNull(idArg())
            },

            resolve(parent, args, context) {
                return context.prisma.link.delete({
                    where: {
                        id: Number(args.id)
                    }
                })
            }
        })
    }
});

export { Link, LinkQuery, LinkMutation };
