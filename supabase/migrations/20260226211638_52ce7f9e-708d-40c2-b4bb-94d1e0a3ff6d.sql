
CREATE TABLE public.department_passwords (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id text NOT NULL,
  departamento text NOT NULL,
  password text NOT NULL DEFAULT 'Anny90pro',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(store_id, departamento)
);

ALTER TABLE public.department_passwords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to department_passwords"
ON public.department_passwords
FOR ALL
USING (true)
WITH CHECK (true);
