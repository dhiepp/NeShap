const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
	'neo4j://localhost',
	neo4j.auth.basic('neo4j', 'neshap-graph'),
);

exports = () => driver.session();