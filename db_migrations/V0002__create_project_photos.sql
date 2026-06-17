CREATE TABLE project_photos (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_photos_project_id ON project_photos(project_id, sort_order);
