import {extendType, idArg, nonNull, objectType, stringArg} from "nexus";
import { NexusGenObjects } from "../../nexus-typegen";

export const Link = objectType({
    name: "Link",
    definition(t) {
        t.nonNull.int("id");
        t.nonNull.string("description");
        t.nonNull.string("url");
    }
});

let links: NexusGenObjects["Link"][]= [   // 1
    {
        id: 1,
        url: "www.howtographql.com",
        description: "Fullstack tutorial for GraphQL",
    },
    {
        id: 2,
        url: "graphql.org",
        description: "GraphQL official website",
    },
];

export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("feed", {
            type: "Link",
            resolve(parent, args, context, info) {
                return links;
            },
        });
        t.field("link", {
            type: "Link",
            args: {
                id: nonNull(idArg())
            },

            resolve(parent, args) {
                const { id } = args;

                return links.find(item => item.id === Number(id));
            }
        })
    },
});

export const LinkMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("post", {
            type: "Link",
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
            },

            resolve(parent, args, context) {
                const { description, url } = args;  // 4

                let idCount = links.length + 1;  // 5
                const link = {
                    id: idCount,
                    description: description,
                    url: url,
                };
                links.push(link);
                return link;
            },
        });
        t.field("update", {
            type: "Link",
            args: {
                description: stringArg(),
                url: stringArg(),
                id: nonNull(idArg())
            },

            resolve(parent, args) {
                const { description, url, id } = args;

                const linkToUpdate = links.find(item => item.id === Number(id));
                if (linkToUpdate) {
                    if (description) {
                        linkToUpdate.description = description;
                    }
                    if (url) {
                        linkToUpdate.url = url;
                    }
                }

                return linkToUpdate;
            }
        })

        t.field("delete", {
            type: "Link",
            args: {
                id: nonNull(idArg())
            },

            resolve(parent, args) {
                const { id } = args;

                const linkToRemove = links.find(item => item.id === Number(id));
                links = links.filter(item => item !== linkToRemove);
                return linkToRemove;
            }
        })
    }
})
