const Neo4j = require('./Neo4j');

module.exports = class SessionData {
	static async getUser(session_id) {
		const result = await Neo4j.run(`MATCH (u:User)-[:HAS_SESSION]->(s:Session {session_id: $idParam})
			RETURN u LIMIT 1`, { idParam: session_id });
		return result.records[0];
	}
};