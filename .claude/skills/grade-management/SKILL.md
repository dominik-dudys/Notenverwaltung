---
name: grade-management
description: Business logic for grades, averages, modules and ECTS in this project
---

# Grade Management

## Database Schema

### modules
```sql
create table modules (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references auth.users(id) on delete cascade,
  name text not null,
  ects integer not null,
  semester integer not null,
  created_at timestamp with time zone default now()
);
```

### grades
```sql
create table grades (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references modules(id) on delete cascade,
  grade numeric(3,1) not null check (grade >= 1.0 and grade <= 5.0),
  date date not null,
  description text,
  created_at timestamp with time zone default now()
);
```

## Grade Logic

### Weighted Average (by ECTS)
```typescript
function calculateWeightedAverage(modules: ModuleWithGrades[]): number {
  const totalEcts = modules.reduce((sum, m) => sum + m.ects, 0)
  const weightedSum = modules.reduce((sum, m) => {
    const avgGrade = m.grades.reduce((s, g) => s + g.grade, 0) / m.grades.length
    return sum + avgGrade * m.ects
  }, 0)
  return weightedSum / totalEcts
}
```

### Simple Average per Module
```typescript
function calculateModuleAverage(grades: Grade[]): number {
  if (grades.length === 0) return 0
  return grades.reduce((sum, g) => sum + g.grade, 0) / grades.length
}
```

## Rules
- Grades range: 1.0 (best) to 5.0 (worst), German system
- Always validate grade range before saving
- Always use weighted average by ECTS for overall GPA
- RLS policies: students can only see their own data
- Always cascade delete (module deleted → grades deleted)

## RLS Policies
```sql
-- modules
alter table modules enable row level security;
create policy "Students see own modules"
  on modules for all
  using (auth.uid() = student_id);

-- grades
alter table grades enable row level security;
create policy "Students see own grades"
  on grades for all
  using (
    module_id in (
      select id from modules where student_id = auth.uid()
    )
  );
```