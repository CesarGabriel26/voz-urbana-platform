drop table voz_messages
create table voz_messages (
	id UUID default gen_random_uuid(),
	user_id UUID not null references voz_users(id),
	type TEXT not null,
	title TEXT not null,
	message TEXT not null,
	read BOOLEAN DEFAULT false,
	created_at TIMESTAMP default current_timestamp,
	updatedAt timestamp,
	complaint_id UUID
)


select * from voz_messages where user_id = ''


-- Ensure voz_complaints has resolved_at for response time tracking
ALTER TABLE voz_complaints ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP;

-- Ensure categories have weight for health calculation
ALTER TABLE voz_categories ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 1;