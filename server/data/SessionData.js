const Neo4j = require('./Neo4j');

module.exports = class Session {
	static async validate(session_id) {
		const result = await Neo4j.run(`MATCH (u:User)-[:HAS_SESSION]->(s:Session {session_id: $sessionParam}) 
			RETURN u.user_id`, { sessionParam: session_id });

		if (result.records.length == 0) return null;
		return result.records[0].get('u.user_id');
	}
};