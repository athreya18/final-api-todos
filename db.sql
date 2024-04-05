CREATE TABLE todos (
	id UUID PRIMARY KEY,
	title VARCHAR,
	description VARCHAR,
	status VARCHAR,
	createdAt TIMESTAMP,
	updatedAt TIMESTAMP
	);
	
INSERT INTO todos (id, title, description,status, createdAt, updatedAt) 
VALUES 
  (gen_random_uuid(), 'Task 2', 'Description for task 2','todo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)\
  
INSERT INTO todos (id, title, description,status, createdAt, updatedAt) 
VALUES 
  (gen_random_uuid(), 'Task 1', 'Description for task 1','todo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)