-- Optional sample seed (replace user id with a real auth.users UUID)
insert into public.applications (
  user_id,
  company,
  role,
  status,
  location,
  salary,
  job_link,
  notes
)
values (
  '00000000-0000-0000-0000-000000000000',
  'Example Inc',
  'Software Engineer',
  'Applied',
  'Remote',
  '$120000',
  'https://example.com/jobs/1',
  'Replace user_id before running this seed.'
);
