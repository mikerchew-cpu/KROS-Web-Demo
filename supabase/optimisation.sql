-- KROS Database Optimisation
-- Safe version — no CHECK constraints with IF NOT EXISTS

-- ── 1. Missing Indexes ──────────────────────────────────────────
create index if not exists idx_worker_department_status on worker_profiles(department, status);
create index if not exists idx_worker_email on worker_profiles(email);
create index if not exists idx_asset_status_location on assets(status, location);
create index if not exists idx_asset_operator on assets(operator);
create index if not exists idx_asset_loan on assets(loan_balance) where loan_balance > 0;
create index if not exists idx_asset_service on assets(next_service) where next_service is not null;
create index if not exists idx_skill_status on skills(status);
create index if not exists idx_production_mine_date on production_days(mine_id, date desc);
create index if not exists idx_production_mineral on production_days(mineral);
create index if not exists idx_shifts_day on production_shifts(production_day_id);
create index if not exists idx_equip_time_asset_date on equipment_time(asset_id, date desc);
create index if not exists idx_delay_date_shift on delay_events(date, shift);
create index if not exists idx_delay_code on delay_events(code);
create index if not exists idx_stockpile_status on stockpiles(status);
create index if not exists idx_stockpile_move_date on stockpile_movements(stockpile_id, date desc);
create index if not exists idx_grade_zone on grade_samples(zone);
create index if not exists idx_blast_zone on blast_records(zone);
create index if not exists idx_safety_type on safety_observations(type);
create index if not exists idx_safety_status on safety_observations(status);
create index if not exists idx_training_expiry on training_records(expiry_date) where status = 'valid';
create index if not exists idx_training_worker on training_records(worker_id);
create index if not exists idx_equip_health_score on equipment_health(health_score) where health_score < 50;
create index if not exists idx_predicted_failures_prob on predicted_failures(probability desc) where probability > 50;
create index if not exists idx_env_type on environmental_readings(type);
create index if not exists idx_env_station_time on environmental_readings(station_id, read_at desc);
create index if not exists idx_notif_severity_read on notifications(severity, read);
create index if not exists idx_compliance_due on compliance_items(due_date);
create index if not exists idx_workflow_status on workflow_instances(status);
create index if not exists idx_handover_date on shift_handovers(date desc);
create index if not exists idx_checklist_handover on handover_checklist(handover_id);

-- ── 2. Full-Text Search ─────────────────────────────────────────
alter table skills add column if not exists search_vector tsvector
  generated always as (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(content,''))) stored;
create index if not exists idx_skill_search on skills using gin(search_vector);

alter table safety_observations add column if not exists search_vector tsvector
  generated always as (to_tsvector('english', coalesce(description,'') || ' ' || coalesce(location,''))) stored;
create index if not exists idx_safety_search on safety_observations using gin(search_vector);

-- ── 3. Auto-Update Triggers ─────────────────────────────────────
create or replace function update_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'set_worker_profiles_updated_at') then
    create trigger set_worker_profiles_updated_at before update on worker_profiles for each row execute function update_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_assets_updated_at') then
    create trigger set_assets_updated_at before update on assets for each row execute function update_updated_at();
  end if;
end $$;

-- ── 4. JSONB Metadata ──────────────────────────────────────────
alter table assets add column if not exists metadata jsonb default '{}';
alter table worker_profiles add column if not exists metadata jsonb default '{}';
alter table production_days add column if not exists metadata jsonb default '{}';
alter table safety_observations add column if not exists metadata jsonb default '{}';

-- ── 5. RLS Policies ─────────────────────────────────────────────
create policy if not exists "Users can insert workers" on worker_profiles for insert with check (true);
create policy if not exists "Users can update workers" on worker_profiles for update using (true);
create policy if not exists "Users can insert assets" on assets for insert with check (true);
create policy if not exists "Users can update assets" on assets for update using (true);
create policy if not exists "Users can insert skills" on skills for insert with check (true);
create policy if not exists "Users can update skills" on skills for update using (true);
create policy if not exists "Users can insert production" on production_days for insert with check (true);
create policy if not exists "Users can insert observations" on safety_observations for insert with check (true);
create policy if not exists "Users can update observations" on safety_observations for update using (true);
create policy if not exists "Users can insert notifications" on notifications for insert with check (true);
create policy if not exists "Users can update notifications" on notifications for update using (true);

-- ── 6. Materialized View ────────────────────────────────────────
create materialized view if not exists mv_production_summary as
select mine_id, date_trunc('month', date) as month, count(*) as days,
  sum(total_tonnes) as total_tonnes, avg(grade) as avg_grade,
  avg(recovery) as avg_recovery, avg(uptime) as avg_uptime
from production_days group by mine_id, date_trunc('month', date)
order by mine_id, month desc;
create unique index if not exists idx_mv_prod_summary on mv_production_summary(mine_id, month);

-- ── 7. Active Alerts View ───────────────────────────────────────
create or replace view v_active_alerts as
select 'training' as source, wp.given_name || ' ' || wp.surname as subject,
  tm.name as detail, tr.expiry_date as due_date,
  case when tr.expiry_date < now() then 'critical' when tr.expiry_date < now()+interval '30 days' then 'warning' else 'info' end as severity
from training_records tr join worker_profiles wp on wp.id=tr.worker_id
join training_modules tm on tm.id=tr.module_id where tr.status!='valid'
union all
select 'insurance', a.asset_id, a.insurance_provider||' policy '||a.insurance_policy,
  a.insurance_expiry,
  case when a.insurance_expiry<now() then 'critical' when a.insurance_expiry<now()+interval '30 days' then 'warning' else 'info' end
from assets a where a.insurance_expiry is not null and a.insurance_expiry<now()+interval '90 days'
union all
select 'compliance', ci.item, ci.authority, ci.due_date,
  case when ci.due_date<now() then 'critical' when ci.due_date<now()+interval '7 days' then 'warning' else 'info' end
from compliance_items ci where ci.status!='completed'
order by due_date;

-- ── 8. Dashboard KPIs Function ──────────────────────────────────
create or replace function get_dashboard_kpis() returns table (
  total_workers bigint, active_assets bigint, assets_in_repair bigint,
  total_skills bigint, stale_skills bigint, open_observations bigint,
  critical_alerts bigint, upcoming_compliance bigint
) language sql stable as $$
  select (select count(*) from worker_profiles where status='Active'),
    (select count(*) from assets where status='Working'),
    (select count(*) from assets where status='Repair'),
    (select count(*) from skills),
    (select count(*) from skills where status in ('stale','urgent')),
    (select count(*) from safety_observations where status='open'),
    (select count(*) from notifications where severity='critical' and read=false),
    (select count(*) from compliance_items where status='upcoming' and due_date>=now());
$$;

-- ── 9. Update Statistics ────────────────────────────────────────
analyze worker_profiles;
analyze assets;
analyze skills;
analyze production_days;
analyze safety_observations;
analyze notifications;
analyze training_records;
analyze compliance_items;
