import { ApolloClient, InMemoryCache, split, HttpLink } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

const httpLink = new HttpLink({
	uri: import.meta.env.VITE_GRAPHQL_URL_HTTP,
});

const wsLink = new GraphQLWsLink(
	createClient({
		url: import.meta.env.VITE_GRAPHQL_URL_WS,
	})
);

const splitLink = split(
	({ query }) => {
		const definition = getMainDefinition(query);
		return (
			definition.kind === "OperationDefinition" &&
			definition.operation === "subscription"
		);
	},
	wsLink,
	httpLink
);

export const apolloClient = new ApolloClient({
	link: splitLink,
	cache: new InMemoryCache(),
});
