
-- Employees table
CREATE TABLE public.employees (
  id TEXT NOT NULL,
  store_id TEXT NOT NULL,
  departamento TEXT NOT NULL,
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  actividad TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id, store_id)
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Public access since auth is store-based (no Supabase auth)
CREATE POLICY "Allow all access to employees"
  ON public.employees FOR ALL
  USING (true)
  WITH CHECK (true);

-- Schedule entries table
CREATE TABLE public.schedule_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id TEXT NOT NULL,
  departamento TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  day INTEGER NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  shift_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (store_id, employee_id, day, month, year)
);

ALTER TABLE public.schedule_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to schedule_entries"
  ON public.schedule_entries FOR ALL
  USING (true)
  WITH CHECK (true);

-- Indexes for fast lookups
CREATE INDEX idx_employees_store ON public.employees (store_id);
CREATE INDEX idx_schedule_store_month ON public.schedule_entries (store_id, departamento, year, month);
