const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
	'neo4j://localhost',
	neo4j.auth.basic('neo4j', 'neshap-graph'),
);

module.exports = {
	neo4j: neo4j,
	run: async (query, params) => {
		const session = driver.session();
		const result = await session.run(query, params);
		await session.close();
		return result;
	},
};