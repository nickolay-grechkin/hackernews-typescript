import {extendType, idArg, nonNull, objectType, stringArg} from "nexus";

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
        t.nonNull.list.nonNull.field("feed", {
            type: "Link",
            resolve(parent, args, context, info) {
                return context.prisma.link.findMany();
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
